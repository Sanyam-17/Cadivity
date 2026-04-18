import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Factory, Target } from "lucide-react";
import { HeroSlider } from "@/components/home/HeroSlider";

/**
 * Shared home page body content.
 * Rendered on both the "/" route and the "/login" route (as background).
 */
export function HomePageContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeroSlider />

      {/* Tagline Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
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
            ].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium border border-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do Split */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
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
            <div className="space-y-6 p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
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
                  <li key={item} className="flex items-center text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-accent mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/services">
                <Button className="w-full mt-4 bg-primary text-white hover:bg-primary/90">
                  Explore Services
                </Button>
              </Link>
            </div>

            {/* Training */}
            <div className="space-y-6 p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
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
                  <li key={item} className="flex items-center text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/courses">
                <Button
                  variant="outline"
                  className="w-full mt-4 border-primary text-primary hover:bg-primary/5"
                >
                  View Courses
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
