const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 🔄 ACTUALIZACIÓN AUTOMÁTICA DE ESTADOS VENCIDOS
 * Cambia de "En Curso" a "Finalizado" cuando la fecha de cosecha ya pasó
 */
async function actualizarEstadosVencidos() {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Reiniciar horas para comparar solo fechas

    console.log('🔍 Verificando períodos vencidos...');

    // Actualizar períodos "En Curso" cuya fecha de cosecha ya pasó
    const resultado = await prisma.periodoSiembra.updateMany({
      where: {
        estado: 'En Curso',
        fechaCosechaEsperada: {
          lt: hoy // Menor que hoy (ya pasó)
        }
      },
      data: {
        estado: 'Finalizado',
        fechaFin: hoy
      }
    });

    if (resultado.count > 0) {
      console.log(`✅ ${resultado.count} período(s) actualizado(s) automáticamente a "Finalizado"`);
    } else {
      console.log('ℹ️  No hay períodos vencidos para actualizar');
    }

    return resultado.count;
  } catch (error) {
    console.error('❌ Error al actualizar estados vencidos:', error);
    return 0;
  }
}

/**
 * Obtener todos los períodos de siembra
 * GET /api/periodos-siembra
 */
exports.getAll = async (req, res) => {
  try {
    // 🔄 Actualizar estados automáticamente ANTES de consultar
    await actualizarEstadosVencidos();

    const periodos = await prisma.periodoSiembra.findMany({
      include: {
        parcela: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            superficieHa: true
          }
        },
        cultivo: {
          select: {
            id: true,
            nombre: true,
            variedad: true,
            diasCiclo: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });

    // ✅ MAPEO PARA FRONTEND
    const periodosFormateados = periodos.map(p => ({
      id: p.id,
      parcelaId: p.parcelaId,
      parcelaNombre: p.parcela?.nombre || 'Sin nombre',
      cultivoId: p.cultivoId,
      cultivo: p.cultivo?.nombre || 'Sin cultivo',
      hectareasSembradas: parseFloat(p.hectareasSembradas),
      fechaInicio: p.fechaInicio,
      fechaCosechaEsperada: p.fechaCosechaEsperada,
      estado: p.estado,
      codigo: p.codigo,
      observaciones: p.observaciones
    }));

    res.json(periodosFormateados);
  } catch (error) {
    console.error('Error en getAll:', error);
    res.status(500).json({ message: 'Error al obtener períodos de siembra', error: error.message });
  }
};

/**
 * Obtener períodos activos
 * GET /api/periodos-siembra/activos
 */
exports.getActivos = async (req, res) => {
  try {
    // 🔄 Actualizar estados automáticamente ANTES de consultar
    await actualizarEstadosVencidos();

    const periodosActivos = await prisma.periodoSiembra.findMany({
      where: { estado: 'En Curso' },
      include: {
        parcela: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            superficieHa: true
          }
        },
        cultivo: {
          select: {
            id: true,
            nombre: true,
            variedad: true,
            diasCiclo: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });

    // ✅ MAPEO PARA FRONTEND
    const periodosFormateados = periodosActivos.map(p => ({
      id: p.id,
      parcelaId: p.parcelaId,
      parcelaNombre: p.parcela?.nombre || 'Sin nombre',
      cultivoId: p.cultivoId,
      cultivo: p.cultivo?.nombre || 'Sin cultivo',
      hectareasSembradas: parseFloat(p.hectareasSembradas),
      fechaInicio: p.fechaInicio,
      fechaCosechaEsperada: p.fechaCosechaEsperada,
      estado: p.estado,
      codigo: p.codigo
    }));

    res.json(periodosFormateados);
  } catch (error) {
    console.error('Error en getActivos:', error);
    res.status(500).json({ message: 'Error al obtener períodos activos', error: error.message });
  }
};

/**
 * Obtener un período por ID
 * GET /api/periodos-siembra/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔄 Actualizar estados antes de consultar
    await actualizarEstadosVencidos();

    const periodo = await prisma.periodoSiembra.findUnique({
      where: { id: parseInt(id) },
      include: {
        parcela: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            superficieHa: true,
            ubicacion: true
          }
        },
        cultivo: {
          select: {
            id: true,
            nombre: true,
            variedad: true,
            diasCiclo: true,
            costoPorHectarea: true,
            rendimientoEsperado: true
          }
        },
        aplicaciones: {
          include: {
            insumos: {
              include: {
                insumo: {
                  select: {
                    nombre: true,
                    unidadMedida: true
                  }
                }
              }
            }
          },
          orderBy: { fecha: 'desc' }
        },
        actividades: {
          orderBy: { fechaProgramada: 'asc' }
        }
      }
    });

    if (!periodo) {
      return res.status(404).json({ message: 'Período de siembra no encontrado' });
    }

    res.json(periodo);
  } catch (error) {
    console.error('Error en getById:', error);
    res.status(500).json({ message: 'Error al obtener período', error: error.message });
  }
};

/**
 * Crear un nuevo período de siembra
 * POST /api/periodos-siembra
 */
exports.create = async (req, res) => {
  try {
    const {
      parcelaId,
      cultivoId,
      fechaInicio,
      fechaCosechaEsperada,
      hectareasSembradas,
      rendimientoEsperado,
      observaciones
    } = req.body;

    // Validaciones
    if (!parcelaId || !cultivoId || !fechaInicio || !fechaCosechaEsperada || !hectareasSembradas) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Verificar que la parcela existe y está activa
    const parcela = await prisma.parcela.findUnique({
      where: { id: parseInt(parcelaId) }
    });

    if (!parcela || !parcela.activo) {
      return res.status(404).json({ message: 'Parcela no encontrada o inactiva' });
    }

    // Verificar que el cultivo existe y está activo
    const cultivo = await prisma.cultivo.findUnique({
      where: { id: parseInt(cultivoId) }
    });

    if (!cultivo || !cultivo.activo) {
      return res.status(404).json({ message: 'Cultivo no encontrado o inactivo' });
    }

    // Generar código único
    const codigo = `PS-${parcela.codigo}-${Date.now()}`;

    // Crear período
    const nuevoPeriodo = await prisma.periodoSiembra.create({
      data: {
        parcelaId: parseInt(parcelaId),
        cultivoId: parseInt(cultivoId),
        codigo,
        fechaInicio: new Date(fechaInicio),
        fechaCosechaEsperada: new Date(fechaCosechaEsperada),
        hectareasSembradas: parseFloat(hectareasSembradas),
        rendimientoEsperado: rendimientoEsperado ? parseFloat(rendimientoEsperado) : null,
        observaciones: observaciones || null,
        estado: 'En Curso'
      },
      include: {
        parcela: {
          select: { nombre: true, codigo: true }
        },
        cultivo: {
          select: { nombre: true, variedad: true }
        }
      }
    });

    res.status(201).json({
      message: 'Período de siembra creado exitosamente',
      periodo: nuevoPeriodo
    });
  } catch (error) {
    console.error('Error en create:', error);
    res.status(500).json({ message: 'Error al crear período de siembra', error: error.message });
  }
};

/**
 * Actualizar un período de siembra
 * PUT /api/periodos-siembra/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fechaCosechaEsperada,
      hectareasSembradas,
      rendimientoEsperado,
      observaciones,
      estado
    } = req.body;

    // Verificar que existe
    const periodoExiste = await prisma.periodoSiembra.findUnique({
      where: { id: parseInt(id) }
    });

    if (!periodoExiste) {
      return res.status(404).json({ message: 'Período de siembra no encontrado' });
    }

    // Actualizar
    const periodoActualizado = await prisma.periodoSiembra.update({
      where: { id: parseInt(id) },
      data: {
        fechaCosechaEsperada: fechaCosechaEsperada ? new Date(fechaCosechaEsperada) : undefined,
        hectareasSembradas: hectareasSembradas ? parseFloat(hectareasSembradas) : undefined,
        rendimientoEsperado: rendimientoEsperado ? parseFloat(rendimientoEsperado) : undefined,
        observaciones: observaciones !== undefined ? observaciones : undefined,
        estado: estado || undefined
      },
      include: {
        parcela: { select: { nombre: true } },
        cultivo: { select: { nombre: true } }
      }
    });

    res.json({
      message: 'Período actualizado exitosamente',
      periodo: periodoActualizado
    });
  } catch (error) {
    console.error('Error en update:', error);
    res.status(500).json({ message: 'Error al actualizar período', error: error.message });
  }
};

/**
 * Cerrar un período de siembra (finalizar ciclo)
 * POST /api/periodos-siembra/:id/cerrar
 */
exports.cerrar = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCosechaReal, rendimientoReal, observaciones } = req.body;

    // Validaciones
    if (!fechaCosechaReal || !rendimientoReal) {
      return res.status(400).json({ message: 'Fecha de cosecha real y rendimiento real son obligatorios' });
    }

    // Verificar que existe y está activo
    const periodo = await prisma.periodoSiembra.findUnique({
      where: { id: parseInt(id) }
    });

    if (!periodo) {
      return res.status(404).json({ message: 'Período no encontrado' });
    }

    if (periodo.estado !== 'En Curso') {
      return res.status(400).json({ message: 'El período ya está finalizado o cancelado' });
    }

    // Cerrar período
    const periodoCerrado = await prisma.periodoSiembra.update({
      where: { id: parseInt(id) },
      data: {
        fechaFin: new Date(),
        fechaCosechaReal: new Date(fechaCosechaReal),
        rendimientoReal: parseFloat(rendimientoReal),
        estado: 'Finalizado',
        observaciones: observaciones || periodo.observaciones
      },
      include: {
        parcela: { select: { nombre: true } },
        cultivo: { select: { nombre: true } }
      }
    });

    res.json({
      message: 'Período cerrado exitosamente',
      periodo: periodoCerrado
    });
  } catch (error) {
    console.error('Error en cerrar:', error);
    res.status(500).json({ message: 'Error al cerrar período', error: error.message });
  }
};

