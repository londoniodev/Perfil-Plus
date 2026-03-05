import { TenantMarketingData } from "@/types/marketing";
import { Fill } from "@alvarosky/ui";
import { HeroSection } from "./sections/HeroSection";
import { ProductHighlight } from "./sections/ProductHighlight";
import { CoachingSection } from "./sections/CoachingSection";

export default function DeborahLanding({ data }: { data: TenantMarketingData }) {
    return (
        <Fill>
            <HeroSection />
            <ProductHighlight />
            <CoachingSection />
        </Fill>
    );
}
