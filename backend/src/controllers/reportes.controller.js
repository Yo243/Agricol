const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Dashboard principal de reportes
 * GET /api/reportes/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Convertir fechas
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date(new Date().setMonth(new Date().getMonth() - 3));
    const fin = fechaFin ? new Date(fechaFin) : new Date();

    // 1. Resumen General
    const [totalParcelas, parcelasData, cultivosActivos, costoTotal] = await Promise.all([
      prisma.parcela.count({ where: { activo: true } }),
      prisma.parcela.aggregate({
        where: { activo: true },
        _sum: { superficieHa: true }
      }),
      prisma.cultivo.count({ where: { activo: true } }),
      prisma.aplicacionParcela.aggregate({
        where: {
          fecha: { gte: inicio, lte: fin }
        },
        _sum: { costoTotal: true }
      })
    ]);

    const resumenGeneral = {
      totalParcelas,
      hectareasTotales: parcelasData._sum.superficieHa || 0,
      cultivosActivos,
      costoTotalAcumulado: costoTotal._sum.costoTotal || 0
    };

    // 2. Consumo por Cultivo
    const consumoPorCultivo = await prisma.aplicacionInsumo.groupBy({
      by: ['insumoId'],
      _sum: {
        cantidad: true,
        costoTotal: true
      },
      where: {
        aplicacion: {
          fecha: { gte: inicio, lte: fin }
        }
      }
    });

    const consumoConNombres = await Promise.all(
      consumoPorCultivo.map(async (item) => {
        const insumo = await prisma.inventarioItem.findUnique({
          where: { id: item.insumoId },
          select: { nombre: true, unidadMedida: true }
        });
        return {
          cultivo: insumo?.nombre || 'Desconocido',
          cantidad: item._sum.cantidad || 0,
          unidad: insumo?.unidadMedida || 'kg',
          costo: item._sum.costoTotal || 0
        };
      })
    );

    // 3. Costos por Mes
    const aplicaciones = await prisma.aplicacionParcela.findMany({
      where: {
        fecha: { gte: inicio, lte: fin }
      },
      select: {
        fecha: true,
        costoTotal: true
      },
      orderBy: { fecha: 'asc' }
    });

    const costosPorMes = aplicaciones.reduce((acc, app) => {
      const mes = app.fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'short' });
      if (!acc[mes]) {
        acc[mes] = { mes, costo: 0, aplicaciones: 0 };
      }
      acc[mes].costo += app.costoTotal;
      acc[mes].aplicaciones += 1;
      return acc;
    }, {});

    // 4. Períodos Activos, progreso
    const periodosActivos = await prisma.periodoSiembra.findMany({
      where: { estado: 'En Curso' },
      include: {
        parcela: { select: { nombre: true } },
        cultivo: { select: { nombre: true } }
      },
      orderBy: { fechaInicio: 'desc' },
      take: 10
    });

    const periodosFormateados = periodosActivos.map(p => {
      const hoy = new Date();
      const inicio = new Date(p.fechaInicio);
      const fin = new Date(p.fechaCosechaEsperada);
      const totalDias = (fin - inicio) / (1000 * 60 * 60 * 24);
      const diasTranscurridos = (hoy - inicio) / (1000 * 60 * 60 * 24);
      const progreso = Math.min(Math.round((diasTranscurridos / totalDias) * 100), 100);

      return {
        id: p.id,
        codigo: p.codigo,
        cultivo: p.cultivo.nombre,
        parcela: p.parcela.nombre,
        hectareas: p.hectareasSembradas,
        fechaInicio: p.fechaInicio,
        fechaCosechaEsperada: p.fechaCosechaEsperada,
        estado: p.estado,
        progreso,
        costoTotal: p.costoTotal
      };
    });

    // 5. Alertas Recientes
    const alertas = await prisma.alertaInventario.findMany({
      where: {
        leida: false,
        fecha: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { fecha: 'desc' },
      take: 5
    });

    res.json({
      resumenGeneral,
      consumoPorCultivo: consumoConNombres,
      costosPorMes: Object.values(costosPorMes),
      periodosActivos: periodosFormateados,
      alertas
    });
  } catch (error) {
    console.error('Error en getDashboard:', error);
    res.status(500).json({ message: 'Error al obtener datos del dashboard', error: error.message });
  }
};

