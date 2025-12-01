const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// GESTIÓN DE PARCELAS
// ==========================================

/**
 * Obtener todas las parcelas
 */
exports.getParcelas = async (req, res) => {
  try {
    const { activo, estado } = req.query;
    
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (estado) where.estado = estado;

    const parcelas = await prisma.parcela.findMany({
      where,
      include: {
        periodosSiembra: {
          where: { estado: 'En Curso' },
          include: {
            cultivo: true
          }
        },
        _count: {
          select: {
            periodosSiembra: true,
            aplicaciones: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    res.json(parcelas);
  } catch (error) {
    console.error('Error al obtener parcelas:', error);
    res.status(500).json({ message: 'Error al obtener parcelas' });
  }
};

/**
 * Obtener parcela por ID con historial completo
 */
exports.getParcelaById = async (req, res) => {
  try {
    const { id } = req.params;

    const parcela = await prisma.parcela.findUnique({
      where: { id: parseInt(id) },
      include: {
        periodosSiembra: {
          include: {
            cultivo: true,
            aplicaciones: {
              include: {
                insumos: {
                  include: {
                    insumo: true
                  }
                }
              },
              orderBy: { fecha: 'desc' }
            },
            actividades: {
              orderBy: { fechaProgramada: 'desc' },
              take: 10
            }
          },
          orderBy: { fechaInicio: 'desc' }
        }
      }
    });

    if (!parcela) {
      return res.status(404).json({ message: 'Parcela no encontrada' });
    }

    res.json(parcela);
  } catch (error) {
    console.error('Error al obtener parcela:', error);
    res.status(500).json({ message: 'Error al obtener parcela' });
  }
};

/**
 * Crear nueva parcela
 */
exports.createParcela = async (req, res) => {
  try {
    const data = req.body;

    // Generar código automático si no viene
    if (!data.codigo) {
      const count = await prisma.parcela.count();
      data.codigo = `PAR-${String(count + 1).padStart(4, '0')}`;
    }

    const parcela = await prisma.parcela.create({
      data
    });

    res.status(201).json(parcela);
  } catch (error) {
    console.error('Error al crear parcela:', error);
    res.status(500).json({ message: 'Error al crear parcela' });
  }
};

/**
 * Actualizar parcela
 */
exports.updateParcela = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const parcela = await prisma.parcela.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(parcela);
  } catch (error) {
    console.error('Error al actualizar parcela:', error);
    res.status(500).json({ message: 'Error al actualizar parcela' });
  }
};

/**
 * Eliminar parcela (soft delete)
 */
exports.deleteParcela = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.parcela.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });

    res.json({ message: 'Parcela eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar parcela:', error);
    res.status(500).json({ message: 'Error al eliminar parcela' });
  }
};

// ==========================================
// PERÍODOS DE SIEMBRA
// ==========================================

/**
 * Crear período de siembra en parcela
 */
exports.createPeriodoSiembra = async (req, res) => {
  try {
    console.log('📥 Body periodo siembra:', req.body);

    const {
      parcelaId,
      cultivoId,
      fechaInicio,
      hectareasSembradas,
      rendimientoEsperado,
      observaciones,
      fechaCosechaEsperada, // ← viene como string "2026-05-13"
    } = req.body;

    // Parseo de fechas
    const fechaInicioDate = fechaInicio
      ? new Date(fechaInicio)  // "2025-12-01" -> Date
      : new Date();

    let fechaCosechaDate = null;
    if (fechaCosechaEsperada && fechaCosechaEsperada.trim() !== '') {
      fechaCosechaDate = new Date(fechaCosechaEsperada); // "2026-05-13" -> Date
    }

    // Generar código
    const count = await prisma.periodoSiembra.count();
    const codigo = `PS-${String(count + 1).padStart(4, '0')}`;

    const dataCreate = {
      parcelaId: parseInt(parcelaId),
      cultivoId: parseInt(cultivoId),
      codigo,
      fechaInicio: fechaInicioDate,
      hectareasSembradas: parseFloat(hectareasSembradas),
      rendimientoEsperado: rendimientoEsperado != null ? parseFloat(rendimientoEsperado) : 0,
      observaciones: observaciones || '',
      // si tu modelo tiene estado con default, puedes quitar esta línea
      estado: 'En Curso'
    };

    // Solo mandamos fechaCosechaEsperada si realmente existe
    if (fechaCosechaDate) {
      dataCreate.fechaCosechaEsperada = fechaCosechaDate;
    }

    const periodo = await prisma.periodoSiembra.create({
      data: dataCreate,
      include: {
        parcela: true,
        cultivo: true
      }
    });

    res.status(201).json(periodo);
  } catch (error) {
    console.error('Error al crear período de siembra:', error);
    res.status(500).json({
      message: 'Error al crear período de siembra',
      error: error.message
    });
  }
};

