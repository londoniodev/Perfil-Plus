import {
  LandingNav,
  LandingHero,
  LandingPlanes,
  LandingTestimonios,
  LandingAbout,
  LandingFooter,
  LandingCTABottom,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="bg-white dark:bg-cs-bg-dark text-gray-800 dark:text-gray-100 font-sans antialiased transition-colors duration-200">
      <LandingNav />
      <LandingHero />
      <LandingPlanes />
      <LandingTestimonios />
      <LandingAbout />
      <LandingFooter />
      <LandingCTABottom />
    </div>
  );
}
