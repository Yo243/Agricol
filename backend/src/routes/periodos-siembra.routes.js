const express = require('express');
const router = express.Router();
const periodosSiembraController = require('../controllers/periodos-siembra.controller');
const authenticateToken = require('../middlewares/auth.middleware');

const {
  validateCreatePeriodo,
  validateUpdatePeriodo,
  validateCerrarPeriodo,
  validateGetById,
  validateGetPorParcela,
  validateDelete
} = require('../validators/periodos-siembra.validator');

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @route   GET /api/periodos-siembra
 * @desc    Obtener todos los períodos de siembra
 * @access  Private
 */
router.get('/', periodosSiembraController.getAll);

/**
 * @route   GET /api/periodos-siembra/activos
 * @desc    Obtener períodos de siembra activos
 * @access  Private
 */
router.get('/activos', periodosSiembraController.getActivos);

/**
 * @route   GET /api/periodos-siembra/parcela/:parcelaId
 * @desc    Obtener períodos de una parcela específica
 * @access  Private
 */
router.get('/parcela/:parcelaId', validateGetPorParcela, periodosSiembraController.getPorParcela);

/**
 * @route   GET /api/periodos-siembra/:id
 * @desc    Obtener un período por ID
 * @access  Private
 */
router.get('/:id', validateGetById, periodosSiembraController.getById);

/**
 * @route   GET /api/periodos-siembra/:id/estadisticas
 * @desc    Obtener estadísticas de un período
 * @access  Private
 */
router.get('/:id/estadisticas', validateGetById, periodosSiembraController.getEstadisticas);

/**
 * @route   POST /api/periodos-siembra
 * @desc    Crear un nuevo período de siembra
 * @access  Private
 */
router.post('/', validateCreatePeriodo, periodosSiembraController.create);

/**
 * @route   POST /api/periodos-siembra/:id/cerrar
 * @desc    Cerrar/finalizar un período de siembra
 * @access  Private
 */
router.post('/:id/cerrar', validateCerrarPeriodo, periodosSiembraController.cerrar);

/**
 * @route   PUT /api/periodos-siembra/:id
 * @desc    Actualizar un período de siembra
 * @access  Private
 */
router.put('/:id', validateUpdatePeriodo, periodosSiembraController.update);

/**
 * @route   DELETE /api/periodos-siembra/:id
 * @desc    Eliminar un período de siembra
 * @access  Private
 */
router.delete('/:id', validateDelete, periodosSiembraController.delete);

module.exports = router;