/**
 * Obtener períodos de siembra
 */
exports.getPeriodosSiembra = async (req, res) => {
  try {
    const { parcelaId, estado } = req.query;

    const where = {};
    if (parcelaId) where.parcelaId = parseInt(parcelaId);
    if (estado) where.estado = estado;

    const periodos = await prisma.periodoSiembra.findMany({
      where,
      include: {
        parcela: true,
        cultivo: true,
        _count: {
          select: {
            aplicaciones: true,
            actividades: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });

    res.json(periodos);
  } catch (error) {
    console.error('Error al obtener períodos:', error);
    res.status(500).json({ message: 'Error al obtener períodos de siembra' });
  }
};

/**
 * Actualizar período de siembra
 */
exports.updatePeriodoSiembra = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const periodo = await prisma.periodoSiembra.update({
      where: { id: parseInt(id) },
      data,
      include: {
        parcela: true,
        cultivo: true
      }
    });

    res.json(periodo);
  } catch (error) {
    console.error('Error al actualizar período:', error);
    res.status(500).json({ message: 'Error al actualizar período' });
  }
};

/**
 * Finalizar período de siembra (cosecha)
 */
exports.finalizarPeriodoSiembra = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCosechaReal, rendimientoReal, observaciones } = req.body;

    let fechaCosechaDate = null;
    if (fechaCosechaReal && fechaCosechaReal.trim() !== '') {
      fechaCosechaDate = new Date(fechaCosechaReal);
    }

    const dataUpdate = {
      rendimientoReal: rendimientoReal != null ? parseFloat(rendimientoReal) : null,
      estado: 'Finalizado',
      observaciones
    };

    if (fechaCosechaDate) {
      dataUpdate.fechaCosechaReal = fechaCosechaDate;
    }

    const periodo = await prisma.periodoSiembra.update({
      where: { id: parseInt(id) },
      data: dataUpdate,
      include: {
        parcela: true,
        cultivo: true
      }
    });

    res.json(periodo);
  } catch (error) {
    console.error('Error al finalizar período:', error);
    res.status(500).json({ message: 'Error al finalizar período' });
  }
};

// ==========================================
// APLICACIONES Y TRAZABILIDAD
// ==========================================

/**
 * Registrar aplicación en parcela
 */
