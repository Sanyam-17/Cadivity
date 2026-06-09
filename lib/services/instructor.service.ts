import { prisma } from "../server/db";

export class InstructorService {
  /**
   * Fetches dashboard statistics scoped to the instructor's courses.
   */
  static async getDashboardStats(instructorId: string) {
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    const [courseCount, enrollments] = await Promise.all([
      courseIds.length,
      courseIds.length > 0
        ? prisma.enrollment.findMany({
            where: { courseId: { in: courseIds } },
            select: {
              studentId: true,
              progress: true,
              completedAt: true,
            },
          })
        : [],
    ]);

    const uniqueStudents = new Set(enrollments.map((e) => e.studentId));
    const avgCompletion =
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
              enrollments.length
          )
        : 0;

    return {
      courseCount,
      studentCount: uniqueStudents.size,
      avgCompletionRate: avgCompletion,
      pendingCount: 0, // Placeholder — no question/submission model yet
    };
  }

  /**
   * Fetches recent enrollment/completion events for instructor's courses.
   */
  static async getRecentActivity(instructorId: string, limit = 20) {
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true, title: true },
    });

    if (courses.length === 0) return [];

    const courseIds = courses.map((c) => c.id);
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.title]));

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      orderBy: { enrolledAt: "desc" },
      take: limit,
      include: {
        student: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return enrollments.map((e) => ({
      id: e.id,
      type: e.completedAt ? ("completion" as const) : ("enrollment" as const),
      studentName: e.student.name,
      studentAvatar: e.student.image,
      courseName: courseMap[e.courseId] || "Unknown Course",
      createdAt: (e.completedAt || e.enrolledAt).toISOString(),
    }));
  }

  /**
   * Fetches daily enrollment trend for instructor's courses.
   */
  static async getEnrollmentTrend(
    instructorId: string,
    days: number = 7,
    courseId?: string
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get instructor's course IDs (or filter by specific course)
    let courseIds: string[];
    if (courseId) {
      // Verify the course belongs to this instructor
      const course = await prisma.course.findFirst({
        where: { id: courseId, instructorId },
        select: { id: true },
      });
      courseIds = course ? [course.id] : [];
    } else {
      const courses = await prisma.course.findMany({
        where: { instructorId },
        select: { id: true },
      });
      courseIds = courses.map((c) => c.id);
    }

    if (courseIds.length === 0) {
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return { date: d.toISOString().split("T")[0], count: 0 };
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
        enrolledAt: { gte: startDate },
      },
      select: { enrolledAt: true },
    });

    // Build day-by-day map
    const dayMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dayMap.set(d.toISOString().split("T")[0], 0);
    }

    for (const e of enrollments) {
      const key = e.enrolledAt.toISOString().split("T")[0];
      if (dayMap.has(key)) {
        dayMap.set(key, (dayMap.get(key) || 0) + 1);
      }
    }

    return Array.from(dayMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  /**
   * Fetches the instructor's courses with pagination/search/filter.
   */
  static async getCourses(
    instructorId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, status, category, search } = options;
    const skip = (page - 1) * limit;

    const where: any = { instructorId };
    if (status) where.status = status;
    if (category) where.categoryId = category;
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          instructor: { select: { id: true, name: true, image: true } },
          _count: { select: { enrollments: true, sections: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const courseIds = courses.map((course) => course.id);
    const completionRows =
      courseIds.length > 0
        ? await prisma.enrollment.groupBy({
            by: ["courseId"],
            where: { courseId: { in: courseIds } },
            _avg: { progress: true },
          })
        : [];
    const completionMap = new Map(
      completionRows.map((row) => [row.courseId, Math.round(row._avg.progress ?? 0)])
    );

    const courseData = courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      status: course.status,
      category: course.category,
      enrolledCount: course._count.enrollments,
      completionRate: completionMap.get(course.id) ?? 0,
      updatedAt: course.updatedAt.toISOString(),
      instructor: course.instructor,
    }));

    return {
      courses: courseData,
      total,
      page,
      pageSize: limit,
    };
  }

  /**
   * Fetches students enrolled in the instructor's courses.
   */
  static async getStudents(
    instructorId: string,
    options: {
      page?: number;
      limit?: number;
      courseId?: string;
      progressRange?: string;
      lastActive?: string;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, courseId, progressRange, lastActive, search } = options;
    const skip = (page - 1) * limit;

    // Build course filter
    const courseWhere: any = { instructorId };
    if (courseId) courseWhere.id = courseId;

    const instructorCourseIds = (
      await prisma.course.findMany({
        where: courseWhere,
        select: { id: true },
      })
    ).map((c) => c.id);

    if (instructorCourseIds.length === 0) {
      return { enrollments: [], total: 0, page, pageSize: limit };
    }

    const enrollmentWhere: any = { courseId: { in: instructorCourseIds } };

    // Progress filter
    if (progressRange) {
      if (progressRange === "0-25") enrollmentWhere.progress = { gte: 0, lte: 25 };
      else if (progressRange === "26-75") enrollmentWhere.progress = { gt: 25, lte: 75 };
      else if (progressRange === "76-100") enrollmentWhere.progress = { gt: 75, lt: 100 };
      else if (progressRange === "completed") enrollmentWhere.completedAt = { not: null };
    }

    // Last active filter
    if (lastActive) {
      const now = new Date();
      if (lastActive === "7days") {
        enrollmentWhere.lastActivity = { gte: new Date(now.getTime() - 7 * 86400000) };
      } else if (lastActive === "30days") {
        enrollmentWhere.lastActivity = { gte: new Date(now.getTime() - 30 * 86400000) };
      }
    }

    // Search filter (on student name/email)
    if (search) {
      enrollmentWhere.student = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: enrollmentWhere,
        skip,
        take: limit,
        orderBy: { enrolledAt: "desc" },
        include: {
          student: { select: { id: true, name: true, email: true, image: true } },
          course: { select: { id: true, title: true } },
        },
      }),
      prisma.enrollment.count({ where: enrollmentWhere }),
    ]);

    return {
      enrollments: enrollments.map((e) => ({
        enrollmentId: e.id,
        studentId: e.student.id,
        studentName: e.student.name,
        studentEmail: e.student.email,
        studentAvatar: e.student.image,
        courseId: e.course.id,
        courseName: e.course.title,
        progressPercent: e.progress,
        enrolledAt: e.enrolledAt.toISOString(),
        lastActiveAt: e.lastActivity?.toISOString() || null,
      })),
      total,
      page,
      pageSize: limit,
    };
  }
}
