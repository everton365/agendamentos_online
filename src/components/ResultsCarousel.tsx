import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import beforeAfter1 from "@/assets/before-after-1.jpg";
import beforeAfter2 from "@/assets/before-after-2.jpg";
import beforeAfter3 from "@/assets/before-after-3.jpg";
import { Badge } from "@/components/ui/badge";

const results = [
  {
    image: beforeAfter1,
    title: "Microblading - Preenchimento Natural",
    description:
      "Transformação completa com técnica de microblading para criar fios naturais",
    technique: "Microblading",
  },
  {
    image: beforeAfter2,
    title: "Design Personalizado",
    description:
      "Modelagem e design personalizado respeitando as características faciais",
    technique: "Design",
  },
  {
    image: beforeAfter3,
    title: "Henna + Design",
    description: "Coloração com henna e design para realçar o formato natural",
    technique: "Henna",
  },
];

const ResultsCarousel = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2
            className="text-4xl font-bold text-foreground mb-4"
            data-aos="fade-right"
          >
            Resultados{" "}
            <span
              className="bg-gradient-primary bg-clip-text text-transparent"
              data-aos="fade-left"
            >
              Impressionantes
            </span>
          </h2>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
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
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
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

                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {result.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
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
