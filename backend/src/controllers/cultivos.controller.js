// backend/src/controllers/cultivos.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/cultivos
exports.getCultivos = async (req, res) => {
  try {
    const cultivos = await prisma.cultivo.findMany({
      // si tu modelo tiene campo "activo", lo filtras:
      // where: { activo: true },
      orderBy: { nombre: 'asc' },
    });

    res.json({
      message: 'Cultivos obtenidos correctamente',
      data: cultivos,
    });
  } catch (error) {
    console.error('Error al obtener cultivos:', error);
    res.status(500).json({
      message: 'Error al obtener cultivos',
      error: error.message,
    });
  }
};

// GET /api/cultivos/:id
exports.getCultivoById = async (req, res) => {
  try {
    const { id } = req.params;

    const cultivo = await prisma.cultivo.findUnique({
      where: { id: parseInt(id) },
    });

    if (!cultivo) {
      return res.status(404).json({ message: 'Cultivo no encontrado' });
    }

    res.json({
      message: 'Cultivo obtenido correctamente',
      data: cultivo,
    });
  } catch (error) {
    console.error('Error al obtener cultivo:', error);
    res.status(500).json({
      message: 'Error al obtener cultivo',
      error: error.message,
    });
  }
};
