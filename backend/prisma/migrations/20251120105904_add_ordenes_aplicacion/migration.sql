-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('PENDIENTE', 'APLICADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "ordenes_aplicacion" (
    "id" SERIAL NOT NULL,
    "parcelaId" INTEGER NOT NULL,
    "recetaId" INTEGER NOT NULL,
    "hectareasAplicadas" DOUBLE PRECISION NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAplicacion" TIMESTAMP(3),
    "operadorId" INTEGER,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "costoTotal" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_aplicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_detalles" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "insumoId" INTEGER NOT NULL,
    "cantidadCalculada" DOUBLE PRECISION NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "costoUnitario" DOUBLE PRECISION NOT NULL,
    "costoTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orden_detalles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ordenes_aplicacion" ADD CONSTRAINT "ordenes_aplicacion_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "parcelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_aplicacion" ADD CONSTRAINT "ordenes_aplicacion_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "recetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_aplicacion" ADD CONSTRAINT "ordenes_aplicacion_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_detalles" ADD CONSTRAINT "orden_detalles_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenes_aplicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_detalles" ADD CONSTRAINT "orden_detalles_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "inventario_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
