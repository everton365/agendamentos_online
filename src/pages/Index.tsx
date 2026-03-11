import { useParams, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense, memo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useStudioPage } from "@/hooks/use-studio-page";
import { useStudio } from "@/contexts/StudioContext";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NotFound from "@/pages/NotFound";
import { Skeleton } from "@/components/ui/skeleton";
import LazySection from "@/components/LazySection";

// Lazy load below-fold sections
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const AboutUs = lazy(() => import("@/components/aboutUs"));
const ResultsCarousel = lazy(() => import("@/components/ResultsCarousel"));
const TestimonialsSection = lazy(
  () => import("@/components/TestimonialsSection"),
);
const Footer = lazy(() => import("@/components/Footer"));

const SectionSkeleton = ({ height = "h-96" }: { height?: string }) => (
  <div className="container mx-auto px-6 py-12">
    <Skeleton className={`${height} w-full rounded-lg`} />
  </div>
);

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
    if (studio?.nome_studio) {
      document.title = studio.nome_studio;
    }
    if (studio?.logoStudio) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = studio.logoStudio;
    }
    return () => {
      document.title = "Sistema de Agendamento";
    };
  }, [studio?.nome_studio, studio?.logoStudio]);

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
        <Header studioH={studio} />
      </div>
      <HeroSection studioA={studio} />

      <div id="servicos">
        <LazySection minHeight="400px">
          <Suspense fallback={<SectionSkeleton />}>
            <ServicesSection services={services} />
          </Suspense>
        </LazySection>
      </div>

      <div id="sobre">
        <LazySection minHeight="400px">
          <Suspense fallback={<SectionSkeleton />}>
            <AboutUs studioA={studio} />
          </Suspense>
        </LazySection>
      </div>

      <div id="resultados">
        <LazySection minHeight="400px">
          <Suspense fallback={<SectionSkeleton />}>
            <ResultsCarousel results={results} />
          </Suspense>
        </LazySection>
      </div>

      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsSection reviews={reviews} />
        </Suspense>
      </LazySection>

      <LazySection minHeight="200px">
        <Suspense fallback={<SectionSkeleton height="h-48" />}>
          <Footer />
        </Suspense>
      </LazySection>
    </main>
  );
};

export default StudioPage;
