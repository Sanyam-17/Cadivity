import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/db";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">
            Certificate Not Found
          </h1>
          <p className="text-slate-600 mb-8">
            We couldn't find a certificate with the ID: <br />
            <code className="bg-slate-100 px-2 py-1 rounded mt-2 inline-block font-mono text-sm">{id}</code>
          </p>
          <Button asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-2">
              Valid Certificate
            </h1>
            <p className="text-slate-400 text-sm">
              This certificate is authentic and verifiable.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Student
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {studentFirstName}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Course Completed
            </p>
            <p className="text-lg font-semibold text-slate-900 leading-snug">
              {certificate.course.title}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Date Issued
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {formattedDate}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Certificate ID
              </p>
              <p className="text-sm font-semibold text-slate-900 font-mono">
                {certificate.certificateNumber}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to Cadivity</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
