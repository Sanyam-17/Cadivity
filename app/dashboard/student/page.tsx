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
    <div className="theme-student min-h-screen bg-[#f8fafe]">
      {/* ─── Welcome Banner ─── */}
      <section className="bg-gradient-to-r from-[#002B5B] to-[#118B63] py-16 sm:py-20">
        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl font-display">
              {greeting}, {firstName} 👋
            </h1>
            <p className="mt-2 text-sm text-white/90 sm:text-base max-w-xl leading-relaxed">
              Continue from where you left. You&apos;ve completed {continueLearning ? continueLearning.progress : stats.avgProgress}% of your current module. Almost there!
            </p>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Course List with Search & Filters */}
        <section>
          <div className="border-b border-border/50 pb-3 mb-6">
            <div className="relative pb-3 -mb-[13px] w-fit">
              <h2 className="text-lg font-medium tracking-tight text-slate-800">
                My Courses
              </h2>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-emerald-600 rounded-t-sm" />
            </div>
          </div>
          <StudentCourseList courses={serializedCourses} />
        </section>
      </main>
    </div >
  );
}
