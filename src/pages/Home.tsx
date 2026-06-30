import Hero from "../components/Hero";
import ExperienceCategories from "../components/ExperienceCategories";
import AboutSection from "../components/AboutSection";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="home">
      <Hero />
      <ExperienceCategories />
      <AboutSection />
      <Features />
      <Testimonials />
      <CTABanner />
      <Footer />
    </main>
  );
}
