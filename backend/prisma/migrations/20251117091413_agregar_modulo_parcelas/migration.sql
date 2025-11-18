-- CreateTable
CREATE TABLE "cultivos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "variedad" TEXT,
    "descripcion" TEXT,
    "diasCiclo" INTEGER,
    "costoPorHectarea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rendimientoEsperado" DOUBLE PRECISION,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cultivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "superficieHa" DOUBLE PRECISION NOT NULL,
    "ubicacion" TEXT,
    "coordenadas" TEXT,
    "tipoSuelo" TEXT,
    "sistemaRiego" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activa',
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos_siembra" (
    "id" SERIAL NOT NULL,
    "parcelaId" INTEGER NOT NULL,
    "cultivoId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "fechaCosechaEsperada" TIMESTAMP(3),
    "fechaCosechaReal" TIMESTAMP(3),
    "hectareasSembradas" DOUBLE PRECISION NOT NULL,
    "rendimientoEsperado" DOUBLE PRECISION,
    "rendimientoReal" DOUBLE PRECISION,
    "costoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'En Curso',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_siembra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aplicaciones_parcela" (
    "id" SERIAL NOT NULL,
    "periodoSiembraId" INTEGER NOT NULL,
    "parcelaId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hectareasAplicadas" DOUBLE PRECISION NOT NULL,
    "tipoAplicacion" TEXT NOT NULL,
    "costoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responsable" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aplicaciones_parcela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aplicaciones_insumos" (
    "id" SERIAL NOT NULL,
    "aplicacionId" INTEGER NOT NULL,
    "insumoId" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "costoUnitario" DOUBLE PRECISION NOT NULL,
    "costoTotal" DOUBLE PRECISION NOT NULL,
    "dosisPorHectarea" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aplicaciones_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recetas" (
    "id" SERIAL NOT NULL,
    "cultivoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "etapaCultivo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receta_detalles" (
    "id" SERIAL NOT NULL,
    "recetaId" INTEGER NOT NULL,
    "insumoId" INTEGER NOT NULL,
    "dosisPorHectarea" DOUBLE PRECISION NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "receta_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" SERIAL NOT NULL,
    "periodoSiembraId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "fechaRealizada" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "responsable" TEXT,
    "costo" DOUBLE PRECISION,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parcelas_codigo_key" ON "parcelas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "periodos_siembra_codigo_key" ON "periodos_siembra"("codigo");

-- AddForeignKey
ALTER TABLE "periodos_siembra" ADD CONSTRAINT "periodos_siembra_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "parcelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos_siembra" ADD CONSTRAINT "periodos_siembra_cultivoId_fkey" FOREIGN KEY ("cultivoId") REFERENCES "cultivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicaciones_parcela" ADD CONSTRAINT "aplicaciones_parcela_periodoSiembraId_fkey" FOREIGN KEY ("periodoSiembraId") REFERENCES "periodos_siembra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicaciones_parcela" ADD CONSTRAINT "aplicaciones_parcela_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "parcelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicaciones_insumos" ADD CONSTRAINT "aplicaciones_insumos_aplicacionId_fkey" FOREIGN KEY ("aplicacionId") REFERENCES "aplicaciones_parcela"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicaciones_insumos" ADD CONSTRAINT "aplicaciones_insumos_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "inventario_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_cultivoId_fkey" FOREIGN KEY ("cultivoId") REFERENCES "cultivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_detalles" ADD CONSTRAINT "receta_detalles_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "recetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_detalles" ADD CONSTRAINT "receta_detalles_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "inventario_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_periodoSiembraId_fkey" FOREIGN KEY ("periodoSiembraId") REFERENCES "periodos_siembra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
