const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const {
  validateCreate,
  validateUpdate,
  validateId,
  validateToggleEstado,
  validateCambiarPassword
} = require('../validators/usuarios.validator');

/**
 * @route   GET /api/users/estadisticas
 * @desc    Obtener estadísticas de usuarios
 * @access  Private/Admin
 */
router.get('/estadisticas', authenticateToken, isAdmin, usuariosController.getEstadisticas);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios
 * @access  Private/Admin
 */
router.get('/', authenticateToken, isAdmin, usuariosController.getAll);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario por ID
 * @access  Private/Admin
 */
router.get('/:id', authenticateToken, isAdmin, validateId, usuariosController.getById);

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario
 * @access  Private/Admin
 */
router.post('/', authenticateToken, isAdmin, validateCreate, usuariosController.create);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario
 * @access  Private/Admin
 */
router.put('/:id', authenticateToken, isAdmin, validateId, validateUpdate, usuariosController.update);

/**
 * @route   PATCH /api/users/:id/estado
 * @desc    Cambiar estado del usuario (activo/inactivo)
 * @access  Private/Admin
 */
router.patch('/:id/estado', authenticateToken, isAdmin, validateId, validateToggleEstado, usuariosController.toggleEstado);

/**
 * @route   PATCH /api/users/:id/password
 * @desc    Cambiar contraseña de usuario
 * @access  Private
 */
router.patch('/:id/password', authenticateToken, validateId, validateCambiarPassword, usuariosController.cambiarPassword);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario
 * @access  Private/Admin
 */
router.delete('/:id', authenticateToken, isAdmin, validateId, usuariosController.delete);

module.exports = router;