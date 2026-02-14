-- CreateTable
CREATE TABLE "subscription_overrides" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "merchant_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscription_overrides_user_id_idx" ON "subscription_overrides"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_overrides_user_id_merchant_name_key" ON "subscription_overrides"("user_id", "merchant_name");

-- AddForeignKey
ALTER TABLE "subscription_overrides" ADD CONSTRAINT "subscription_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
