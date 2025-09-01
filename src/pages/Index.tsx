import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { useLocation } from "react-router-dom";
import ServicesSection from "@/components/ServicesSection";
import ResultsCarousel from "@/components/ResultsCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import AboutUs from "@/components/aboutUs";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Index = () => {
  const location = useLocation();
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const state = location.state as { scrollToId?: string };

    if (state?.scrollToId) {
      const id = state.scrollToId;

      let attempts = 0;
      const maxAttempts = 10;

      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryScroll, 100);
        }
      };

      tryScroll();
    }
  }, [location]);

  return (
    <main className="min-h-screen">
      <div id="inicio">
        <Header />
      </div>
      <HeroSection />
      <div id="servicos">
        <ServicesSection />
      </div>
      <div id="sobre">
        <AboutUs />
      </div>
      <div id="resultados">
        <ResultsCarousel />
      </div>
      <TestimonialsSection />
      <Footer />
    </main>
  );
};

export default Index;
