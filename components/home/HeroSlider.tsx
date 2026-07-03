"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import heroBg1 from "@/public/generated_images/Background_img1.webp";
import heroBg2 from "@/public/generated_images/Background_img2.webp";
import heroBg3 from "@/public/generated_images/Background_img3.webp";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSlider() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000 })]
  );

  const slides = [
    {
      image: heroBg1,
      headline: "🚀 Automate Your Engineering — Work 5x Faster",
      subline:
      "Transform repetitive CAD tasks into intelligent, reusable automation workflows.",
      alt: "CAD automation workflow showing engineering design optimization",
    },
    {
      image: heroBg2,
      headline: "⚙️ Manual Modeling Is History — Automation Is the Future",
      subline:
      "Design smarter, scale faster, and stay competitive with automation-driven CAD development.",
      alt: "Automated CAD modeling and engineering design process",
    },
    {
      image: heroBg3,
      headline: "🎯 Engineering Efficiency Starts Here",
      subline:
      "Save time, reduce rework, and unlock the full potential of CAD customization.",
      alt: "Engineering efficiency through CAD customization and automation",
    },
  ];

  return (
    <section
      ref={emblaRef}
      className="relative overflow-hidden bg-slate-900 text-white"
    >
      <div className="flex">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative flex-[0_0_100%] min-w-0"
            style={{ aspectRatio: "16 / 9", minHeight: "28rem" }}
          >
            {/* Background Image — uses next/image for AVIF/WebP optimization */}
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              className="object-cover opacity-40 transition-transform duration-[2000ms] hover:scale-105"
              placeholder="blur"
            />

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-transparent to-slate-900/40 z-5" />

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-5" aria-hidden="true">
              <div className="absolute top-20 right-[10%] w-16 h-16 rounded-2xl bg-white/5 border border-white/10 animate-float" style={{ animationDuration: "10s" }} />
              <div className="absolute bottom-24 left-[8%] w-12 h-12 rounded-full bg-white/5 border border-white/10 animate-float delay-500" style={{ animationDuration: "12s" }} />
              <div className="absolute top-1/3 right-[30%] w-8 h-8 rounded-lg bg-white/5 border border-white/10 animate-float delay-300" style={{ animationDuration: "8s" }} />
            </div>

            {/* Content */}
            <div className="container relative z-20 mx-auto px-4 h-full flex flex-col justify-center">
              <div className="max-w-4xl space-y-6 animate-fade-in-up">
                <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl text-white leading-tight">
                  {slide.headline}
                </h1>
                <p className="text-xl text-slate-200 max-w-2xl leading-relaxed">
                  {slide.subline}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {/* External Link */}
                  <a
                    href="https://forms.gle/7zrASYUa3JxVQxLK8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button 
                      size="lg"
                      className="h-14 px-8 text-lg bg-accent text-white hover:bg-accent/90 border-0 shadow-lg shadow-accent/20 cursor-pointer rounded-full group transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02]"
                    >
                      Get Free Consultation
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </a>

                  {/* Internal Link */}
                  <Link href="/courses">
                    <Button
                      size="lg"
                      variant="outline" 
                      className="h-14 px-8 text-lg bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white cursor-pointer rounded-full backdrop-blur-sm transition-all duration-300 hover:border-white/50"
                    >
                      View Our Training Programs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}