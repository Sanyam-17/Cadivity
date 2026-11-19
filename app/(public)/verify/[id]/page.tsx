import { Metadata } from "next";
import { prisma } from "@/lib/server/db";
import { CheckCircle2, XCircle, Award, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: VerifyPageProps
): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Verify Certificate ${id} | Cadivity`,
    description: "Verify the authenticity of a Cadivity certificate of completion.",
  };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      course: true,
      student: true,
    },
  });

  if (!certificate) {
    return (
      <div className="min-h-screen cad-bg-cream flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full cad-card bg-white p-8 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-[var(--cad-error)] flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-[var(--cad-error)]" />
          </div>
          <h1 className="cad-text-h3 text-[var(--cad-ink)] mb-2">
            Certificate Not Found
          </h1>
          <p className="text-sm text-[var(--cad-muted)] mb-2" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            We couldn&apos;t find a certificate with the ID:
          </p>
          <code className="cad-text-mono bg-[var(--cad-sand)] px-3 py-1.5 inline-block mb-8 text-[var(--cad-ink)]" style={{ fontSize: '12px' }}>{id}</code>
          <Link href="/" className="cad-btn cad-btn-dark w-full">
            Return Home
            <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
          </Link>
        </div>
      </div>
    );
  }

  // Use only the first name for privacy
  const studentFirstName = certificate.student.name.split(" ")[0];

  const formattedDate = certificate.issuedAt.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen cad-bg-cream flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full cad-card bg-white overflow-hidden">
        
        {/* Header */}
        <div className="cad-bg-navy p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10" aria-hidden="true">
            <Award className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-[var(--cad-success)] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-[var(--cad-success)]" />
            </div>
            <h1 className="cad-text-h3 text-white mb-2">
              Valid Certificate
            </h1>
            <p className="cad-text-mono text-white/40" style={{ fontSize: '10px' }}>
              This certificate is authentic and verifiable.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          
          <div>
            <p className="cad-text-mono text-[var(--cad-muted)] mb-1" style={{ fontSize: '10px' }}>
              Student
            </p>
            <p className="text-lg font-semibold text-[var(--cad-ink)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              {studentFirstName}
            </p>
          </div>

          <div>
            <p className="cad-text-mono text-[var(--cad-muted)] mb-1" style={{ fontSize: '10px' }}>
              Course Completed
            </p>
            <p className="text-lg font-semibold text-[var(--cad-ink)] leading-snug" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              {certificate.course.title}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--cad-hairline)]">
            <div>
              <p className="cad-text-mono text-[var(--cad-muted)] mb-1" style={{ fontSize: '10px' }}>
                Date Issued
              </p>
              <p className="text-sm font-semibold text-[var(--cad-ink)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                {formattedDate}
              </p>
            </div>
            <div>
              <p className="cad-text-mono text-[var(--cad-muted)] mb-1" style={{ fontSize: '10px' }}>
                Certificate ID
              </p>
              <p className="cad-text-mono text-[var(--cad-ink)]" style={{ fontSize: '12px' }}>
                {certificate.certificateNumber}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[var(--cad-sand)] p-6 border-t border-[var(--cad-hairline)] text-center">
          <Link href="/" className="cad-btn cad-btn-outline text-[var(--cad-ink)] border-[var(--cad-hairline)] w-full">
            Back to Cadivity
          </Link>
        </div>

      </div>
    </div>
  );
}
