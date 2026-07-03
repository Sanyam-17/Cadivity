-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "phonepeOrderId" TEXT NOT NULL,
    "phonepeTransactionId" TEXT,
    "merchantOrderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'created',
    "courseId" TEXT NOT NULL,
    "studentId" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "guestName" TEXT,
    "enrollmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationUrl" TEXT,

    CONSTRAINT "certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_comment" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "isInstructorAnswer" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_phonepeOrderId_key" ON "Payment"("phonepeOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_merchantOrderId_key" ON "Payment"("merchantOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_enrollmentId_key" ON "Payment"("enrollmentId");

-- CreateIndex
CREATE INDEX "Payment_merchantOrderId_idx" ON "Payment"("merchantOrderId");

-- CreateIndex
CREATE INDEX "Payment_phonepeOrderId_idx" ON "Payment"("phonepeOrderId");

-- CreateIndex
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");

-- CreateIndex
CREATE INDEX "Payment_courseId_idx" ON "Payment"("courseId");

-- CreateIndex
CREATE INDEX "Payment_guestEmail_idx" ON "Payment"("guestEmail");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_enrollmentId_key" ON "certificate"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_certificateNumber_key" ON "certificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "certificate_studentId_idx" ON "certificate"("studentId");

-- CreateIndex
CREATE INDEX "certificate_courseId_idx" ON "certificate"("courseId");

-- CreateIndex
CREATE INDEX "lesson_comment_lessonId_idx" ON "lesson_comment"("lessonId");

-- CreateIndex
CREATE INDEX "lesson_comment_authorId_idx" ON "lesson_comment"("authorId");

-- CreateIndex
CREATE INDEX "lesson_comment_parentId_idx" ON "lesson_comment"("parentId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_comment" ADD CONSTRAINT "lesson_comment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_comment" ADD CONSTRAINT "lesson_comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_comment" ADD CONSTRAINT "lesson_comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "lesson_comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
