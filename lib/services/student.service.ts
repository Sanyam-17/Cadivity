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
  totalSections: number;
  totalLessons: number;
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
        course: {
          include: {
            category: { select: { name: true } },
            instructor: { select: { name: true } },
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
      totalSections: e.course.sections.length,
      totalLessons: e.course.sections.reduce(
        (sum, s) => sum + s._count.lessons,
        0
      ),
    }));
  }

  /**
   * Get summary stats for the student dashboard banner.
   */
  static async getDashboardStats(studentId: string) {
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
      avgProgress,
    };
  }
}