/**
 * Eliminar un período de siembra
 * DELETE /api/periodos-siembra/:id
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const periodo = await prisma.periodoSiembra.findUnique({
      where: { id: parseInt(id) },
      include: {
        aplicaciones: true,
        actividades: true
      }
    });

    if (!periodo) {
      return res.status(404).json({ message: 'Período no encontrado' });
    }

    // Verificar si tiene aplicaciones o actividades
    if (periodo.aplicaciones.length > 0 || periodo.actividades.length > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar un período con aplicaciones o actividades registradas'
      });
    }

    // Eliminar
    await prisma.periodoSiembra.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Período eliminado exitosamente' });
  } catch (error) {
    console.error('Error en delete:', error);
    res.status(500).json({ message: 'Error al eliminar período', error: error.message });
  }
};

/**
 * Obtener períodos por parcela
 * GET /api/periodos-siembra/parcela/:parcelaId
 */
exports.getPorParcela = async (req, res) => {
  try {
    const { parcelaId } = req.params;

    // 🔄 Actualizar estados antes de consultar
    await actualizarEstadosVencidos();

    const periodos = await prisma.periodoSiembra.findMany({
      where: { parcelaId: parseInt(parcelaId) },
      include: {
        cultivo: {
          select: { nombre: true, variedad: true }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });

    res.json(periodos);
  } catch (error) {
    console.error('Error en getPorParcela:', error);
    res.status(500).json({ message: 'Error al obtener períodos de la parcela', error: error.message });
  }
};

/**
 * Obtener estadísticas de un período
 * GET /api/periodos-siembra/:id/estadisticas
 */
exports.getEstadisticas = async (req, res) => {
  try {
    const { id } = req.params;

    const periodo = await prisma.periodoSiembra.findUnique({
      where: { id: parseInt(id) },
      include: {
        aplicaciones: {
          include: {
            insumos: true
          }
        },
        actividades: true
      }
    });

    if (!periodo) {
      return res.status(404).json({ message: 'Período no encontrado' });
    }

    // Calcular estadísticas
    const totalAplicaciones = periodo.aplicaciones.length;
    const totalInsumos = periodo.aplicaciones.reduce((sum, app) => sum + app.insumos.length, 0);
    const costoTotal = periodo.aplicaciones.reduce((sum, app) => sum + app.costoTotal, 0);
    
    const actividadesRealizadas = periodo.actividades.filter(a => a.estado === 'Completada').length;
    const actividadesPendientes = periodo.actividades.filter(a => a.estado === 'Pendiente').length;

    // Calcular progreso
    const hoy = new Date();
    const inicio = new Date(periodo.fechaInicio);
    const fin = new Date(periodo.fechaCosechaEsperada);
    const totalDias = (fin - inicio) / (1000 * 60 * 60 * 24);
    const diasTranscurridos = (hoy - inicio) / (1000 * 60 * 60 * 24);
    const progreso = Math.min(Math.max(Math.round((diasTranscurridos / totalDias) * 100), 0), 100);

    res.json({
      totalAplicaciones,
      totalInsumos,
      costoTotal,
      costoPromedioPorHectarea: costoTotal / periodo.hectareasSembradas,
      actividadesRealizadas,
      actividadesPendientes,
      progreso,
      diasTranscurridos: Math.floor(diasTranscurridos),
      diasRestantes: Math.ceil(totalDias - diasTranscurridos)
    });
  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};