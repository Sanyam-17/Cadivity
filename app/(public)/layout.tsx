import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ReactNode } from "react";

export default function LayoutPublic({ children }: { children: ReactNode }) {
     return (
       <div>
          <Navbar />
          {children}
           <Footer />
       </div>
     )
}