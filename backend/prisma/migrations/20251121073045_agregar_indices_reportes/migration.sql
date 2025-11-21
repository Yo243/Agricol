-- DropForeignKey
ALTER TABLE "actividades" DROP CONSTRAINT "actividades_periodoSiembraId_fkey";

-- DropForeignKey
ALTER TABLE "aplicaciones_parcela" DROP CONSTRAINT "aplicaciones_parcela_periodoSiembraId_fkey";

-- CreateIndex
CREATE INDEX "actividades_periodoSiembraId_idx" ON "actividades"("periodoSiembraId");

-- CreateIndex
CREATE INDEX "actividades_estado_idx" ON "actividades"("estado");

-- CreateIndex
CREATE INDEX "actividades_fechaProgramada_idx" ON "actividades"("fechaProgramada");

-- CreateIndex
CREATE INDEX "alertas_inventario_itemId_idx" ON "alertas_inventario"("itemId");

-- CreateIndex
CREATE INDEX "alertas_inventario_leida_idx" ON "alertas_inventario"("leida");

-- CreateIndex
CREATE INDEX "alertas_inventario_fecha_idx" ON "alertas_inventario"("fecha");

-- CreateIndex
CREATE INDEX "aplicaciones_insumos_aplicacionId_idx" ON "aplicaciones_insumos"("aplicacionId");

-- CreateIndex
CREATE INDEX "aplicaciones_insumos_insumoId_idx" ON "aplicaciones_insumos"("insumoId");

-- CreateIndex
CREATE INDEX "aplicaciones_parcela_periodoSiembraId_idx" ON "aplicaciones_parcela"("periodoSiembraId");

-- CreateIndex
CREATE INDEX "aplicaciones_parcela_parcelaId_idx" ON "aplicaciones_parcela"("parcelaId");

-- CreateIndex
CREATE INDEX "aplicaciones_parcela_fecha_idx" ON "aplicaciones_parcela"("fecha");

-- CreateIndex
CREATE INDEX "aplicaciones_parcela_tipoAplicacion_idx" ON "aplicaciones_parcela"("tipoAplicacion");

-- CreateIndex
CREATE INDEX "cultivos_activo_idx" ON "cultivos"("activo");

-- CreateIndex
CREATE INDEX "cultivos_nombre_idx" ON "cultivos"("nombre");

-- CreateIndex
CREATE INDEX "inventario_items_categoria_idx" ON "inventario_items"("categoria");

-- CreateIndex
CREATE INDEX "inventario_items_estado_idx" ON "inventario_items"("estado");

-- CreateIndex
CREATE INDEX "inventario_items_activo_idx" ON "inventario_items"("activo");

-- CreateIndex
CREATE INDEX "movimientos_inventario_itemId_idx" ON "movimientos_inventario"("itemId");

-- CreateIndex
CREATE INDEX "movimientos_inventario_tipo_idx" ON "movimientos_inventario"("tipo");

-- CreateIndex
CREATE INDEX "movimientos_inventario_fecha_idx" ON "movimientos_inventario"("fecha");

-- CreateIndex
CREATE INDEX "orden_detalles_ordenId_idx" ON "orden_detalles"("ordenId");

-- CreateIndex
CREATE INDEX "orden_detalles_insumoId_idx" ON "orden_detalles"("insumoId");

-- CreateIndex
CREATE INDEX "ordenes_aplicacion_parcelaId_idx" ON "ordenes_aplicacion"("parcelaId");

-- CreateIndex
CREATE INDEX "ordenes_aplicacion_recetaId_idx" ON "ordenes_aplicacion"("recetaId");

-- CreateIndex
CREATE INDEX "ordenes_aplicacion_estado_idx" ON "ordenes_aplicacion"("estado");

-- CreateIndex
CREATE INDEX "ordenes_aplicacion_fechaCreacion_idx" ON "ordenes_aplicacion"("fechaCreacion");

-- CreateIndex
CREATE INDEX "parcelas_activo_idx" ON "parcelas"("activo");

-- CreateIndex
CREATE INDEX "parcelas_estado_idx" ON "parcelas"("estado");

-- CreateIndex
CREATE INDEX "parcelas_nombre_idx" ON "parcelas"("nombre");

-- CreateIndex
CREATE INDEX "periodos_siembra_parcelaId_idx" ON "periodos_siembra"("parcelaId");

-- CreateIndex
CREATE INDEX "periodos_siembra_cultivoId_idx" ON "periodos_siembra"("cultivoId");

-- CreateIndex
CREATE INDEX "periodos_siembra_estado_idx" ON "periodos_siembra"("estado");

-- CreateIndex
CREATE INDEX "periodos_siembra_fechaInicio_idx" ON "periodos_siembra"("fechaInicio");

-- CreateIndex
CREATE INDEX "periodos_siembra_fechaCosechaEsperada_idx" ON "periodos_siembra"("fechaCosechaEsperada");

-- CreateIndex
CREATE INDEX "receta_detalles_recetaId_idx" ON "receta_detalles"("recetaId");

-- CreateIndex
CREATE INDEX "receta_detalles_insumoId_idx" ON "receta_detalles"("insumoId");

-- CreateIndex
CREATE INDEX "recetas_cultivoId_idx" ON "recetas"("cultivoId");

-- CreateIndex
CREATE INDEX "recetas_activo_idx" ON "recetas"("activo");

-- AddForeignKey
ALTER TABLE "aplicaciones_parcela" ADD CONSTRAINT "aplicaciones_parcela_periodoSiembraId_fkey" FOREIGN KEY ("periodoSiembraId") REFERENCES "periodos_siembra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_periodoSiembraId_fkey" FOREIGN KEY ("periodoSiembraId") REFERENCES "periodos_siembra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
