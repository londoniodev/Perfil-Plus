import {
  LandingHero,
  LandingPlanes,
  LandingTestimonios,
  LandingAbout,
  LandingCTABottom,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="bg-white  text-gray-800  font-sans antialiased transition-colors duration-200">
      <LandingHero />
      <LandingPlanes />
      <LandingTestimonios />
      <LandingAbout />
      <LandingCTABottom />
    </div>
  );
}
