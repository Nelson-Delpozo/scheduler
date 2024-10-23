/*
  Warnings:

  - Made the column `role` on table `Shift` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Shift" ALTER COLUMN "role" SET NOT NULL;
