const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ==========================================
  // LIMPIAR DATOS EXISTENTES (en orden correcto por dependencias)
  // ==========================================
  console.log('🧹 Limpiando datos existentes...');
  
  await prisma.actividad.deleteMany({});
  await prisma.aplicacionInsumo.deleteMany({});
  await prisma.aplicacionParcela.deleteMany({});
  await prisma.periodoSiembra.deleteMany({});
  await prisma.recetaDetalle.deleteMany({});
  await prisma.receta.deleteMany({});
  await prisma.alertaInventario.deleteMany({});
  await prisma.movimientoInventario.deleteMany({});
  await prisma.inventarioItem.deleteMany({});
  await prisma.parcela.deleteMany({});
  await prisma.cultivo.deleteMany({});
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
      stockActual: 100,
      stockMinimo: 20,
      stockMaximo: 200,
      costoUnitario: 85000,
      valorTotal: 8500000,
      estado: 'Disponible',
      ubicacion: 'Bodega A - Estante 5',
      lote: 'LOT-2024-003',
      proveedor: 'Semillas Premium',
      fechaAdquisicion: new Date('2024-09-01'),
      fechaVencimiento: new Date('2025-09-01'),
      diasParaVencer: 290,
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

  const item6 = await prisma.inventarioItem.create({
    data: {
      codigo: 'FERT-002',
      nombre: 'Urea 46%',
      descripcion: 'Fertilizante nitrogenado de alta concentración',
      categoria: 'Fertilizantes',
      unidadMedida: 'kg',
      stockActual: 800,
      stockMinimo: 200,
      stockMaximo: 1500,
      costoUnitario: 1800,
      valorTotal: 1440000,
      estado: 'Disponible',
      ubicacion: 'Bodega A - Estante 3',
      lote: 'LOT-2024-006',
      proveedor: 'AgroInsumos S.A.',
      fechaAdquisicion: new Date('2024-11-05'),
      fechaVencimiento: new Date('2026-11-05'),
      diasParaVencer: 720,
      activo: true
    },
  });

  console.log(`✅ ${item1.nombre} - Stock: ${item1.stockActual} ${item1.unidadMedida}`);
  console.log(`✅ ${item2.nombre} - Stock: ${item2.stockActual} ${item2.unidadMedida} (STOCK BAJO)`);
  console.log(`✅ ${item3.nombre} - Stock: ${item3.stockActual} ${item3.unidadMedida}`);
  console.log(`✅ ${item4.nombre} - Stock: ${item4.stockActual} ${item4.unidadMedida}`);
  console.log(`✅ ${item5.nombre} - Stock: ${item5.stockActual} ${item5.unidadMedida} (POR VENCER)`);
  console.log(`✅ ${item6.nombre} - Stock: ${item6.stockActual} ${item6.unidadMedida}`);

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
      itemId: item5.id,
      itemNombre: item5.nombre,
      tipo: 'Próximo a Vencer',
      tipoAlerta: 'Próximo a Vencer',
      mensaje: `${item5.nombre} vence en ${item5.diasParaVencer} días`,
      prioridad: 'media',
    },
  });

  console.log('✅ Alertas de inventario creadas correctamente');

  // ==========================================
  // CREAR CULTIVOS
  // ==========================================
  console.log('🌾 Creando cultivos...');

  const maiz = await prisma.cultivo.create({
    data: {
      nombre: 'Maíz',
      variedad: 'Híbrido Blanco',
      descripcion: 'Maíz para grano de alta productividad',
      diasCiclo: 120,
      costoPorHectarea: 15000,
      rendimientoEsperado: 8.5,
      activo: true
    }
  });

  const frijol = await prisma.cultivo.create({
    data: {
      nombre: 'Frijol',
      variedad: 'Negro Jamapa',
      descripcion: 'Frijol de temporal resistente',
      diasCiclo: 90,
      costoPorHectarea: 12000,
      rendimientoEsperado: 1.5,
      activo: true
    }
  });

  const tomate = await prisma.cultivo.create({
    data: {
      nombre: 'Tomate',
      variedad: 'Saladette',
      descripcion: 'Tomate de invernadero',
      diasCiclo: 150,
      costoPorHectarea: 45000,
      rendimientoEsperado: 80.0,
      activo: true
    }
  });

  const chile = await prisma.cultivo.create({
    data: {
      nombre: 'Chile',
      variedad: 'Jalapeño',
      descripcion: 'Chile jalapeño para exportación',
      diasCiclo: 130,
      costoPorHectarea: 35000,
      rendimientoEsperado: 25.0,
      activo: true
    }
  });

  console.log(`✅ ${maiz.nombre} - ${maiz.variedad} (${maiz.diasCiclo} días)`);
  console.log(`✅ ${frijol.nombre} - ${frijol.variedad} (${frijol.diasCiclo} días)`);
  console.log(`✅ ${tomate.nombre} - ${tomate.variedad} (${tomate.diasCiclo} días)`);
  console.log(`✅ ${chile.nombre} - ${chile.variedad} (${chile.diasCiclo} días)`);

  // ==========================================
  // CREAR PARCELAS
  // ==========================================
  console.log('🗺️ Creando parcelas...');

  const parcela1 = await prisma.parcela.create({
    data: {
      codigo: 'PAR-0001',
      nombre: 'Parcela Norte',
      superficieHa: 5.5,
      ubicacion: 'Sector Norte - Lote 1',
      coordenadas: '24.8049° N, 107.3940° W',
      tipoSuelo: 'Franco arcilloso',
      sistemaRiego: 'Por aspersión',
      estado: 'Activa',
      activo: true
    }
  });

  const parcela2 = await prisma.parcela.create({
    data: {
      codigo: 'PAR-0002',
      nombre: 'Parcela Sur',
      superficieHa: 8.0,
      ubicacion: 'Sector Sur - Lote 3',
      coordenadas: '24.8000° N, 107.3950° W',
      tipoSuelo: 'Franco limoso',
      sistemaRiego: 'Goteo',
      estado: 'Activa',
      activo: true
    }
  });

  const parcela3 = await prisma.parcela.create({
    data: {
      codigo: 'PAR-0003',
      nombre: 'Parcela Este',
      superficieHa: 12.0,
      ubicacion: 'Sector Este - Lote 5',
      coordenadas: '24.8100° N, 107.3900° W',
      tipoSuelo: 'Franco arenoso',
      sistemaRiego: 'Pivot central',
      estado: 'Activa',
      activo: true
    }
  });

  const parcela4 = await prisma.parcela.create({
    data: {
      codigo: 'PAR-0004',
      nombre: 'Parcela Oeste',
      superficieHa: 6.5,
      ubicacion: 'Sector Oeste - Lote 2',
      coordenadas: '24.8070° N, 107.4000° W',
      tipoSuelo: 'Arcilloso',
      sistemaRiego: 'Por gravedad',
      estado: 'En Descanso',
      activo: true
    }
  });

  console.log(`✅ ${parcela1.nombre} - ${parcela1.superficieHa} ha (${parcela1.estado})`);
  console.log(`✅ ${parcela2.nombre} - ${parcela2.superficieHa} ha (${parcela2.estado})`);
  console.log(`✅ ${parcela3.nombre} - ${parcela3.superficieHa} ha (${parcela3.estado})`);
  console.log(`✅ ${parcela4.nombre} - ${parcela4.superficieHa} ha (${parcela4.estado})`);

  // ==========================================
  // CREAR PERÍODOS DE SIEMBRA
  // ==========================================
  console.log('📅 Creando períodos de siembra...');

  const periodo1 = await prisma.periodoSiembra.create({
    data: {
      parcelaId: parcela1.id,
      cultivoId: maiz.id,
      codigo: 'PS-0001',
      fechaInicio: new Date('2024-05-01'),
      fechaCosechaEsperada: new Date('2024-09-01'),
      hectareasSembradas: 5.0,
      rendimientoEsperado: 42.5,
      costoTotal: 0,
      estado: 'En Curso',
      observaciones: 'Primera siembra de maíz en esta parcela'
    }
  });

  const periodo2 = await prisma.periodoSiembra.create({
    data: {
      parcelaId: parcela2.id,
      cultivoId: frijol.id,
      codigo: 'PS-0002',
      fechaInicio: new Date('2024-06-15'),
      fechaCosechaEsperada: new Date('2024-09-15'),
      hectareasSembradas: 7.5,
      rendimientoEsperado: 11.25,
      costoTotal: 0,
      estado: 'En Curso',
      observaciones: 'Frijol de temporal'
    }
  });

  const periodo3 = await prisma.periodoSiembra.create({
    data: {
      parcelaId: parcela3.id,
      cultivoId: tomate.id,
      codigo: 'PS-0003',
      fechaInicio: new Date('2024-03-01'),
      fechaCosechaEsperada: new Date('2024-08-01'),
      fechaCosechaReal: new Date('2024-08-05'),
      hectareasSembradas: 10.0,
      rendimientoEsperado: 800.0,
      rendimientoReal: 850.0,
      costoTotal: 450000,
      estado: 'Finalizado',
      observaciones: 'Excelente rendimiento, superó expectativas'
    }
  });

  console.log(`✅ Período ${periodo1.codigo} - ${maiz.nombre} en ${parcela1.nombre} (${periodo1.estado})`);
  console.log(`✅ Período ${periodo2.codigo} - ${frijol.nombre} en ${parcela2.nombre} (${periodo2.estado})`);
  console.log(`✅ Período ${periodo3.codigo} - ${tomate.nombre} en ${parcela3.nombre} (${periodo3.estado})`);

  // ==========================================
  // CREAR APLICACIONES EN PERÍODOS ACTIVOS
  // ==========================================
  console.log('💧 Creando aplicaciones de ejemplo...');

  // Aplicación 1: Fertilización en Parcela Norte (Maíz)
  const aplicacion1 = await prisma.aplicacionParcela.create({
    data: {
      periodoSiembraId: periodo1.id,
      parcelaId: parcela1.id,
      fecha: new Date('2024-05-15'),
      hectareasAplicadas: 5.0,
      tipoAplicacion: 'Fertilización',
      costoTotal: 25000,
      responsable: 'Juan Pérez',
      observaciones: 'Fertilización de arranque',
      insumos: {
        create: [
          {
            insumoId: item1.id,
            cantidad: 250,
            unidadMedida: item1.unidadMedida,
            costoUnitario: item1.costoUnitario,
            costoTotal: 625000,
            dosisPorHectarea: 50
          },
          {
            insumoId: item6.id,
            cantidad: 150,
            unidadMedida: item6.unidadMedida,
            costoUnitario: item6.costoUnitario,
            costoTotal: 270000,
            dosisPorHectarea: 30
          }
        ]
      }
    }
  });

  // Aplicación 2: Control de plagas en Parcela Norte
  const aplicacion2 = await prisma.aplicacionParcela.create({
    data: {
      periodoSiembraId: periodo1.id,
      parcelaId: parcela1.id,
      fecha: new Date('2024-06-10'),
      hectareasAplicadas: 5.0,
      tipoAplicacion: 'Fumigación',
      costoTotal: 112500,
      responsable: 'María López',
      observaciones: 'Control preventivo de gusano cogollero',
      insumos: {
        create: [
          {
            insumoId: item2.id,
            cantidad: 10,
            unidadMedida: item2.unidadMedida,
            costoUnitario: item2.costoUnitario,
            costoTotal: 450000,
            dosisPorHectarea: 2
          }
        ]
      }
    }
  });

  // Aplicación 3: Fertilización en Parcela Sur (Frijol)
  const aplicacion3 = await prisma.aplicacionParcela.create({
    data: {
      periodoSiembraId: periodo2.id,
      parcelaId: parcela2.id,
      fecha: new Date('2024-06-20'),
      hectareasAplicadas: 7.5,
      tipoAplicacion: 'Fertilización',
      costoTotal: 281250,
      responsable: 'Pedro Ramírez',
      observaciones: 'Primera fertilización de cobertura',
      insumos: {
        create: [
          {
            insumoId: item1.id,
            cantidad: 150,
            unidadMedida: item1.unidadMedida,
            costoUnitario: item1.costoUnitario,
            costoTotal: 375000,
            dosisPorHectarea: 20
          }
        ]
      }
    }
  });

  // Actualizar costos de períodos
  await prisma.periodoSiembra.update({
    where: { id: periodo1.id },
    data: { costoTotal: 737500 }
  });

  await prisma.periodoSiembra.update({
    where: { id: periodo2.id },
    data: { costoTotal: 281250 }
  });

  console.log(`✅ Aplicación ${aplicacion1.tipoAplicacion} en ${parcela1.nombre}`);
  console.log(`✅ Aplicación ${aplicacion2.tipoAplicacion} en ${parcela1.nombre}`);
  console.log(`✅ Aplicación ${aplicacion3.tipoAplicacion} en ${parcela2.nombre}`);

  // ==========================================
  // CREAR RECETAS
  // ==========================================
  console.log('📋 Creando recetas de aplicación...');

  const receta1 = await prisma.receta.create({
    data: {
      cultivoId: maiz.id,
      nombre: 'Fertilización Inicial Maíz',
      descripcion: 'Programa de fertilización para primeras 4 semanas',
      etapaCultivo: 'Vegetativo',
      activo: true,
      detalles: {
        create: [
          {
            insumoId: item1.id,
            dosisPorHectarea: 50,
            unidadMedida: item1.unidadMedida,
            orden: 1
          },
          {
            insumoId: item6.id,
            dosisPorHectarea: 30,
            unidadMedida: item6.unidadMedida,
            orden: 2
          }
        ]
      }
    }
  });

  const receta2 = await prisma.receta.create({
    data: {
      cultivoId: tomate.id,
      nombre: 'Programa Integral Tomate',
      descripcion: 'Fertilización y control fitosanitario completo',
      etapaCultivo: 'Completo',
      activo: true,
      detalles: {
        create: [
          {
            insumoId: item1.id,
            dosisPorHectarea: 80,
            unidadMedida: item1.unidadMedida,
            orden: 1
          },
          {
            insumoId: item5.id,
            dosisPorHectarea: 3,
            unidadMedida: item5.unidadMedida,
            orden: 2
          }
        ]
      }
    }
  });

  console.log(`✅ Receta: ${receta1.nombre} para ${maiz.nombre}`);
  console.log(`✅ Receta: ${receta2.nombre} para ${tomate.nombre}`);

  // ==========================================
  // CREAR ACTIVIDADES
  // ==========================================
  console.log('📝 Creando actividades programadas...');

  const actividad1 = await prisma.actividad.create({
    data: {
      periodoSiembraId: periodo1.id,
      nombre: 'Segunda Fertilización',
      tipo: 'Fertilización',
      fechaProgramada: new Date('2024-07-01'),
      estado: 'Pendiente',
      responsable: 'Juan Pérez',
      costo: 300000,
      observaciones: 'Aplicar NPK en etapa de floración'
    }
  });

  const actividad2 = await prisma.actividad.create({
    data: {
      periodoSiembraId: periodo1.id,
      nombre: 'Riego de Auxilio',
      tipo: 'Riego',
      fechaProgramada: new Date('2024-06-25'),
      fechaRealizada: new Date('2024-06-25'),
      estado: 'Completada',
      responsable: 'Pedro Ramírez',
      costo: 5000,
      observaciones: 'Riego debido a sequía temporal'
    }
  });

  const actividad3 = await prisma.actividad.create({
    data: {
      periodoSiembraId: periodo2.id,
      nombre: 'Control de Malezas',
      tipo: 'Control de Malezas',
      fechaProgramada: new Date('2024-07-10'),
      estado: 'Pendiente',
      responsable: 'María López',
      costo: 80000,
      observaciones: 'Aplicación de herbicida selectivo'
    }
  });

  console.log(`✅ Actividad: ${actividad1.nombre} (${actividad1.estado})`);
  console.log(`✅ Actividad: ${actividad2.nombre} (${actividad2.estado})`);
  console.log(`✅ Actividad: ${actividad3.nombre} (${actividad3.estado})`);

  // ==========================================
  // RESUMEN FINAL
  // ==========================================
  console.log('\n🎉 ¡Seed completado exitosamente!\n');
  console.log('📊 RESUMEN DE DATOS CREADOS:');
  console.log('═══════════════════════════════════════');
  console.log(`👥 Usuarios:           2`);
  console.log(`📦 Items Inventario:   6`);
  console.log(`⚠️  Alertas:            2`);
  console.log(`🌾 Cultivos:           4`);
  console.log(`🗺️  Parcelas:           4`);
  console.log(`📅 Períodos Siembra:   3 (2 activos, 1 finalizado)`);
  console.log(`💧 Aplicaciones:       3`);
  console.log(`📋 Recetas:            2`);
  console.log(`📝 Actividades:        3 (1 completada, 2 pendientes)`);
  console.log('═══════════════════════════════════════\n');
  
  console.log('🔐 CREDENCIALES DE ACCESO:');
  console.log('═══════════════════════════════════════');
  console.log('   📧 Email:    admin@agricol.com');
  console.log('   🔑 Password: 123456');
  console.log('   👤 Rol:      Administrador\n');
  console.log('   📧 Email:    user@agricol.com');
  console.log('   🔑 Password: 123456');
  console.log('   👤 Rol:      Usuario\n');

  console.log('🌐 ENDPOINTS DISPONIBLES:');
  console.log('═══════════════════════════════════════');
  console.log('   📦 Inventario:  /api/inventario');
  console.log('   🗺️  Parcelas:    /api/parcelas');
  console.log('   📅 Períodos:    /api/parcelas/periodos/list');
  console.log('   💧 Aplicaciones:/api/parcelas/aplicaciones/list');
  console.log('   📊 Estadísticas:/api/parcelas/estadisticas\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });