const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    console.log('=== REGISTER ATTEMPT ===');
    console.log('Email:', email);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Email ya registrado');
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario (por defecto activo)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'user',
        activo: true  // ✅ AGREGADO - Por defecto activo
      }
    });

    console.log('Usuario creado:', { id: user.id, email: user.email, activo: user.activo });

    // Generar token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        activo: user.activo  // ✅ AGREGADO - Incluir en token
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        activo: user.activo  // ✅ AGREGADO - Devolver en respuesta
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    console.log('Usuario encontrado:', { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      activo: user.activo 
    });

    // ✅ VERIFICAR QUE EL USUARIO ESTÉ ACTIVO
    if (user.activo === false) {
      console.log('⛔ Login bloqueado - Usuario inactivo');
      return res.status(403).json({ 
        error: 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.' 
      });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log('Contraseña inválida');
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    console.log('✅ Login exitoso');

    // Generar token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        activo: user.activo  // ✅ AGREGADO - Incluir en token
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        activo: user.activo  // ✅ AGREGADO - Devolver en respuesta
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión' 
    });
  }
};