-- AlterTable
ALTER TABLE "inventario_items" ADD COLUMN     "almacen" TEXT,
ADD COLUMN     "composicion" TEXT,
ADD COLUMN     "concentracion" TEXT,
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "precioVenta" DOUBLE PRECISION,
ADD COLUMN     "presentacion" TEXT,
ADD COLUMN     "seccion" TEXT,
ADD COLUMN     "subcategoria" TEXT;
