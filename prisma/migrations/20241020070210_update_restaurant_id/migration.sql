/*
  Warnings:

  - The primary key for the `Restaurant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.

*/
-- Drop dependent constraints
ALTER TABLE "User" DROP CONSTRAINT "User_restaurantId_fkey";
ALTER TABLE "Shift" DROP CONSTRAINT "Shift_restaurantId_fkey";
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_pkey",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Restaurant_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_id_key" ON "Restaurant"("id");

-- Re-add the constraints
ALTER TABLE "User" ADD CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id");
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id");
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id");
