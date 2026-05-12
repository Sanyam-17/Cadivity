"use client";

import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Factory, Target, ArrowRight } from "lucide-react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

/**
 * Shared home page body content.
 * Rendered on both the "/" route and the "/login" route (as background).
 */
export function HomePageContent() {
  const taglineReveal = useScrollReveal();
  const whatWeDoReveal = useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeroSlider />

      {/* Tagline Section */}
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

      {/* What We Do Split */}
      <section className="py-24 bg-white overflow-hidden">
        <div ref={whatWeDoReveal.ref} className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-700 ${whatWeDoReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">
              What We Do
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Cadivity helps engineers and organizations automate repetitive
              design workflows, develop custom CAD applications, and master
              engineering API programming.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
            {/* Services */}
            <div className={`space-y-6 p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group ${whatWeDoReveal.visible ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Factory className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900">
                Custom Automation Services
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                We build custom software solutions to automate your design
                workflows. From simple macros to complex enterprise plugins.
              </p>
              <ul className="space-y-3">
                {[
                  "Drawing & Model Automation",
                  "Custom Plugin Development",
                  "ERP Integration",
                  "Batch Processing",
                ].map((item) => (
                  <li key={item} className="flex items-center text-slate-700 group/item">
                    <CheckCircle2 className="h-5 w-5 text-accent mr-3 transition-transform duration-300 group-hover/item:scale-110" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/services">
                <Button className="w-full mt-4 bg-primary text-white hover:bg-primary/90 group/btn transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  Explore Services
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                </Button>
              </Link>
            </div>

            {/* Training */}
            <div className={`space-y-6 p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group ${whatWeDoReveal.visible ? "animate-fade-in-up delay-400" : "opacity-0"}`}>
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900">
                Professional Training
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Master the skills that the industry demands. Practical,
                project-based courses on CAD API programming.
              </p>
              <ul className="space-y-3">
                {[
                  "Creo ProToolkit & C++",
                  "SolidWorks API (C# / VB.NET)",
                  "NX Open Programming",
                  "Corporate Training",
                ].map((item) => (
                  <li key={item} className="flex items-center text-slate-700 group/item">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 transition-transform duration-300 group-hover/item:scale-110" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/courses">
                <Button
                  variant="outline"
                  className="w-full mt-4 border-primary text-primary hover:bg-primary/5 group/btn transition-all duration-300"
                >
                  View Courses
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
