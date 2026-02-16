-- DropForeignKey
ALTER TABLE "otp_codes" DROP CONSTRAINT IF EXISTS "otp_codes_user_id_fkey";
ALTER TABLE "backup_codes" DROP CONSTRAINT IF EXISTS "backup_codes_user_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "otp_codes";
DROP TABLE IF EXISTS "backup_codes";

-- DropEnum
DROP TYPE IF EXISTS "OtpPurpose";

-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified";
ALTER TABLE "users" DROP COLUMN IF EXISTS "mfa_enabled";
ALTER TABLE "users" DROP COLUMN IF EXISTS "is_demo";
