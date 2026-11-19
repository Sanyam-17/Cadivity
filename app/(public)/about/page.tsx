"use client";

import Image from "next/image";
import { Eye, Target, Compass, Shield, Users, Lightbulb, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import Link from "next/link";

export default function AboutPage() {
  const heroReveal = useScrollReveal();
  const missionReveal = useScrollReveal();
  const principlesReveal = useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col">

      {/* ─── Hero ─── */}
      <section className="relative cad-bg-navy cad-section pt-32 pb-16 md:pb-20 overflow-hidden">
        <div ref={heroReveal.ref} className={`cad-container relative z-10 transition-all duration-700 ${heroReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="max-w-3xl">
            <p className="cad-eyebrow text-[var(--cad-sky)] mb-3">WHO WE ARE</p>
            <h1 className="cad-text-display text-white mb-6">
              Built for{" "}
              <span className="cad-accent-sky">Engineers.</span>
            </h1>
            <p className="cad-text-body max-w-2xl text-white/70">
              Cadivity is a technology-driven company specializing in CAD
              automation and engineering education. We combine deep domain
              expertise with clean engineering to help organizations optimize
              their design processes.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Mission / Vision ─── */}
      <section className="cad-bg-sand cad-section overflow-hidden">
        <div ref={missionReveal.ref} className="cad-container">
          <div className={`mb-16 transition-all duration-700 ${missionReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
            <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-4">OUR PURPOSE</p>
            <h2 className="cad-text-h2 text-[var(--cad-ink)]">
              Mission &{" "}
              <span className="cad-accent-cobalt font-bold">Vision.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission */}
            <div className={`cad-card cad-card-ice p-8 lg:p-10 space-y-5 transition-all duration-700 ${missionReveal.visible ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: '200ms' }}>
              <div className="flex items-start justify-between">
                <p className="cad-eyebrow text-[var(--cad-teal)]">MISSION</p>
                <Target className="h-5 w-5 text-[var(--cad-teal)]" strokeWidth={1.5} />
              </div>
              <h3 className="cad-text-h3 text-[var(--cad-ink)]">
                What Drives Us
              </h3>
              <p className="text-sm leading-relaxed text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                To make engineering workflows faster, smarter, and more
                reliable through intelligent CAD automation and practical,
                high-impact training programs.
              </p>
            </div>

            {/* Vision */}
            <div className={`cad-card cad-card-cobalt p-8 lg:p-10 space-y-5 transition-all duration-700 ${missionReveal.visible ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: '400ms' }}>
              <div className="flex items-start justify-between">
                <p className="cad-eyebrow text-[var(--cad-sky)]">VISION</p>
                <Eye className="h-5 w-5 text-[var(--cad-sky)]" strokeWidth={1.5} />
              </div>
              <h3 className="cad-text-h3 text-white">
                Where We&apos;re Going
              </h3>
              <p className="text-sm leading-relaxed text-white/60" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                To become the global standard for CAD automation excellence and
                engineering education — where every design process is optimized,
                and every engineer has access to world-class training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Principles ─── */}
      <section className="cad-bg-cream cad-section overflow-hidden">
        <div ref={principlesReveal.ref} className="cad-container">
          <div className={`mb-16 transition-all duration-700 ${principlesReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
            <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-4">HOW WE WORK</p>
            <h2 className="cad-text-h2 text-[var(--cad-ink)]">
              Core <span className="cad-accent-amber font-bold">Principles.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Compass, title: "Precision First", desc: "Every solution is measured, tested, and optimized. No shortcuts." },
              { icon: Shield, title: "Reliability", desc: "Build automation that works every time. Enterprise-grade, production-ready." },
              { icon: Users, title: "Community", desc: "Knowledge shared is knowledge multiplied. We grow together." },
              { icon: Lightbulb, title: "Innovation", desc: "Push boundaries. Find better ways. Never stop improving." },
            ].map((principle, i) => {
              const Icon = principle.icon;
              return (
                <div
                  key={i}
                  className={`cad-card cad-card-sand p-6 space-y-4 transition-all duration-500 ${principlesReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100 + 200}ms` }}
                >
                  <Icon className="h-6 w-6 text-[var(--cad-cobalt)]" strokeWidth={1.5} />
                  <h3 className="cad-text-h3 text-[var(--cad-ink)]" style={{ fontSize: '1.125rem' }}>
                    {principle.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                    {principle.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cad-bg-cobalt cad-section-sm overflow-hidden">
        <div className="cad-container text-center space-y-6">
          <h2 className="cad-text-h2-bold text-white">
            Ready to <span className="cad-accent-amber">collaborate?</span>
          </h2>
          <p className="cad-text-body mx-auto text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Whether you need automation services or training, let&apos;s talk.
          </p>
          <Link href="/contact" className="cad-btn cad-btn-primary">
            Get in Touch
            <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
          </Link>
        </div>
      </section>

    </div>
  );
}