exports.registrarAplicacion = async (req, res) => {
  try {
    const {
      periodoSiembraId,
      parcelaId,
      fecha,
      hectareasAplicadas,
      tipoAplicacion,
      insumos, // Array de { insumoId, cantidad, dosisPorHectarea }
      responsable,
      observaciones
    } = req.body;

    // Calcular costo total
    let costoTotal = 0;
    const insumosData = [];

    for (const insumo of insumos) {
      const item = await prisma.inventarioItem.findUnique({
        where: { id: parseInt(insumo.insumoId) }
      });

      if (!item) {
        return res.status(404).json({ 
          message: `Insumo con ID ${insumo.insumoId} no encontrado` 
        });
      }

      const cantidad = parseFloat(insumo.cantidad);
      const costoUnitario = item.costoUnitario;
      const costoInsumo = cantidad * costoUnitario;
      costoTotal += costoInsumo;

      insumosData.push({
        insumoId: parseInt(insumo.insumoId),
        cantidad,
        unidadMedida: item.unidadMedida,
        costoUnitario,
        costoTotal: costoInsumo,
        dosisPorHectarea: parseFloat(insumo.dosisPorHectarea)
      });

      // Descontar del inventario
      await prisma.inventarioItem.update({
        where: { id: parseInt(insumo.insumoId) },
        data: {
          stockActual: {
            decrement: cantidad
          }
        }
      });

      // Registrar movimiento de inventario
      await prisma.movimientoInventario.create({
        data: {
          itemId: parseInt(insumo.insumoId),
          tipo: 'Salida',
          cantidad,
          unidadMedida: item.unidadMedida,
          costoUnitario,
          costoTotal: costoInsumo,
          razon: `Aplicación en parcela - ${tipoAplicacion}`,
          referencia: `Período: ${periodoSiembraId}`,
          responsable
        }
      });
    }

    // Crear aplicación
    const aplicacion = await prisma.aplicacionParcela.create({
      data: {
        periodoSiembraId: parseInt(periodoSiembraId),
        parcelaId: parseInt(parcelaId),
        fecha: new Date(fecha),
        hectareasAplicadas: parseFloat(hectareasAplicadas),
        tipoAplicacion,
        costoTotal,
        responsable,
        observaciones,
        insumos: {
          create: insumosData
        }
      },
      include: {
        insumos: {
          include: {
            insumo: true
          }
        },
        parcela: true
      }
    });

    // Actualizar costo total del período
    await prisma.periodoSiembra.update({
      where: { id: parseInt(periodoSiembraId) },
      data: {
        costoTotal: {
          increment: costoTotal
        }
      }
    });

    res.status(201).json(aplicacion);
  } catch (error) {
    console.error('Error al registrar aplicación:', error);
    res.status(500).json({ message: 'Error al registrar aplicación' });
  }
};

/**
 * Obtener historial de aplicaciones
 */
