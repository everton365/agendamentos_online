import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Shield, Users } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Certificação Profissional",
    description: "Formação especializada e certificações em técnicas avançadas de sobrancelhas"
  },
  {
    icon: Shield,
    title: "Segurança e Higiene",
    description: "Ambiente totalmente esterilizado e materiais descartáveis para sua segurança"
  },
  {
    icon: Heart,
    title: "Atendimento Personalizado",
    description: "Cada cliente é única, por isso oferecemos um atendimento 100% personalizado"
  },
  {
    icon: Users,
    title: "Experiência Comprovada",
    description: "Mais de 5 anos de experiência e centenas de clientes satisfeitas"
  }
];

const AboutSection = () => {
  return (
    <section className="py-20 bg-gradient-elegant">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Sobre nossa <span className="bg-gradient-primary bg-clip-text text-transparent">Especialista</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Com mais de 5 anos de experiência na área de estética facial, nossa profissional 
              é especializada em técnicas avançadas de sobrancelhas. Formada pelos melhores cursos 
              do Brasil e sempre em constante atualização para oferecer os melhores resultados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-soft">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-6">
                  Nossa Missão
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Acreditamos que sobrancelhas bem feitas transformam não apenas o visual, 
                  mas também a autoestima. Nossa missão é realçar a beleza natural de cada 
                  cliente, respeitando suas características únicas e criando um resultado 
                  harmonioso e duradouro.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">Técnicas modernas e seguras</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">Produtos de alta qualidade</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">Atendimento humanizado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">Resultados naturais e duradouros</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-primary rounded-2xl p-6 text-white">
                  <div className="text-3xl font-bold mb-2">500+</div>
                  <div className="text-white/90">Clientes Atendidas</div>
                </div>
                <div className="bg-elegant-gold rounded-2xl p-6 text-white">
                  <div className="text-3xl font-bold mb-2">5</div>
                  <div className="text-white/90">Anos de Experiência</div>
                </div>
                <div className="bg-warm-pink rounded-2xl p-6 text-white">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-white/90">Satisfação Garantida</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;