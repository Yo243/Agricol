const prisma = require('../config/database');

/**
 * Servicio de Inventario
 * Maneja toda la lógica de negocio relacionada con el inventario
 */
class InventarioService {

  /**
   * Obtener todos los items del inventario
   */
  async getAllItems() {
    try {
      const items = await prisma.inventarioItem.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      return items;
    } catch (error) {
      throw new Error(`Error al obtener items: ${error.message}`);
    }
  }

  /**
   * Obtener un item por ID
   */
  async getItemById(id) {
    try {
      const item = await prisma.inventarioItem.findUnique({
        where: { id: parseInt(id) }
      });

      if (!item) {
        throw new Error('Item no encontrado');
      }

      return item;
    } catch (error) {
      throw new Error(`Error al obtener item: ${error.message}`);
    }
  }

  /**
   * Crear un nuevo item en el inventario
   */
  async createItem(data) {
    try {
      const newItem = await prisma.inventarioItem.create({
        data: {
          codigo: data.codigo,
          nombre: data.nombre,
          marca: data.marca || null,
          categoria: data.categoria,
          stockActual: parseFloat(data.stockActual),
          stockMinimo: parseFloat(data.stockMinimo),
          unidadMedida: data.unidadMedida,
          ubicacion: data.ubicacion,
          almacen: data.almacen || null,
          costoUnitario: parseFloat(data.costoUnitario),
          valorTotal: parseFloat(data.stockActual) * parseFloat(data.costoUnitario),
          fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
          estado: this.calcularEstado(
            parseFloat(data.stockActual),
            parseFloat(data.stockMinimo),
            data.fechaVencimiento ? new Date(data.fechaVencimiento) : null
          )
        }
      });

      return newItem;
    } catch (error) {
      throw new Error(`Error al crear item: ${error.message}`);
    }
  }

  /**
   * Actualizar un item existente
   */
  async updateItem(id, data) {
    try {
      const itemExistente = await this.getItemById(id);

      const stockActual = data.stockActual !== undefined 
        ? parseFloat(data.stockActual) 
        : itemExistente.stockActual;
      
      const stockMinimo = data.stockMinimo !== undefined 
        ? parseFloat(data.stockMinimo) 
        : itemExistente.stockMinimo;
      
      const costoUnitario = data.costoUnitario !== undefined 
        ? parseFloat(data.costoUnitario) 
        : itemExistente.costoUnitario;

      const fechaVencimiento = data.fechaVencimiento !== undefined
        ? (data.fechaVencimiento ? new Date(data.fechaVencimiento) : null)
        : itemExistente.fechaVencimiento;

      const updatedItem = await prisma.inventarioItem.update({
        where: { id: parseInt(id) },
        data: {
          ...data,
          stockActual,
          stockMinimo,
          costoUnitario,
          valorTotal: stockActual * costoUnitario,
          fechaVencimiento,
          estado: this.calcularEstado(stockActual, stockMinimo, fechaVencimiento),
          updatedAt: new Date()
        }
      });

      return updatedItem;
    } catch (error) {
      throw new Error(`Error al actualizar item: ${error.message}`);
    }
  }