exports.getAplicaciones = async (req, res) => {
  try {
    const { parcelaId, periodoSiembraId } = req.query;

    const where = {};
    if (parcelaId) where.parcelaId = parseInt(parcelaId);
    if (periodoSiembraId) where.periodoSiembraId = parseInt(periodoSiembraId);

    const aplicaciones = await prisma.aplicacionParcela.findMany({
      where,
      include: {
        parcela: true,
        periodoSiembra: {
          include: {
            cultivo: true
          }
        },
        insumos: {
          include: {
            insumo: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    res.json(aplicaciones);
  } catch (error) {
    console.error('Error al obtener aplicaciones:', error);
    res.status(500).json({ message: 'Error al obtener aplicaciones' });
  }
};

// ==========================================
// REPORTES Y ESTADÍSTICAS
// ==========================================

/**
 * Reporte de producción por parcela
 */
exports.getReporteProduccion = async (req, res) => {
  try {
    const { parcelaId, fechaInicio, fechaFin } = req.query;

    const where = {
      estado: 'Finalizado'
    };

    if (parcelaId) where.parcelaId = parseInt(parcelaId);
    if (fechaInicio && fechaFin) {
      where.fechaInicio = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      };
    }

    const periodos = await prisma.periodoSiembra.findMany({
      where,
      include: {
        parcela: true,
        cultivo: true,
        aplicaciones: {
          include: {
            insumos: {
              include: {
                insumo: true
              }
            }
          }
        }
      }
    });

    const reporte = periodos.map(periodo => ({
      parcela: periodo.parcela.nombre,
      cultivo: periodo.cultivo.nombre,
      hectareas: periodo.hectareasSembradas,
      rendimientoEsperado: periodo.rendimientoEsperado,
      rendimientoReal: periodo.rendimientoReal,
      variacion: periodo.rendimientoReal && periodo.rendimientoEsperado 
        ? ((periodo.rendimientoReal - periodo.rendimientoEsperado) / periodo.rendimientoEsperado * 100).toFixed(2)
        : null,
      costoTotal: periodo.costoTotal,
      costoPorHectarea: periodo.costoTotal / periodo.hectareasSembradas,
      fechaInicio: periodo.fechaInicio,
      fechaCosecha: periodo.fechaCosechaReal,
      numeroAplicaciones: periodo.aplicaciones.length
    }));

    res.json(reporte);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

/**
 * Estadísticas generales de parcelas
 */
exports.getEstadisticasParcelas = async (req, res) => {
  try {
    const parcelas = await prisma.parcela.findMany({
      where: { activo: true },
      include: {
        periodosSiembra: {
          include: {
            aplicaciones: true
          }
        }
      }
    });

    const estadisticas = {
      totalParcelas: parcelas.length,
      superficieTotal: parcelas.reduce((sum, p) => sum + p.superficieHa, 0),
      parcelasActivas: parcelas.filter(p => p.estado === 'Activa').length,
      periodosSiembraActivos: 0,
      costoTotalAplicaciones: 0,
      porEstado: {}
    };

    parcelas.forEach(parcela => {
      const periodosActivos = parcela.periodosSiembra.filter(ps => ps.estado === 'En Curso');
      estadisticas.periodosSiembraActivos += periodosActivos.length;

      parcela.periodosSiembra.forEach(ps => {
        estadisticas.costoTotalAplicaciones += ps.costoTotal;
      });

      if (!estadisticas.porEstado[parcela.estado]) {
        estadisticas.porEstado[parcela.estado] = 0;
      }
      estadisticas.porEstado[parcela.estado]++;
    });

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

/**
 * Trazabilidad completa de una parcela
 */
exports.getTrazabilidad = async (req, res) => {
  try {
    const { parcelaId } = req.params;

    const parcela = await prisma.parcela.findUnique({
      where: { id: parseInt(parcelaId) },
      include: {
        periodosSiembra: {
          include: {
            cultivo: true,
            aplicaciones: {
              include: {
                insumos: {
                  include: {
                    insumo: true
                  }
                }
              },
              orderBy: { fecha: 'asc' }
            },
            actividades: {
              orderBy: { fechaProgramada: 'asc' }
            }
          },
          orderBy: { fechaInicio: 'desc' }
        }
      }
    });

    if (!parcela) {
      return res.status(404).json({ message: 'Parcela no encontrada' });
    }

    // Construir línea de tiempo de trazabilidad
    const trazabilidad = parcela.periodosSiembra.map(periodo => {
      const aplicaciones = periodo.aplicaciones.map(app => ({
        fecha: app.fecha,
        tipo: 'Aplicación',
        tipoAplicacion: app.tipoAplicacion,
        hectareas: app.hectareasAplicadas,
        costo: app.costoTotal,
        insumos: app.insumos.map(ins => ({
          nombre: ins.insumo.nombre,
          cantidad: ins.cantidad,
          unidad: ins.unidadMedida,
          dosis: ins.dosisPorHectarea
        })),
        responsable: app.responsable
      }));

      const actividades = periodo.actividades.map(act => ({
        fecha: act.fechaRealizada || act.fechaProgramada,
        tipo: 'Actividad',
        nombre: act.nombre,
        tipoActividad: act.tipo,
        estado: act.estado,
        costo: act.costo,
        responsable: act.responsable
      }));

      const eventos = [...aplicaciones, ...actividades].sort((a, b) => 
        new Date(a.fecha) - new Date(b.fecha)
      );

      return {
        periodo: {
          codigo: periodo.codigo,
          cultivo: periodo.cultivo.nombre,
          fechaInicio: periodo.fechaInicio,
          fechaFin: periodo.fechaFin || periodo.fechaCosechaReal,
          estado: periodo.estado,
          hectareas: periodo.hectareasSembradas,
          costoTotal: periodo.costoTotal,
          rendimiento: periodo.rendimientoReal
        },
        eventos
      };
    });

    res.json({
      parcela: {
        codigo: parcela.codigo,
        nombre: parcela.nombre,
        superficie: parcela.superficieHa,
        ubicacion: parcela.ubicacion
      },
      trazabilidad
    });
  } catch (error) {
    console.error('Error al obtener trazabilidad:', error);
    res.status(500).json({ message: 'Error al obtener trazabilidad' });
  }
};
