"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

/**
 * Tagline section with scroll-reveal animations and tech tags.
 */
export function HomeTaglineSection() {
  const taglineReveal = useScrollReveal();

  return (
    <section className="py-16 bg-primary text-white overflow-hidden">
      <div
        ref={taglineReveal.ref}
        className={`container mx-auto px-4 text-center transition-all duration-700 ${taglineReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
          Automation. Training. Innovation.
        </h2>
        <p className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
          Empowering engineering teams and individuals to work smarter — not
          harder.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            "Creo ProToolkit",
            "NX Open",
            "SolidWorks API",
            "CATIA CAA",
            "AutoCAD Automation",
            "C++",
            "Python",
            "VB.NET",
          ].map((tag, i) => (
            <span
              key={tag}
              className={`px-4 py-2 bg-white/10 rounded-full text-sm font-medium border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-default ${taglineReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 80 + 200}ms` }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
