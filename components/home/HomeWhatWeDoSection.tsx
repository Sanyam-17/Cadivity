"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Factory, Target, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

/**
 * "What We Do" section with scroll-reveal animations and hover effects.
 */
export function HomeWhatWeDoSection() {
  const whatWeDoReveal = useScrollReveal();

  return (
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
  );
}
