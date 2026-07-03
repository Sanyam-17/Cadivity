import "server-only";
import { prisma } from "../server/db";

export interface EnrolledCourse {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  status: string;
  progress: number;
  enrolledAt: Date;
  lastActivity: Date | null;
  completedAt: Date | null;
  categoryName: string | null;
  instructorName: string | null;
  instructorImage: string | null;
  totalSections: number;
  totalLessons: number;
  completedLessons: number;
  currentLessonId: string | null;
  currentLessonTitle: string | null;
}

export interface DashboardStats {
  totalCourses: number;
  inProgressCourses: number;
  completedCourses: number;
  notStartedCourses: number;
  avgProgress: number;
}

export interface ContinueLearningCourse {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  progress: number;
  currentLessonTitle: string | null;
  currentLessonType: string | null;
  totalLessons: number;
  completedLessons: number;
  lastActivity: Date | null;
  instructorName: string | null;
}

export interface StudentDashboardData {
  stats: DashboardStats;
  courses: EnrolledCourse[];
  continueLearning: ContinueLearningCourse | null;
}

export class StudentService {
  /**
   * Get all courses a student is enrolled in, with progress info.
   */
  static async getEnrolledCourses(
    studentId: string
  ): Promise<EnrolledCourse[]> {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      orderBy: { enrolledAt: "desc" },
      include: {
        currentLesson: { select: { id: true, title: true } },
        course: {
          include: {
            category: { select: { name: true } },
            instructor: { select: { name: true, image: true } },
            sections: {
              select: {
                id: true,
                _count: { select: { lessons: true } },
              },
            },
          },
        },
      },
    });

    // Batch-fetch completed lesson counts for all enrollments
    const courseIds = enrollments.map((e) => e.courseId);
    const completionCounts = await prisma.lessonCompletion.groupBy({
      by: ["lessonId"],
      where: {
        studentId,
        lesson: {
          section: {
            courseId: { in: courseIds },
          },
        },
      },
    });

    // Build a map: courseId → completed lesson count
    // We need to resolve lessonId → courseId through section
    const lessonToCourse = new Map<string, string>();
    const allLessons = await prisma.lesson.findMany({
      where: {
        section: {
          courseId: { in: courseIds },
        },
      },
      select: {
        id: true,
        section: { select: { courseId: true } },
      },
    });
    for (const lesson of allLessons) {
      lessonToCourse.set(lesson.id, lesson.section.courseId);
    }

    const completedPerCourse = new Map<string, number>();
    for (const completion of completionCounts) {
      const cId = lessonToCourse.get(completion.lessonId);
      if (cId) {
        completedPerCourse.set(cId, (completedPerCourse.get(cId) || 0) + 1);
      }
    }

    return enrollments.map((e) => ({
      id: e.id,
      courseId: e.courseId,
      title: e.course.title,
      slug: e.course.slug,
      description: e.course.description,
      thumbnail: e.course.thumbnail,
      status: e.course.status,
      progress: e.progress,
      enrolledAt: e.enrolledAt,
      lastActivity: e.lastActivity,
      completedAt: e.completedAt,
      categoryName: e.course.category?.name ?? null,
      instructorName: e.course.instructor?.name ?? null,
      instructorImage: e.course.instructor?.image ?? null,
      totalSections: e.course.sections.length,
      totalLessons: e.course.sections.reduce(
        (sum, s) => sum + s._count.lessons,
        0
      ),
      completedLessons: completedPerCourse.get(e.courseId) || 0,
      currentLessonId: e.currentLessonId,
      currentLessonTitle: e.currentLesson?.title ?? null,
    }));
  }

  /**
   * Get summary stats for the student dashboard banner.
   */
  static async getDashboardStats(studentId: string): Promise<DashboardStats> {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      select: {
        progress: true,
        completedAt: true,
      },
    });

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(
      (e) => e.completedAt !== null
    ).length;
    const inProgressCourses = enrollments.filter(
      (e) => e.completedAt === null && e.progress > 0
    ).length;
    const notStartedCourses = enrollments.filter(
      (e) => e.completedAt === null && e.progress === 0
    ).length;
    const avgProgress =
      totalCourses > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses
          )
        : 0;

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      notStartedCourses,
      avgProgress,
    };
  }

  /**
   * Single method to get everything the student dashboard needs.
   * Avoids multiple round-trips and keeps the page component lean.
   */
  static async getDashboardData(
    studentId: string
  ): Promise<StudentDashboardData> {
    const courses = await this.getEnrolledCourses(studentId);

    // Compute stats from already-fetched courses
    const totalCourses = courses.length;
    const completedCourses = courses.filter((c) => c.completedAt !== null).length;
    const inProgressCourses = courses.filter(
      (c) => c.completedAt === null && c.progress > 0
    ).length;
    const notStartedCourses = courses.filter(
      (c) => c.completedAt === null && c.progress === 0
    ).length;
    const avgProgress =
      totalCourses > 0
        ? Math.round(
            courses.reduce((sum, c) => sum + c.progress, 0) / totalCourses
          )
        : 0;

    // Find the best "continue learning" candidate:
    // Most recently active in-progress course
    const inProgressList = courses
      .filter((c) => c.completedAt === null && c.progress > 0)
      .sort((a, b) => {
        const aTime = a.lastActivity?.getTime() ?? 0;
        const bTime = b.lastActivity?.getTime() ?? 0;
        return bTime - aTime; // most recent first
      });

    const continueCourse = inProgressList[0] ?? null;

    // Fall back to a not-started course if nothing is in progress
    const continueCandidate =
      continueCourse ??
      courses.find((c) => c.completedAt === null && c.progress === 0) ??
      null;

    const continueLearning: ContinueLearningCourse | null = continueCandidate
      ? {
          enrollmentId: continueCandidate.id,
          courseId: continueCandidate.courseId,
          title: continueCandidate.title,
          slug: continueCandidate.slug,
          thumbnail: continueCandidate.thumbnail,
          progress: continueCandidate.progress,
          currentLessonTitle: continueCandidate.currentLessonTitle,
          currentLessonType: null, // resolved below if needed
          totalLessons: continueCandidate.totalLessons,
          completedLessons: continueCandidate.completedLessons,
          lastActivity: continueCandidate.lastActivity,
          instructorName: continueCandidate.instructorName,
        }
      : null;

    return {
      stats: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        avgProgress,
      },
      courses,
      continueLearning,
    };
  }
}