/**
 * Reporte de consumo por cultivo
 * GET /api/reportes/consumo-cultivo
 */
exports.getConsumoPorCultivo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const whereClause = {};
    if (fechaInicio && fechaFin) {
      whereClause.aplicacion = {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        }
      };
    }

    const consumo = await prisma.aplicacionInsumo.groupBy({
      by: ['insumoId'],
      _sum: {
        cantidad: true,
        costoTotal: true
      },
      where: whereClause
    });

    const resultado = await Promise.all(
      consumo.map(async (item) => {
        const insumo = await prisma.inventarioItem.findUnique({
          where: { id: item.insumoId },
          select: { nombre: true, categoria: true, unidadMedida: true, costoUnitario: true }
        });

        return {
          nombre: insumo?.nombre || 'Desconocido',
          categoria: insumo?.categoria || 'Sin categoría',
          cantidad: item._sum.cantidad || 0,
          unidad: insumo?.unidadMedida || 'kg',
          costoUnitario: insumo?.costoUnitario || 0,
          costoTotal: item._sum.costoTotal || 0
        };
      })
    );

    res.json(resultado);
  } catch (error) {
    console.error('Error en getConsumoPorCultivo:', error);
    res.status(500).json({ message: 'Error al obtener consumo por cultivo', error: error.message });
  }
};

/**
 * Reporte de consumo por parcela
 * GET /api/reportes/consumo-parcela
 */
exports.getConsumoPorParcela = async (req, res) => {
  try {
    const { parcelaId } = req.query;

    const whereClause = parcelaId ? { parcelaId: parseInt(parcelaId) } : {};

    const aplicaciones = await prisma.aplicacionParcela.findMany({
      where: whereClause,
      include: {
        parcela: { select: { nombre: true, codigo: true } },
        insumos: {
          include: {
            insumo: { select: { nombre: true, unidadMedida: true } }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    const resultado = aplicaciones.map(app => ({
      id: app.id,
      parcela: app.parcela.nombre,
      codigoParcela: app.parcela.codigo,
      fecha: app.fecha,
      hectareasAplicadas: app.hectareasAplicadas,
      tipoAplicacion: app.tipoAplicacion,
      costoTotal: app.costoTotal,
      insumos: app.insumos.map(i => ({
        nombre: i.insumo.nombre,
        cantidad: i.cantidad,
        unidad: i.unidadMedida
      }))
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error en getConsumoPorParcela:', error);
    res.status(500).json({ message: 'Error al obtener consumo por parcela', error: error.message });
  }
};

/**
 * Reporte de costos
 * GET /api/reportes/costos
 */
exports.getCostos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, agruparPor = 'mes' } = req.query;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const aplicaciones = await prisma.aplicacionParcela.findMany({
      where: {
        fecha: { gte: inicio, lte: fin }
      },
      select: {
        fecha: true,
        costoTotal: true,
        tipoAplicacion: true
      },
      orderBy: { fecha: 'asc' }
    });

    const agrupado = aplicaciones.reduce((acc, app) => {
      let clave;
      if (agruparPor === 'dia') clave = app.fecha.toLocaleDateString('es-MX');
      else if (agruparPor === 'mes') clave = app.fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
      else clave = app.fecha.getFullYear().toString();

      if (!acc[clave]) {
        acc[clave] = { periodo: clave, costo: 0, aplicaciones: 0 };
      }
      acc[clave].costo += app.costoTotal;
      acc[clave].aplicaciones += 1;
      return acc;
    }, {});

    res.json(Object.values(agrupado));
  } catch (error) {
    console.error('Error en getCostos:', error);
    res.status(500).json({ message: 'Error al obtener costos', error: error.message });
  }
};

/**
 * Trazabilidad de parcela
 * GET /api/reportes/trazabilidad/:parcelaId
 */
exports.getTrazabilidadParcela = async (req, res) => {
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
              }
            }
          },
          orderBy: { fechaInicio: 'desc' }
        }
      }
    });

    if (!parcela) {
      return res.status(404).json({ message: 'Parcela no encontrada' });
    }

    const historial = parcela.periodosSiembra.map(periodo => ({
      id: periodo.id,
      codigo: periodo.codigo,
      cultivo: periodo.cultivo.nombre,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      estado: periodo.estado,
      hectareas: periodo.hectareasSembradas,
      rendimiento: periodo.rendimientoReal,
      costoTotal: periodo.costoTotal,
      aplicaciones: periodo.aplicaciones.length,
      detalleAplicaciones: periodo.aplicaciones.map(app => ({
        fecha: app.fecha,
        tipo: app.tipoAplicacion,
        hectareas: app.hectareasAplicadas,
        costo: app.costoTotal,
        insumos: app.insumos.map(i => ({
          nombre: i.insumo.nombre,
          cantidad: i.cantidad,
          unidad: i.unidadMedida
        }))
      }))
    }));

    res.json({
      parcela: {
        id: parcela.id,
        nombre: parcela.nombre,
        codigo: parcela.codigo,
        superficie: parcela.superficieHa
      },
      historial
    });
  } catch (error) {
    console.error('Error en getTrazabilidadParcela:', error);
    res.status(500).json({ message: 'Error al obtener trazabilidad', error: error.message });
  }
};

