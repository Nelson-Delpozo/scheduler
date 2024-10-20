/*
  Warnings:

  - You are about to drop the column `day` on the `Availability` table. All the data in the column will be lost.
  - Added the required column `date` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `startTime` on the `Availability` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `Availability` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "day",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phoneNumber" DROP DEFAULT;
