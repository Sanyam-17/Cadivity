import { prisma } from "../server/db";

export class AdminService {
  /**
   * Fetches statistics for the admin dashboard.
   */
  static async getDashboardStats() {
    try {
      const [studentCount, instructorCount, courseCount] = await Promise.all([
        prisma.user.count({ where: { role: "student" } }),
        prisma.user.count({ where: { role: "instructor" } }),
        prisma.course.count(),
      ]);

      return {
        totalStudents: studentCount,
        totalInstructors: instructorCount,
        totalCourses: courseCount,
        totalRevenue: 0, 
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw new Error("Failed to fetch dashboard statistics");
    }
  }

  /**
   * Fetches mock enrollments since dynamic enrollment is not yet implemented.
   */
  static async getRecentEnrollments(limit = 5) {
    // Returning empty for now as requested no new models in schema
    return [];
  }
}
