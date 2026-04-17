import { courses } from "@/lib/courseData";

export class CourseService {
  /**
   * Fetches all courses with optional filters from static data.
   */
  static async getCourses(filters: {
    category?: string;
    difficulty?: string;
    status?: string;
  } = {}) {
    let filtered = [...courses];
    
    // Note: static courses don't have 'category' or 'status' in the same way, 
    // but we can map them or just return all for now to keep it safe.
    if (filters.difficulty) {
      filtered = filtered.filter(c => c.level.toLowerCase().includes(filters.difficulty!.toLowerCase()));
    }

    return filtered.map(c => ({
      ...c,
      id: c.slug, // Use slug as ID for compatibility
      instructor: { name: c.instructor, image: null },
      _count: { enrollments: 0, modules: 0 }
    }));
  }

  /**
   * Fetches a single course by ID or Slug from static data.
   */
  static async getCourseByIdOrSlug(identifier: string) {
    const course = courses.find(c => c.slug === identifier);
    
    if (!course) return null;

    return {
      ...course,
      id: course.slug,
      instructor: { id: "1", name: course.instructor, image: null, email: "contact@cadivity.com" },
      modules: [] // Static data currently handles content differently
    };
  }
}
