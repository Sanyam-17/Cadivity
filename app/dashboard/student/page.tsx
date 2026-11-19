import { requireAuth } from "@/lib/server/auth-guard";
import { StudentService } from "@/lib/services/student.service";
import { StudentCourseList } from "@/components/student/student-course-list";

export default async function StudentDashboard() {
  const session = await requireAuth();
  const userId = session.user.id;
  const firstName = session.user.name;

  const { stats, courses, continueLearning } =
    await StudentService.getDashboardData(userId);

  // Serialize dates to ISO strings for client components
  const serializedCourses = courses.map((c) => ({
    id: c.id,
    courseId: c.courseId,
    title: c.title,
    slug: c.slug,
    description: c.description,
    thumbnail: c.thumbnail,
    progress: c.progress,
    enrolledAt: c.enrolledAt.toISOString(),
    lastActivity: c.lastActivity?.toISOString() ?? null,
    completedAt: c.completedAt?.toISOString() ?? null,
    categoryName: c.categoryName,
    instructorName: c.instructorName,
    totalLessons: c.totalLessons,
    completedLessons: c.completedLessons,
    currentLessonTitle: c.currentLessonTitle,
  }));

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";



  return (
    <div className="theme-student min-h-screen bg-[hsl(var(--background))]">
      {/* ─── Blueprint Hero Banner ─── */}
      <section className="relative isolate overflow-hidden bg-[#070B14] py-14 sm:py-18 border-b border-white/10 text-white">
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[#183F7F]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#4AB8EA]/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1 max-w-2xl">
            <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4AB8EA]">
              — LEARNER WORKSPACE
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl font-display">
              {greeting}, {firstName} 👋
            </h1>
            <p className="mt-2 text-sm text-[#A0AEC0] sm:text-base leading-relaxed font-light">
              Continue your CAD automation progress. You&apos;ve completed {continueLearning ? continueLearning.progress : stats.avgProgress}% of your current module.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Course List with Search & Filters */}
        <section>
          <div className="border-b border-[var(--cad-hairline,rgba(14,22,36,0.15))] pb-3 mb-6">
            <div className="relative pb-3 -mb-[13px] w-fit">
              <h2 className="font-display text-xl font-bold tracking-tight text-[#0E1624]">
                My Enrolled Courses
              </h2>
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#F2A63B]" />
            </div>
          </div>
          <StudentCourseList courses={serializedCourses} />
        </section>
      </main>
    </div>
  );
}
