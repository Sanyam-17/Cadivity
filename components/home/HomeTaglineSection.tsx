"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

/**
 * Tagline section — cobalt background with two-tone headline and mono tech pills.
 */
export function HomeTaglineSection() {
  const taglineReveal = useScrollReveal();

  return (
    <section className="cad-bg-cobalt cad-section">
      <div
        ref={taglineReveal.ref}
        className={`cad-container text-center transition-all duration-700 ${taglineReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
      >
        {/* Two-tone headline: "Training." in amber */}
        <h2 className="cad-text-h2-bold text-white mb-6">
          Automation.{" "}
          <span className="cad-accent-amber">Training.</span>{" "}
          Innovation.
        </h2>
        <p className="cad-text-body mx-auto text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Empowering engineering teams and individuals to work smarter — not
          harder.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
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
              className={`cad-tag text-white/70 border-white/20 cursor-default ${taglineReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
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
