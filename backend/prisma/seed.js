const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos AgriCol...\n');

  // ==========================================
  // LIMPIAR DATOS EXISTENTES (SIN TOCAR USUARIOS)
  // ==========================================
  console.log('🧹 Limpiando datos existentes (manteniendo usuarios)...');
  
  await prisma.ordenDetalle.deleteMany();
  await prisma.ordenAplicacion.deleteMany();
  await prisma.actividad.deleteMany();
  await prisma.aplicacionInsumo.deleteMany();
  await prisma.aplicacionParcela.deleteMany();
  await prisma.periodoSiembra.deleteMany();
  await prisma.recetaDetalle.deleteMany();
  await prisma.receta.deleteMany();
  await prisma.movimientoInventario.deleteMany();
  await prisma.alertaInventario.deleteMany();
  await prisma.inventarioItem.deleteMany();
  await prisma.cultivo.deleteMany();
  await prisma.parcela.deleteMany();

  console.log('✅ Datos antiguos eliminados\n');

  // ==========================================
  // CREAR CULTIVOS
  // ==========================================
  console.log('🌾 Creando cultivos...');
  
  const maiz = await prisma.cultivo.create({
    data: {
      nombre: 'Maíz',
      variedad: 'Híbrido Premium',
      descripcion: 'Cultivo de maíz híbrido para producción de grano con alto rendimiento',
      diasCiclo: 120,
      costoPorHectarea: 35000,
      rendimientoEsperado: 12.5,
      activo: true
    }
  });

  const tomate = await prisma.cultivo.create({
    data: {
      nombre: 'Tomate',
      variedad: 'Saladette',
      descripcion: 'Tomate saladette para consumo fresco y procesado industrial',
      diasCiclo: 90,
      costoPorHectarea: 55000,
      rendimientoEsperado: 80.0,
      activo: true
    }
  });

  const trigo = await prisma.cultivo.create({
    data: {
      nombre: 'Trigo',
      variedad: 'Cronos',
      descripcion: 'Trigo de ciclo otoño-invierno para producción de harina panificable',
      diasCiclo: 150,
      costoPorHectarea: 28000,
      rendimientoEsperado: 6.5,
      activo: true
    }
  });

  const chile = await prisma.cultivo.create({
    data: {
      nombre: 'Chile Jalapeño',
      variedad: 'Grande',
      descripcion: 'Chile jalapeño para mercado nacional y exportación',
      diasCiclo: 100,
      costoPorHectarea: 48000,
      rendimientoEsperado: 25.0,
      activo: true
    }
  });

  const frijol = await prisma.cultivo.create({
    data: {
      nombre: 'Frijol',
      variedad: 'Negro Jamapa',
      descripcion: 'Frijol negro de alto rendimiento para consumo humano',
      diasCiclo: 90,
      costoPorHectarea: 22000,
      rendimientoEsperado: 2.8,
      activo: true
    }
  });

  console.log('   ✅ 5 cultivos creados');

  // ==========================================
  // CREAR PARCELAS
  // ==========================================
  console.log('\n🗺️ Creando parcelas...');
  
  const parcela1 = await prisma.parcela.create({
    data: {
      codigo: 'PAR-001',
      nombre: 'Parcela Norte A',
      superficieHa: 10.5,
      ubicacion: 'Sector Norte - Zona A',
      coordenadas: '25.7617,-100.3028',
      tipoSuelo: 'Franco Arcilloso',
      sistemaRiego: 'Riego por Aspersión',
      estado: 'Activa',
      observaciones: 'Parcela con sistema de riego instalado en 2023',
      activo: true
    }
  });

  const parcela2 = await prisma.parcela.create({
    data: {
      codigo: 'PAR-002',
      nombre: 'Parcela Sur B',
      superficieHa: 8.0,
      ubicacion: 'Sector Sur - Zona B',
      coordenadas: '25.7510,-100.3142',
      tipoSuelo: 'Franco Arenoso',
      sistemaRiego: 'Riego por Goteo',
      estado: 'Activa',
      observaciones: 'Sistema de goteo con fertirrigación',
      activo: true
    }
  });

  const parcela3 = await prisma.parcela.create({
    data: {
      codigo: 'PAR-003',
      nombre: 'Parcela Este C',
      superficieHa: 12.0,
      ubicacion: 'Sector Este - Zona C',
      coordenadas: '25.7688,-100.2897',
      tipoSuelo: 'Franco',
      sistemaRiego: 'Temporal',
      estado: 'En Preparación',
      observaciones: 'En proceso de nivelación y preparación para siembra',
      activo: true
    }
  });

  const parcela4 = await prisma.parcela.create({
    data: {
      codigo: 'PAR-004',
      nombre: 'Parcela Oeste D',
      superficieHa: 15.5,
      ubicacion: 'Sector Oeste - Zona D',
      coordenadas: '25.7642,-100.3256',
      tipoSuelo: 'Arcilloso',
      sistemaRiego: 'Riego por Gravedad',
      estado: 'Activa',
      observaciones: 'Sistema de riego tradicional por surcos',
      activo: true
    }
  });

  const parcela5 = await prisma.parcela.create({
    data: {
      codigo: 'PAR-005',
      nombre: 'Parcela Central E',
      superficieHa: 6.0,
      ubicacion: 'Sector Central - Zona E',
      coordenadas: '25.7580,-100.3085',
      tipoSuelo: 'Franco Limoso',
      sistemaRiego: 'Riego por Goteo',
      estado: 'Descanso',
      observaciones: 'En periodo de descanso para recuperación del suelo',
      activo: true
    }
  });

  console.log('   ✅ 5 parcelas creadas');

  // ==========================================
  // CREAR ITEMS DE INVENTARIO
  // ==========================================
  console.log('\n📦 Creando inventario...');

  // FERTILIZANTES
  const fert1 = await prisma.inventarioItem.create({
    data: {
      codigo: 'FERT-001',
      nombre: 'Fertilizante NPK 15-15-15',
      descripcion: 'Fertilizante completo balanceado para todo tipo de cultivos',
      categoria: 'Fertilizantes',
      subcategoria: 'NPK',
      marca: 'AgroMax',
      presentacion: 'Costal 50 kg',
      composicion: 'N-P-K 15-15-15',
      concentracion: '45% total',
      unidadMedida: 'kg',
      stockActual: 1500,
      stockMinimo: 200,
      stockMaximo: 3000,
      costoUnitario: 450,
      precioVenta: 600,
      valorTotal: 675000,
      estado: 'Disponible',
      ubicacion: 'Bodega A',
      almacen: 'Principal',
      seccion: 'Estante 1',
      proveedor: 'AgroInsumos S.A.',
      numeroLote: 'LOT-2024-001',
      fechaAdquisicion: new Date('2024-11-01'),
      fechaVencimiento: new Date('2026-11-01'),
      activo: true
    }
  });

  const fert2 = await prisma.inventarioItem.create({
    data: {
      codigo: 'FERT-002',
      nombre: 'Urea 46%',
      descripcion: 'Fertilizante nitrogenado de alta concentración',
      categoria: 'Fertilizantes',
      subcategoria: 'Nitrogenados',
      marca: 'FertilPro',
      presentacion: 'Costal 50 kg',
      composicion: 'Nitrógeno (N)',
      concentracion: '46% N',
      unidadMedida: 'kg',
      stockActual: 2400,
      stockMinimo: 400,
      stockMaximo: 5000,
      costoUnitario: 350,
      precioVenta: 480,
      valorTotal: 840000,
      estado: 'Disponible',
      ubicacion: 'Bodega A',
      almacen: 'Principal',
      seccion: 'Estante 2',
      proveedor: 'FertilMax',
      numeroLote: 'LOT-2024-002',
      fechaAdquisicion: new Date('2024-11-15'),
      fechaVencimiento: new Date('2026-11-15'),
      activo: true
    }
  });

  const fert3 = await prisma.inventarioItem.create({
    data: {
      codigo: 'FERT-003',
      nombre: 'Superfosfato Triple',
      descripcion: 'Fertilizante fosfórico soluble de alta concentración',
      categoria: 'Fertilizantes',
      subcategoria: 'Fosfatados',
      marca: 'AgroMax',
      presentacion: 'Costal 50 kg',
      composicion: 'Fósforo (P₂O₅)',
      concentracion: '46% P₂O₅',
      unidadMedida: 'kg',
      stockActual: 1000,
      stockMinimo: 200,
      stockMaximo: 2000,
      costoUnitario: 520,
      precioVenta: 700,
      valorTotal: 520000,
      estado: 'Disponible',
      ubicacion: 'Bodega A',
      almacen: 'Principal',
      seccion: 'Estante 3',
      proveedor: 'AgroInsumos S.A.',
      numeroLote: 'LOT-2024-003',
      fechaAdquisicion: new Date('2024-10-20'),
      fechaVencimiento: new Date('2026-10-20'),
      activo: true
    }
  });

  // PESTICIDAS
  const pest1 = await prisma.inventarioItem.create({
    data: {
      codigo: 'PEST-001',
      nombre: 'Insecticida Cipermetrina 25%',
      descripcion: 'Control eficaz de plagas de insectos masticadores y chupadores',
      categoria: 'Pesticidas',
      subcategoria: 'Insecticidas',
      marca: 'AgroquímicaPro',
      presentacion: 'Envase 1 L',
      composicion: 'Cipermetrina',
      concentracion: '25% EC',
      unidadMedida: 'litro',
      stockActual: 150,
      stockMinimo: 30,
      stockMaximo: 300,
      costoUnitario: 280,
      precioVenta: 400,
      valorTotal: 42000,
      estado: 'Disponible',
      ubicacion: 'Bodega B',
      almacen: 'Químicos',
      seccion: 'Estante 1',
      proveedor: 'AgroquímicaPro',
      numeroLote: 'LOT-2024-010',
      fechaAdquisicion: new Date('2024-10-01'),
      fechaVencimiento: new Date('2025-10-01'),
      activo: true
    }
  });

  const pest2 = await prisma.inventarioItem.create({
    data: {
      codigo: 'HERB-001',
      nombre: 'Herbicida Glifosato 48%',
      descripcion: 'Control total de malezas de hoja ancha y angosta',
      categoria: 'Pesticidas',
      subcategoria: 'Herbicidas',
      marca: 'HerbaMax',
      presentacion: 'Envase 1 L',
      composicion: 'Glifosato',
      concentracion: '48% SL',
      unidadMedida: 'litro',
      stockActual: 200,
      stockMinimo: 40,
      stockMaximo: 400,
      costoUnitario: 180,
      precioVenta: 260,
      valorTotal: 36000,
      estado: 'Disponible',
      ubicacion: 'Bodega B',
      almacen: 'Químicos',
      seccion: 'Estante 2',
      proveedor: 'AgroquímicaPro',
      numeroLote: 'LOT-2024-011',
      fechaAdquisicion: new Date('2024-10-15'),
      fechaVencimiento: new Date('2025-10-15'),
      activo: true
    }
  });

  const pest3 = await prisma.inventarioItem.create({
    data: {
      codigo: 'FUNG-001',
      nombre: 'Fungicida Mancozeb 80%',
      descripcion: 'Control preventivo de enfermedades fungosas',
      categoria: 'Pesticidas',
      subcategoria: 'Fungicidas',
      marca: 'FungiControl',
      presentacion: 'Bolsa 1 kg',
      composicion: 'Mancozeb',
      concentracion: '80% WP',
      unidadMedida: 'kg',
      stockActual: 120,
      stockMinimo: 25,
      stockMaximo: 250,
      costoUnitario: 320,
      precioVenta: 450,
      valorTotal: 38400,
      estado: 'Disponible',
      ubicacion: 'Bodega B',
      almacen: 'Químicos',
      seccion: 'Estante 3',
      proveedor: 'AgroquímicaPro',
      numeroLote: 'LOT-2024-012',
      fechaAdquisicion: new Date('2024-09-20'),
      fechaVencimiento: new Date('2025-09-20'),
      activo: true
    }
  });

  // SEMILLAS
  const sem1 = await prisma.inventarioItem.create({
    data: {
      codigo: 'SEM-001',
      nombre: 'Semilla Maíz Híbrido Premium',
      descripcion: 'Semilla certificada de maíz híbrido de alta producción',
      categoria: 'Semillas',
      subcategoria: 'Granos',
      marca: 'Semillas del Valle',
      presentacion: 'Costal 25 kg',
      composicion: 'Semilla híbrida',
      concentracion: '100%',
      unidadMedida: 'kg',
      stockActual: 600,
      stockMinimo: 100,
      stockMaximo: 1200,
      costoUnitario: 150,
      precioVenta: 220,
      valorTotal: 90000,
      estado: 'Disponible',
      ubicacion: 'Bodega C',
      almacen: 'Semillas',
      seccion: 'Estante 1',
      proveedor: 'Semillas del Valle',
      numeroLote: 'LOT-2024-020',
      fechaAdquisicion: new Date('2024-09-01'),
      fechaVencimiento: new Date('2025-09-01'),
      activo: true
    }
  });

  const sem2 = await prisma.inventarioItem.create({
    data: {
      codigo: 'SEM-002',
      nombre: 'Semilla Tomate Saladette',
      descripcion: 'Variedad resistente a enfermedades, alto rendimiento',
      categoria: 'Semillas',
      subcategoria: 'Hortalizas',
      marca: 'Semillas del Valle',
      presentacion: 'Sobre 100 g',
      composicion: 'Semilla híbrida',
      concentracion: '100%',
      unidadMedida: 'gramos',
      stockActual: 15000,
      stockMinimo: 2000,
      stockMaximo: 30000,
      costoUnitario: 0.25,
      precioVenta: 0.40,
      valorTotal: 3750,
      estado: 'Disponible',
      ubicacion: 'Bodega C',
      almacen: 'Semillas',
      seccion: 'Estante 2',
      proveedor: 'Semillas del Valle',
      numeroLote: 'LOT-2024-021',
      fechaAdquisicion: new Date('2024-08-15'),
      fechaVencimiento: new Date('2025-08-15'),
      activo: true
    }
  });

  console.log('   ✅ 9 items de inventario creados');

  // ==========================================
  // CREAR RECETAS AGRONÓMICAS
  // ==========================================
  console.log('\n📋 Creando recetas agronómicas...');

  const receta1 = await prisma.receta.create({
    data: {
      cultivoId: maiz.id,
      nombre: 'Fertilización Maíz - Siembra',
      descripcion: 'Programa de fertilización base para siembra de maíz con NPK y Urea',
      etapaCultivo: 'Siembra',
      activo: true,
      detalles: {
        create: [
          {
            insumoId: fert1.id,
            dosisPorHectarea: 200,
            unidadMedida: 'kg',
            orden: 1
          },
          {
            insumoId: fert2.id,
            dosisPorHectarea: 100,
            unidadMedida: 'kg',
            orden: 2
          }
        ]
      }
    }
  });

  const receta2 = await prisma.receta.create({
    data: {
      cultivoId: maiz.id,
      nombre: 'Fertilización Maíz - Vegetativo',
      descripcion: 'Fertilización complementaria en etapa vegetativa (40-50 cm de altura)',
      etapaCultivo: 'Vegetativo',
      activo: true,
      detalles: {
        create: [
          {
            insumoId: fert2.id,
            dosisPorHectarea: 150,
            unidadMedida: 'kg',
            orden: 1
          }
        ]
      }
    }
  });

  const receta3 = await prisma.receta.create({
    data: {
      cultivoId: tomate.id,
      nombre: 'Control Integral Tomate',
      descripcion: 'Control preventivo de plagas y enfermedades en tomate',
      etapaCultivo: 'Vegetativo',
      activo: true,
      detalles: {
        create: [
          {
            insumoId: pest1.id,
            dosisPorHectarea: 1.5,
            unidadMedida: 'litro',
            orden: 1
          },
          {
            insumoId: pest3.id,
            dosisPorHectarea: 2.5,
            unidadMedida: 'kg',
            orden: 2
          }
        ]
      }
    }
  });

  const receta4 = await prisma.receta.create({
    data: {
      cultivoId: trigo.id,
      nombre: 'Fertilización Trigo - Siembra',
      descripcion: 'Fertilización base para siembra de trigo con NPK y Superfosfato',
      etapaCultivo: 'Siembra',
      activo: true,
      detalles: {
        create: [
          {
            insumoId: fert1.id,
            dosisPorHectarea: 180,
            unidadMedida: 'kg',
            orden: 1
          },
          {
            insumoId: fert3.id,
            dosisPorHectarea: 120,
            unidadMedida: 'kg',
            orden: 2
          }
        ]
      }
    }
  });

  console.log('   ✅ 4 recetas agronómicas creadas');

  // ==========================================
  // CREAR PERÍODOS DE SIEMBRA
  // ==========================================
  console.log('\n🌱 Creando períodos de siembra...');

  const periodo1 = await prisma.periodoSiembra.create({
    data: {
      parcelaId: parcela1.id,
      cultivoId: maiz.id,
      codigo: 'PS-2024-001',
      fechaInicio: new Date('2024-11-01'),
      fechaCosechaEsperada: new Date('2025-03-01'),
      hectareasSembradas: 10.5,
      rendimientoEsperado: 12.5,
      costoTotal: 367500, // 10.5 ha * 35000
      estado: 'En Curso',
      observaciones: 'Primera siembra de maíz en parcela norte. Suelo preparado con arado de discos y rastra. Sistema de riego por aspersión verificado y funcionando correctamente.'
    }
  });

  const periodo2 = await prisma.periodoSiembra.create({
    data: {
      parcelaId: parcela2.id,
      cultivoId: tomate.id,
      codigo: 'PS-2024-002',
      fechaInicio: new Date('2024-10-15'),
      fechaCosechaEsperada: new Date('2025-01-15'),
      hectareasSembradas: 8.0,
      rendimientoEsperado: 80.0,
      costoTotal: 440000, // 8.0 ha * 55000
      estado: 'En Curso',
      observaciones: 'Siembra de tomate saladette. Sistema de riego por goteo con fertirrigación instalado. Plántulas trasplantadas con 30 cm de separación entre plantas.'
    }
  });

  const periodo3 = await prisma.periodoSiembra.create({
    data: {
      parcelaId: parcela4.id,
      cultivoId: trigo.id,
      codigo: 'PS-2024-003',
      fechaInicio: new Date('2024-11-20'),
      fechaCosechaEsperada: new Date('2025-04-20'),
      hectareasSembradas: 15.5,
      rendimientoEsperado: 6.5,
      costoTotal: 434000, // 15.5 ha * 28000
      estado: 'En Curso',
      observaciones: 'Trigo de ciclo otoño-invierno. Densidad de siembra de 120 kg/ha. Sistema de riego por gravedad en surcos. Variedad resistente a roya.'
    }
  });

  console.log('   ✅ 3 períodos de siembra creados');

  // ==========================================
  // CREAR ÓRDENES DE APLICACIÓN
  // ==========================================
  console.log('\n📝 Creando órdenes de aplicación...');

  const orden1 = await prisma.ordenAplicacion.create({
    data: {
      parcelaId: parcela1.id,
      recetaId: receta1.id,
      hectareasAplicadas: 10.5,
      fechaCreacion: new Date('2024-11-03'),
      fechaAplicacion: new Date('2024-11-05'),
      estado: 'APLICADA',
      observaciones: 'Fertilización base aplicada correctamente. Condiciones climáticas favorables, sin viento. Equipo de aplicación calibrado.',
      costoTotal: 94500 // (200kg*450 + 100kg*350) * 10.5ha
    }
  });

  const orden2 = await prisma.ordenAplicacion.create({
    data: {
      parcelaId: parcela2.id,
      recetaId: receta3.id,
      hectareasAplicadas: 8.0,
      fechaCreacion: new Date('2024-11-25'),
      fechaAplicacion: null,
      estado: 'PENDIENTE',
      observaciones: 'Control preventivo programado. Verificar condiciones climáticas antes de aplicación. Evitar aplicar con viento mayor a 10 km/h.',
      costoTotal: 9760 // (1.5L*280 + 2.5kg*320) * 8.0ha
    }
  });

  const orden3 = await prisma.ordenAplicacion.create({
    data: {
      parcelaId: parcela1.id,
      recetaId: receta2.id,
      hectareasAplicadas: 10.5,
      fechaCreacion: new Date('2024-12-01'),
      fechaAplicacion: null,
      estado: 'PENDIENTE',
      observaciones: 'Segunda fertilización programada para cuando las plantas tengan 40-50 cm de altura. Aplicar en banda lateral.',
      costoTotal: 55125 // 150kg*350 * 10.5ha
    }
  });

  const orden4 = await prisma.ordenAplicacion.create({
    data: {
      parcelaId: parcela4.id,
      recetaId: receta4.id,
      hectareasAplicadas: 15.5,
      fechaCreacion: new Date('2024-11-22'),
      fechaAplicacion: null,
      estado: 'PENDIENTE',
      observaciones: 'Fertilización base para trigo. Aplicar al voleo e incorporar con rastra ligera inmediatamente después.',
      costoTotal: 183600 // (180kg*450 + 120kg*520) * 15.5ha
    }
  });

  console.log('   ✅ 4 órdenes de aplicación creadas');

  // ==========================================
  // CREAR ACTIVIDADES PROGRAMADAS
  // ==========================================
  console.log('\n📅 Creando actividades programadas...');

  await prisma.actividad.create({
    data: {
      periodoSiembraId: periodo1.id,
      nombre: 'Riego Programado - Maíz Norte',
      tipo: 'Riego',
      fechaProgramada: new Date('2024-12-03'),
      estado: 'Pendiente',
      responsable: 'Juan Operador',
      costo: 3500,
      observaciones: 'Riego por aspersión programado. Duración estimada: 4 horas. Verificar presión del sistema.'
    }
  });

  await prisma.actividad.create({
    data: {
      periodoSiembraId: periodo2.id,
      nombre: 'Monitoreo de Plagas - Tomate',
      tipo: 'Monitoreo',
      fechaProgramada: new Date('2024-12-02'),
      fechaRealizada: new Date('2024-12-02'),
      estado: 'Completada',
      responsable: 'María Técnico',
      costo: 1500,
      observaciones: 'Monitoreo realizado. No se detectaron niveles críticos de plagas. Se observaron algunos áfidos en hojas inferiores, nivel bajo.'
    }
  });

  await prisma.actividad.create({
    data: {
      periodoSiembraId: periodo1.id,
      nombre: 'Segunda Fertilización - Maíz',
      tipo: 'Fertilización',
      fechaProgramada: new Date('2024-12-15'),
      estado: 'Pendiente',
      responsable: 'Juan Operador',
      costo: 55125,
      observaciones: 'Segunda aplicación de urea cuando plantas tengan 40-50 cm. Aplicar en banda lateral cerca de las plantas.'
    }
  });

  await prisma.actividad.create({
    data: {
      periodoSiembraId: periodo3.id,
      nombre: 'Control de Malezas - Trigo',
      tipo: 'Control de Malezas',
      fechaProgramada: new Date('2024-12-10'),
      estado: 'Pendiente',
      responsable: 'Pedro Operador',
      costo: 8000,
      observaciones: 'Aplicación de herbicida selectivo. Esperar a que el trigo tenga 3-4 hojas verdaderas.'
    }
  });

  console.log('   ✅ 4 actividades programadas creadas');

  // ==========================================
  // RESUMEN FINAL
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('🎉 ¡SEED COMPLETADO EXITOSAMENTE!');
  console.log('='.repeat(60));
  console.log('\n📊 RESUMEN DE DATOS CREADOS:');
  console.log(`   🌾 Cultivos:              5 (Maíz, Tomate, Trigo, Chile, Frijol)`);
  console.log(`   🗺️  Parcelas:             5 (Total: 52 hectáreas)`);
  console.log(`   📦 Items inventario:      9 (Fertilizantes, Pesticidas, Semillas)`);
  console.log(`   📋 Recetas agronómicas:   4`);
  console.log(`   🌱 Períodos de siembra:   3 (todos en curso)`);
  console.log(`   📝 Órdenes de aplicación: 4 (1 aplicada, 3 pendientes)`);
  console.log(`   📅 Actividades:           4 (1 completada, 3 pendientes)\n`);
  
  console.log('💰 VALOR TOTAL DEL INVENTARIO:');
  console.log(`   Fertilizantes: $2,035,000`);
  console.log(`   Pesticidas:    $116,400`);
  console.log(`   Semillas:      $93,750`);
  console.log(`   TOTAL:         $2,245,150\n`);
  
  console.log('✅ La base de datos está lista para usar!');
  console.log('✅ Los usuarios existentes se mantuvieron intactos');
  console.log('=' + '='.repeat(59) + '\n');
}

main()
  .catch((e) => {
    console.error('\n❌ ERROR DURANTE EL SEED:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });