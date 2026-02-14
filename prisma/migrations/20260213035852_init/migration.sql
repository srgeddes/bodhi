-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('DEPOSITORY', 'CREDIT', 'INVESTMENT', 'LOAN', 'BROKERAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'DEGRADED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "CategorySource" AS ENUM ('TELLER', 'AI', 'RULE', 'USER_OVERRIDE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teller_enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "institution_name" TEXT,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_synced_date" DATE,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teller_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "teller_enrollment_id" TEXT NOT NULL,
    "teller_account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "official_name" TEXT,
    "type" "AccountType" NOT NULL,
    "subtype" TEXT,
    "mask" TEXT,
    "current_balance" DECIMAL(19,4),
    "available_balance" DECIMAL(19,4),
    "limit_amount" DECIMAL(19,4),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "teller_transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "merchant_name" TEXT,
    "clean_merchant_name" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "category_confidence" DECIMAL(5,4),
    "category_source" "CategorySource",
    "is_transfer" BOOLEAN NOT NULL DEFAULT false,
    "linked_transfer_id" TEXT,
    "is_pending" BOOLEAN NOT NULL DEFAULT false,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "is_excluded" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teller_enrollments_enrollment_id_key" ON "teller_enrollments"("enrollment_id");

-- CreateIndex
CREATE INDEX "teller_enrollments_user_id_idx" ON "teller_enrollments"("user_id");

-- CreateIndex
CREATE INDEX "teller_enrollments_status_idx" ON "teller_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_teller_account_id_key" ON "accounts"("teller_account_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "accounts_teller_enrollment_id_idx" ON "accounts"("teller_enrollment_id");

-- CreateIndex
CREATE INDEX "accounts_type_idx" ON "accounts"("type");

-- CreateIndex
CREATE INDEX "accounts_user_id_type_idx" ON "accounts"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_teller_transaction_id_key" ON "transactions"("teller_transaction_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_account_id_idx" ON "transactions"("account_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_date_idx" ON "transactions"("user_id", "date");

-- CreateIndex
CREATE INDEX "transactions_user_id_category_idx" ON "transactions"("user_id", "category");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "transactions_is_pending_idx" ON "transactions"("is_pending");

-- CreateIndex
CREATE INDEX "transactions_is_transfer_idx" ON "transactions"("is_transfer");

-- CreateIndex
CREATE INDEX "transactions_merchant_name_idx" ON "transactions"("merchant_name");

-- AddForeignKey
ALTER TABLE "teller_enrollments" ADD CONSTRAINT "teller_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_teller_enrollment_id_fkey" FOREIGN KEY ("teller_enrollment_id") REFERENCES "teller_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_linked_transfer_id_fkey" FOREIGN KEY ("linked_transfer_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
