import { Footer } from "@/components/common/Footer";
import { Navbar } from "@/components/common/Navbar";
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