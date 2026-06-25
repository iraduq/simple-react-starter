import Hero from "../components/Hero";
import ExperienceCategories from "../components/ExperienceCategories";
import FeaturedRooms from "../components/FeaturedRooms";
import AboutSection from "../components/AboutSection";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";

export default function Home() {
  return (
    <main className="home">
      <Hero />
      <ExperienceCategories />
      <FeaturedRooms />
      <AboutSection />
      <Features />
      <Testimonials />
      <CTABanner />
    </main>
  );
}
