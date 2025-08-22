import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

import ServicesSection from "@/components/ServicesSection";
import ResultsCarousel from "@/components/ResultsCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import AboutUs from "@/components/aboutUs";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Index = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <div id="servicos">
        <ServicesSection />
      </div>

      <AboutUs />
      <div id="resultados">
        <ResultsCarousel />
      </div>
      <TestimonialsSection />
      <Footer />
    </main>
  );
};

export default Index;
