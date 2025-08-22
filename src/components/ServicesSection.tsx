import { Card, CardContent } from "@/components/ui/card";
import { Eye, Brush, Palette, Sparkles } from "lucide-react";

const services = [
  {
    icon: Eye,
    title: "Design de Sobrancelhas",
    description:
      "Modelagem personalizada respeitando o formato do seu rosto e características naturais.",
    price: "A partir de R$ 80",
    duration: "45 min",
  },
  {
    icon: Brush,
    title: "Microblading",
    description:
      "Técnica de micropigmentação que cria fios naturais, preenchendo falhas e definindo o formato.",
    price: "A partir de R$ 350",
    duration: "2h",
  },
  {
    icon: Palette,
    title: "Henna para Sobrancelhas",
    description:
      "Coloração natural que realça a cor dos fios e preenche temporariamente a pele.",
    price: "A partir de R$ 60",
    duration: "30 min",
  },
  {
    icon: Sparkles,
    title: "Laminação de Sobrancelhas",
    description:
      "Tratamento que alinha e fixa os fios, criando um efeito de sobrancelhas mais volumosas.",
    price: "A partir de R$ 120",
    duration: "1h",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-20 bg-gradient-elegant">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2
            className="text-4xl font-bold text-foreground mb-4"
            data-aos="fade-left"
          >
            Nossos{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Serviços
            </span>
          </h2>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            data-aos="fade-left"
          >
            Oferecemos uma gama completa de serviços especializados em
            sobrancelhas, utilizando as técnicas mais modernas e produtos de
            alta qualidade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-8 text-center">
                <div
                  className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                  data-aos="fade-right"
                >
                  <service.icon
                    className="w-8 h-8 text-white"
                    data-aos="fade-right"
                  />
                </div>

                <h3
                  className="text-xl font-semibold text-foreground mb-3"
                  data-aos="fade-right"
                >
                  {service.title}
                </h3>

                <p
                  className="text-muted-foreground mb-6 leading-relaxed"
                  data-aos="fade-right"
                >
                  {service.description}
                </p>

                <div className="space-y-2">
                  <div
                    className="text-2xl font-bold text-primary"
                    data-aos="fade-right"
                  >
                    {service.price}
                  </div>
                  <div
                    className="text-sm text-muted-foreground"
                    data-aos="fade-right"
                  >
                    Duração: {service.duration}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
