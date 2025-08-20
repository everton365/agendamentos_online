import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ResultsCarousel from "@/components/ResultsCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <div id="servicos">
        <ServicesSection />
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
