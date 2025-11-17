const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.alertaInventario.deleteMany({});
  await prisma.movimientoInventario.deleteMany({});
  await prisma.inventarioItem.deleteMany({});
  await prisma.user.deleteMany({});

  // ==========================================
  // CREAR USUARIOS DE PRUEBA
  // ==========================================
  console.log('👤 Creando usuarios...');
  
  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@agricol.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@agricol.com',
      password: hashedPassword,
      name: 'Usuario Normal',
      role: 'user',
    },
  });

  console.log(`✅ Usuario admin creado: ${adminUser.email}`);
  console.log(`✅ Usuario normal creado: ${normalUser.email}`);

  // ==========================================
  // CREAR ITEMS DE INVENTARIO
  // ==========================================
  console.log('📦 Creando items de inventario...');

  const item1 = await prisma.inventarioItem.create({
    data: {
      codigo: 'FERT-001',
      nombre: 'Fertilizante NPK 15-15-15',
      descripcion: 'Fertilizante completo para todo tipo de cultivos',
      categoria: 'Fertilizantes',
      unidadMedida: 'kg',
      stockActual: 500,
      stockMinimo: 100,
      stockMaximo: 1000,
      costoUnitario: 2500,
      valorTotal: 1250000,
      estado: 'Disponible',
      ubicacion: 'Bodega A - Estante 1',
      lote: 'LOT-2024-001',
      proveedor: 'AgroInsumos S.A.',
      fechaAdquisicion: new Date('2024-11-01'),
      fechaVencimiento: new Date('2026-11-01'),
      diasParaVencer: 730,
      activo: true
    },
  });

  const item2 = await prisma.inventarioItem.create({
    data: {
      codigo: 'PEST-001',
      nombre: 'Pesticida Clorpirifos 48%',
      descripcion: 'Insecticida de amplio espectro',
      categoria: 'Pesticidas',
      unidadMedida: 'L',
      stockActual: 25,
      stockMinimo: 50,
      stockMaximo: 200,
      costoUnitario: 45000,
      valorTotal: 1125000,
      estado: 'Stock Bajo',
      ubicacion: 'Bodega B - Estante 3',
      lote: 'LOT-2024-002',
      proveedor: 'Químicos del Campo',
      fechaAdquisicion: new Date('2024-10-15'),
      fechaVencimiento: new Date('2025-12-31'),
      diasParaVencer: 410,
      activo: true
    },
  });

  const item3 = await prisma.inventarioItem.create({
    data: {
      codigo: 'SEM-001',
      nombre: 'Semillas de Maíz Híbrido',
      descripcion: 'Semillas certificadas de alto rendimiento',
      categoria: 'Semillas',
      unidadMedida: 'kg',
      stockActual: 0,
      stockMinimo: 20,
      stockMaximo: 100,
      costoUnitario: 85000,
      valorTotal: 0,
      estado: 'Agotado',
      ubicacion: 'Bodega A - Estante 5',
      lote: 'LOT-2024-003',
      proveedor: 'Semillas Premium',
      fechaAdquisicion: new Date('2024-09-01'),
      fechaVencimiento: new Date('2025-03-01'),
      diasParaVencer: 105,
      activo: true
    },
  });

  const item4 = await prisma.inventarioItem.create({
    data: {
      codigo: 'HERB-001',
      nombre: 'Herbicida Glifosato 74.7%',
      descripcion: 'Herbicida sistémico no selectivo',
      categoria: 'Herbicidas',
      unidadMedida: 'L',
      stockActual: 150,
      stockMinimo: 30,
      stockMaximo: 300,
      costoUnitario: 28000,
      valorTotal: 4200000,
      estado: 'Disponible',
      ubicacion: 'Bodega B - Estante 1',
      lote: 'LOT-2024-004',
      proveedor: 'AgroQuímica Nacional',
      fechaAdquisicion: new Date('2024-11-10'),
      fechaVencimiento: new Date('2025-11-30'),
      diasParaVencer: 380,
      activo: true
    },
  });

  const item5 = await prisma.inventarioItem.create({
    data: {
      codigo: 'FUNG-001',
      nombre: 'Fungicida Mancozeb 80%',
      descripcion: 'Fungicida preventivo de contacto',
      categoria: 'Fungicidas',
      unidadMedida: 'kg',
      stockActual: 80,
      stockMinimo: 40,
      stockMaximo: 200,
      costoUnitario: 35000,
      valorTotal: 2800000,
      estado: 'Disponible',
      ubicacion: 'Bodega A - Estante 2',
      lote: 'LOT-2024-005',
      proveedor: 'Químicos del Campo',
      fechaAdquisicion: new Date('2024-10-20'),
      fechaVencimiento: new Date('2025-01-15'),
      diasParaVencer: 60,
      activo: true
    },
  });

  console.log(`✅ ${item1.nombre} - Stock: ${item1.stockActual} ${item1.unidadMedida}`);
  console.log(`✅ ${item2.nombre} - Stock: ${item2.stockActual} ${item2.unidadMedida} (STOCK BAJO)`);
  console.log(`✅ ${item3.nombre} - Stock: ${item3.stockActual} ${item3.unidadMedida} (AGOTADO)`);
  console.log(`✅ ${item4.nombre} - Stock: ${item4.stockActual} ${item4.unidadMedida}`);
  console.log(`✅ ${item5.nombre} - Stock: ${item5.stockActual} ${item5.unidadMedida} (POR VENCER)`);

  // ==========================================
  // CREAR ALERTAS
  // ==========================================
  console.log('⚠️ Creando alertas...');

  await prisma.alertaInventario.create({
    data: {
      itemId: item2.id,
      itemNombre: item2.nombre,
      tipo: 'Stock Bajo',
      tipoAlerta: 'Stock Bajo',
      mensaje: `${item2.nombre} tiene stock bajo (${item2.stockActual} ${item2.unidadMedida})`,
      prioridad: 'alta',
    },
  });

  await prisma.alertaInventario.create({
    data: {
      itemId: item3.id,
      itemNombre: item3.nombre,
      tipo: 'Stock Agotado',
      tipoAlerta: 'Stock Agotado',
      mensaje: `${item3.nombre} está agotado`,
      prioridad: 'alta',
    },
  });

  await prisma.alertaInventario.create({
    data: {
      itemId: item5.id,
      itemNombre: item5.nombre,
      tipo: 'Próximo a Vencer',
      tipoAlerta: 'Próximo a Vencer',
      mensaje: `${item5.nombre} vence en ${item5.diasParaVencer} días`,
      prioridad: 'media',
    },
  });

  console.log('✅ Alertas creadas correctamente');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📝 Credenciales de prueba:');
  console.log('   Email: admin@agricol.com');
  console.log('   Password: 123456');
  console.log('\n   Email: user@agricol.com');
  console.log('   Password: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });