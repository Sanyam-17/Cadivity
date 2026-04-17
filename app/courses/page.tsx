"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  Code2,
  Star,
  Download,
} from "lucide-react";

import coursesHero from "@/public/generated_images/Background_img2.png";
import { courses } from "@/lib/courseData";

export default function Courses() {

  const comparisonData = [
    {
      name: "Creo ProToolkit",
      lang: "C++",
      difficulty: 4,
      industry: "Mechanical, Industrial",
      bestFor: "Product Design Automation",
      output: "Plugins, UI Tools",
    },
    {
      name: "SolidWorks API",
      lang: "C#, VB.NET",
      difficulty: 3,
      industry: "Mechanical, Sheet Metal",
      bestFor: "Feature & Drawing Automation",
      output: "Add-ins, Batch Tools",
    },
    {
      name: "NX Open",
      lang: "C++, C#, .NET",
      difficulty: 4,
      industry: "Automotive, Aerospace",
      bestFor: "Enterprise-level Automation",
      output: "Extensions, Modeling Automation",
    },
    {
      name: "AutoCAD API",
      lang: "AutoLISP, .NET",
      difficulty: 2,
      industry: "Architecture, Manufacturing",
      bestFor: "Drafting Automation",
      output: "Scripts, Plugins",
    },
    {
      name: "CATIA CAA",
      lang: "C++",
      difficulty: 5,
      industry: "Automotive, Aerospace",
      bestFor: "High-complexity Automation",
      output: "Enterprise Plugins",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
     <Navbar />

      {/* Hero */}
      <section className="relative bg-slate-900 text-white py-20">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${coursesHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl">
            <h5 className="text-accent font-semibold tracking-wide uppercase mb-4">
              Training Programs
            </h5>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Master CAD Automation
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
              Practical, industry-oriented training. Move beyond basic modeling
              and learn to build tools that automate the design process.
            </p>
          </div>
        </div>
      </section>

      {/* Program Highlights */}
   
     <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">
              Our Training Programs
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our training focuses on practical implementation, automation
              thinking, and real-world engineering tasks.

            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <Card
                key={i}
                className="flex flex-col overflow-hidden border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader className="bg-slate-50 border-b border-slate-100 ">
                  <div className="flex justify-between items-start mb-4">
                    {/* <span className="text-4xl">{course.icon}</span> */}
                    <span className="block ">
                    <Image
  src={course.image}
  alt={course.title}
  width={200}
  height={80}
  className="w-full h-20 object-contain"
/>
                    </span>

                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                      >
                      {course.level}
                    </Badge>
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm font-medium text-accent">
                    {course.subtitle}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 pt-6">
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {course.desc}
                  </p>

                  <div className="space-y-2 mb-6">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Includes:
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {course.cardIncludes.map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                </CardContent>

<CardFooter className="pt-0 pb-6">
                  <div className="w-full flex gap-3">
                    {/* PRIMARY BUTTON */}
                    {course.isCustom ? (
                      <Link href="/contact" className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          Contact Now
                        </Button>
                      </Link>
                    ) : course.isActive ? (
                      <Link href="/contact" className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          Enroll Now
                        </Button>
                      </Link>
                    ) : (
                      <Button
                      className="flex-1 bg-slate-300 text-slate-500 cursor-not-allowed"
                      disabled
                      >
                        Coming Soon...
                      </Button>
                    )}

                    {/* DOWNLOAD BUTTON — hidden for Custom card */}
                    {!course.isCustom &&
                      (course.isActive ? (
                        <a href={course.syllabus} download>
                          <Button
                            variant="outline"
                            size="icon"
                            title="Download Syllabus"
                            >
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        <Button
                        variant="outline"
                        size="icon"
                        title="Coming Soon"
                        disabled
                        className="opacity-40 cursor-not-allowed"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
            </div>
            </div>
            </section>
            
            {/* Comparison Matrix */}
              <section className="py-20 bg-slate-50">
              <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-12 text-center">
              Program Comparison
              </h2>
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
              <table className="w-full text-sm text-left">
              <thead className="bg-slate-900 text-white uppercase text-xs font-bold tracking-wider">
              <tr>
              <th className="px-6 py-4 rounded-tl-xl">
              Feature / Criteria
              </th>
              <th className="px-6 py-4">Programming Language</th>
              <th className="px-6 py-4">Difficulty</th>
              <th className="px-6 py-4">Best For</th>
              <th className="px-6 py-4 rounded-tr-xl">Industry</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {comparisonData.map((row, i) => (
                <tr
                key={i}
                className="hover:bg-slate-50/50 transition-colors"
                >
                <td className="px-6 py-4 font-bold text-primary">
                {row.name}
                </td>
                <td className="px-6 py-4 text-slate-600">
                <Code2 className="inline h-4 w-4 mr-1 text-slate-400" />
                {row.lang}
                </td>
                <td className="px-6 py-4">
                <div className="flex text-yellow-400">
                {[...Array(5)].map((_, starI) => (
                  <Star
                  key={starI}
                  className={`h-3 w-3 ${
                    starI < row.difficulty
                    ? "fill-current"
                    : "text-slate-200 fill-slate-200"
                  }`}
                  />
                ))}
                </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{row.bestFor}</td>
                <td className="px-6 py-4 text-slate-600">{row.industry}</td>
                </tr>
              ))}
              </tbody>
              </table>
              </div>
              </div>
              </section>
          
              
              
      <Footer />
    </div>
  );
}

