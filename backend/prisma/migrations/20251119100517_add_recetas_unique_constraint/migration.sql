/*
  Warnings:

  - A unique constraint covering the columns `[recetaId,insumoId]` on the table `receta_detalles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "receta_detalles_recetaId_insumoId_key" ON "receta_detalles"("recetaId", "insumoId");
