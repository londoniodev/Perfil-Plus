import { TenantMarketingData } from "@/types/marketing";
import {
    LandingHero,
    LandingPlanes,
    LandingTestimonios,
    LandingAbout,
    LandingCTABottom,
} from "./";

export default function CocinasieteLanding({ data }: { data: TenantMarketingData }) {
    return (
        <div className="bg-white text-gray-800 font-sans antialiased transition-colors duration-200">
            <LandingHero />
            <LandingPlanes />
            <LandingTestimonios />
            <LandingAbout />
            <LandingCTABottom />
        </div>
    );
}
