import { siteConfig } from "@/config/site";
import { Fill } from "@alvarosky/ui";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProductHighlight } from "@/components/sections/ProductHighlight";
import { CoachingSection } from "@/components/sections/CoachingSection";

export default function Home() {
  return (
    <Fill>
      <HeroSection />
      <ProductHighlight />
      <CoachingSection />
    </Fill>
  );
}
