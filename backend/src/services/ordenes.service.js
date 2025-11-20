// backend/src/services/ordenes.service.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OrdenesService {
  // Obtener todas las órdenes con filtros
  async getAll(filters = {}) {
    const where = {};

    if (filters.parcelaId) {
      where.parcelaId = filters.parcelaId;
    }

    if (filters.recetaId) {
      where.recetaId = filters.recetaId;
    }

    if (filters.estado) {
      where.estado = filters.estado.toUpperCase();
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      where.fechaAplicacion = {};
      if (filters.fechaDesde) {
        where.fechaAplicacion.gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        where.fechaAplicacion.lte = filters.fechaHasta;
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
            name: true,  // ✅ CORREGIDO: era "nombre", ahora es "name"
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
    const orden = await prisma.ordenAplicacion.findUnique({
      where: { id },
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
            name: true,  // ✅ CORREGIDO
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
    // 1. Obtener la receta con sus detalles
    const receta = await prisma.receta.findUnique({
      where: { id: data.recetaId },
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
      const cantidadCalculada = detalle.dosisPorHectarea * data.hectareasAplicadas;
      const costoUnitario = detalle.insumo.costoUnitario;
      const costoTotal = cantidadCalculada * costoUnitario;

      return {
        insumoId: detalle.insumoId,
        cantidadCalculada: cantidadCalculada,
        unidadMedida: detalle.unidadMedida,
        costoUnitario: costoUnitario,
        costoTotal: costoTotal
      };
    });

    // 3. Calcular costo total
    const costoTotal = detalles.reduce((sum, d) => sum + d.costoTotal, 0);

    // 4. Crear orden con detalles
    const orden = await prisma.ordenAplicacion.create({
      data: {
        parcelaId: data.parcelaId,
        recetaId: data.recetaId,
        hectareasAplicadas: data.hectareasAplicadas,
        fechaAplicacion: data.fechaAplicacion ? new Date(data.fechaAplicacion) : new Date(),
        operadorId: data.operadorId,
        observaciones: data.observaciones,
        costoTotal: costoTotal,
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
    const ordenExistente = await prisma.ordenAplicacion.findUnique({
      where: { id }
    });

    if (!ordenExistente) {
      throw new Error('Orden no encontrada');
    }

    if (ordenExistente.estado === 'APLICADA') {
      throw new Error('No se puede modificar una orden ya aplicada');
    }

    const orden = await prisma.ordenAplicacion.update({
      where: { id },
      data: {
        hectareasAplicadas: data.hectareasAplicadas,
        fechaAplicacion: data.fechaAplicacion ? new Date(data.fechaAplicacion) : undefined,
        operadorId: data.operadorId,
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
    const orden = await prisma.ordenAplicacion.findUnique({
      where: { id }
    });

    if (!orden) {
      throw new Error('Orden no encontrada');
    }

    if (orden.estado === 'APLICADA') {
      throw new Error('No se puede eliminar una orden ya aplicada');
    }

    await prisma.ordenAplicacion.delete({
      where: { id }
    });

    return true;
  }

  // Cerrar orden y descontar inventario
  async cerrarOrden(id) {
    const orden = await prisma.ordenAplicacion.findUnique({
      where: { id },
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
      throw new Error(`Stock insuficiente: ${validacion.errores.map(e => e.insumoNombre).join(', ')}`);
    }

    // Iniciar transacción
    const ordenActualizada = await prisma.$transaction(async (tx) => {
      // 1. Descontar inventario
      for (const detalle of orden.detalles) {
        await tx.inventarioItem.update({  // ✅ CORREGIDO: era "inventario", ahora es "inventarioItem"
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
        where: { id },
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
    const orden = await prisma.ordenAplicacion.findUnique({
      where: { id }
    });

    if (!orden) {
      throw new Error('Orden no encontrada');
    }

    if (orden.estado === 'APLICADA') {
      throw new Error('No se puede cancelar una orden ya aplicada');
    }

    const ordenCancelada = await prisma.ordenAplicacion.update({
      where: { id },
      data: {
        estado: 'CANCELADA',
        observaciones: motivo ? `CANCELADA: ${motivo}` : orden.observaciones
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

  // Validar stock disponible
  async validarStock(recetaId, hectareas) {
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

    const errores = [];

    for (const detalle of receta.detalles) {
      const cantidadRequerida = detalle.dosisPorHectarea * hectareas;
      const stockDisponible = detalle.insumo.stockActual;

      if (stockDisponible < cantidadRequerida) {
        errores.push({
          insumoId: detalle.insumoId,
          insumoNombre: detalle.insumo.nombre,
          cantidadRequerida: cantidadRequerida,
          stockDisponible: stockDisponible,
          faltante: cantidadRequerida - stockDisponible
        });
      }
    }

    return {
      esValido: errores.length === 0,
      errores: errores
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
      errores: errores
    };
  }

  // Obtener historial de parcela
  async getHistorialParcela(parcelaId) {
    const ordenes = await prisma.ordenAplicacion.findMany({
      where: {
        parcelaId: parcelaId,
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
          gte: fechaInicio,
          lte: fechaFin
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
      costoPromedioPorHectarea: hectareasTotal > 0 ? costoTotal / hectareasTotal : 0
    };
  }

  // Formatear orden para respuesta
  formatOrden(orden) {
    return {
      ...orden,
      estado: orden.estado.toLowerCase(),
      operador: orden.operador ? orden.operador.name : null  // ✅ CORREGIDO
    };
  }
}

module.exports = new OrdenesService();