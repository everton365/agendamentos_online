import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import capaDesktop from "../assets/estudio3.jpg";
import { useNavigate } from "react-router-dom";
import { Calendar, Star } from "lucide-react";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        src={capaDesktop}
        alt="Capa Desktop"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 w-auto h-[100dvh] max-w-full object-contain md:w-[120%] md:h-[120%] md:object-cover"
      />

      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-6 py-8 sm:py-10  w-full max-w-[900px] text-center">
        <div className=" animate-fade-in">
          {/* Título */}
          <h1 className="font-cinzel font-extrabold text-center relative mt-0 mb-0 uppercase leading-none">
            {/* Camada de sombra 3D */}
            <span
              className="absolute inset-0 text-yellow-500 [text-shadow:2px_2px_0_#a7a7a7,4px_4px_0_#7a7a7a,6px_6px_8px_rgba(0,0,0,0.35)]"
              style={{
                fontSize: "clamp(2rem, 10vw, 9rem)",
                backgroundSize: "100% 100%",
              }}
              aria-hidden="true"
            >
              Lariza Freitas
            </span>

            {/* Camada visível com gradiente */}
            <span
              className="relative block text-transparent bg-clip-text bg-gradient-to-b from-black/40 to-yellow-400 leading-none"
              style={{
                fontSize: "clamp(2rem, 10vw, 9rem)",
                backgroundSize: "100% 100%",
              }}
            >
              Lariza Freitas
            </span>
          </h1>

          <h2 className="font-cinzel font-extrabold text-center relative mt-0 mb-5 uppercase leading-none">
            {/* Subtítulo - dois spans lado a lado */}
            <span
              className="relative inline-block text-transparent bg-clip-text bg-gradient-to-b from-black/30 to-yellow-400 leading-none mr-1"
              style={{
                fontSize: "clamp(1.2rem, 2.5vw, 2.7rem)",
                backgroundSize: "100% 100%",
              }}
            >
              Especialista em
            </span>
            <span
              className="relative inline-block text-transparent bg-clip-text bg-gradient-to-b from-black/30 to-yellow-400 leading-none"
              style={{
                fontSize: "clamp(1.2rem, 2.5vw, 2.7rem)",
                backgroundSize: "100% 100%",
              }}
            >
              sobrancelhas naturais
            </span>
          </h2>

          {/* Descrição */}
          <p className="text-lg font-poppins text-muted-foreground max-w-2xl mx-auto mb-10 leading-snug">
            Especialista em design, microblading e técnicas avançadas. Realce
            sua beleza com sobrancelhas naturais, leves e perfeitamente
            moldadas.
          </p>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-14 justify-center items-center">
            <Button
              size="lg"
              onClick={handleScheduleClick}
              className="group w-56 h-14 text-base font-semibold"
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
              className="w-56 h-14 text-base font-semibold hover:bg-[#D4AF37] hover:text-black"
              style={{ borderColor: "#D4AF37", color: "#000000ff" }}
            >
              Ver Resultados
            </Button>
          </div>

          {/* Badge flutuante */}
          <div className="flex justify-center mt-4 mb-4 sm:mb-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-elegant p-2 inline-flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black">
                <Star className="w-7 h-7 text-[#D4AF37] fill-current" />
              </div>
              <div>
                <div className="font-semibold text-foreground font-poppins text-lg">
                  Certificada
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
