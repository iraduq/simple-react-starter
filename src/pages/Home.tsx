import Hero from "../components/Hero";
import ExperienceCategories from "../components/ExperienceCategories";
import AboutSection from "../components/AboutSection";
import Features from "../components/Features";
import Map from "../components/MapClient";

export default function Home() {
  return (
    <main className="text-[#1a1a1a]">
      <Hero />
      <ExperienceCategories />
      <AboutSection />
      <Features />
      <Map />
    </main>
  );
}
