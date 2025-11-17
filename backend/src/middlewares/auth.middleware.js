const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar JWT
 */
const verifyToken = (req, res, next) => {
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
    
    // Agregar información del usuario al request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();

  } catch (error) {
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
  if (req.userRole !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requiere rol de administrador' 
    });
  }
  next();
};

// Exportar como función por defecto
module.exports = verifyToken;
module.exports.isAdmin = isAdmin;