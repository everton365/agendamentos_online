import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import beforeAfter1 from "/lovable-uploads/service1.jpg";
import beforeAfter2 from "/lovable-uploads/service2.jpg";
import beforeAfter3 from "/lovable-uploads/service3.jpg";
import beforeAfter0 from "/lovable-uploads/service4.jpg";
import { Badge } from "@/components/ui/badge";

const results = [
  {
    image: beforeAfter3,
    title: "Labial Hidragloss",
    description:
      "Hidragloss: hidratação profunda com estímulo ao colágeno, lábios mais firmes, volumosos e com brilho natural.",
    technique: "Labial Hidragloss",
  },
  {
    image: beforeAfter2,
    title: "Lash Lifting",
    description:
      "Lifting de cílios: curva e levanta os fios naturalmente, realçando o olhar por até 8 semanas sem necessidade de extensões.",
    technique: "Lash Lifting",
  },
  {
    image: beforeAfter1,
    title: "Nano fios realistas",
    description:
      "Nano fios realistas: técnica que corrige falhas das sobrancelhas com naturalidade, garantindo o efeito “nasci assim”, sem aparência de micro.",
    technique: "Nano fios realistas",
  },
  {
    image: beforeAfter0,
    title: "Reconstrução Sobrancelhas",
    description:
      "Conjunto de técnicas que estimula o crescimento dos fios, devolve o formato natural das sobrancelhas e aumenta o volume, com argiloterapia e alta frequência.",
    technique: "Reconstrução Sobrancelhas",
  },
];

const ResultsCarousel = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 animate-fade-in">
          <h2
            className="text-4xl font-cinzel font-bold text-foreground mb-6"
            data-aos="fade-right"
          >
            Resultados{" "}
            <span
              style={{ color: "#D4AF37" }}
              className="bg-gradient-primary bg-clip-text text-transparent"
              data-aos="fade-left"
            >
              Impressionantes
            </span>
          </h2>
          <p
            className="text-xl font-poppins text-muted-foreground max-w-3xl mx-auto"
            data-aos="fade-top"
          >
            Confira algumas das transformações realizadas em nossa clínica. Cada
            trabalho é único e personalizado para cada cliente.
          </p>
        </div>

        <div className="max-w-5xl mx-auto" data-aos="fade-down">
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {results.map((result, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 md:basis-1/2 lg:basis-1/2"
                >
                  <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-full min-h-[16rem] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge
                            variant="secondary"
                            className="bg-white/90 text-foreground"
                          >
                            {result.technique}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-8">
                        <h3 className="text-xl font-poppins font-semibold text-foreground mb-3">
                          {result.title}
                        </h3>
                        <p className="text-muted-foreground font-poppins leading-relaxed">
                          {result.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-0 bg-white shadow-soft hover:bg-primary hover:text-white" />
            <CarouselNext className="border-0 bg-white shadow-soft hover:bg-primary hover:text-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ResultsCarousel;
