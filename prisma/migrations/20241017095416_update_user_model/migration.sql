-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consentToText" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
