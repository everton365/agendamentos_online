import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudio } from "@/contexts/StudioContext";
import capaDesktop from "../assets/estudio3.jpg";
import { useNavigate } from "react-router-dom";
import { Calendar, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { StudioData } from "@/hooks/use-studio-page";

interface HeroSectionProps {
  studioA: StudioData | null;
}
const HeroSection = ({ studioA }: HeroSectionProps) => {
  const { user } = useAuth();
  const { loading, studio } = useStudio();

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { clearCart } = useCart();
  useEffect(() => {
    // limpa o carrinho assim que a tela de sucesso carregar
    clearCart();
  }, []);
  const handleScheduleClick = () => {
    if (user) {
      navigate("/agendamento");
    } else {
      navigate("/auth");
    }
    setMobileMenuOpen(false);
  };

  return (
    <section className="relative w-full max-w-[1350px] mx-auto h-screen  overflow-hidden flex items-center justify-center">
      {/* Imagem de fundo */}
      <img
        src={studio?.foto_capa || studioA?.foto_capa}
        alt="Capa Desktop"
        loading="eager"
        decoding="async"
        width={1350}
        height={900}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  w-auto h-[100dvh] max-w-full object-contain md:w-[120%] md:h-[120%] md:object-cover"
      />

      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-6 py-8 sm:py-10  w-full max-w-[900px] text-center">
        <div className=" animate-fade-in">
          {/* Título */}
          <h1 className="font-cinzel font-extrabold text-center margin-out relative -mt-10 mb-0 uppercase leading-none">
            {/* Camada de sombra 3D */}
            <span
              className="absolute inset-0 text-yellow-500 [text-shadow:2px_2px_0_#a7a7a7,4px_4px_0_#7a7a7a,6px_6px_8px_rgba(0,0,0,0.35)]"
              style={{
                fontSize: "clamp(2rem, 10vw, 9rem)",
                backgroundSize: "100% 100%",
              }}
              aria-hidden="true"
            >
              {loading
                ? "Carregando..."
                : studio?.nome_studio || studioA?.nome_studio}
            </span>

            {/* Camada visível com gradiente*/}
            <span
              className="relative block text-transparent bg-clip-text bg-gradient-to-b from-black/40 to-yellow-400 leading-none"
              style={{
                fontSize: "clamp(2rem, 10vw, 9rem)",
                backgroundSize: "100% 100%",
              }}
            >
              {loading
                ? "Carregando..."
                : studio?.nome_studio || studioA?.nome_studio}
            </span>
          </h1>

          <h2 className="font-cinzel font-extrabold text-center relative mt-2 mb-5 uppercase leading-none">
            {/* Subtítulo - dois spans lado a lado */}

            <span
              className="relative inline-block text-transparent bg-clip-text bg-gradient-to-b from-black/30 to-yellow-400 leading-none mr-1"
              style={{
                fontSize: "clamp(1.2rem, 2.5vw, 2.7rem)",
                backgroundSize: "100% 100%",
              }}
            >
              {studio?.subtitle_studio}
            </span>
          </h2>

          {/* Descrição */}
          <p className="text-lg font-poppins text-foreground max-w-2xl mx-auto mt-16 mb-16 leading-snug">
            {studio?.description_studio}
          </p>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-14 justify-center items-center">
            <Button
              size="lg"
              onClick={handleScheduleClick}
              className="group w-56 h-14 text-base font-semibold rounded-full"
              style={{ backgroundColor: "#D4AF37", color: "#000000ff" }}
            >
              <Calendar
                style={{ color: "#000000ff" }}
                className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
              />
              Agendar Horário
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document.getElementById("resultados")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="w-56 h-14 text-base font-semibold rounded-full hover:bg-[#D4AF37] hover:text-black"
              style={{ borderColor: "#D4AF37", color: "#000000ff" }}
            >
              Ver Resultados
            </Button>
          </div>

          {/* Badge flutuante */}
          <div className="flex justify-center mt-4 mb-4 sm:mb-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-2 inline-flex items-center gap-4 animate-float shadow-xl">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black">
                <Star className="w-7 h-7 text-[#D4AF37] fill-current" />
              </div>
              <div>
                <div className="font-semibold text-foreground font-poppins text-lg">
                  Certificado
                </div>
                <div className="text-muted-foreground font-poppins">
                  Técnicas Avançadas
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
