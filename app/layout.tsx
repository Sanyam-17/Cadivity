import type { Metadata } from "next";
import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import LoginModal from "@/components/auth/LoginModal";
import { BfcacheGuard } from "@/components/auth/BfcacheGuard";
import { Toaster } from "@/components/ui/sonner";


const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Cadivity",
  description: "Professional platform for CAD training and engineering courses",
  keywords: ["CAD Automation Services",
    "CAD Automation Course Online",
    "CAD API Programming",
    "CAD Software Automation",
    "Engineering Design Automation",
    "CAD Customization Services",

    "Creo Toolkit Development",
    "Creo API Programming",
    "Creo CAD Automation",
    "SolidWorks Automation Services",
    "SolidWorks API Programming",
    "SolidWorks Macro Development",
    "AutoCAD Automation Services",
    "AutoCAD Lisp Programming",
    "Siemens NX Open API Programming",

    "CAD Automation Training",
    "Learn CAD Automation Online",
    "CAD Programming Course",
    "Creo Toolkit Training",
    "SolidWorks API Course",
    "AutoCAD Automation Course",
    "Python for CAD Automation",
    "VBA for CAD Automation",
    "CAD Macro Programming Course",

    "CAD Automation Service Provider",
    "Custom CAD Tool Development",
    "CAD Workflow Automation",
    "CAD Plugin Development",
    "CAD Macro Development Services",
    "Engineering Automation Solutions",
    "CAD Design Automation Services",

    "Learn Creo Toolkit Programming from Scratch",
    "Best CAD Automation Course Online",
    "CAD Automation for Mechanical Engineers",
    "Custom CAD Automation Tools for Manufacturing",
    "Reduce Design Time using CAD Automation",
    "SolidWorks API Training with Projects",
    "CAD Automation Solutions for Businesses",

    "CAD Automation Training and Services",
    "Learn CAD Automation with Real Projects",
    "Industry-Level CAD Automation Course",
    "CAD Automation Consulting and Development",

    "CAD Automation Services in India",
    "Creo Toolkit Development India",
    "SolidWorks API Training India",
    "CAD Programming Course India",
    "CAD Automation Company in Nagpur"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"
      data-arp="">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        {children}
        <BfcacheGuard />
        <Toaster />
        <LoginModal />
      </body>
    </html>
  );
}