  /**
   * Eliminar un item del inventario
   */
  async deleteItem(id) {
    try {
      await this.getItemById(id); // Verificar que existe

      await prisma.inventarioItem.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Item eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar item: ${error.message}`);
    }
  }

  /**
   * Registrar un movimiento de inventario (entrada/salida/merma)
   */
  async registrarMovimiento(itemId, tipo, cantidad, motivo, usuarioId) {
    try {
      const item = await this.getItemById(itemId);
      let nuevoStock = item.stockActual;

      // Calcular nuevo stock según tipo de movimiento
      switch (tipo) {
        case 'ENTRADA':
          nuevoStock += parseFloat(cantidad);
          break;
        case 'SALIDA':
          nuevoStock -= parseFloat(cantidad);
          if (nuevoStock < 0) {
            throw new Error('Stock insuficiente para realizar la salida');
          }
          break;
        case 'MERMA':
          nuevoStock -= parseFloat(cantidad);
          if (nuevoStock < 0) {
            throw new Error('Stock insuficiente para registrar la merma');
          }
          break;
        default:
          throw new Error('Tipo de movimiento no válido');
      }

      // Registrar el movimiento
      const movimiento = await prisma.movimientoInventario.create({
        data: {
          itemId: parseInt(itemId),
          tipo,
          cantidad: parseFloat(cantidad),
          stockAnterior: item.stockActual,
          stockNuevo: nuevoStock,
          motivo,
          usuarioId: parseInt(usuarioId),
          fecha: new Date()
        }
      });

      // Actualizar el stock del item
      await this.updateItem(itemId, {
        stockActual: nuevoStock
      });

      return movimiento;
    } catch (error) {
      throw new Error(`Error al registrar movimiento: ${error.message}`);
    }
  }

  /**
   * Obtener movimientos de un item
   */
  async getMovimientosByItem(itemId) {
    try {
      const movimientos = await prisma.movimientoInventario.findMany({
        where: { itemId: parseInt(itemId) },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        },
        orderBy: {
          fecha: 'desc'
        }
      });

      return movimientos;
    } catch (error) {
      throw new Error(`Error al obtener movimientos: ${error.message}`);
    }
  }

  /**
   * Obtener alertas de inventario
   */
  async getAlertas() {
    try {
      const hoy = new Date();
      const treintaDiasDespues = new Date();
      treintaDiasDespues.setDate(hoy.getDate() + 30);

      const items = await this.getAllItems();
      const alertas = [];

      items.forEach(item => {
        // Alerta de stock bajo
        if (item.stockActual <= item.stockMinimo && item.stockActual > 0) {
          alertas.push({
            tipo: 'STOCK_BAJO',
            itemId: item.id,
            itemNombre: item.nombre,
            mensaje: `Stock bajo: ${item.stockActual} ${item.unidadMedida} (mínimo: ${item.stockMinimo})`,
            prioridad: 'MEDIA',
            fecha: new Date()
          });
        }

        // Alerta de stock agotado
        if (item.stockActual === 0) {
          alertas.push({
            tipo: 'STOCK_AGOTADO',
            itemId: item.id,
            itemNombre: item.nombre,
            mensaje: `Stock agotado`,
            prioridad: 'ALTA',
            fecha: new Date()
          });
        }

        // Alerta de próximo vencimiento
        if (item.fechaVencimiento) {
          const diasParaVencer = Math.ceil(
            (new Date(item.fechaVencimiento) - hoy) / (1000 * 60 * 60 * 24)
          );

          if (diasParaVencer <= 30 && diasParaVencer > 0) {
            alertas.push({
              tipo: 'PROXIMO_VENCIMIENTO',
              itemId: item.id,
              itemNombre: item.nombre,
              mensaje: `Vence en ${diasParaVencer} días (${new Date(item.fechaVencimiento).toLocaleDateString()})`,
              prioridad: 'MEDIA',
              fecha: new Date()
            });
          } else if (diasParaVencer <= 0) {
            alertas.push({
              tipo: 'VENCIDO',
              itemId: item.id,
              itemNombre: item.nombre,
              mensaje: `Producto vencido desde ${new Date(item.fechaVencimiento).toLocaleDateString()}`,
              prioridad: 'ALTA',
              fecha: new Date()
            });
          }
        }
      });

      return alertas;
    } catch (error) {
      throw new Error(`Error al obtener alertas: ${error.message}`);
    }
  }

  /**
   * Calcular el estado de un item según stock y vencimiento
   */
  calcularEstado(stockActual, stockMinimo, fechaVencimiento) {
    // Verificar vencimiento primero
    if (fechaVencimiento) {
      const hoy = new Date();
      const diasParaVencer = Math.ceil(
        (new Date(fechaVencimiento) - hoy) / (1000 * 60 * 60 * 24)
      );

      if (diasParaVencer <= 0) {
        return 'VENCIDO';
      } else if (diasParaVencer <= 30) {
        return 'POR_VENCER';
      }
    }

    // Verificar stock
    if (stockActual === 0) {
      return 'AGOTADO';
    } else if (stockActual <= stockMinimo * 0.5) {
      return 'CRITICO';
    } else if (stockActual <= stockMinimo) {
      return 'BAJO';
    }

    return 'DISPONIBLE';
  }

  /**
   * Obtener estadísticas del inventario
   */
  async getEstadisticas() {
    try {
      const items = await this.getAllItems();

      const estadisticas = {
        totalItems: items.length,
        valorTotal: items.reduce((sum, item) => sum + item.valorTotal, 0),
        itemsBajoStock: items.filter(i => 
          i.estado === 'BAJO' || i.estado === 'CRITICO'
        ).length,
        itemsPorVencer: items.filter(i => i.estado === 'POR_VENCER').length,
        itemsVencidos: items.filter(i => i.estado === 'VENCIDO').length,
        itemsAgotados: items.filter(i => i.estado === 'AGOTADO').length,
        categorias: this.agruparPorCategoria(items)
      };

      return estadisticas;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Agrupar items por categoría
   */
  agruparPorCategoria(items) {
    const categorias = {};

    items.forEach(item => {
      if (!categorias[item.categoria]) {
        categorias[item.categoria] = {
          cantidad: 0,
          valorTotal: 0
        };
      }
      categorias[item.categoria].cantidad++;
      categorias[item.categoria].valorTotal += item.valorTotal;
    });

    return categorias;
  }

  /**
   * Buscar items por término
   */
  async buscarItems(termino) {
    try {
      const items = await prisma.inventarioItem.findMany({
        where: {
          OR: [
            { nombre: { contains: termino, mode: 'insensitive' } },
            { codigo: { contains: termino, mode: 'insensitive' } },
            { marca: { contains: termino, mode: 'insensitive' } }
          ]
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      return items;
    } catch (error) {
      throw new Error(`Error al buscar items: ${error.message}`);
    }
  }

  /**
   * Filtrar items por categoría y/o estado
   */
  async filtrarItems(categoria, estado) {
    try {
      const filtros = {};

      if (categoria && categoria !== 'TODAS') {
        filtros.categoria = categoria;
      }

      if (estado && estado !== 'TODOS') {
        filtros.estado = estado;
      }

      const items = await prisma.inventarioItem.findMany({
        where: filtros,
        orderBy: {
          nombre: 'asc'
        }
      });

      return items;
    } catch (error) {
      throw new Error(`Error al filtrar items: ${error.message}`);
    }
  }
}

module.exports = new InventarioService();