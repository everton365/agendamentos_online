import { Button } from "@/components/ui/button";
import { Calendar, Star } from "lucide-react";
import professionalHero from "@/assets/professional-hero.jpg";

const HeroSection = () => {
  const handleScheduleClick = () => {
    const appointmentSection = document.getElementById('agendamento');
    if (appointmentSection) {
      appointmentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-warm-pink/20 to-soft-nude/30" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Hero Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">Mais de 500 clientes satisfeitas</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Sobrancelhas{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Perfeitas
                </span>
                <br />
                para Você
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Especialista em design, microblading e técnicas avançadas. 
                Transforme seu olhar com sobrancelhas perfeitamente moldadas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleScheduleClick}
                className="group"
              >
                <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Agendar Consulta
              </Button>
              <Button variant="outline" size="lg">
                Ver Resultados
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5+</div>
                <div className="text-sm text-muted-foreground">Anos de Experiência</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Clientes Atendidas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
            </div>
          </div>

          {/* Professional Image */}
          <div className="relative animate-scale-in">
            <div className="relative rounded-3xl overflow-hidden shadow-elegant">
              <img
                src="/lovable-uploads/115e7050-38de-4ebc-9a55-06c150f2d3c4.png"
                alt="Profissional especialista em sobrancelhas"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-soft p-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Certificada</div>
                  <div className="text-sm text-muted-foreground">Técnicas Avançadas</div>
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