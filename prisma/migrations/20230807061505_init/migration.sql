/*
  Warnings:

  - Changed the type of `active` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
DROP COLUMN "active",
ADD COLUMN     "active" BOOLEAN NOT NULL;
