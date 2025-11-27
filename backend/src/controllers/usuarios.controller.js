const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

/**
 * Obtener todos los usuarios
 * GET /api/users
 */
exports.getAll = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        activo: true,  // ✅ AGREGADO
        createdAt: true,
        updatedAt: true
        // NO devolver password
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error en getAll:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

/**
 * Obtener un usuario por ID
 * GET /api/users/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        activo: true,  // ✅ AGREGADO
        createdAt: true,
        updatedAt: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error en getById:', error);
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
};

/**
 * Crear un nuevo usuario
 * POST /api/users
 */
exports.create = async (req, res) => {
  try {
    const { email, password, name, role, activo } = req.body;  // ✅ AGREGADO activo

    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, contraseña y nombre son obligatorios' });
    }

    // Verificar si el email ya existe
    const existeEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existeEmail) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'user',
        activo: activo !== undefined ? activo : true  // ✅ AGREGADO (por defecto true)
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        activo: true,  // ✅ AGREGADO
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: nuevoUsuario
    });
  } catch (error) {
    console.error('Error en create:', error);
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

/**
 * Actualizar un usuario
 * PUT /api/users/:id
 * ✅ CORREGIDO - Ahora incluye activo y password
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, activo, password } = req.body;  // ✅ AGREGADO activo y password

    console.log('=== UPDATE USER ===');
    console.log('ID:', id);
    console.log('Body recibido:', { email, name, role, activo, password: password ? '[PRESENTE]' : '[NO PRESENTE]' });

    // Verificar que el usuario existe
    const usuarioExiste = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExiste) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se está cambiando el email, verificar que no exista
    if (email && email !== usuarioExiste.email) {
      const emailExiste = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExiste) {
        return res.status(400).json({ message: 'El email ya está en uso' });
      }
    }

    // Preparar datos para actualizar
    const dataToUpdate = {};
    
    if (email !== undefined) dataToUpdate.email = email;
    if (name !== undefined) dataToUpdate.name = name;
    if (role !== undefined) dataToUpdate.role = role;
    if (activo !== undefined) dataToUpdate.activo = activo;  // ✅ AGREGADO
    
    // Si se proporciona password, hashearlo
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    console.log('Datos a actualizar:', dataToUpdate);

    // Actualizar usuario
    const usuarioActualizado = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        activo: true,  // ✅ AGREGADO
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('Usuario actualizado:', usuarioActualizado);

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error en update:', error);
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

/**
 * Eliminar un usuario
 * DELETE /api/users/:id
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // No permitir que se elimine a sí mismo
    if (req.user && req.user.id === userId) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }

    // Verificar que el usuario existe
    const usuario = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error en delete:', error);
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

/**
 * Cambiar estado (activo/inactivo)
 * PATCH /api/users/:id/estado
 */
exports.toggleEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    console.log('=== TOGGLE ESTADO ===');
    console.log('ID:', id);
    console.log('Activo recibido:', activo);
    console.log('Tipo de activo:', typeof activo);

    // Verificar que el usuario existe
    const usuario = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar estado - Convertir explícitamente a boolean
    const activoBoolean = activo === true || activo === 'true' || activo === 1;

    const usuarioActualizado = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { activo: activoBoolean },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        activo: true,  // ✅ AGREGADO
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('Usuario actualizado:', usuarioActualizado);

    res.json({
      message: `Usuario ${activoBoolean ? 'activado' : 'desactivado'} exitosamente`,
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error en toggleEstado:', error);
    res.status(500).json({ message: 'Error al cambiar estado', error: error.message });
  }
};

/**
 * Cambiar contraseña
 * PATCH /api/users/:id/password
 */
exports.cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { passwordActual, passwordNuevo } = req.body;

    // Validaciones
    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({ message: 'Se requiere la contraseña actual y la nueva' });
    }

    // Obtener usuario con contraseña
    const usuario = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);

    if (!passwordValida) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(passwordNuevo, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    console.error('Error en cambiarPassword:', error);
    res.status(500).json({ message: 'Error al cambiar contraseña', error: error.message });
  }
};

/**
 * Obtener estadísticas de usuarios
 * GET /api/users/estadisticas
 */
exports.getEstadisticas = async (req, res) => {
  try {
    const [totalUsuarios, totalAdministradores, totalOperadores, usuariosActivos] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { activo: true } })
    ]);

    const usuariosInactivos = totalUsuarios - usuariosActivos;

    res.json({
      totalUsuarios,
      totalAdministradores,
      totalOperadores,
      usuariosActivos,
      usuariosInactivos
    });
  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};