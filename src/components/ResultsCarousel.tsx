import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResults } from "@/hooks/use-results";
import { Skeleton } from "@/components/ui/skeleton";

const ResultsCarousel = () => {
  const { results, loading, error } = useResults();

  if (error) {
    return null;
  }

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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhum resultado disponível no momento.
            </p>
          ) : (
            <Carousel className="w-full">
              <CarouselContent className="-ml-4">
                {results.map((result) => (
                  <CarouselItem
                    key={result.id}
                    className="pl-4 md:basis-1/2 lg:basis-1/2"
                  >
                    <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={result.imagem_url}
                            alt={result.titulo}
                            className="w-full min-h-[16rem] object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge
                              variant="secondary"
                              className="bg-white/90 text-foreground"
                            >
                              {result.titulo}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-8">
                          <h3 className="text-xl font-poppins font-semibold text-foreground mb-3">
                            {result.titulo}
                          </h3>
                          <p className="text-muted-foreground font-poppins leading-relaxed">
                            {result.descricao}
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
          )}
        </div>
      </div>
    </section>
  );
};

export default ResultsCarousel;
