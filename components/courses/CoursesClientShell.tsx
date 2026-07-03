"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { PublicCourseCard, type PublicCourse } from "@/components/layout/public-course-card";
import { BookOpen, Code2, Search, SlidersHorizontal, Star, X } from "lucide-react";
import type { PublicCourseWithMeta } from "@/app/(public)/courses/page";
import { useState, useMemo } from "react";

/* ─── Comparison table data (static) ─── */
const comparisonData = [
  {
    name: "Creo ProToolkit",
    lang: "C++",
    difficulty: 4,
    industry: "Mechanical, Industrial",
    bestFor: "Product Design Automation",
    output: "Plugins, UI Tools",
  },
  {
    name: "SolidWorks API",
    lang: "C#, VB.NET",
    difficulty: 3,
    industry: "Mechanical, Sheet Metal",
    bestFor: "Feature & Drawing Automation",
    output: "Add-ins, Batch Tools",
  },
  {
    name: "NX Open",
    lang: "C++, C#, .NET",
    difficulty: 4,
    industry: "Automotive, Aerospace",
    bestFor: "Enterprise-level Automation",
    output: "Extensions, Modeling Automation",
  },
  {
    name: "AutoCAD API",
    lang: "AutoLISP, .NET",
    difficulty: 2,
    industry: "Architecture, Manufacturing",
    bestFor: "Drafting Automation",
    output: "Scripts, Plugins",
  },
  {
    name: "CATIA CAA",
    lang: "C++",
    difficulty: 5,
    industry: "Automotive, Aerospace",
    bestFor: "High-complexity Automation",
    output: "Enterprise Plugins",
  },
];

