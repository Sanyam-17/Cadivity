"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import heroBg1 from "@/public/generated_images/Background_img1.webp";
import heroBg2 from "@/public/generated_images/Background_img2.webp";
import heroBg3 from "@/public/generated_images/Background_img3.webp";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function HeroSlider() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5500 })]
  );

  const slides = [
    {
      image: heroBg1,
      headline: "Make engineering",
      accentLine: "move faster.",
      subline:
        "We turn repetitive CAD work into intelligent, reusable automation — and help the teams behind it build what comes next.",
      alt: "CAD automation engineering workspace and design process",
    },
    {
      image: heroBg2,
      headline: "Automate design,",
      accentLine: "scale delivery.",
      subline:
        "Transform manual modeling into automated, reusable workflows built to accelerate complex engineering pipelines.",
      alt: "Automated CAD modeling and engineering design process",
    },
    {
      image: heroBg3,
      headline: "Engineering tools,",
      accentLine: "built for speed.",
      subline:
        "Eliminate repetitive tasks and empower your technical teams with precision CAD automation systems.",
      alt: "Engineering efficiency through CAD customization and automation",
    },
  ];

  return (
    <section
      ref={emblaRef}
      className="relative overflow-hidden cad-bg-navy min-h-[620px] lg:min-h-[720px] lg:h-[90vh]"
    >
      <div className="flex h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative flex-[0_0_100%] min-w-0 h-full flex items-center"
          >
            {/* Background Image with half-page opacity fade */}
            <div className="absolute inset-0 z-0">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 100vw"
                className="object-cover object-right md:object-center opacity-70"
                placeholder="blur"
              />

              {/* Half-page gradient: solid dark navy on the left 40%, smoothly fading to reveal image on the right */}
              <div
                className="absolute inset-0 z-[1] hidden md:block"
                style={{
                  background:
                    "linear-gradient(90deg, #070B14 0%, #070B14 38%, rgba(7, 11, 20, 0.88) 55%, rgba(7, 11, 20, 0.25) 100%)",
                }}
              />

              {/* Mobile overlay for full legibility */}
              <div
                className="absolute inset-0 z-[1] md:hidden"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(7, 11, 20, 0.92) 0%, rgba(7, 11, 20, 0.96) 100%)",
                }}
              />

              {/* Top dark gradient ensuring area behind nav links is deep dark */}
              <div
                className="absolute top-0 left-0 right-0 h-36 z-[2] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(7, 11, 20, 0.98) 0%, rgba(7, 11, 20, 0.82) 65%, transparent 100%)",
                }}
              />
            </div>

            {/* Blueprint decorative HUD elements on the right half */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none z-[2]"
              aria-hidden="true"
            >
              <div className="absolute right-[6%] lg:right-[12%] top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-[360px] h-[360px] lg:w-[420px] lg:h-[420px]">
                {/* Outer concentric circle */}
                <div className="absolute inset-0 rounded-full border border-[var(--cad-sky)]/25" />

                {/* Middle concentric circle */}
                <div className="absolute inset-[15%] rounded-full border border-[var(--cad-sky)]/35" />

                {/* Inner dashed circle */}
                <div className="absolute inset-[28%] rounded-full border border-dashed border-[var(--cad-sky)]/40 animate-[spin_60s_linear_infinite]" />

                {/* Rotated diamond / square wireframe */}
                <div className="absolute inset-[20%] border border-[var(--cad-sky)]/20 rotate-45" />

                {/* Central CAD sphere */}
                <div
                  className="relative z-10 w-24 h-24 lg:w-28 lg:h-28 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(74,184,234,0.4)] border border-white/20"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 35%, #4AB8EA 0%, #1E4E8C 45%, #0B1E3F 80%, #070B14 100%)",
                  }}
                >
                  <span className="text-white text-xs lg:text-sm font-bold font-mono tracking-widest drop-shadow">
                    CAD
                  </span>
                  <span className="text-[var(--cad-amber)] text-[10px] font-mono font-semibold mt-0.5">
                    01
                  </span>
                </div>

                {/* HUD captions */}
                <span className="cad-text-mono text-[10px] tracking-widest uppercase text-[var(--cad-sky)]/70 absolute right-[-20px] lg:right-[-40px] top-1/2 -translate-y-1/2">
                  01 / SYSTEMS
                </span>

                <span className="cad-text-mono text-[9px] tracking-widest uppercase text-white/40 absolute bottom-[8%] left-1/2 -translate-x-1/2 whitespace-nowrap">
                  PRECISION ENGINEERED
                </span>
              </div>
            </div>

            {/* Content — Left side, clean & structured */}
            <div className="cad-container relative z-10 w-full pt-24 pb-20 md:pt-28 md:pb-24">
              <div className="max-w-2xl space-y-5">
                {/* Eyebrow with amber line */}
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-[2px] bg-[var(--cad-amber)] shrink-0 inline-block" />
                  <p className="cad-eyebrow text-[var(--cad-sky)] tracking-wider">
                    CAD AUTOMATION / ENGINEERING TRAINING
                  </p>
                </div>

                {/* Two-tone headline — fixed height box to keep all 3 slides same size */}
                <div className="min-h-[5.5rem] sm:min-h-[6.5rem] lg:min-h-[7.5rem] flex items-center">
                  <h1 className="cad-text-display text-white">
                    <span className="block whitespace-normal sm:whitespace-nowrap">
                      {slide.headline}
                    </span>
                    <span className="cad-accent-sky block whitespace-normal sm:whitespace-nowrap">
                      {slide.accentLine}
                    </span>
                  </h1>
                </div>

                {/* Subline — fixed height box to keep all 3 slides same size */}
                <div className="min-h-[3.5rem] sm:min-h-[4rem] flex items-start">
                  <p className="cad-text-body text-white/70 max-w-xl leading-relaxed">
                    {slide.subline}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  {/* Primary CTA (Amber) — explicitly colored and highly visible */}
                  <Link
                    href="/courses"
                    className="cad-btn cad-btn-amber bg-[var(--cad-amber)] text-[var(--cad-navy-950)] border-[var(--cad-amber)] hover:bg-[#e0952e] hover:border-[#e0952e] justify-center text-xs tracking-wider font-bold shadow-sm"
                  >
                    VIEW TRAINING PROGRAMS
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>

                  {/* Secondary CTA (Outline) — turns white with dark text on hover */}
                  <a
                    href="https://forms.gle/7zrASYUa3JxVQxLK8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cad-btn cad-btn-outline text-white border-white/60 hover:bg-white hover:text-[#070B14] hover:border-white transition-all duration-200 justify-center text-xs tracking-wider"
                  >
                    GET CONSULTATION
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Bottom note bullet */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--cad-sky)] shrink-0 inline-block shadow-[0_0_8px_var(--cad-sky)]" />
                  <p className="cad-text-mono text-xs text-white/40">
                    Built for teams who refuse to work the slow way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}