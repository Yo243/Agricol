const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RecetaService {
  
  // Crear receta con sus detalles
  async createReceta(data) {
    try {
      // Validar que el cultivo exista
      const cultivo = await prisma.cultivo.findUnique({
        where: { id: parseInt(data.cultivoId) }
      });

      if (!cultivo) {
        throw new Error('El cultivo especificado no existe');
      }

      // Validar que los insumos existan
      const insumosIds = data.detalles.map(d => parseInt(d.insumoId));
      const insumos = await prisma.inventarioItem.findMany({
        where: { id: { in: insumosIds } }
      });

      if (insumos.length !== insumosIds.length) {
        throw new Error('Uno o más insumos no existen');
      }

      // Crear receta con detalles
      const receta = await prisma.receta.create({
        data: {
          cultivoId: parseInt(data.cultivoId),
          nombre: data.nombre,
          descripcion: data.descripcion || null,
          etapaCultivo: data.etapaCultivo || null,
          detalles: {
            create: data.detalles.map((detalle, index) => ({
              insumoId: parseInt(detalle.insumoId),
              dosisPorHectarea: parseFloat(detalle.dosisPorHectarea),
              unidadMedida: detalle.unidadMedida,
              orden: detalle.orden || index + 1
            }))
          }
        },
        include: {
          cultivo: true,
          detalles: {
            include: {
              insumo: true
            },
            orderBy: {
              orden: 'asc'
            }
          }
        }
      });

      return receta;
    } catch (error) {
      throw error;
    }
  }

  // Listar recetas con filtros
  async getRecetas(filters = {}) {
    try {
      const where = {};

      if (filters.cultivoId) {
        where.cultivoId = parseInt(filters.cultivoId);
      }

      if (filters.etapaCultivo) {
        where.etapaCultivo = { contains: filters.etapaCultivo, mode: 'insensitive' };
      }

      if (filters.activo !== undefined) {
        where.activo = filters.activo === 'true' || filters.activo === true;
      }

      if (filters.search) {
        where.OR = [
          { nombre: { contains: filters.search, mode: 'insensitive' } },
          { descripcion: { contains: filters.search, mode: 'insensitive' } },
          { etapaCultivo: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const recetas = await prisma.receta.findMany({
        where,
        include: {
          cultivo: true,
          detalles: {
            include: {
              insumo: true
            },
            orderBy: {
              orden: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calcular costo estimado por hectárea para cada receta
      const recetasConCosto = recetas.map(receta => {
        const costoTotal = receta.detalles.reduce((sum, detalle) => {
          const precioInsumo = parseFloat(detalle.insumo.costoUnitario) || 0;
          const dosis = parseFloat(detalle.dosisPorHectarea);
          return sum + (precioInsumo * dosis);
        }, 0);

        return {
          ...receta,
          costoPorHectarea: costoTotal,
          numeroInsumos: receta.detalles.length
        };
      });

      return recetasConCosto;
    } catch (error) {
      throw error;
    }
  }

  // Obtener una receta por ID
  async getRecetaById(id) {
    try {
      const receta = await prisma.receta.findUnique({
        where: { id: parseInt(id) },
        include: {
          cultivo: true,
          detalles: {
            include: {
              insumo: true
            },
            orderBy: {
              orden: 'asc'
            }
          }
        }
      });

      if (!receta) {
        throw new Error('Receta no encontrada');
      }

      // Calcular costo total
      const costoTotal = receta.detalles.reduce((sum, detalle) => {
        const precioInsumo = parseFloat(detalle.insumo.costoUnitario) || 0;
        const dosis = parseFloat(detalle.dosisPorHectarea);
        return sum + (precioInsumo * dosis);
      }, 0);

      return {
        ...receta,
        costoPorHectarea: costoTotal,
        numeroInsumos: receta.detalles.length
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar receta
  async updateReceta(id, data) {
    try {
      const recetaExistente = await prisma.receta.findUnique({
        where: { id: parseInt(id) },
        include: { detalles: true }
      });

      if (!recetaExistente) {
        throw new Error('Receta no encontrada');
      }

      // Validar cultivo si se actualiza
      if (data.cultivoId) {
        const cultivo = await prisma.cultivo.findUnique({
          where: { id: parseInt(data.cultivoId) }
        });

        if (!cultivo) {
          throw new Error('El cultivo especificado no existe');
        }
      }

      // Si se actualizan los detalles, eliminar los anteriores y crear los nuevos
      if (data.detalles) {
        // Validar insumos
        const insumosIds = data.detalles.map(d => parseInt(d.insumoId));
        const insumos = await prisma.inventarioItem.findMany({
          where: { id: { in: insumosIds } }
        });

        if (insumos.length !== insumosIds.length) {
          throw new Error('Uno o más insumos no existen');
        }

        await prisma.receta.update({
          where: { id: parseInt(id) },
          data: {
            cultivoId: data.cultivoId ? parseInt(data.cultivoId) : undefined,
            nombre: data.nombre,
            descripcion: data.descripcion,
            etapaCultivo: data.etapaCultivo,
            activo: data.activo,
            detalles: {
              deleteMany: {},
              create: data.detalles.map((detalle, index) => ({
                insumoId: parseInt(detalle.insumoId),
                dosisPorHectarea: parseFloat(detalle.dosisPorHectarea),
                unidadMedida: detalle.unidadMedida,
                orden: detalle.orden || index + 1
              }))
            }
          }
        });
      } else {
        // Solo actualizar datos básicos
        await prisma.receta.update({
          where: { id: parseInt(id) },
          data: {
            cultivoId: data.cultivoId ? parseInt(data.cultivoId) : undefined,
            nombre: data.nombre,
            descripcion: data.descripcion,
            etapaCultivo: data.etapaCultivo,
            activo: data.activo
          }
        });
      }

      return this.getRecetaById(id);
    } catch (error) {
      throw error;
    }
  }

  // Eliminar o desactivar receta
  async deleteReceta(id) {
    try {
      const receta = await prisma.receta.findUnique({
        where: { id: parseInt(id) }
      });

      if (!receta) {
        throw new Error('Receta no encontrada');
      }

      // Verificar si tiene aplicaciones asociadas (cuando implementes ese módulo)
      // const aplicaciones = await prisma.aplicacionParcela.count({
      //   where: { recetaId: parseInt(id) }
      // });

      // if (aplicaciones > 0) {
      //   // Si tiene aplicaciones, solo desactivar
      //   return await prisma.receta.update({
      //     where: { id: parseInt(id) },
      //     data: { activo: false }
      //   });
      // }

      // Si no tiene aplicaciones, eliminar físicamente
      return await prisma.receta.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      throw error;
    }
  }

  // Obtener lista de cultivos activos
  async getCultivos() {
    try {
      const cultivos = await prisma.cultivo.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' }
      });
      return cultivos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener lista de etapas únicas
  async getEtapas() {
    try {
      const recetas = await prisma.receta.findMany({
        where: { 
          activo: true,
          etapaCultivo: { not: null }
        },
        select: { etapaCultivo: true },
        distinct: ['etapaCultivo']
      });
      return recetas.map(r => r.etapaCultivo).filter(Boolean);
    } catch (error) {
      throw error;
    }
  }

  // Obtener recetas por cultivo
  async getRecetasByCultivo(cultivoId) {
    try {
      const recetas = await prisma.receta.findMany({
        where: { 
          cultivoId: parseInt(cultivoId),
          activo: true
        },
        include: {
          cultivo: true,
          detalles: {
            include: {
              insumo: true
            },
            orderBy: {
              orden: 'asc'
            }
          }
        }
      });

      return recetas;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RecetaService();