const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware para verificar JWT
 * ✅ CORREGIDO - Ahora también verifica que el usuario esté activo
 */
const verifyToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Token no proporcionado'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ VERIFICAR EN LA BASE DE DATOS QUE EL USUARIO AÚN ESTÉ ACTIVO
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        activo: true  // ✅ Incluir campo activo
      }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Usuario no encontrado'
      });
    }

    // ✅ VERIFICAR QUE EL USUARIO ESTÉ ACTIVO
    if (user.activo === false) {
      console.log('⛔ Acceso bloqueado - Usuario inactivo:', user.email);
      return res.status(403).json({
        message: 'Tu cuenta ha sido desactivada. Tu sesión ha sido revocada.'
      });
    }

    // Agregar información del usuario al request
    req.userId = user.id;
    req.userEmail = user.email;
    req.userRole = user.role;
    req.userActivo = user.activo;  // ✅ AGREGADO

    // Objeto req.user para compatibilidad con controllers
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      activo: user.activo  // ✅ AGREGADO
    };

    next();

  } catch (error) {
    console.error('Error en verifyToken:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expirado'
      });
    }

    return res.status(401).json({
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar rol de administrador
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'No autenticado'
    });
  }

  // Verificar rol de administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Acceso denegado. Se requiere rol de administrador'
    });
  }

  next();
};

/**
 * ✅ NUEVO - Middleware para verificar que el usuario esté activo
 * (Uso opcional si quieres doble validación)
 */
const isActive = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'No autenticado'
    });
  }

  if (req.user.activo === false) {
    return res.status(403).json({
      message: 'Tu cuenta ha sido desactivada'
    });
  }

  next();
};

module.exports = {
  verifyToken,
  authenticateToken: verifyToken, // alias
  isAdmin,
  isActive  // ✅ NUEVO - Exportar middleware de validación de activo
};