const DIFFICULTY_OPTIONS = ["All Levels", "Beginner/Inter", "Intermediate", "Advanced", "Expert"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Most Enrolled", value: "popular" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

/* ─── Animated hero section ─── */
export function CoursesHeroClient() {
  const heroReveal = useScrollReveal();

  return (
    <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(30,64,175,0.3), rgba(15,23,42,0.8))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-12 right-[10%] w-14 h-14 rounded-2xl bg-white/5 border border-white/10 animate-float" style={{ animationDuration: "10s" }} />
        <div className="absolute bottom-16 left-[12%] w-10 h-10 rounded-full bg-white/5 border border-white/10 animate-float delay-500" style={{ animationDuration: "12s" }} />
      </div>

      <div ref={heroReveal.ref} className={`container relative z-10 mx-auto px-4 transition-all duration-700 ${heroReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
        <div className="max-w-3xl">
          {/* eyebrow — using <p> not <h5> for correct heading hierarchy */}
          <p className="text-accent font-semibold tracking-wide uppercase mb-4 text-sm">
            Training Programs
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Master CAD Automation
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
            Practical, industry-oriented training. Move beyond basic modeling
            and learn to build tools that automate the design process.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Animated course cards grid with search + filter + sort ─── */
export function CoursesGridClient({ courses }: { courses: PublicCourseWithMeta[] }) {
  const programsReveal = useScrollReveal();

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All Levels");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  /* derive unique categories for filter */
  const categories = useMemo(() => {
    const cats = Array.from(new Set(courses.map((c) => c.categoryName).filter(Boolean))) as string[];
    return ["All Categories", ...cats];
  }, [courses]);

  const [category, setCategory] = useState("All Categories");

  const filtered = useMemo(() => {
    let result = [...courses];

    /* search */
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.shortDescription ?? "").toLowerCase().includes(q) ||
          (c.tags ?? "").toLowerCase().includes(q) ||
          (c.instructorName ?? "").toLowerCase().includes(q)
      );
    }

    /* level filter */
    if (level !== "All Levels") {
      result = result.filter((c) => c.difficultyBadge === level);
    }

    /* category filter */
    if (category !== "All Categories") {
      result = result.filter((c) => c.categoryName === category);
    }

    /* sort */
    switch (sort) {
      case "popular":
        result.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case "price_asc":
        result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price_desc":
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      default: /* newest — already ordered from DB */
        break;
    }

    return result;
  }, [courses, search, level, category, sort]);

  const hasActiveFilters = search || level !== "All Levels" || category !== "All Categories" || sort !== "newest";

  function clearFilters() {
    setSearch("");
    setLevel("All Levels");
    setCategory("All Categories");
    setSort("newest");
  }

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div ref={programsReveal.ref} className="container mx-auto px-4">
        {/* Section heading */}
        <div className={`text-center mb-10 transition-all duration-700 ${programsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">
            Our Training Programs
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our training focuses on practical implementation, automation
            thinking, and real-world engineering tasks.
          </p>
        </div>

        {/* ── Search + Filter bar ── */}
        <div className={`mb-8 transition-all duration-700 delay-100 ${programsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search courses, topics, instructors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Filter toggle on mobile */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {hasActiveFilters && <span className="ml-1 h-2 w-2 rounded-full bg-primary" />}
            </button>

            {/* Desktop filters */}
            <div className={`hidden sm:flex items-center gap-3`}>
              <Filters
                level={level} setLevel={setLevel}
                category={category} setCategory={setCategory}
                categories={categories}
                sort={sort} setSort={setSort}
              />
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="sm:hidden mt-3 flex flex-wrap gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Filters
                level={level} setLevel={setLevel}
                category={category} setCategory={setCategory}
                categories={categories}
                sort={sort} setSort={setSort}
              />
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500">
                  <X className="h-3 w-3" /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-6">
          {filtered.length} {filtered.length === 1 ? "course" : "courses"} found
          {hasActiveFilters && " — "}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              clear filters
            </button>
          )}
        </p>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-6">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">
              No courses match your search
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Try different keywords or{" "}
              <button onClick={clearFilters} className="text-primary underline underline-offset-2">
                clear all filters
              </button>{" "}
              to see all programs.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((course, i) => (
              <div
                key={course.id}
                className={`transition-all duration-500 ${programsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 100 + 100}ms` }}
              >
                <PublicCourseCard course={course} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Reusable filter controls ─── */
function Filters({
  level, setLevel,
  category, setCategory, categories,
  sort, setSort,
}: {
  level: string; setLevel: (v: string) => void;
  category: string; setCategory: (v: string) => void; categories: string[];
  sort: string; setSort: (v: string) => void;
}) {
  return (
    <>
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        aria-label="Filter by difficulty level"
        className="h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer"
      >
        {DIFFICULTY_OPTIONS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {categories.length > 1 && (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        aria-label="Sort courses"
        className="h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </>
  );
}

/* ─── Animated comparison table ─── */
export function CoursesComparisonClient() {
  const comparisonReveal = useScrollReveal();

  return (
    <section className="py-20 bg-slate-50 overflow-hidden">
      <div ref={comparisonReveal.ref} className="container mx-auto px-4">
        <h2 className={`font-display text-3xl font-bold text-slate-900 mb-12 text-center transition-all duration-700 ${comparisonReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          Program Comparison
        </h2>
        <div className={`overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200 transition-all duration-700 ${comparisonReveal.visible ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900 text-white uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Feature / Criteria</th>
                <th className="px-6 py-4">Programming Language</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Best For</th>
                <th className="px-6 py-4 rounded-tr-xl">Industry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 font-bold text-primary">{row.name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <Code2 className="inline h-4 w-4 mr-1 text-slate-400" />
                    {row.lang}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-yellow-400" aria-label={`Difficulty: ${row.difficulty} out of 5`}>
                      {[...Array(5)].map((_, starI) => (
                        <Star
                          key={starI}
                          className={`h-3 w-3 ${starI < row.difficulty ? "fill-current" : "text-slate-200 fill-slate-200"}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{row.bestFor}</td>
                  <td className="px-6 py-4 text-slate-600">{row.industry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
