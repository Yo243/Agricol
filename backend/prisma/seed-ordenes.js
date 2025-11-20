// backend/prisma/seed-ordenes.js
// Script para agregar datos de ejemplo de órdenes de aplicación

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedOrdenes() {
  try {
    console.log('🌱 Iniciando seed de órdenes de aplicación...');

    // 1. Verificar que existan datos necesarios
    const parcelas = await prisma.parcela.findMany({ take: 5 });
    const recetas = await prisma.receta.findMany({ take: 5 });
    const usuarios = await prisma.user.findMany({ take: 3 });

    if (parcelas.length === 0) {
      console.log('❌ No hay parcelas. Primero debes tener parcelas en la BD.');
      return;
    }

    if (recetas.length === 0) {
      console.log('❌ No hay recetas. Primero debes tener recetas en la BD.');
      return;
    }

    console.log(`✅ Encontradas ${parcelas.length} parcelas`);
    console.log(`✅ Encontradas ${recetas.length} recetas`);
    console.log(`✅ Encontrados ${usuarios.length} usuarios`);

    // 2. Limpiar órdenes existentes (opcional)
    const deletedDetalles = await prisma.ordenDetalle.deleteMany();
    const deletedOrdenes = await prisma.ordenAplicacion.deleteMany();
    console.log(`🗑️  Eliminadas ${deletedOrdenes.count} órdenes anteriores`);

    // 3. Crear órdenes de ejemplo
    const ordenesData = [];

    // ORDEN 1: Pendiente - Parcela 1, Receta 1
    if (parcelas[0] && recetas[0]) {
      const receta1 = await prisma.receta.findUnique({
        where: { id: recetas[0].id },
        include: {
          detalles: {
            include: { insumo: true }
          }
        }
      });

      const hectareas1 = 10.5;
      const detalles1 = receta1.detalles.map(d => ({
        insumoId: d.insumoId,
        cantidadCalculada: d.dosisPorHectarea * hectareas1,
        unidadMedida: d.unidadMedida,
        costoUnitario: d.insumo.costoUnitario,
        costoTotal: d.dosisPorHectarea * hectareas1 * d.insumo.costoUnitario
      }));

      const costoTotal1 = detalles1.reduce((sum, d) => sum + d.costoTotal, 0);

      const orden1 = await prisma.ordenAplicacion.create({
        data: {
          parcelaId: parcelas[0].id,
          recetaId: recetas[0].id,
          hectareasAplicadas: hectareas1,
          fechaAplicacion: new Date('2025-11-15'),
          operadorId: usuarios[0]?.id || null,
          estado: 'PENDIENTE',
          observaciones: 'Aplicación programada para mañana temprano',
          costoTotal: costoTotal1,
          detalles: {
            create: detalles1
          }
        }
      });

      ordenesData.push(orden1);
      console.log(`✅ Orden 1 creada: ${orden1.id} - PENDIENTE`);
    }

    // ORDEN 2: Aplicada - Parcela 2, Receta 2
    if (parcelas[1] && recetas[1]) {
      const receta2 = await prisma.receta.findUnique({
        where: { id: recetas[1].id },
        include: {
          detalles: {
            include: { insumo: true }
          }
        }
      });

      const hectareas2 = 8.0;
      const detalles2 = receta2.detalles.map(d => ({
        insumoId: d.insumoId,
        cantidadCalculada: d.dosisPorHectarea * hectareas2,
        unidadMedida: d.unidadMedida,
        costoUnitario: d.insumo.costoUnitario,
        costoTotal: d.dosisPorHectarea * hectareas2 * d.insumo.costoUnitario
      }));

      const costoTotal2 = detalles2.reduce((sum, d) => sum + d.costoTotal, 0);

      const orden2 = await prisma.ordenAplicacion.create({
        data: {
          parcelaId: parcelas[1].id,
          recetaId: recetas[1].id,
          hectareasAplicadas: hectareas2,
          fechaCreacion: new Date('2025-11-10'),
          fechaAplicacion: new Date('2025-11-12'),
          operadorId: usuarios[1]?.id || null,
          estado: 'APLICADA',
          observaciones: 'Aplicación completada exitosamente',
          costoTotal: costoTotal2,
          detalles: {
            create: detalles2
          }
        }
      });

      ordenesData.push(orden2);
      console.log(`✅ Orden 2 creada: ${orden2.id} - APLICADA`);
    }

    // ORDEN 3: Pendiente - Parcela 1, Receta 2
    if (parcelas[0] && recetas[1]) {
      const receta3 = await prisma.receta.findUnique({
        where: { id: recetas[1].id },
        include: {
          detalles: {
            include: { insumo: true }
          }
        }
      });

      const hectareas3 = 12.0;
      const detalles3 = receta3.detalles.map(d => ({
        insumoId: d.insumoId,
        cantidadCalculada: d.dosisPorHectarea * hectareas3,
        unidadMedida: d.unidadMedida,
        costoUnitario: d.insumo.costoUnitario,
        costoTotal: d.dosisPorHectarea * hectareas3 * d.insumo.costoUnitario
      }));

      const costoTotal3 = detalles3.reduce((sum, d) => sum + d.costoTotal, 0);

      const orden3 = await prisma.ordenAplicacion.create({
        data: {
          parcelaId: parcelas[0].id,
          recetaId: recetas[1].id,
          hectareasAplicadas: hectareas3,
          fechaAplicacion: new Date('2025-11-18'),
          operadorId: usuarios[0]?.id || null,
          estado: 'PENDIENTE',
          observaciones: 'Revisar condiciones climáticas antes de aplicar',
          costoTotal: costoTotal3,
          detalles: {
            create: detalles3
          }
        }
      });

      ordenesData.push(orden3);
      console.log(`✅ Orden 3 creada: ${orden3.id} - PENDIENTE`);
    }

    // ORDEN 4: Aplicada - Parcela 3, Receta 1
    if (parcelas[2] && recetas[0]) {
      const receta4 = await prisma.receta.findUnique({
        where: { id: recetas[0].id },
        include: {
          detalles: {
            include: { insumo: true }
          }
        }
      });

      const hectareas4 = 15.5;
      const detalles4 = receta4.detalles.map(d => ({
        insumoId: d.insumoId,
        cantidadCalculada: d.dosisPorHectarea * hectareas4,
        unidadMedida: d.unidadMedida,
        costoUnitario: d.insumo.costoUnitario,
        costoTotal: d.dosisPorHectarea * hectareas4 * d.insumo.costoUnitario
      }));

      const costoTotal4 = detalles4.reduce((sum, d) => sum + d.costoTotal, 0);

      const orden4 = await prisma.ordenAplicacion.create({
        data: {
          parcelaId: parcelas[2].id,
          recetaId: recetas[0].id,
          hectareasAplicadas: hectareas4,
          fechaCreacion: new Date('2025-11-08'),
          fechaAplicacion: new Date('2025-11-09'),
          operadorId: usuarios[1]?.id || null,
          estado: 'APLICADA',
          observaciones: 'Aplicación realizada en condiciones óptimas',
          costoTotal: costoTotal4,
          detalles: {
            create: detalles4
          }
        }
      });

      ordenesData.push(orden4);
      console.log(`✅ Orden 4 creada: ${orden4.id} - APLICADA`);
    }

    // ORDEN 5: Cancelada - Parcela 2, Receta 3
    if (parcelas[1] && recetas[2]) {
      const receta5 = await prisma.receta.findUnique({
        where: { id: recetas[2].id },
        include: {
          detalles: {
            include: { insumo: true }
          }
        }
      });

      const hectareas5 = 7.0;
      const detalles5 = receta5.detalles.map(d => ({
        insumoId: d.insumoId,
        cantidadCalculada: d.dosisPorHectarea * hectareas5,
        unidadMedida: d.unidadMedida,
        costoUnitario: d.insumo.costoUnitario,
        costoTotal: d.dosisPorHectarea * hectareas5 * d.insumo.costoUnitario
      }));

      const costoTotal5 = detalles5.reduce((sum, d) => sum + d.costoTotal, 0);

      const orden5 = await prisma.ordenAplicacion.create({
        data: {
          parcelaId: parcelas[1].id,
          recetaId: recetas[2].id,
          hectareasAplicadas: hectareas5,
          fechaAplicacion: new Date('2025-11-14'),
          operadorId: usuarios[2]?.id || null,
          estado: 'CANCELADA',
          observaciones: 'CANCELADA: Condiciones climáticas adversas',
          costoTotal: costoTotal5,
          detalles: {
            create: detalles5
          }
        }
      });

      ordenesData.push(orden5);
      console.log(`✅ Orden 5 creada: ${orden5.id} - CANCELADA`);
    }

    // ORDEN 6: Pendiente - Parcela 4, Receta 3
    if (parcelas[3] && recetas[2]) {
      const receta6 = await prisma.receta.findUnique({
        where: { id: recetas[2].id },
        include: {
          detalles: {
            include: { insumo: true }
          }
        }
      });

      const hectareas6 = 20.0;
      const detalles6 = receta6.detalles.map(d => ({
        insumoId: d.insumoId,
        cantidadCalculada: d.dosisPorHectarea * hectareas6,
        unidadMedida: d.unidadMedida,
        costoUnitario: d.insumo.costoUnitario,
        costoTotal: d.dosisPorHectarea * hectareas6 * d.insumo.costoUnitario
      }));

      const costoTotal6 = detalles6.reduce((sum, d) => sum + d.costoTotal, 0);

      const orden6 = await prisma.ordenAplicacion.create({
        data: {
          parcelaId: parcelas[3].id,
          recetaId: recetas[2].id,
          hectareasAplicadas: hectareas6,
          fechaAplicacion: new Date('2025-11-22'),
          operadorId: usuarios[0]?.id || null,
          estado: 'PENDIENTE',
          observaciones: 'Aplicación de gran escala - verificar disponibilidad de equipo',
          costoTotal: costoTotal6,
          detalles: {
            create: detalles6
          }
        }
      });

      ordenesData.push(orden6);
      console.log(`✅ Orden 6 creada: ${orden6.id} - PENDIENTE`);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log(`📊 Total de órdenes creadas: ${ordenesData.length}`);
    console.log('\n📋 Resumen:');
    console.log(`   - Pendientes: ${ordenesData.filter(o => o.estado === 'PENDIENTE').length}`);
    console.log(`   - Aplicadas: ${ordenesData.filter(o => o.estado === 'APLICADA').length}`);
    console.log(`   - Canceladas: ${ordenesData.filter(o => o.estado === 'CANCELADA').length}`);

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar seed
seedOrdenes()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });