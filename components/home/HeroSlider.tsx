"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import heroBg1 from "@/public/generated_images/Background_img1.png";
import heroBg2 from "@/public/generated_images/Background_img2.png";
import heroBg3 from "@/public/generated_images/Background_img3.png";
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
    },
    {
      image: heroBg2,
      headline: "⚙️ Manual Modeling Is History — Automation Is the Future",
      subline:
      "Design smarter, scale faster, and stay competitive with automation-driven CAD development.",
    },
    {
      image: heroBg3,
      headline: "🎯 Engineering Efficiency Starts Here",
      subline:
      "Save time, reduce rework, and unlock the full potential of CAD customization.",
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
            className="relative flex-[0_0_100%] min-w-0 h-144 md:h-176"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 z-0 opacity-40"
                style={{
                  backgroundImage: `url(${slide.image.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                />

              {/* Gradient Overlay */}
              {/* <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/80 to-transparent z-10" /> */}

              {/* Content */}
              <div className="container relative z-20 mx-auto px-4 h-full flex flex-col justify-center">
                <div className="max-w-4xl space-y-6 animate-in slide-in-from-left-10 duration-700 fade-in">
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
                        className="h-14 px-8 text-lg bg-accent text-white hover:bg-accent/90 border-0 shadow-lg shadow-accent/20 cursor-pointer rounded-full"
                        >
                        Get Free Consultation
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </a>

                    {/* Internal Link */}
                    <Link href="/courses">
                      <Button
                        size="lg"
                        variant="outline" 
                        className="h-14 px-8 text-lg bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white cursor-pointer rounded-full backdrop-blur-sm"
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