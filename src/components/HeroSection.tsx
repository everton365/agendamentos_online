import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import capaDesktop from "../assets/nanoFios.mp4";
import capaMobile from "../assets/capa-mobile.jpg";
import { useNavigate } from "react-router-dom";
import { Calendar, Star, LogOut, User, Menu, X } from "lucide-react";

const HeroSection = () => {
  const { user, signOut } = useAuth();
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
    <section className="relative h-1/3 bg-gradient-hero overflow-hidden flex items-center justify-center">
      {/* Imagem Desktop */}
      <video
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] object-cover opacity-50"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={capaDesktop} type="video/mp4" />
        Seu navegador não suporta o vídeo.
      </video>

      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="space-y-8 animate-fade-in">
          {/* Estrelas + Avaliações 
          <div className="flex justify-center items-center  gap-2 text-primary">
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <span className="text-sm font-medium">
              Mais de 500 clientes satisfeitas
            </span>
          </div>*/}

          {/* Título */}
          <h1 className="text-6xl lg:text-8xl font-cinzel font-extrabold leading-tight">
            <span className="block text-6xl text-transparent bg-clip-text bg-gradient-to-b from-black to-yellow-400">
              Lariza Freitas
            </span>
            <span className="block text-2xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-black -mt-2">
              Especialista em sobrancelhas naturais
            </span>
          </h1>

          {/* Descrição */}
          <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Especialista em design, microblading e técnicas avançadas. Realce
            sua beleza com sobrancelhas naturais, leves e perfeitamente
            moldadas.
          </p>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4  justify-center items-center">
            <Button
              size="lg"
              onClick={handleScheduleClick}
              className="group w-48"
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
              onClick={() =>
                document.getElementById("resultados")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="w-48 bg-transparent border-2 border-black text-black hover:bg-black hover:text-white transition"
            >
              Ver Resultados
            </Button>
          </div>

          {/* Estatísticas 
          <div className="grid grid-cols-3 gap-x-1 pt-6">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary">5+</div>
              <div className="text-sm text-muted-foreground">
                Anos de Experiência
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">
                Clientes Atendidas
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Satisfação</div>
            </div>
          </div>
          */}

          {/* Badge flutuante */}
          <div className="flex justify-center pt-12">
            <div className="bg-white rounded-2xl shadow-soft p-6 animate-fade-in inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black">
                <Star className="w-6 h-6 text-[#D4AF37] fill-current" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Certificada</div>
                <div className="text-sm text-muted-foreground">
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
