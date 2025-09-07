import { Card, CardContent } from "@/components/ui/card";

import { serviceOptions } from "../data/servicesData";
import { useState } from "react";

const ServicesSection = () => {
  const [showAll, setShowAll] = useState(false);

  const visibleServices = showAll ? serviceOptions : serviceOptions.slice(0, 4); // 👈 só mostra 4 no início

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

        <div className="flex flex-col items-center">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {visibleServices.map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center h-[420px] flex flex-col justify-between">
                  <div>
                    <div
                      className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                      data-aos="fade-right"
                    >
                      <service.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="w-full text-xl font-semibold text-foreground mb-3">
                      {service.value}
                    </h3>

                    <div className="text-muted-foreground mb-6 leading-relaxed max-h-40 overflow-y-auto">
                      {service.description}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {service.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Duração: {service.duration}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botão Ver todos */}
          {serviceOptions.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-8 px-6 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition"
            >
              {showAll ? "Ver menos" : "Ver todos"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
