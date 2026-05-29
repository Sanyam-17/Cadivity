"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Code,
  Database,
  FileSpreadsheet,
  Layout,
  MonitorPlay,
  ArrowRight,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

import servicesHero from "@/public/generated_images/Background_img1.png";

export default function ServicesPage() {
  const heroReveal = useScrollReveal();
  const capabilitiesReveal = useScrollReveal();
  const platformsReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  const capabilities = [
    {
      icon: <Layout className="h-8 w-8 text-primary" />,
      title: "Drawing & Model Automation",
      desc: "Automatically generate 2D drawings and 3D models based on input parameters, saving hours of manual drafting time.",
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Plugin / Add-on Development",
      desc: "Custom toolbars, ribbons, and commands integrated directly into your CAD environment for seamless workflow.",
    },
    {
      icon: <FileSpreadsheet className="h-8 w-8 text-primary" />,
      title: "ERP & Excel Integration",
      desc: "Connect your CAD data with BOMs, Excel spreadsheets, and ERP systems to ensure data consistency across the organization.",
    },
    {
      icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
      title: "Model Checking & Validation",
      desc: "Automated quality assurance tools that verify geometry, standards compliance, and feature validity before release.",
    },
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "Batch Processing",
      desc: "Process thousands of files overnight. Bulk export, format conversion, and mass property updates without manual intervention.",
    },
    {
      icon: <MonitorPlay className="h-8 w-8 text-primary" />,
      title: "UI Extensions",
      desc: "Create intuitive user interfaces (dialogs, forms, property pages) to make your automation tools user-friendly for your team.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Hero */}
      <section className="relative bg-slate-900 text-white py-24 overflow-hidden">
        <Image
          src={servicesHero}
          alt="Services"
          fill
          priority
          className="object-cover opacity-15 transition-transform duration-2000 hover:scale-105"
        />
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-16 right-[12%] w-14 h-14 rounded-2xl bg-white/5 border border-white/10 animate-float" style={{ animationDuration: "10s" }} />
          <div className="absolute bottom-20 left-[15%] w-10 h-10 rounded-full bg-white/5 border border-white/10 animate-float delay-500" style={{ animationDuration: "12s" }} />
        </div>

        <div ref={heroReveal.ref} className={`container relative z-10 mx-auto px-4 transition-all duration-700 ${heroReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="max-w-3xl">
            <h5 className="text-accent font-semibold tracking-wide uppercase mb-4">
              Our Expertise
            </h5>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Engineering Solutions Provider
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
              We deliver automation and engineering development across multiple
              CAD platforms. From drawing automation to full enterprise
              integration.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24 bg-white overflow-hidden">
        <div ref={capabilitiesReveal.ref} className="container mx-auto px-4">
          <h2 className={`font-display text-3xl font-bold text-center mb-16 text-slate-900 transition-all duration-700 ${capabilitiesReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
            Our Capabilities
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((feature, i) => (
              <Card
                key={i}
                className={`border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group hover:-translate-y-1 ${capabilitiesReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 100 + 100}ms` }}
              >
                <CardContent className="pt-8">
                  <div className="mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3 text-slate-900 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div ref={platformsReveal.ref} className="container mx-auto px-4 text-center">
          <h2 className={`font-display text-3xl font-bold mb-12 text-slate-900 transition-all duration-700 ${platformsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
            Supported Platforms
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {["Creo", "SolidWorks", "Siemens NX", "CATIA CAA", "AutoCAD"].map(
              (platform, i) => (
                <div
                  key={platform}
                  className={`bg-white px-8 py-4 rounded-xl shadow-sm border border-slate-100 font-display font-bold text-xl text-slate-700 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 cursor-default ${platformsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100 + 100}ms` }}
                >
                  {platform}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-white overflow-hidden">
        <div ref={ctaReveal.ref} className={`container mx-auto px-4 text-center max-w-2xl transition-all duration-700 ${ctaReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="font-display text-3xl font-bold mb-6">
            Ready to optimize your workflow?
          </h2>
          <p className="text-slate-200 mb-8 text-lg">
            Let's discuss how we can automate your engineering processes.
          </p>

          <Link href="/contact">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white font-semibold h-12 px-8 rounded-full group transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02]"
            >
              Get Free Consultation
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>


    </div>
  );
}
