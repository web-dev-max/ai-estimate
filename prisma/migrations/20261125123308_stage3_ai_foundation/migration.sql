/*
  Warnings:

  - A unique constraint covering the columns `[price_list_id,service_id,unit_id,valid_from]` on the table `price_list_items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "state" JSONB;

-- AlterTable
ALTER TABLE "estimate_items" ADD COLUMN     "price_list_item_id" UUID,
ADD COLUMN     "price_source_detail" VARCHAR(32);

-- AlterTable
ALTER TABLE "price_list_items" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "service_aliases" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "alias" VARCHAR(255) NOT NULL,

    CONSTRAINT "service_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_aliases_alias_key" ON "service_aliases"("alias");

-- CreateIndex
CREATE INDEX "service_aliases_service_id_idx" ON "service_aliases"("service_id");

-- CreateIndex
CREATE INDEX "conversations_updated_at_idx" ON "conversations"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "price_list_items_price_list_id_service_id_unit_id_valid_fro_key" ON "price_list_items"("price_list_id", "service_id", "unit_id", "valid_from");

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_price_list_item_id_fkey" FOREIGN KEY ("price_list_item_id") REFERENCES "price_list_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_aliases" ADD CONSTRAINT "service_aliases_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS services_name_trgm_idx
  ON services USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS service_aliases_alias_trgm_idx
  ON service_aliases USING gin (alias gin_trgm_ops);
