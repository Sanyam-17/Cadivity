"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { PublicCourseCard, type PublicCourse } from "@/components/layout/public-course-card";
import { BookOpen, Code2, Star } from "lucide-react";

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
          <h5 className="text-accent font-semibold tracking-wide uppercase mb-4">
            Training Programs
          </h5>
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

/* ─── Animated course cards grid ─── */
export function CoursesGridClient({ courses }: { courses: PublicCourse[] }) {
  const programsReveal = useScrollReveal();

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div ref={programsReveal.ref} className="container mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-700 ${programsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">
            Our Training Programs
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our training focuses on practical implementation, automation
            thinking, and real-world engineering tasks.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-6">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">
              No courses available yet
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We&apos;re working on bringing new training programs. Check back soon
              or contact us for custom training solutions.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <div
                key={course.id}
                className={`transition-all duration-500 ${programsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 100 + 100}ms` }}
              >
                <PublicCourseCard course={course} index={0} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
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
                <th className="px-6 py-4 rounded-tl-xl">
                  Feature / Criteria
                </th>
                <th className="px-6 py-4">Programming Language</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Best For</th>
                <th className="px-6 py-4 rounded-tr-xl">Industry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonData.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 font-bold text-primary">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <Code2 className="inline h-4 w-4 mr-1 text-slate-400" />
                    {row.lang}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, starI) => (
                        <Star
                          key={starI}
                          className={`h-3 w-3 ${
                            starI < row.difficulty
                              ? "fill-current"
                              : "text-slate-200 fill-slate-200"
                          }`}
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
