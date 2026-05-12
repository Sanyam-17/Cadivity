// AboutPage
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Target,
  Wrench,
  Lightbulb,
  TrendingUp,
  LifeBuoy,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function AboutPage() {
  const headerReveal = useScrollReveal();
  const missionReveal = useScrollReveal();
  const principlesReveal = useScrollReveal();

  const features = [
    { title: "Precision", icon: Target },
    { title: "Practicality", icon: Wrench },
    { title: "Innovation", icon: Lightbulb },
    { title: "Scalability", icon: TrendingUp },
    { title: "Support", icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
     <Navbar/>

      <main className="grow">
        {/* Header */}
        <section className="bg-slate-50 py-24 border-b border-slate-100 overflow-hidden">
          <div
            ref={headerReveal.ref}
            className={`container mx-auto px-4 text-center max-w-4xl transition-all duration-700 ${headerReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-8">
              We Enable Industry to Transform <br />
              <span className="text-primary">
                Manual Design into Intelligent Automation
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CADIVITY is an engineering solutions provider specializing in CAD
              automation, workflow optimization, custom plugin development, and
              professional training.
            </p>
          </div>
        </section>

        {/* Mission / Vision */}
        <section className="py-24 bg-white overflow-hidden">
          <div ref={missionReveal.ref} className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Mission */}
              <div className={`bg-blue-50/50 p-10 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group ${missionReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6 text-primary" />
                </div>

                <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
                  Our Mission
                </h2>

                <p className="text-slate-700 leading-relaxed text-lg">
                  Enable industry and individuals to transform manual
                  engineering design into intelligent, automated workflows.
                </p>
              </div>

              {/* Vision */}
              <div className={`bg-green-50/50 p-10 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group ${missionReveal.visible ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
                <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="h-6 w-6 text-green-600" />
                </div>

                <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
                  Our Vision
                </h2>

                <p className="text-slate-700 leading-relaxed text-lg">
                  Become a global leader in CAD automation skill development and
                  customized engineering software solutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden">
          <div ref={principlesReveal.ref} className="container mx-auto px-4 text-center">
            <h2 className={`font-display text-3xl font-bold mb-16 transition-all duration-700 ${principlesReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
              Core Principles
            </h2>

            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`flex flex-col items-center gap-4 group transition-all duration-700 ${principlesReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                    style={{ animationDelay: `${i * 120 + 200}ms` }}
                  >
                    <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>

                    <span className="font-display text-xl font-bold">
                      {feature.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
