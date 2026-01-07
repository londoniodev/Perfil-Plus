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
} from "./components/sections";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ClientsCarouselSection />
      <AreasImpactoSection />
      <AboutSection />
      <PropuestaSection />
      <ServiciosSection />
      <MetodoSection />
      <TestimoniosSection />
      <CTASection />
    </>
  );
}