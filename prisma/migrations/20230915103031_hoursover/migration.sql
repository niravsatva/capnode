-- CreateTable
CREATE TABLE "HoursOver" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "isOverHours" BOOLEAN NOT NULL DEFAULT false,
    "overHours" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoursOver_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HoursOver" ADD CONSTRAINT "HoursOver_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoursOver" ADD CONSTRAINT "HoursOver_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
