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
          {/* Título */}
          <h1 className="font-cinzel font-extrabold leading-tight text-center relative">
            {/* --- Título principal 3D --- */}
            <span
              className="absolute inset-0 text-yellow-500 [text-shadow:2px_2px_0_#a7a7a7,4px_4px_0_#7a7a7a,6px_6px_8px_rgba(0,0,0,0.35)]"
              style={{ fontSize: "clamp(3rem, 8vw, 10rem)" }}
              aria-hidden="true"
            >
              Lariza Freitas
            </span>
            <span
              className="relative block text-transparent bg-clip-text bg-gradient-to-b from-black to-yellow-400"
              style={{ fontSize: "clamp(3rem, 8vw, 10rem)" }}
            >
              Lariza Freitas
            </span>

            {/* --- Subtítulo 3D --- 
            <span
              className="absolute inset-0 text-yellow-500 [text-shadow:2px_2px_0_#c3c3c3,4px_4px_0_#a5a5a5,6px_6px_8px_rgba(0,0,0,0.35)]"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 3rem)",
                top: "100%",
                transform: "translateY(-0.25em)",
              }}
              aria-hidden="true"
            >
              Especialista em sobrancelhas naturais
            </span>
*/}
            {/* --- Camada visível com gradiente do subtítulo --- */}
            <span
              className="relative block text-transparent bg-clip-text bg-gradient-to-b from-black to-yellow-400"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 3rem)",
                marginTop: "-0.25em", // mantém alinhamento com a sombra 3D
              }}
            >
              Especialista em sobrancelhas naturais
            </span>
          </h1>
          <br></br>

          {/* Descrição */}
          <p className="text-xl mt-8 text-muted-foreground max-w-lg mx-auto leading-relaxed mt-6">
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
              className="w-48 bg-transparent border-2 border-black text-black hover:#D4AF37 hover:text-white transition"
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
          {/* Estrelas + Avaliações 
          <div className="flex justify-center items-center  gap-2 text-primary">
            <Star
              style={{ color: "#D4AF37" }}
              className="w-5 h-5 fill-current"
            />
            <Star
              style={{ color: "#D4AF37" }}
              className="w-5 h-5 fill-current"
            />
            <Star
              style={{ color: "#D4AF37" }}
              className="w-5 h-5 fill-current"
            />
            <Star
              style={{ color: "#D4AF37" }}
              className="w-5 h-5 fill-current"
            />
            <Star
              style={{ color: "#D4AF37" }}
              className="w-5 h-5 fill-current"
            />
            <span
              style={{ color: "#000000ff" }}
              className="text-sm font-medium"
            >
              Mais de 500 <span>clientes</span> satisfeitas
            </span>
          </div>
           */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
