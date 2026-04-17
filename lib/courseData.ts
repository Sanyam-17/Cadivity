import { StaticImageData } from "next/image";

import Creo from "@/public/courses-logos/Creo.png";
import SolidWorks from "@/public/courses-logos/solidworks.png";
import Siemens from "@/public/courses-logos/siemens-nx.png";
import AutoCad from "@/public/courses-logos/AutoCad.png";
import Catia from "@/public/courses-logos/Catia.png";
import Custom from "@/public/courses-logos/Custom.png";

export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  desc: string;
  longDescription: string;
  level: string;
  price: string;
  duration: string;
  instructor: string;
  image: StaticImageData;
  isActive: boolean;
  syllabus?: string;
  isCustom?: boolean;
  customIncludes?: string[];
  cardIncludes: string[];
  highlights: string[];
}

export const courses: Course[] = [
  {
    slug: "creo-protoolkit-development",
    title: "Creo ProToolkit Development",
    subtitle: "C++",
    desc: "Unlock the full potential of PTC Creo by developing automation tools, plugins, and custom interfaces using ProToolkit and C++. Build solutions for modeling, drawings, assemblies, and workflow optimization.",
    longDescription:
      "This comprehensive program teaches you to harness the power of PTC Creo's ProToolkit API using C++. You'll start from the fundamentals of the ProToolkit architecture — understanding sessions, models, features, and UI customization — and progress to building production-grade automation tools.\n\nThe course covers creating custom menu commands, automating feature creation and modification, generating drawings programmatically, performing assembly-level operations, and integrating with external databases and PLM systems. By the end, you'll be able to develop robust Creo plugins that save engineering teams hundreds of hours of repetitive work.",
    level: "Advanced",
    price: "Flagship",
    duration: "12 Weeks",
    instructor: "Amit Gupta",
    image: Creo,
    isActive: true,
    syllabus: "/syllabus/catia.pdf",
    cardIncludes: [
      "ProToolkit Architecture",
      "Custom UI & Plugin Development",
      "Drawing & Assembly Automation",
      "PDM/PLM Integration",
    ],
    highlights: [
      "ProToolkit architecture & session management",
      "Automating part & assembly feature creation",
      "Custom UI panels, menus, and dialog boxes",
      "Drawing automation & BOM extraction",
      "Integration with PDM/PLM systems",
      "2 Mini Projects + 2 Capstone Projects",
    ],
  },
  {
    slug: "solidworks-api-development",
    title: "SolidWorks API Development",
    subtitle: "C# / VB.NET",
    desc: "Create customized tools and automation features inside SolidWorks. Ideal for engineers who want to eliminate repetitive design tasks and enhance SolidWorks productivity.",
    longDescription:
      "Designed for mechanical engineers and developers, this course takes you from zero to proficient in the SolidWorks API ecosystem. You'll learn to build add-ins, macros, and standalone applications using C# and VB.NET that deeply integrate with SolidWorks.\n\nTopics include navigating the SolidWorks object model, automating sketches, features, assemblies, and drawings, creating custom property managers and task panes, and batch-processing files for enterprise workflows. Real-world projects ensure you walk away with portfolio-ready automation tools.",
    level: "Intermediate",
    price: "Popular",
    duration: "10 Weeks",
    instructor: "Amit Gupta",
    image: SolidWorks,
    isActive: true,
    syllabus: "/syllabus/catia.pdf",
    cardIncludes: [
      "SolidWorks Object Model",
      "Add-in & Macro Development",
      "Sketch & Feature Automation",
      "Batch Processing & PDM",
    ],
    highlights: [
      "SolidWorks object model deep-dive",
      "Building add-ins with C# / VB.NET",
      "Sketch, feature & assembly automation",
      "Custom property managers and task panes",
      "Batch processing & file management",
      "Resume guidance & interview preparation",
    ],
  },
  {
    slug: "siemens-nx-open-programming",
    title: "Siemens NX Open Programming",
    subtitle: "C++, Python, .NET",
    desc: "Learn how to develop automation solutions in Siemens NX using NX Open API. Focuses on advanced engineering extensions and integrating NX with external systems.",
    longDescription:
      "Siemens NX is one of the most powerful CAD/CAM/CAE platforms in the industry, and NX Open gives you the keys to extend it. This course covers NX Open programming in C++, Python, and .NET, giving you the flexibility to choose the right tool for every automation challenge.\n\nYou'll learn to create journals and automate them, build custom NX dialogs with Block Styler, manipulate geometry and features programmatically, and develop full NX applications that integrate with Teamcenter and other enterprise systems. Ideal for engineers in automotive, aerospace, and heavy machinery industries.",
    level: "Advanced",
    price: "Premium",
    duration: "12 Weeks",
    instructor: "Amit Gupta",
    image: Siemens,
    isActive: true,
    syllabus: "/syllabus/catia.pdf",
    cardIncludes: [
      "NX Open in C++, Python & .NET",
      "Block Styler UI Development",
      "Journal Recording & Automation",
      "Teamcenter Integration",
    ],
    highlights: [
      "NX Open API in C++, Python, and .NET",
      "Journal recording & automation",
      "Block Styler UI development",
      "Geometry manipulation & feature automation",
      "Teamcenter integration workflows",
      "Industry capstone project",
    ],
  },
  {
    slug: "autocad-automation-api",
    title: "AutoCAD Automation & API",
    subtitle: "AutoLISP & .NET",
    desc: "Automate repetitive drafting and documentation tasks in AutoCAD. Build scripts, functions, and plugins that improve accuracy, speed, and workflow efficiency.",
    longDescription:
      "This course teaches you how to go beyond manual drafting in AutoCAD by leveraging AutoLISP and .NET APIs. You'll learn to write custom commands, automate drawing generation, create intelligent blocks, and build productivity tools that transform how your team uses AutoCAD.\n\nStarting with AutoLISP for rapid scripting and quick-wins, the course progresses to the full .NET API for building robust plugins and custom palettes. You'll also learn to interact with external data sources, automate layer management, and generate reports from drawing data.",
    level: "Beginner/Inter",
    price: "Standard",
    duration: "8 Weeks",
    instructor: "Amit Gupta",
    image: AutoCad,
    isActive: true,
    syllabus: "/syllabus/catia.pdf",
    cardIncludes: [
      "AutoLISP Scripting",
      ".NET Plugin & Palette Development",
      "Block & Drawing Automation",
      "External Database Integration",
    ],
    highlights: [
      "AutoLISP fundamentals & custom commands",
      ".NET API plugins & palettes",
      "Automated drawing & block generation",
      "Layer & style management automation",
      "External data integration",
      "Workflow optimization techniques",
    ],
  },
  {
    slug: "catia-caa-rade-development",
    title: "CATIA CAA RADE Development",
    subtitle: "C++",
    desc: "Develop advanced CAD automation and custom enterprise-level tools for CATIA using the CAA RADE framework. For high-precision design environments (Automotive, Aerospace).",
    longDescription:
      "The CAA RADE framework represents the highest tier of CATIA customization, enabling you to build enterprise-grade plugins for the world's most demanding engineering environments. This expert-level course is designed for experienced C++ developers who need to extend CATIA V5/V6 functionality.\n\nYou'll master the CAA architecture (frameworks, modules, interfaces), learn to create custom workbenches and commands, manipulate CATIA's geometric and topological kernel, and build solutions for automated part design, assembly management, and manufacturing workflows used by leading automotive and aerospace companies.",
    level: "Expert",
    price: "Specialized",
    duration: "14 Weeks",
    instructor: "Amit Gupta",
    image: Catia,
    isActive: false,
    syllabus: "/syllabus/catia.pdf",
    cardIncludes: [
      "CAA V5/V6 Framework & Architecture",
      "Custom Workbench & Commands",
      "Geometric Kernel Manipulation",
      "Enterprise PLM Deployment",
    ],
    highlights: [
      "CAA V5/V6 architecture & framework",
      "Custom workbenches & commands",
      "Geometric & topological kernel access",
      "Automated part design & assembly",
      "Manufacturing workflow automation",
      "Enterprise deployment strategies",
    ],
  },
  {
    slug: "custom-automation-projects",
    title: "Custom Automation Projects",
    subtitle: "Tailored",
    desc: "A fully customizable program designed to help engineering teams learn automation based on their actual tools, product architecture, and workflow challenges.",
    longDescription:
      "Every engineering team has unique challenges. This program is built around your organization's specific CAD software, product architecture, and workflow bottlenecks. We work directly with your team to identify automation opportunities, design solutions, and train your engineers to build and maintain them independently.\n\nWhether you need to automate engineer-to-order configurations, maintain and migrate legacy design data, create batch-processing tools, or build custom design validation checks — this program delivers targeted training that directly impacts your bottom line.",
    level: "Custom",
    price: "Corporate",
    duration: "Flexible",
    instructor: "Cadivity Team",
    image: Custom,
    isActive: true,
    isCustom: true,
    customIncludes: [
      "Engineer to order",
      "Maintain legacy data",
      "Radically increase productivity",
      "30 Days Post-delivery support",
    ],
    cardIncludes: [
      "Engineer to order",
      "Maintain legacy data",
      "Radically increase productivity",
      "30 Days Post-delivery support",
    ],
    highlights: [
      "Tailored to your CAD platform & stack",
      "Based on your actual product architecture",
      "Hands-on with your real engineering data",
      "Custom tooling & automation scripts",
      "Team training & knowledge transfer",
      "30-day post-delivery support included",
    ],
  },
];
