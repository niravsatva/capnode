/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `HoursOver` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HoursOver_employeeId_key" ON "HoursOver"("employeeId");
