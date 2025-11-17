/*
  Warnings:

  - You are about to drop the column `stock` on the `inventario_items` table. All the data in the column will be lost.
  - You are about to drop the column `stockAnterior` on the `movimientos_inventario` table. All the data in the column will be lost.
  - You are about to drop the column `stockNuevo` on the `movimientos_inventario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `inventario_items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "alertas_inventario" ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "itemNombre" TEXT,
ADD COLUMN     "tipoAlerta" TEXT;

-- AlterTable
ALTER TABLE "inventario_items" DROP COLUMN "stock",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "codigo" TEXT,
ADD COLUMN     "stockActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ultimoMovimiento" TIMESTAMP(3),
ALTER COLUMN "estado" SET DEFAULT 'Disponible';

-- AlterTable
ALTER TABLE "movimientos_inventario" DROP COLUMN "stockAnterior",
DROP COLUMN "stockNuevo",
ADD COLUMN     "unidadMedida" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "inventario_items_codigo_key" ON "inventario_items"("codigo");
