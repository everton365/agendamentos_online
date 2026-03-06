import { Card, CardContent } from "@/components/ui/card";
import { useState, memo } from "react";
import { Link } from "react-router-dom";
import type { ServiceData } from "@/hooks/use-studio-page";

interface ServicesSectionProps {
  services: ServiceData[];
}

const ServicesSection = memo(({ services }: ServicesSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  if (!services) {
    return null;
  }

  const visibleServices = showAll ? services : services.slice(0, 4);

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-6">
            Nossos <span style={{ color: "#D4AF37" }}>Serviços</span>
          </h2>
        </div>

        <div className="flex flex-col items-center">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 w-full">
            {visibleServices.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-8 flex flex-col justify-between h-full">
                  <div>
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.name}
                        loading="lazy"
                        width={400}
                        height={240}
                        className="w-full h-60 object-cover rounded-xl mb-4"
                      />
                    )}

                    <h3 className="text-xl font-semibold mb-4">
                      {service.name}
                    </h3>

                    <p className="mb-6 max-h-24 overflow-y-auto pr-2">
                      {service.description || "Sem descrição disponível."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <div
                        style={{ color: "#D4AF37" }}
                        className="text-2xl font-bold"
                      >
                        {service.price}
                      </div>

                      {service.duration && (
                        <div className="text-sm text-muted-foreground">
                          Duração: {service.duration}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/agendamento?service=${encodeURIComponent(
                        service.name,
                      )}&price=${service.price}&duration=${service.duration}`}
                    >
                      <button
                        className="px-6 py-3 rounded-xl text-white"
                        style={{ backgroundColor: "#D4AF37" }}
                      >
                        Agendar
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {services.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-12 px-8 py-4 rounded-xl text-white"
              style={{ backgroundColor: "#D4AF37" }}
            >
              {showAll ? "Ver menos" : "Ver todos"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = "ServicesSection";

export default ServicesSection;
