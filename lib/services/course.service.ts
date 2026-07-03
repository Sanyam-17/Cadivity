import "server-only";

/**
 * ⚠️  MIGRATION NOTE
 * ──────────────────
 * This service now queries the database via Prisma.
 * The legacy static data file `lib/courseData.ts` is no longer used
 * anywhere in the codebase and can be safely deleted.
 */

import { prisma } from "@/lib/server/db";
import type { Prisma } from "@prisma/client";

// ─── Exported Interfaces ─────────────────────────────────────────────────────

/** Filters accepted by `getCourses()`. */
export interface CourseFilters {
  status?: "draft" | "published" | "archived";
  categoryId?: string;
  instructorId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** Shape returned by `getCourses()` — list/card context. */
export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnail: string | null;
  logo: string | null;
  difficultyBadge: string | null;
  tags: string | null;
  keyFeatures: string[];
  ctaType: string;
  price: number | null;
  originalPrice: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  instructor: { id: string; name: string; image: string | null } | null;
  category: { id: string; name: string } | null;
  _count: { enrollments: number };
}

/** A single lesson inside a section (for `CourseDetail`). */
export interface CourseDetailLesson {
  id: string;
  title: string;
  type: string;
  duration: number | null;
  order: number;
}

/** A single section inside a course (for `CourseDetail`). */
export interface CourseDetailSection {
  id: string;
  title: string;
  order: number;
  lessons: CourseDetailLesson[];
}

/** Shape returned by `getCourseBySlug()` — full detail page context. */
export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  thumbnail: string | null;
  logo: string | null;
  difficultyBadge: string | null;
  tags: string | null;
  keyFeatures: string[];
  ctaType: string;
  brochureUrl: string | null;
  price: number | null;
  originalPrice: number | null;
  status: string;
  visibility: string;
  whatYouWillLearn: string[];
  requirements: string[];
  whoIsThisFor: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  instructor: { id: string; name: string; image: string | null } | null;
  category: { id: string; name: string } | null;
  sections: CourseDetailSection[];
  enrollmentCount: number;
}

/** Lightweight shape returned by `getPublishedCourses()` — card only. */
export interface PublicCourseCard {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnail: string | null;
  logo: string | null;
  price: number | null;
  originalPrice: number | null;
  difficultyBadge: string | null;
  keyFeatures: string[];
  ctaType: string;
  status: string;
}

/** Paginated result wrapper. */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// ─── Service ─────────────────────────────────────────────────────────────────

export class CourseService {
  /**
   * Fetch a paginated, filterable list of courses.
   *
   * - Supports filtering by status, category, instructor, and free-text search.
   * - Ordered by `updatedAt` descending (most recently touched first).
   * - Includes instructor, category, and enrollment count.
   */
  static async getCourses(
    filters: CourseFilters = {},
  ): Promise<PaginatedResult<PublicCourse>> {
    const {
      status,
      categoryId,
      instructorId,
      search,
      page = DEFAULT_PAGE,
      pageSize: rawPageSize = DEFAULT_PAGE_SIZE,
    } = filters;

    const pageSize = Math.min(Math.max(1, rawPageSize), MAX_PAGE_SIZE);
    const skip = (Math.max(1, page) - 1) * pageSize;

    // Build the WHERE clause
    const where: Prisma.CourseWhereInput = {};

    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (instructorId) {
      where.instructorId = instructorId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Fetch full course detail by slug, including curriculum.
   *
   * - Sections ordered by `section.order`, lessons by `lesson.order`.
   * - Includes instructor (id, name, image), category (id, name),
   *   and enrollment count.
   * - Returns `null` when the course doesn't exist or is not published
   *   (for public access). Pass `allowUnpublished: true` for admin views.
   */
  static async getCourseBySlug(
    slug: string,
    options: { allowUnpublished?: boolean } = {},
  ): Promise<CourseDetail | null> {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                order: true,
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) return null;

    // For public consumers, reject non-published courses
    if (!options.allowUnpublished && course.status !== "published") {
      return null;
    }

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail,
      logo: course.logo,
      difficultyBadge: course.difficultyBadge,
      tags: course.tags,
      keyFeatures: course.keyFeatures,
      ctaType: course.ctaType,
      brochureUrl: course.brochureUrl,
      price: course.price,
      originalPrice: course.originalPrice,
      status: course.status,
      visibility: course.visibility,
      whatYouWillLearn: course.whatYouWillLearn,
      requirements: course.requirements,
      whoIsThisFor: course.whoIsThisFor,
      seoTitle: course.seoTitle,
      seoDescription: course.seoDescription,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      instructor: course.instructor,
      category: course.category,
      sections: course.sections.map((section) => ({
        id: section.id,
        title: section.title,
        order: section.order,
        lessons: section.lessons,
      })),
      enrollmentCount: course._count.enrollments,
    };
  }

  /**
   * Lightweight list of published courses for the public courses page.
   *
   * Only selects the fields needed for rendering course cards.
   * Ordered by `createdAt` descending so newest courses appear first.
   *
   * **Caching**: This method is a pure data fetch with no user-specific
   * logic. Callers (Server Components) should wrap it with React `cache()`
   * or Next.js `unstable_cache()` to deduplicate within a single render
   * pass or across requests:
   *
   * ```ts
   * import { cache } from "react";
   * const getCards = cache(() => CourseService.getPublishedCourses());
   * ```
   */
  static async getPublishedCourses(): Promise<PublicCourseCard[]> {
    return prisma.course.findMany({
      where: { status: "published" },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        thumbnail: true,
        logo: true,
        price: true,
        originalPrice: true,
        difficultyBadge: true,
        keyFeatures: true,
        ctaType: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
