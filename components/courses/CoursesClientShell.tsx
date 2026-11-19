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

/* ─── Hero section ─── */
export function CoursesHeroClient() {
  const heroReveal = useScrollReveal();

  return (
    <section className="relative cad-bg-navy cad-section pt-32 pb-16 md:pb-20 overflow-hidden">
      <div ref={heroReveal.ref} className={`cad-container relative z-10 transition-all duration-700 ${heroReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
        <div className="max-w-3xl">
          <p className="cad-eyebrow text-[var(--cad-sky)] mb-3">TRAINING PROGRAMS</p>
          <h1 className="cad-text-display text-white mb-6">
            Master CAD{" "}
            <span className="cad-accent-amber">Automation.</span>
          </h1>
          <p className="cad-text-body max-w-2xl text-white/70">
            Practical, industry-oriented training. Move beyond basic modeling
            and learn to build tools that automate the design process.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Course cards grid with search + filter + sort ─── */
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

  const selectClasses = "h-10 pl-3 pr-8 border-0 bg-transparent cad-text-mono text-[var(--cad-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--cad-sky)]/30 appearance-none cursor-pointer";

  return (
    <section className="cad-bg-cream cad-section overflow-hidden">
      <div ref={programsReveal.ref} className="cad-container">
        {/* Section heading */}
        <div className={`mb-12 transition-all duration-700 ${programsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-4">AVAILABLE PROGRAMS</p>
          <h2 className="cad-text-h2 text-[var(--cad-ink)]">
            Our Training <span className="cad-accent-teal font-bold">Programs.</span>
          </h2>
        </div>

        {/* ── Search + Filter toolbar ── */}
        <div className={`mb-8 transition-all duration-700 delay-100 ${programsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="border border-[var(--cad-hairline)] bg-white/50 flex flex-col sm:flex-row items-stretch">
            {/* Search */}
            <div className="relative flex-1 border-b sm:border-b-0 sm:border-r border-[var(--cad-hairline)]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--cad-muted)] pointer-events-none" />
              <input
                type="search"
                placeholder="Search courses, topics, instructors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-transparent text-sm text-[var(--cad-ink)] placeholder:text-[var(--cad-muted)]/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--cad-sky)]/30"
                style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
              />
            </div>

            {/* Filter toggle on mobile */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 h-12 px-4 cad-text-mono text-[var(--cad-muted)] hover:text-[var(--cad-ink)] transition-colors border-b border-[var(--cad-hairline)]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {hasActiveFilters && <span className="ml-1 h-2 w-2 rounded-full bg-[var(--cad-amber)]" />}
            </button>

            {/* Desktop filters */}
            <div className="hidden sm:flex items-center">
              <Filters
                level={level} setLevel={setLevel}
                category={category} setCategory={setCategory}
                categories={categories}
                sort={sort} setSort={setSort}
                selectClasses={selectClasses}
              />
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="hidden sm:flex items-center gap-1 px-4 cad-text-mono text-[var(--cad-muted)] hover:text-[var(--cad-error)] transition-colors border-l border-[var(--cad-hairline)]"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="sm:hidden mt-0 flex flex-wrap gap-3 p-4 border border-t-0 border-[var(--cad-hairline)] bg-white/50">
              <Filters
                level={level} setLevel={setLevel}
                category={category} setCategory={setCategory}
                categories={categories}
                sort={sort} setSort={setSort}
                selectClasses={selectClasses}
              />
              {hasActiveFilters && (
                <button onClick={clearFilters} className="cad-text-mono text-[var(--cad-error)] flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="cad-text-mono text-[var(--cad-muted)] mb-8">
          {filtered.length} {filtered.length === 1 ? "course" : "courses"} found
          {hasActiveFilters && " — "}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-[var(--cad-cobalt)] hover:text-[var(--cad-ink)] transition-colors">
              clear filters
            </button>
          )}
        </p>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[var(--cad-hairline)] mb-6">
              <BookOpen className="h-7 w-7 text-[var(--cad-muted)]" strokeWidth={1.5} />
            </div>
            <h3 className="cad-text-h3 text-[var(--cad-ink)] mb-2">
              0 courses found
            </h3>
            <p className="cad-text-body mx-auto mb-6" style={{ textAlign: 'center' }}>
              No courses match your current filters. Try different keywords or{" "}
              <button onClick={clearFilters} className="text-[var(--cad-cobalt)] hover:underline">
                clear all filters
              </button>{" "}
              to see all programs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filtered.map((course, i) => (
              <div
                key={course.id}
                className={`transition-all duration-500 ${programsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 80 + 100}ms` }}
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
  selectClasses,
}: {
  level: string; setLevel: (v: string) => void;
  category: string; setCategory: (v: string) => void; categories: string[];
  sort: string; setSort: (v: string) => void;
  selectClasses: string;
}) {
  return (
    <>
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        aria-label="Filter by difficulty level"
        className={`${selectClasses} border-r border-[var(--cad-hairline)]`}
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
          className={`${selectClasses} border-r border-[var(--cad-hairline)]`}
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
        className={selectClasses}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </>
  );
}

/* ─── Comparison table ─── */
export function CoursesComparisonClient() {
  const comparisonReveal = useScrollReveal();

  return (
    <section className="cad-bg-sand cad-section overflow-hidden">
      <div ref={comparisonReveal.ref} className="cad-container">
        <div className="mb-12">
          <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-4">COMPARISON</p>
          <h2 className="cad-text-h2 text-[var(--cad-ink)]">
            Program <span className="cad-accent-teal font-bold">Comparison.</span>
          </h2>
        </div>
        <div className={`overflow-x-auto border border-[var(--cad-hairline)] transition-all duration-700 ${comparisonReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="cad-bg-navy">
                <th className="px-6 py-4 cad-text-mono text-white/70">Feature / Criteria</th>
                <th className="px-6 py-4 cad-text-mono text-white/70">Language</th>
                <th className="px-6 py-4 cad-text-mono text-white/70">Difficulty</th>
                <th className="px-6 py-4 cad-text-mono text-white/70">Best For</th>
                <th className="px-6 py-4 cad-text-mono text-white/70">Industry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cad-hairline)] bg-white">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--cad-cream)] transition-colors duration-200">
                  <td className="px-6 py-4 font-semibold text-[var(--cad-cobalt)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>{row.name}</td>
                  <td className="px-6 py-4 text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                    <Code2 className="inline h-3.5 w-3.5 mr-1.5 text-[var(--cad-muted)]" strokeWidth={1.5} />
                    {row.lang}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-[var(--cad-amber)]" aria-label={`Difficulty: ${row.difficulty} out of 5`}>
                      {[...Array(5)].map((_, starI) => (
                        <Star
                          key={starI}
                          className={`h-3 w-3 ${starI < row.difficulty ? "fill-current" : "text-[var(--cad-hairline)] fill-[var(--cad-hairline)]"}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>{row.bestFor}</td>
                  <td className="px-6 py-4 text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>{row.industry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
