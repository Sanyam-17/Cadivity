"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { PublicCourseCard, type PublicCourse } from "@/components/layout/public-course-card";

interface RelatedCoursesProps {
  slug: string;
}

export function RelatedCourses({ slug }: RelatedCoursesProps) {
  const [courses, setCourses] = React.useState<PublicCourse[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/courses/${slug}/related`)
      .then((r) => r.json())
      .then((data) => setCourses(data.courses ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (!loading && courses.length === 0) return null;

  return (
    <section className="py-14 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900">
            Related Courses
          </h2>
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Browse all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, i) => (
              <PublicCourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
