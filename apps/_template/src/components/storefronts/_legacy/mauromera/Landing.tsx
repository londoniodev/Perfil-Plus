import { TenantMarketingData } from "@/types/marketing";
import {
    HeroSection,
    ClientsCarouselSection,
    AreasImpactoSection,
    AboutSection,
    PropuestaSection,
    ServiciosSection,
    MetodoSection,
    TestimoniosSection,
    CTASection,
} from "./sections";

export default function MauroLanding({ data }: { data: TenantMarketingData }) {
    return (
        <>
            <HeroSection />
            <AreasImpactoSection />
            <ClientsCarouselSection />
            <AboutSection />
            <PropuestaSection />
            <ServiciosSection />
            <MetodoSection />
            <TestimoniosSection />
            <CTASection />
        </>
    );
}
