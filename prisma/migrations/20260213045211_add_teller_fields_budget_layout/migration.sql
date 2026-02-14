-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "institution_id" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "processing_status" TEXT,
ADD COLUMN     "teller_status" TEXT,
ADD COLUMN     "teller_type" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dashboard_layout" JSONB,
ADD COLUMN     "monthly_budget" DECIMAL(19,4);

-- CreateIndex
CREATE INDEX "transactions_teller_type_idx" ON "transactions"("teller_type");
