"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
} from "lucide-react";

import servicesHero from "@/public/generated_images/Background_img1.png";

export default function ServicesPage() {
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
      <Navbar />

      {/* Hero */}
      <section className="relative bg-slate-900 text-white py-24">
        <Image
          src={servicesHero}
          alt="Services"
          fill
          priority
          className="object-cover opacity-15"
        />
        <div className="container relative z-10 mx-auto px-4">
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-16 text-slate-900">
            Our Capabilities
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((feature, i) => (
              <Card
                key={i}
                className="border-slate-100 shadow-sm hover:shadow-lg transition-shadow group"
              >
                <CardContent className="pt-8">
                  <div className="mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3 text-slate-900">
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
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-12 text-slate-900">
            Supported Platforms
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {["Creo", "SolidWorks", "Siemens NX", "CATIA CAA", "AutoCAD"].map(
              (platform) => (
                <div
                  key={platform}
                  className="bg-white px-8 py-4 rounded-xl shadow-sm border border-slate-100 font-display font-bold text-xl text-slate-700"
                >
                  {platform}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl font-bold mb-6">
            Ready to optimize your workflow?
          </h2>
          <p className="text-slate-200 mb-8 text-lg">
            Let's discuss how we can automate your engineering processes.
          </p>

          <Link href="/contact">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white font-semibold h-12 px-8 rounded-full"
            >
              Get Free Consultation
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
