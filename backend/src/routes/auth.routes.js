const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { loginSchema, registerSchema } = require('../validators/auth.validator');

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
// router.get('/me', authMiddleware, authController.me);

module.exports = router;