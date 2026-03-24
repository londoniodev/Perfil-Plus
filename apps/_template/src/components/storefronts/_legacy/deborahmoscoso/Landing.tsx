import { TenantMarketingData } from "@/types/marketing";
import { HeroSection } from "./sections/HeroSection";
import { ProductHighlight } from "./sections/ProductHighlight";
import { CoachingSection } from "./sections/CoachingSection";

export default function DeborahLanding({ data }: { data: TenantMarketingData }) {
    return (
        <>
            <HeroSection />
            <ProductHighlight />
            <CoachingSection />
        </>
    );
}
