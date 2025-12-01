const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtener todos los items del inventario
 */
exports.getItems = async (req, res) => {
  try {
    const { activo, categoria, estado } = req.query;
    
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (categoria) where.categoria = categoria;
    if (estado) where.estado = estado;

    const items = await prisma.inventarioItem.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });

    res.json(items);
  } catch (error) {
    console.error('Error al obtener items:', error);
    res.status(500).json({
      message: 'Error al obtener items del inventario',
      error: error.message
    });
  }
};

/**
 * Obtener un item por ID
 */
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.inventarioItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        movimientos: {
          orderBy: { fecha: 'desc' },
          take: 10
        }
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error al obtener item:', error);
    res.status(500).json({
      message: 'Error al obtener item',
      error: error.message
    });
  }
};

/**
 * Crear nuevo item
 */
exports.createItem = async (req, res) => {
  try {
    const data = req.body;

    // Calcular valor total
    data.valorTotal = data.stockActual * data.costoUnitario;

    // Calcular días para vencer
    if (data.fechaVencimiento) {
      const hoy = new Date();
      const vencimiento = new Date(data.fechaVencimiento);
      data.diasParaVencer = Math.ceil(
        (vencimiento - hoy) / (1000 * 60 * 60 * 24)
      );
    }

    // Determinar estado automáticamente
    data.estado = determinarEstado(data);

    const item = await prisma.inventarioItem.create({
      data
    });

    // Generar alertas si es necesario
    await generarAlertas(item.id);

    res.status(201).json(item);
  } catch (error) {
    console.error('Error al crear item:', error);
    res.status(500).json({
      message: 'Error al crear item',
      error: error.message
    });
  }
};

/**
 * Actualizar item
 */
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // 🔧 Normalizar valores vacíos en numéricos
    const numericFields = [
      'stockActual',
      'stockMinimo',
      'stockMaximo',
      'costoUnitario',
      'precioVenta'
    ];

    numericFields.forEach((field) => {
      if (data[field] === '' || data[field] === null) {
        delete data[field];
      } else if (data[field] !== undefined) {
        data[field] = Number(data[field]);
      }
    });

    // Fechas: si viene vacío, eliminar
    ['fechaAdquisicion', 'fechaVencimiento'].forEach((field) => {
      if (!data[field]) {
        delete data[field];
      }
    });

    // Recalcular valor total si tenemos ambas cosas
    if (data.stockActual !== undefined && data.costoUnitario !== undefined) {
      data.valorTotal = data.stockActual * data.costoUnitario;
    }

    // Recalcular días para vencer
    if (data.fechaVencimiento) {
      const hoy = new Date();
      const vencimiento = new Date(data.fechaVencimiento);
      data.diasParaVencer = Math.ceil(
        (vencimiento - hoy) / (1000 * 60 * 60 * 24)
      );
    }

    // Determinar estado si cambiaron cosas relacionadas
    if (
      data.stockActual !== undefined ||
      data.stockMinimo !== undefined ||
      data.diasParaVencer !== undefined
    ) {
      const itemActual = await prisma.inventarioItem.findUnique({
        where: { id: parseInt(id) }
      });

      data.estado = determinarEstado({ ...itemActual, ...data });
    }

    const item = await prisma.inventarioItem.update({
      where: { id: parseInt(id) },
      data
    });

    await generarAlertas(item.id);

    res.json(item);
  } catch (error) {
    console.error('Error al actualizar item:', error);
    res.status(500).json({
      message: 'Error al actualizar item',
      error: error.message
    });
  }
};

/**
 * Eliminar item
 */
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.inventarioItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({
      message: 'Error al eliminar item',
      error: error.message
    });
  }
};

/**
 * Obtener movimientos
 */
exports.getMovimientos = async (req, res) => {
  try {
    const { itemId } = req.query;

    const where = {};
    if (itemId) where.itemId = parseInt(itemId);

    const movimientos = await prisma.movimientoInventario.findMany({
      where,
      include: {
        item: {
          select: {
            codigo: true,
            nombre: true
          }
        }
      },
      orderBy: { fecha: 'desc' },
      take: 100
    });

    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      message: 'Error al obtener movimientos',
      error: error.message
    });
  }
};

