-- AlterTable
ALTER TABLE "User" ADD COLUMN "grade" INTEGER;
ALTER TABLE "User" ADD COLUMN "studentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");
