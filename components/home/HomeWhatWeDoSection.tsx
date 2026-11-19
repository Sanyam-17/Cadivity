"use client";

import Link from "next/link";
import { Layout, Target, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

/**
 * "What We Do" section — cream bg, asymmetric header, flat color-blocked cards.
 */
export function HomeWhatWeDoSection() {
  const whatWeDoReveal = useScrollReveal();

  return (
    <section className="cad-bg-cream cad-section overflow-hidden">
      <div ref={whatWeDoReveal.ref} className="cad-container">
        {/* Asymmetric two-column header */}
        <div className={`grid md:grid-cols-2 gap-8 md:gap-16 mb-16 items-start transition-all duration-700 ${whatWeDoReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div>
            <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-4">WHAT WE DO</p>
            <h2 className="cad-text-h2 text-[var(--cad-ink)]">
              More building.{" "}
              <span className="cad-accent-teal font-bold">Less repetition.</span>
            </h2>
          </div>
          <div className="md:pt-8">
            <p className="cad-text-body">
              Cadivity helps engineers and organizations automate repetitive
              design workflows, develop custom CAD applications, and master
              engineering API programming.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Services Card — sand */}
          <div className={`cad-card cad-card-sand group p-8 lg:p-10 space-y-6 transition-all duration-700 ${whatWeDoReveal.visible ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: '200ms' }}>
            <div className="flex items-start justify-between">
              <p className="cad-eyebrow text-[var(--cad-cobalt)]">AUTOMATION</p>
              <ArrowUpRight className="h-5 w-5 text-[var(--cad-muted)] group-hover:text-[var(--cad-cobalt)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" strokeWidth={1.5} />
            </div>
            <div className="h-12 w-12 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Layout className="h-7 w-7 text-[var(--cad-cobalt)]" strokeWidth={1.5} />
            </div>
            <h3 className="cad-text-h3 text-[var(--cad-ink)]">
              Custom Automation Services
            </h3>
            <p className="cad-text-body">
              We build custom software solutions to automate your design
              workflows. From simple macros to complex enterprise plugins.
            </p>
            <ul className="space-y-2 pt-2">
              {[
                "Drawing & Model Automation",
                "Custom Plugin Development",
                "ERP Integration",
                "Batch Processing",
              ].map((item) => (
                <li key={item} className="flex items-center text-sm text-[var(--cad-ink)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--cad-cobalt)] mr-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/services" className="cad-btn cad-btn-dark w-full mt-4">
              Explore Services
              <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
            </Link>
          </div>

          {/* Training Card — ice */}
          <div className={`cad-card cad-card-ice group p-8 lg:p-10 space-y-6 transition-all duration-700 ${whatWeDoReveal.visible ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: '400ms' }}>
            <div className="flex items-start justify-between">
              <p className="cad-eyebrow text-[var(--cad-teal)]">TRAINING</p>
              <ArrowUpRight className="h-5 w-5 text-[var(--cad-muted)] group-hover:text-[var(--cad-teal)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" strokeWidth={1.5} />
            </div>
            <div className="h-12 w-12 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Target className="h-7 w-7 text-[var(--cad-teal)]" strokeWidth={1.5} />
            </div>
            <h3 className="cad-text-h3 text-[var(--cad-ink)]">
              Professional Training
            </h3>
            <p className="cad-text-body">
              Master the skills that the industry demands. Practical,
              project-based courses on CAD API programming.
            </p>
            <ul className="space-y-2 pt-2">
              {[
                "Creo ProToolkit & C++",
                "SolidWorks API (C# / VB.NET)",
                "NX Open Programming",
                "Corporate Training",
              ].map((item) => (
                <li key={item} className="flex items-center text-sm text-[var(--cad-ink)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--cad-teal)] mr-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/courses" className="cad-btn cad-btn-outline text-[var(--cad-ink)] border-[var(--cad-ink)] w-full mt-4 hover:bg-[var(--cad-ink)] hover:text-white">
              View Courses
              <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
