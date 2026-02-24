import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useStudioPage } from "@/hooks/use-studio-page";
import { useStudio } from "@/contexts/StudioContext";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ResultsCarousel from "@/components/ResultsCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import AboutUs from "@/components/aboutUs";
import NotFound from "@/pages/NotFound";
import { Skeleton } from "@/components/ui/skeleton";

const StudioPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { setSlug } = useStudio();
  const { studio, services, results, reviews, loading, error, notFound } =
    useStudioPage(slug);

  useEffect(() => {
    if (slug) setSlug(slug);
  }, [slug]);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-elegant pt-16 flex items-center justify-center">
        <div className="container mx-auto px-6 space-y-8">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (notFound || error) {
    return <NotFound />;
  }

  return (
    <main className="min-h-screen bg-gradient-elegant pt-16">
      <div id="inicio">
        <Header />
      </div>
      <HeroSection studio={studio} />
      <div id="servicos">
        <ServicesSection services={services} />
      </div>
      <div id="sobre">
        <AboutUs studio={studio} />
      </div>
      <div id="resultados">
        <ResultsCarousel results={results} />
      </div>
      <TestimonialsSection reviews={reviews} />
      <Footer studio={studio} />
    </main>
  );
};

export default StudioPage;
