const recetaService = require('../services/receta.service');
const { validateCreateReceta, validateUpdateReceta } = require('../validators/receta.validator');

class RecetaController {
  
  async create(req, res) {
    try {
      const validation = validateCreateReceta(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: 'Errores de validación', 
          errors: validation.errors
        });
      }

      const receta = await recetaService.createReceta(req.body);
      
      return res.status(201).json({
        message: 'Receta creada exitosamente',
        data: receta
      });
    } catch (error) {
      console.error('Error al crear receta:', error);
      return res.status(500).json({ 
        message: 'Error al crear receta', 
        error: error.message 
      });
    }
  }

  async getAll(req, res) {
    try {
      const filters = req.query;
      const recetas = await recetaService.getRecetas(filters);
      
      return res.status(200).json({
        message: 'Recetas obtenidas exitosamente',
        data: recetas
      });
    } catch (error) {
      console.error('Error al obtener recetas:', error);
      return res.status(500).json({ 
        message: 'Error al obtener recetas', 
        error: error.message 
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const receta = await recetaService.getRecetaById(id);
      
      return res.status(200).json({
        message: 'Receta obtenida exitosamente',
        data: receta
      });
    } catch (error) {
      console.error('Error al obtener receta:', error);
      return res.status(404).json({ 
        message: 'Receta no encontrada', 
        error: error.message 
      });
    }
  }

  async getByCultivo(req, res) {
    try {
      const { cultivoId } = req.params;
      const recetas = await recetaService.getRecetasByCultivo(cultivoId);
      
      return res.status(200).json({
        message: 'Recetas obtenidas exitosamente',
        data: recetas
      });
    } catch (error) {
      console.error('Error al obtener recetas por cultivo:', error);
      return res.status(500).json({ 
        message: 'Error al obtener recetas', 
        error: error.message 
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const validation = validateUpdateReceta(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: 'Errores de validación', 
          errors: validation.errors
        });
      }

      const receta = await recetaService.updateReceta(id, req.body);
      
      return res.status(200).json({
        message: 'Receta actualizada exitosamente',
        data: receta
      });
    } catch (error) {
      console.error('Error al actualizar receta:', error);
      return res.status(500).json({ 
        message: 'Error al actualizar receta', 
        error: error.message 
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await recetaService.deleteReceta(id);
      
      return res.status(200).json({
        message: 'Receta eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      return res.status(500).json({ 
        message: 'Error al eliminar receta', 
        error: error.message 
      });
    }
  }

  async getCultivos(req, res) {
    try {
      const cultivos = await recetaService.getCultivos();
      
      return res.status(200).json({
        message: 'Cultivos obtenidos exitosamente',
        data: cultivos
      });
    } catch (error) {
      console.error('Error al obtener cultivos:', error);
      return res.status(500).json({ 
        message: 'Error al obtener cultivos', 
        error: error.message 
      });
    }
  }

  async getEtapas(req, res) {
    try {
      const etapas = await recetaService.getEtapas();
      
      return res.status(200).json({
        message: 'Etapas obtenidas exitosamente',
        data: etapas
      });
    } catch (error) {
      console.error('Error al obtener etapas:', error);
      return res.status(500).json({ 
        message: 'Error al obtener etapas', 
        error: error.message 
      });
    }
  }
}

module.exports = new RecetaController();