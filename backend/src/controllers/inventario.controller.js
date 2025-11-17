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
    res.status(500).json({ message: 'Error al obtener items del inventario' });
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
    res.status(500).json({ message: 'Error al obtener item' });
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
      data.diasParaVencer = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
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
    res.status(500).json({ message: 'Error al crear item' });
  }
};

/**
 * Actualizar item
 */
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Recalcular valor total
    if (data.stockActual !== undefined && data.costoUnitario !== undefined) {
      data.valorTotal = data.stockActual * data.costoUnitario;
    }

    // Recalcular días para vencer
    if (data.fechaVencimiento) {
      const hoy = new Date();
      const vencimiento = new Date(data.fechaVencimiento);
      data.diasParaVencer = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    }

    // Determinar estado
    if (data.stockActual !== undefined || data.stockMinimo !== undefined || data.diasParaVencer !== undefined) {
      const itemActual = await prisma.inventarioItem.findUnique({
        where: { id: parseInt(id) }
      });
      data.estado = determinarEstado({ ...itemActual, ...data });
    }

    const item = await prisma.inventarioItem.update({
      where: { id: parseInt(id) },
      data
    });

    // Actualizar alertas
    await generarAlertas(item.id);

    res.json(item);
  } catch (error) {
    console.error('Error al actualizar item:', error);
    res.status(500).json({ message: 'Error al actualizar item' });
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
    res.status(500).json({ message: 'Error al eliminar item' });
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
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
};

/**
 * Registrar movimiento
 */
exports.registrarMovimiento = async (req, res) => {
  try {
    const { itemId, tipo, cantidad, costoUnitario, ...restoData } = req.body;

    // Obtener item actual
    const item = await prisma.inventarioItem.findUnique({
      where: { id: parseInt(itemId) }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    // Calcular nuevo stock según tipo de movimiento
    let nuevoStock = item.stockActual;
    if (tipo === 'Entrada' || tipo === 'Devolución') {
      nuevoStock += parseFloat(cantidad);
    } else if (tipo === 'Salida' || tipo === 'Merma') {
      nuevoStock -= parseFloat(cantidad);
    } else if (tipo === 'Ajuste') {
      nuevoStock = parseFloat(cantidad);
    }

    // Validar que el stock no sea negativo
    if (nuevoStock < 0) {
      return res.status(400).json({ message: 'Stock insuficiente' });
    }

    // Calcular costo total
    const costoTotal = (costoUnitario || item.costoUnitario) * parseFloat(cantidad);

    // Registrar movimiento
    const movimiento = await prisma.movimientoInventario.create({
      data: {
        itemId: parseInt(itemId),
        tipo,
        cantidad: parseFloat(cantidad),
        unidadMedida: item.unidadMedida,
        costoUnitario: costoUnitario || item.costoUnitario,
        costoTotal,
        ...restoData
      }
    });

    // Actualizar stock del item
    const nuevoValorTotal = nuevoStock * (costoUnitario || item.costoUnitario);
    const nuevoEstado = determinarEstado({
      ...item,
      stockActual: nuevoStock,
      costoUnitario: costoUnitario || item.costoUnitario
    });

    await prisma.inventarioItem.update({
      where: { id: parseInt(itemId) },
      data: {
        stockActual: nuevoStock,
        valorTotal: nuevoValorTotal,
        estado: nuevoEstado,
        ultimoMovimiento: new Date(),
        ...(costoUnitario && { costoUnitario })
      }
    });

    // Generar alertas
    await generarAlertas(parseInt(itemId));

    res.status(201).json(movimiento);
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    res.status(500).json({ message: 'Error al registrar movimiento' });
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
    res.status(500).json({ message: 'Error al obtener alertas' });
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
    res.status(500).json({ message: 'Error al marcar alerta' });
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
      itemsBajoStock: items.filter(i => i.estado === 'Stock Bajo' || i.estado === 'Stock Crítico').length,
      itemsPorVencer: items.filter(i => i.estado === 'Por Vencer').length,
      itemsVencidos: items.filter(i => i.estado === 'Vencido').length,
      itemsAgotados: items.filter(i => i.estado === 'Agotado').length,
      porCategoria: {}
    };

    // Agrupar por categoría
    items.forEach(item => {
      if (!estadisticas.porCategoria[item.categoria]) {
        estadisticas.porCategoria[item.categoria] = 0;
      }
      estadisticas.porCategoria[item.categoria]++;
    });

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
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
    res.status(500).json({ message: 'Error al buscar items' });
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
        tipoAlerta: 'Producto Vencido',
        mensaje: `Producto vencido hace ${Math.abs(item.diasParaVencer)} días`,
        prioridad: 'alta'
      });
    } else if (item.diasParaVencer <= 30) {
      alertas.push({
        itemId,
        itemNombre: item.nombre,
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
}