/**
 * Registrar movimiento
 */
exports.registrarMovimiento = async (req, res) => {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('📦 INICIO - Registro de Movimiento');
    console.log('═══════════════════════════════════════════');
    console.log('Body completo recibido:', JSON.stringify(req.body, null, 2));

    const {
      itemId,
      tipo,
      cantidad,
      costoUnitario,
      razon,        // ya usamos "razon"
      referencia,
      destino,
      observaciones, // por ahora NO lo mandamos a Prisma
      responsable
    } = req.body;

    // ✅ VALIDACIONES
    if (!itemId) {
      console.error('❌ Error: itemId es requerido');
      return res.status(400).json({ message: 'itemId es requerido' });
    }

    if (!tipo) {
      console.error('❌ Error: tipo es requerido');
      return res.status(400).json({ message: 'tipo es requerido' });
    }

    if (!cantidad || isNaN(parseFloat(cantidad))) {
      console.error('❌ Error: cantidad inválida:', cantidad);
      return res.status(400).json({
        message: 'cantidad es requerida y debe ser un número válido'
      });
    }

    console.log('✅ Validaciones pasadas');

    // Obtener item actual
    const item = await prisma.inventarioItem.findUnique({
      where: { id: parseInt(itemId) }
    });

    if (!item) {
      console.error('❌ Error: Item no encontrado con ID:', itemId);
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    console.log('✅ Item encontrado:', {
      id: item.id,
      nombre: item.nombre,
      codigo: item.codigo,
      stockActual: item.stockActual,
      unidadMedida: item.unidadMedida
    });

    // Calcular nuevo stock según tipo de movimiento
    let nuevoStock = item.stockActual;
    const cantidadFloat = parseFloat(cantidad);

    console.log('📊 Cálculo de stock:');
    console.log('   Stock actual:', nuevoStock);
    console.log('   Tipo movimiento:', tipo);
    console.log('   Cantidad:', cantidadFloat);

    if (tipo === 'Entrada' || tipo === 'ENTRADA') {
      nuevoStock += cantidadFloat;
      console.log('   ➕ Entrada - Nuevo stock:', nuevoStock);
    } else if (tipo === 'Salida' || tipo === 'SALIDA') {
      nuevoStock -= cantidadFloat;
      console.log('   ➖ Salida - Nuevo stock:', nuevoStock);
    } else if (tipo === 'Merma' || tipo === 'MERMA') {
      nuevoStock -= cantidadFloat;
      console.log('   ➖ Merma - Nuevo stock:', nuevoStock);
    } else if (tipo === 'Ajuste' || tipo === 'AJUSTE') {
      nuevoStock = cantidadFloat;
      console.log('   🔄 Ajuste - Nuevo stock:', nuevoStock);
    } else if (tipo === 'Devolución' || tipo === 'DEVOLUCION') {
      nuevoStock += cantidadFloat;
      console.log('   ↩️ Devolución - Nuevo stock:', nuevoStock);
    } else {
      console.error('❌ Tipo de movimiento desconocido:', tipo);
      return res.status(400).json({
        message: `Tipo de movimiento no válido: ${tipo}`,
        tiposValidos: ['Entrada', 'Salida', 'Merma', 'Ajuste', 'Devolución']
      });
    }

    // Validar que el stock no sea negativo
    if (nuevoStock < 0) {
      console.error('❌ Stock insuficiente:', {
        stockActual: item.stockActual,
        cantidadSolicitada: cantidadFloat,
        stockResultante: nuevoStock
      });
      return res.status(400).json({
        message: 'Stock insuficiente',
        stockActual: item.stockActual,
        cantidadSolicitada: cantidadFloat,
        faltante: Math.abs(nuevoStock)
      });
    }

    // Calcular costo
    const costoUnitarioFinal = costoUnitario
      ? parseFloat(costoUnitario)
      : item.costoUnitario;
    const costoTotal = costoUnitarioFinal * cantidadFloat;

    console.log('💰 Cálculo de costos:');
    console.log('   Costo unitario:', costoUnitarioFinal);
    console.log('   Costo total:', costoTotal);

    // Datos del movimiento (SIN observaciones por ahora)
    const movimientoData = {
      itemId: parseInt(itemId),
      tipo,
      cantidad: cantidadFloat,
      unidadMedida: item.unidadMedida,
      costoUnitario: costoUnitarioFinal,
      costoTotal,
      razon: razon || null,
      referencia: referencia || null,
      destino: destino || null,
      responsable: responsable || null,
      fecha: new Date()
      // ⚠️ No mandamos observaciones todavía para evitar el error de Prisma
      // observaciones: observaciones || null,
    };

    console.log('📝 Datos del movimiento a crear:', movimientoData);

    // Registrar movimiento en la base de datos
    console.log('💾 Creando movimiento en BD...');
    const movimiento = await prisma.movimientoInventario.create({
      data: movimientoData
    });

    console.log('✅ Movimiento creado con ID:', movimiento.id);

    // Actualizar stock del item
    const nuevoValorTotal = nuevoStock * costoUnitarioFinal;
    const nuevoEstado = determinarEstado({
      ...item,
      stockActual: nuevoStock,
      costoUnitario: costoUnitarioFinal
    });

    console.log('🔄 Actualizando item:');
    console.log('   Nuevo stock:', nuevoStock);
    console.log('   Nuevo valor total:', nuevoValorTotal);
    console.log('   Nuevo estado:', nuevoEstado);

    const itemActualizado = await prisma.inventarioItem.update({
      where: { id: parseInt(itemId) },
      data: {
        stockActual: nuevoStock,
        valorTotal: nuevoValorTotal,
        estado: nuevoEstado,
        ultimoMovimiento: new Date(),
        ...(costoUnitario && { costoUnitario: costoUnitarioFinal })
      }
    });

    console.log('✅ Item actualizado correctamente');

    // Generar alertas
    console.log('🔔 Generando alertas...');
    await generarAlertas(parseInt(itemId));
    console.log('✅ Alertas generadas');

    console.log('═══════════════════════════════════════════');
    console.log('✅ ÉXITO - Movimiento registrado');
    console.log('═══════════════════════════════════════════');

    res.status(201).json({
      success: true,
      message: 'Movimiento registrado correctamente',
      movimiento,
      item: {
        id: itemActualizado.id,
        nombre: itemActualizado.nombre,
        codigo: itemActualizado.codigo,
        stockAnterior: item.stockActual,
        stockNuevo: nuevoStock,
        estadoAnterior: item.estado,
        estadoNuevo: nuevoEstado
      }
    });
  } catch (error) {
    console.error('═══════════════════════════════════════════');
    console.error('❌ ERROR CRÍTICO en registro de movimiento');
    console.error('═══════════════════════════════════════════');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════════');

    res.status(500).json({
      message: 'Error al registrar movimiento',
      error: error.message,
      details:
        process.env.NODE_ENV === 'development'
          ? {
              stack: error.stack,
              prismaCode: error.code
            }
          : undefined
    });
  }
};

