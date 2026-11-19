"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Layout,
  Code,
  FileSpreadsheet,
  CheckCircle2,
  Database,
  MonitorPlay,
  ArrowUpRight,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";


export default function ServicesPage() {
  const heroReveal = useScrollReveal();
  const capabilitiesReveal = useScrollReveal();
  const platformsReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  const capabilities = [
    {
      icon: Layout,
      title: "Drawing & Model Automation",
      desc: "Automatically generate 2D drawings and 3D models based on input parameters, saving hours of manual drafting time.",
      bg: "cad-card-sand",
    },
    {
      icon: Code,
      title: "Plugin / Add-on Development",
      desc: "Custom toolbars, ribbons, and commands integrated directly into your CAD environment for seamless workflow.",
      bg: "cad-card-cobalt",
    },
    {
      icon: FileSpreadsheet,
      title: "ERP & Excel Integration",
      desc: "Connect your CAD data with BOMs, Excel spreadsheets, and ERP systems to ensure data consistency across the organization.",
      bg: "cad-card-ice",
    },
    {
      icon: CheckCircle2,
      title: "Model Checking & Validation",
      desc: "Automated quality assurance tools that verify geometry, standards compliance, and feature validity before release.",
      bg: "cad-card-sand",
    },
    {
      icon: Database,
      title: "Batch Processing",
      desc: "Process thousands of files overnight. Bulk export, format conversion, and mass property updates without manual intervention.",
      bg: "cad-card-ice",
    },
    {
      icon: MonitorPlay,
      title: "UI Extensions",
      desc: "Create intuitive user interfaces (dialogs, forms, property pages) to make your automation tools user-friendly for your team.",
      bg: "cad-card-sand",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero */}
      <section className="relative cad-bg-navy cad-section pt-32 pb-16 md:pb-20 overflow-hidden">
        <div ref={heroReveal.ref} className={`cad-container relative z-10 transition-all duration-700 ${heroReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="max-w-3xl">
            <p className="cad-eyebrow text-[var(--cad-sky)] mb-3">OUR EXPERTISE</p>
            <h1 className="cad-text-display text-white mb-6">
              Engineering{" "}
              <span className="cad-accent-sky">Solutions Provider.</span>
            </h1>
            <p className="cad-text-body max-w-2xl text-white/70">
              We deliver automation and engineering development across multiple
              CAD platforms. From drawing automation to full enterprise
              integration.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities — 3-col grid */}
      <section className="cad-bg-cream cad-section overflow-hidden">
        <div ref={capabilitiesReveal.ref} className="cad-container">
          <div className="mb-16">
            <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-4">CAPABILITIES</p>
            <h2 className="cad-text-h2 text-[var(--cad-ink)]">
              What we <span className="cad-accent-teal font-bold">deliver.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((feature, i) => {
              const Icon = feature.icon;
              const isCobalt = feature.bg === "cad-card-cobalt";
              return (
                <div
                  key={i}
                  className={`cad-card ${feature.bg} p-8 space-y-5 transition-all duration-500 ${capabilitiesReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100 + 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <Icon
                      className={`h-6 w-6 ${isCobalt ? "text-white/70" : "text-[var(--cad-cobalt)]"}`}
                      strokeWidth={1.5}
                    />
                    <ArrowUpRight
                      className={`h-4 w-4 ${isCobalt ? "text-white/30" : "text-[var(--cad-muted)]"}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className={`cad-text-h3 ${isCobalt ? "text-white" : "text-[var(--cad-ink)]"}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isCobalt ? "text-white/60" : "text-[var(--cad-muted)]"}`}
                    style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
                  >
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="cad-bg-sand cad-section-sm overflow-hidden">
        <div ref={platformsReveal.ref} className="cad-container">
          <div className="mb-12">
            <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-4">PLATFORMS</p>
            <h2 className="cad-text-h2 text-[var(--cad-ink)]">
              Supported <span className="cad-accent-cobalt font-bold">platforms.</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {["Creo", "SolidWorks", "Siemens NX", "CATIA CAA", "AutoCAD"].map(
              (platform, i) => (
                <span
                  key={platform}
                  className={`cad-tag text-[var(--cad-ink)] border-[var(--cad-hairline)] cursor-default ${platformsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100 + 100}ms`, padding: '8px 20px', fontSize: '12px' }}
                >
                  {platform}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cad-bg-cobalt cad-section overflow-hidden">
        <div ref={ctaReveal.ref} className={`cad-container transition-all duration-700 ${ctaReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            <div>
              <p className="cad-eyebrow text-[var(--cad-sky)] mb-4">LET&apos;S BUILD BETTER</p>
              <h2 className="cad-text-h2-bold text-white">
                Ready to optimize your{" "}
                <span className="cad-accent-amber">workflow?</span>
              </h2>
            </div>
            <div className="md:pt-8 space-y-6">
              <p className="cad-text-body" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Let&apos;s discuss how we can automate your engineering processes.
              </p>
              <Link href="/contact" className="cad-btn cad-btn-primary">
                Get Free Consultation
                <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
