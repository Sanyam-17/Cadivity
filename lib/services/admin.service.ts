import { courses } from "@/lib/courseData";
import { prisma } from "../db";

export class AdminService {
  /**
   * Fetches statistics for the admin dashboard.
   */
  static async getDashboardStats() {
    try {
      const [studentCount, instructorCount] = await Promise.all([
        prisma.user.count({ where: { role: "student" } }),
        prisma.user.count({ where: { role: "instructor" } }),
      ]);

      return {
        totalStudents: studentCount,
        totalInstructors: instructorCount,
        totalCourses: courses.length,
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