/**
 * Obtener alertas
 */
exports.getAlertas = async (req, res) => {
  try {
    const { leida } = req.query;

    const where = {};
    if (leida !== undefined) where.leida = leida === 'true';

    const alertas = await prisma.alertaInventario.findMany({
      where,
      orderBy: [
        { leida: 'asc' },
        { prioridad: 'desc' },
        { fecha: 'desc' }
      ]
    });

    res.json(alertas);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
};

/**
 * Marcar alerta como leída
 */
exports.marcarAlertaLeida = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.alertaInventario.update({
      where: { id: parseInt(id) },
      data: { leida: true }
    });

    res.json({ message: 'Alerta marcada como leída' });
  } catch (error) {
    console.error('Error al marcar alerta:', error);
    res.status(500).json({
      message: 'Error al marcar alerta',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas
 */
exports.getEstadisticas = async (req, res) => {
  try {
    const items = await prisma.inventarioItem.findMany({
      where: { activo: true }
    });

    const estadisticas = {
      totalItems: items.length,
      valorTotal: items.reduce((sum, item) => sum + item.valorTotal, 0),
      itemsBajoStock: items.filter(
        (i) => i.estado === 'Stock Bajo' || i.estado === 'Stock Crítico'
      ).length,
      itemsPorVencer: items.filter((i) => i.estado === 'Por Vencer').length,
      itemsVencidos: items.filter((i) => i.estado === 'Vencido').length,
      itemsAgotados: items.filter((i) => i.estado === 'Agotado').length,
      porCategoria: {}
    };

    // Agrupar por categoría
    items.forEach((item) => {
      if (!estadisticas.porCategoria[item.categoria]) {
        estadisticas.porCategoria[item.categoria] = 0;
      }
      estadisticas.porCategoria[item.categoria]++;
    });

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * Buscar items
 */
exports.buscarItems = async (req, res) => {
  try {
    const { q } = req.query;

    const items = await prisma.inventarioItem.findMany({
      where: {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { codigo: { contains: q, mode: 'insensitive' } },
          { descripcion: { contains: q, mode: 'insensitive' } }
        ],
        activo: true
      },
      take: 20
    });

    res.json(items);
  } catch (error) {
    console.error('Error al buscar items:', error);
    res.status(500).json({
      message: 'Error al buscar items',
      error: error.message
    });
  }
};

/**
 * FUNCIONES AUXILIARES
 */

function determinarEstado(item) {
  // Verificar vencimiento
  if (item.diasParaVencer !== null && item.diasParaVencer !== undefined) {
    if (item.diasParaVencer < 0) return 'Vencido';
    if (item.diasParaVencer <= 30) return 'Por Vencer';
  }

  // Verificar stock
  if (item.stockActual === 0) return 'Agotado';
  if (item.stockActual <= item.stockMinimo * 0.5) return 'Stock Crítico';
  if (item.stockActual <= item.stockMinimo) return 'Stock Bajo';

  return 'Disponible';
}

async function generarAlertas(itemId) {
  try {
    const item = await prisma.inventarioItem.findUnique({
      where: { id: itemId }
    });

    if (!item) return;

    // Eliminar alertas antiguas del item
    await prisma.alertaInventario.deleteMany({
      where: { itemId }
    });

    const alertas = [];

    // Alerta de stock agotado
    if (item.stockActual === 0) {
      alertas.push({
        itemId,
        itemNombre: item.nombre,
        tipo: 'Stock Agotado',
        tipoAlerta: 'Stock Agotado',
        mensaje: `El producto ${item.nombre} (${item.codigo}) está agotado`,
        prioridad: 'alta'
      });
    }
    // Alerta de stock crítico
    else if (item.stockActual <= item.stockMinimo * 0.5) {
      alertas.push({
        itemId,
        itemNombre: item.nombre,
        tipo: 'Stock Crítico',
        tipoAlerta: 'Stock Crítico',
        mensaje: `Stock crítico: ${item.stockActual} ${item.unidadMedida} (Mínimo: ${item.stockMinimo})`,
        prioridad: 'alta'
      });
    }
    // Alerta de stock bajo
    else if (item.stockActual <= item.stockMinimo) {
      alertas.push({
        itemId,
        itemNombre: item.nombre,
        tipo: 'Stock Bajo',
        tipoAlerta: 'Stock Bajo',
        mensaje: `Stock bajo: ${item.stockActual} ${item.unidadMedida} (Mínimo: ${item.stockMinimo})`,
        prioridad: 'media'
      });
    }

    // Alerta de vencimiento
    if (item.diasParaVencer !== null && item.diasParaVencer !== undefined) {
      if (item.diasParaVencer < 0) {
        alertas.push({
          itemId,
          itemNombre: item.nombre,
          tipo: 'Producto Vencido',
          tipoAlerta: 'Producto Vencido',
          mensaje: `Producto vencido hace ${Math.abs(item.diasParaVencer)} días`,
          prioridad: 'alta'
        });
      } else if (item.diasParaVencer <= 30) {
        alertas.push({
          itemId,
          itemNombre: item.nombre,
          tipo: 'Próximo a Vencer',
          tipoAlerta: 'Próximo a Vencer',
          mensaje: `Vence en ${item.diasParaVencer} días`,
          prioridad: item.diasParaVencer <= 7 ? 'alta' : 'media'
        });
      }
    }

    // Crear alertas
    if (alertas.length > 0) {
      await prisma.alertaInventario.createMany({
        data: alertas
      });
    }
  } catch (error) {
    console.error('Error al generar alertas:', error);
    // No lanzamos error para no romper el flujo principal
  }
}