/**
 * Costos por hectárea
 * GET /api/reportes/costos-hectarea
 */
exports.getCostosPorHectarea = async (req, res) => {
  try {
    const { periodoId } = req.query;

    if (!periodoId) {
      return res.status(400).json({ message: "periodoId es requerido" });
    }

    const periodo = await prisma.periodoSiembra.findUnique({
      where: { id: Number(periodoId) },
      include: {
        parcela: { select: { nombre: true } },
        cultivo: { select: { nombre: true } },
        aplicaciones: {
          include: {
            insumos: true
          }
        }
      }
    });

    if (!periodo) {
      return res.status(404).json({ message: "Período no encontrado" });
    }

    let costoTotal = 0;
    periodo.aplicaciones.forEach(app => {
      app.insumos.forEach(i => {
        costoTotal += i.costoTotal;
      });
    });

    const costoPorHa = costoTotal / periodo.hectareasSembradas;

    res.json({
      periodoId: periodo.id,
      cultivo: periodo.cultivo.nombre,
      parcela: periodo.parcela.nombre,
      hectareas: periodo.hectareasSembradas,
      costoTotal,
      costoPorHectarea: costoPorHa
    });

  } catch (error) {
    console.error("Error en getCostosPorHectarea:", error);
    res.status(500).json({ message: "Error calculando costos por hectárea", error: error.message });
  }
};

/**
 * Alertas de inventario
 * GET /api/reportes/alertas
 */
exports.getAlertasInventario = async (req, res) => {
  try {
    const alertas = await prisma.alertaInventario.findMany({
      include: {
        item: {
          select: { nombre: true, unidadMedida: true }
        }
      },
      orderBy: { fecha: "desc" },
      take: 50
    });

    const resultado = alertas.map(a => ({
      id: a.id,
      tipo: a.tipo,
      prioridad: a.prioridad,
      titulo: `${a.tipoAlerta || a.tipo} - ${a.itemNombre || a.item?.nombre}`,
      mensaje: a.mensaje,
      fecha: a.fecha,
      insumo: a.item?.nombre || "Insumo desconocido",
      unidad: a.item?.unidadMedida || ""
    }));

    res.json(resultado);

  } catch (error) {
    console.error("Error en getAlertasInventario:", error);
    res.status(500).json({ message: "Error al obtener alertas", error: error.message });
  }
};
