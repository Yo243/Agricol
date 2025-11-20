// backend/src/controllers/ordenes.controller.js

const ordenesService = require('../services/ordenes.service');

class OrdenesController {
  // Obtener todas las órdenes con filtros
  async getAll(req, res) {
    try {
      const { parcelaId, recetaId, estado, fechaDesde, fechaHasta, search } = req.query;

      const filters = {
        parcelaId: parcelaId ? parseInt(parcelaId) : undefined,
        recetaId: recetaId ? parseInt(recetaId) : undefined,
        estado: estado,
        fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
        search: search
      };

      const ordenes = await ordenesService.getAll(filters);

      res.json({
        message: 'Órdenes obtenidas exitosamente',
        data: ordenes
      });
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({
        message: 'Error al obtener órdenes',
        error: error.message
      });
    }
  }

  // Obtener orden por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const orden = await ordenesService.getById(parseInt(id));

      if (!orden) {
        return res.status(404).json({
          message: 'Orden no encontrada'
        });
      }

      res.json({
        message: 'Orden obtenida exitosamente',
        data: orden
      });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({
        message: 'Error al obtener orden',
        error: error.message
      });
    }
  }

  // Crear nueva orden
  async create(req, res) {
    try {
      const data = req.body;
      const orden = await ordenesService.create(data);

      res.status(201).json({
        message: 'Orden creada exitosamente',
        data: orden
      });
    } catch (error) {
      console.error('Error en create:', error);
      res.status(400).json({
        message: 'Error al crear orden',
        error: error.message
      });
    }
  }

  // Actualizar orden
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const orden = await ordenesService.update(parseInt(id), data);

      res.json({
        message: 'Orden actualizada exitosamente',
        data: orden
      });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(400).json({
        message: 'Error al actualizar orden',
        error: error.message
      });
    }
  }

  // Eliminar orden
  async delete(req, res) {
    try {
      const { id } = req.params;
      await ordenesService.delete(parseInt(id));

      res.json({
        message: 'Orden eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(400).json({
        message: 'Error al eliminar orden',
        error: error.message
      });
    }
  }

  // Cerrar orden y descontar inventario
  async cerrarOrden(req, res) {
    try {
      const { id } = req.params;
      const orden = await ordenesService.cerrarOrden(parseInt(id));

      res.json({
        message: 'Orden cerrada exitosamente. Inventario actualizado.',
        data: orden
      });
    } catch (error) {
      console.error('Error en cerrarOrden:', error);
      res.status(400).json({
        message: 'Error al cerrar orden',
        error: error.message
      });
    }
  }

  // Cancelar orden
  async cancelarOrden(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const orden = await ordenesService.cancelarOrden(parseInt(id), motivo);

      res.json({
        message: 'Orden cancelada exitosamente',
        data: orden
      });
    } catch (error) {
      console.error('Error en cancelarOrden:', error);
      res.status(400).json({
        message: 'Error al cancelar orden',
        error: error.message
      });
    }
  }

  // Validar stock disponible
  async validarStock(req, res) {
    try {
      const { recetaId, hectareas } = req.body;

      const validacion = await ordenesService.validarStock(
        parseInt(recetaId),
        parseFloat(hectareas)
      );

      res.json({
        message: 'Validación completada',
        data: validacion
      });
    } catch (error) {
      console.error('Error en validarStock:', error);
      res.status(400).json({
        message: 'Error al validar stock',
        error: error.message
      });
    }
  }

  // Obtener historial de parcela
  async getHistorialParcela(req, res) {
    try {
      const { parcelaId } = req.params;
      const ordenes = await ordenesService.getHistorialParcela(parseInt(parcelaId));

      res.json({
        message: 'Historial obtenido exitosamente',
        data: ordenes
      });
    } catch (error) {
      console.error('Error en getHistorialParcela:', error);
      res.status(500).json({
        message: 'Error al obtener historial',
        error: error.message
      });
    }
  }

  // Obtener estadísticas por período
  async getEstadisticas(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      const estadisticas = await ordenesService.getEstadisticas(
        new Date(fechaInicio),
        new Date(fechaFin)
      );

      res.json({
        message: 'Estadísticas obtenidas exitosamente',
        data: estadisticas
      });
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      res.status(500).json({
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new OrdenesController();