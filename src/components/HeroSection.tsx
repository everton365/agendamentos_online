import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import capaDesktop from "../assets/capa.jpg";
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
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden flex items-center justify-center">
      {/* Imagem Mobile */}
      <img
        src={capaMobile}
        alt="Capa Mobile"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-70 lg:hidden"
      />

      {/* Imagem Desktop */}
      <img
        src={capaDesktop}
        alt="Capa Desktop"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 hidden lg:block"
      />

      {/* Gradiente sobre a imagem */}
      <div className="absolute inset-0 bg-gradient-to-br from-warm-pink/20 to-soft-nude/30" />

      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="space-y-8 animate-fade-in">
          {/* Estrelas + Avaliações */}
          <div className="flex justify-center items-center  gap-2 text-primary">
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <span className="text-sm font-medium">
              Mais de 500 clientes satisfeitas
            </span>
          </div>

          {/* Título */}
          <h1 className="text-5xl lg:text-6xl  font-bold text-foreground leading-tight">
            Sobrancelhas{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Perfeitas
            </span>
            <br />
            para Você
          </h1>

          {/* Descrição */}
          <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Especialista em design, microblading e técnicas avançadas.
            Transforme seu olhar com sobrancelhas perfeitamente moldadas.
          </p>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleScheduleClick}
              className="group"
            >
              <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Agendar Consulta
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                document.getElementById("resultados")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Ver Resultados
            </Button>
          </div>

          {/* Estatísticas */}
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

          {/* Badge flutuante */}
          <div className="flex justify-center pt-12">
            <div className="bg-white rounded-2xl shadow-soft p-6 animate-fade-in inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-current" />
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
