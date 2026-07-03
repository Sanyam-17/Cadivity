import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { guardApiRole } from "@/lib/server/auth-guard";
import { generateCertificatePdf } from "@/lib/certificates/generate";
import { resend } from "@/lib/server/resend";
import { getCertificateEmailHtml } from "@/lib/server/emails/certificate-email";
import { logger } from "@/lib/server/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;

    // Must be logged in (student or above)
    const guarded = await guardApiRole("student");
    if (guarded.error) return guarded.error;
    const session = guarded.session;

    // Fetch the enrollment to ensure it belongs to this user (or user is admin)
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
        student: true,
        certificate: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Auth check: either the student themselves or an admin
    if (enrollment.studentId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check completion status
    if (!enrollment.completedAt) {
      return NextResponse.json(
        { error: "Course is not fully completed yet" },
        { status: 400 }
      );
    }

    let certificate = enrollment.certificate;
    let isFirstGeneration = false;

    // If no certificate exists, create one
    if (!certificate) {
      // Generate a cryptographically secure certificate ID
      const { randomBytes } = await import("crypto");
      const randomPart = randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
      const year = new Date().getFullYear();
      const certificateNumber = `CAD-${year}-${randomPart}`;

      certificate = await prisma.certificate.create({
        data: {
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          enrollmentId: enrollment.id,
          certificateNumber,
          // verificationUrl will be generated dynamically or stored. We'll store it for completeness:
          verificationUrl: "", // Temporary, will update after creating ID
        },
      });

      // Update verification URL based on the generated CUID
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://cadivity.com"}/verify/${certificate.id}`;
      certificate = await prisma.certificate.update({
        where: { id: certificate.id },
        data: { verificationUrl },
      });

      isFirstGeneration = true;
    }

    const verificationUrl = certificate.verificationUrl || `https://cadivity.com/verify/${certificate.id}`;
    
    // Format issue date
    const issueDate = certificate.issuedAt.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate PDF
    const pdfBuffer = await generateCertificatePdf({
      studentName: enrollment.student.name,
      courseTitle: enrollment.course.title,
      issueDate,
      certificateNumber: certificate.certificateNumber,
      verificationUrl,
    });

    // Send email if first generation
    if (isFirstGeneration && enrollment.student.email) {
      try {
        await resend.emails.send({
          from: "Cadivity <noreply@cadivity.com>",
          to: [enrollment.student.email],
          subject: `Your Cadivity Certificate — ${enrollment.course.title}`,
          html: getCertificateEmailHtml({
            studentName: enrollment.student.name,
            courseTitle: enrollment.course.title,
            verificationUrl,
          }),
          attachments: [
            {
              filename: `cadivity-certificate-${enrollment.course.slug}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
      } catch (emailError) {
        logger.error("Failed to send certificate email", { error: String(emailError) });
        // We don't fail the request if the email fails
      }
    }

    // Return the PDF as a downloadable attachment
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cadivity-certificate-${enrollment.course.slug}.pdf"`,
      },
    });
  } catch (error) {
    logger.error("Failed to generate certificate", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
