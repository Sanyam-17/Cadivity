import { requireAuth } from "@/lib/server/auth-guard";
import { StudentService } from "@/lib/services/student.service";
import { StudentCourseCard } from "@/components/student/course-card";
import { KPITile } from "@/components/shared/kpi-tile";
import { ModeBadge } from "@/components/shared/mode-badge";
import { BookOpen, GraduationCap, Search, TrendingUp, Trophy, Clock } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [enrolledCourses, stats] = await Promise.all([
    StudentService.getEnrolledCourses(userId),
    StudentService.getDashboardStats(userId),
  ]);

  const firstName = session.user.name;

  return (
    <div className="theme-student min-h-screen bg-background">
      {/* ─── Welcome Banner ─── */}
      <section className="student-banner px-4 py-10 sm:py-14">
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-2 text-sm text-white/75 sm:text-base">
            Continue your learning journey — pick up where you left off.
          </p>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Stats Section */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Your Progress</h2>
            <ModeBadge mode="student" size="sm" />
          </div>
          <p className="text-sm text-muted-foreground">Track your learning metrics at a glance</p>
        </div>

        {/* KPI Tiles Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="student-kpi-card">
            <KPITile
              title="Courses Enrolled"
              value={enrolledCourses.length}
              icon={BookOpen}
              accentColor="blue"
              cornerBracket
              animated
            />
          </div>
          <div className="student-kpi-card">
            <KPITile
              title="Hours Learned"
              value={stats?.totalHoursLearned || 0}
              suffix=" hrs"
              icon={Clock}
              accentColor="blue"
              cornerBracket
              animated
            />
          </div>
          <div className="student-kpi-card">
            <KPITile
              title="Avg Completion"
              value={stats?.averageCompletion || 0}
              suffix="%"
              icon={TrendingUp}
              accentColor="blue"
              cornerBracket
              animated
            />
          </div>
          <div className="student-kpi-card">
            <KPITile
              title="Certificates"
              value={stats?.certificatesEarned || 0}
              icon={Trophy}
              accentColor="blue"
              cornerBracket
              animated
            />
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            My Courses
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {enrolledCourses.length > 0
              ? `You are enrolled in ${enrolledCourses.length} course${enrolledCourses.length === 1 ? "" : "s"}.`
              : "You haven't enrolled in any courses yet."}
          </p>
        </div>

        {enrolledCourses.length > 0 ? (
          /* ─── Card Grid ─── */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <StudentCourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          /* ─── Empty State ─── */
          <div className="student-empty-state flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 px-6 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="size-7 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              You&apos;re not enrolled in any courses
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Browse our course catalog to find the right program for you and
              start your learning journey today.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-lg"
            >
              <Search className="size-4" />
              Browse Courses
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

