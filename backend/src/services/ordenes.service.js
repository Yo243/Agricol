// backend/src/services/ordenes.service.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OrdenesService {
  // Obtener todas las órdenes con filtros
  async getAll(filters = {}) {
    const where = {};

    if (filters.parcelaId) {
      const parcelaId = Number(filters.parcelaId);
      if (!Number.isNaN(parcelaId)) {
        where.parcelaId = parcelaId;
      }
    }

    if (filters.recetaId) {
      const recetaId = Number(filters.recetaId);
      if (!Number.isNaN(recetaId)) {
        where.recetaId = recetaId;
      }
    }

    if (filters.estado) {
      where.estado = filters.estado.toUpperCase();
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      where.fechaAplicacion = {};
      if (filters.fechaDesde) {
        where.fechaAplicacion.gte = new Date(filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        where.fechaAplicacion.lte = new Date(filters.fechaHasta);
      }
    }

    if (filters.search) {
      where.OR = [
        { parcela: { nombre: { contains: filters.search, mode: 'insensitive' } } },
        { receta: { nombre: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    const ordenes = await prisma.ordenAplicacion.findMany({
      where,
      include: {
        parcela: true,
        receta: {
          include: {
            cultivo: true
          }
        },
        operador: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        detalles: {
          include: {
            insumo: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return ordenes.map(orden => this.formatOrden(orden));
  }

  // Obtener orden por ID
  async getById(id) {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      throw new Error('ID de orden inválido');
    }

    const orden = await prisma.ordenAplicacion.findUnique({
      where: { id: idNum },
      include: {
        parcela: true,
        receta: {
          include: {
            cultivo: true,
            detalles: {
              include: {
                insumo: true
              }
            }
          }
        },
        operador: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        detalles: {
          include: {
            insumo: true
          },
          orderBy: {
            id: 'asc'
          }
        }
      }
    });

    if (!orden) {
      throw new Error('Orden no encontrada');
    }

    return this.formatOrden(orden);
  }

  // Crear nueva orden
  async create(data) {
    // Normalizar / validar datos numéricos
    const parcelaId = Number(data.parcelaId);
    const recetaId = Number(data.recetaId);
    const hectareasAplicadas = Number(
      data.hectareasAplicadas ?? data.hectareas
    );
    const operadorId = data.operadorId != null ? Number(data.operadorId) : null;

    if (!Number.isInteger(parcelaId) || parcelaId <= 0) {
      throw new Error('parcelaId inválido');
    }

    if (!Number.isInteger(recetaId) || recetaId <= 0) {
      throw new Error('recetaId inválido');
    }

    if (Number.isNaN(hectareasAplicadas) || hectareasAplicadas <= 0) {
      throw new Error('Las hectáreas aplicadas deben ser mayores a 0');
    }

    if (operadorId !== null && (Number.isNaN(operadorId) || operadorId <= 0)) {
      throw new Error('operadorId inválido');
    }

    // 1. Obtener la receta con sus detalles
    const receta = await prisma.receta.findUnique({
      where: { id: recetaId },
      include: {
        detalles: {
          include: {
            insumo: true
          }
        }
      }
    });

    if (!receta) {
      throw new Error('Receta no encontrada');
    }

    // 2. Calcular detalles de la orden
    const detalles = receta.detalles.map(detalle => {
      const cantidadCalculada = detalle.dosisPorHectarea * hectareasAplicadas;
      const costoUnitario = detalle.insumo.costoUnitario || 0;
      const costoTotal = cantidadCalculada * costoUnitario;

      return {
        insumoId: detalle.insumoId,
        cantidadCalculada,
        unidadMedida: detalle.unidadMedida,
        costoUnitario,
        costoTotal
      };
    });

    // 3. Calcular costo total
    const costoTotal = detalles.reduce((sum, d) => sum + d.costoTotal, 0);

    // 4. Crear orden con detalles
    const orden = await prisma.ordenAplicacion.create({
      data: {
        parcelaId,
        recetaId,
        hectareasAplicadas,
        fechaAplicacion: data.fechaAplicacion
          ? new Date(data.fechaAplicacion)
          : new Date(),
        operadorId: operadorId || null,
        observaciones: data.observaciones || null,
        costoTotal,
        estado: 'PENDIENTE',
        detalles: {
          create: detalles
        }
      },
      include: {
        parcela: true,
        receta: true,
        detalles: {
          include: {
            insumo: true
          }
        }
      }
    });

    return this.formatOrden(orden);
  }

  // Actualizar orden
  async update(id, data) {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      throw new Error('ID de orden inválido');
    }

    const ordenExistente = await prisma.ordenAplicacion.findUnique({
      where: { id: idNum }
    });

    if (!ordenExistente) {
      throw new Error('Orden no encontrada');
    }

    if (ordenExistente.estado === 'APLICADA') {
      throw new Error('No se puede modificar una orden ya aplicada');
    }

    const operadorId = data.operadorId != null ? Number(data.operadorId) : null;

    const orden = await prisma.ordenAplicacion.update({
      where: { id: idNum },
      data: {
        hectareasAplicadas:
          data.hectareasAplicadas != null
            ? Number(data.hectareasAplicadas)
            : ordenExistente.hectareasAplicadas,
        fechaAplicacion: data.fechaAplicacion
          ? new Date(data.fechaAplicacion)
          : undefined,
        operadorId: operadorId || undefined,
        observaciones: data.observaciones,
        estado: data.estado
      },
      include: {
        parcela: true,
        receta: true,
        detalles: {
          include: {
            insumo: true
          }
        }
      }
    });

    return this.formatOrden(orden);
  }

  // Eliminar orden
  async delete(id) {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      throw new Error('ID de orden inválido');
    }

    const orden = await prisma.ordenAplicacion.findUnique({
      where: { id: idNum }
    });

    if (!orden) {
      throw new Error('Orden no encontrada');
    }

    if (orden.estado === 'APLICADA') {
      throw new Error('No se puede eliminar una orden ya aplicada');
    }

    await prisma.ordenAplicacion.delete({
      where: { id: idNum }
    });

    return true;
  }

  // Cerrar orden y descontar inventario
  async cerrarOrden(id) {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      throw new Error('ID de orden inválido');
    }

    const orden = await prisma.ordenAplicacion.findUnique({
      where: { id: idNum },
      include: {
        detalles: {
          include: {
            insumo: true
          }
        }
      }
    });

    if (!orden) {
      throw new Error('Orden no encontrada');
    }

    if (orden.estado === 'APLICADA') {
      throw new Error('La orden ya ha sido aplicada');
    }

    if (orden.estado === 'CANCELADA') {
      throw new Error('No se puede cerrar una orden cancelada');
    }

    // Validar stock disponible
    const validacion = await this.validarStockDetalles(orden.detalles);
    if (!validacion.esValido) {
      throw new Error(
        `Stock insuficiente: ${validacion.errores
          .map(e => e.insumoNombre)
          .join(', ')}`
      );
    }

    // Iniciar transacción
    const ordenActualizada = await prisma.$transaction(async tx => {
      // 1. Descontar inventario
      for (const detalle of orden.detalles) {
        await tx.inventarioItem.update({
          where: { id: detalle.insumoId },
          data: {
            stockActual: {
              decrement: detalle.cantidadCalculada
            }
          }
        });
      }

      // 2. Actualizar estado de orden
      const ordenCerrada = await tx.ordenAplicacion.update({
        where: { id: idNum },
        data: {
          estado: 'APLICADA',
          fechaAplicacion: new Date()
        },
        include: {
          parcela: true,
          receta: true,
          detalles: {
            include: {
              insumo: true
            }
          }
        }
      });

      return ordenCerrada;
    });

    return this.formatOrden(ordenActualizada);
  }

  // Cancelar orden
  async cancelarOrden(id, motivo) {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      throw new Error('ID de orden inválido');
    }

    const orden = await prisma.ordenAplicacion.findUnique({
      where: { id: idNum }
    });

    if (!orden) {
      throw new Error('Orden no encontrada');
    }

    if (orden.estado === 'APLICADA') {
      throw new Error('No se puede cancelar una orden ya aplicada');
    }

    const ordenCancelada = await prisma.ordenAplicacion.update({
      where: { id: idNum },
      data: {
        estado: 'CANCELADA',
        observaciones: motivo
          ? `CANCELADA: ${motivo}`
          : orden.observaciones
      },
      include: {
        parcela: true,
        receta: true,
        detalles: {
          include: {
            insumo: true
          }
        }
      }
    });

    return this.formatOrden(ordenCancelada);
  }

  // Validar stock disponible (por receta + hectáreas)
  async validarStock(recetaId, hectareas) {
    const recetaIdNum = Number(recetaId);
    const hectareasNum = Number(hectareas);

    if (!Number.isInteger(recetaIdNum) || recetaIdNum <= 0) {
      throw new Error('recetaId inválido');
    }

    if (Number.isNaN(hectareasNum) || hectareasNum <= 0) {
      throw new Error('Las hectáreas deben ser mayores a 0');
    }

    const receta = await prisma.receta.findUnique({
      where: { id: recetaIdNum },
      include: {
        detalles: {
          include: {
            insumo: true
          }
        }
      }
    });

    if (!receta) {
      throw new Error('Receta no encontrada');
    }

    const errores = [];

    for (const detalle of receta.detalles) {
      const cantidadRequerida = detalle.dosisPorHectarea * hectareasNum;
      const stockDisponible = detalle.insumo.stockActual;

      if (stockDisponible < cantidadRequerida) {
        errores.push({
          insumoId: detalle.insumoId,
          insumoNombre: detalle.insumo.nombre,
          cantidadRequerida,
          stockDisponible,
          faltante: cantidadRequerida - stockDisponible
        });
      }
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  // Validar stock de detalles existentes
  async validarStockDetalles(detalles) {
    const errores = [];

    for (const detalle of detalles) {
      if (detalle.insumo.stockActual < detalle.cantidadCalculada) {
        errores.push({
          insumoId: detalle.insumoId,
          insumoNombre: detalle.insumo.nombre,
          cantidadRequerida: detalle.cantidadCalculada,
          stockDisponible: detalle.insumo.stockActual,
          faltante: detalle.cantidadCalculada - detalle.insumo.stockActual
        });
      }
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  // Obtener historial de parcela
  async getHistorialParcela(parcelaId) {
    const parcelaIdNum = Number(parcelaId);
    if (Number.isNaN(parcelaIdNum)) {
      throw new Error('parcelaId inválido');
    }

    const ordenes = await prisma.ordenAplicacion.findMany({
      where: {
        parcelaId: parcelaIdNum,
        estado: 'APLICADA'
      },
      include: {
        receta: true,
        detalles: {
          include: {
            insumo: true
          }
        }
      },
      orderBy: {
        fechaAplicacion: 'desc'
      }
    });

    return ordenes.map(orden => this.formatOrden(orden));
  }

  // Obtener estadísticas
  async getEstadisticas(fechaInicio, fechaFin) {
    const ordenes = await prisma.ordenAplicacion.findMany({
      where: {
        fechaAplicacion: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        }
      },
      include: {
        detalles: true
      }
    });

    const totalOrdenes = ordenes.length;
    const ordenesPendientes = ordenes.filter(o => o.estado === 'PENDIENTE').length;
    const ordenesAplicadas = ordenes.filter(o => o.estado === 'APLICADA').length;
    const ordenesCanceladas = ordenes.filter(o => o.estado === 'CANCELADA').length;

    const costoTotal = ordenes.reduce((sum, o) => sum + (o.costoTotal || 0), 0);
    const hectareasTotal = ordenes.reduce((sum, o) => sum + o.hectareasAplicadas, 0);

    return {
      totalOrdenes,
      ordenesPendientes,
      ordenesAplicadas,
      ordenesCanceladas,
      costoTotal,
      hectareasTotal,
      costoPromedioPorHectarea:
        hectareasTotal > 0 ? costoTotal / hectareasTotal : 0
    };
  }

  // Formatear orden para respuesta
  formatOrden(orden) {
    return {
      ...orden,
      estado: orden.estado.toLowerCase(),
      operador: orden.operador ? orden.operador.name : null
    };
  }
}

module.exports = new OrdenesService();
