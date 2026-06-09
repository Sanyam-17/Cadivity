import { HeroSlider } from "@/components/home/HeroSlider";
import { HomeTaglineSection } from "@/components/home/HomeTaglineSection";
import { HomeWhatWeDoSection } from "@/components/home/HomeWhatWeDoSection";

/**
 * Shared home page body content.
 * Rendered on both the "/" route and the "/login" route (as background).
 * Now a Server Component — HeroSlider, tagline, and "What We Do"
 * are client components that handle their own interactivity.
 */
export function HomePageContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeroSlider />
      <HomeTaglineSection />
      <HomeWhatWeDoSection />
    </div>
  );
}
