import { Card, CardContent } from "@/components/ui/card";

import { serviceOptions } from "../data/servicesData";
import { useState } from "react";
import { Link } from "react-router-dom";
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
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div>
                    {/* Imagem do serviço */}
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.value}
                        className="w-full h-60 object-cover rounded-xl mb-4 shadow-md group-hover:scale-105 transition-transform"
                        data-aos="zoom-in"
                      />
                    )}

                    {/* Nome e descrição */}
                    <h3
                      className="text-xl font-semibold text-foreground mb-3"
                      data-aos="fade-left"
                    >
                      {service.value}
                    </h3>
                    <div
                      className="text-muted-foreground mb-6 leading-relaxed max-h-32 overflow-y-auto"
                      data-aos="fade-right"
                    >
                      {service.description}
                    </div>
                  </div>

                  {/* Preço + Duração + Botão */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-left">
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

                    <Link
                      to={`/agendamento?service=${service.value}&price=${service.price}&duration=${service.duration}`}
                    >
                      <button
                        className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition"
                        data-aos="fade-left"
                      >
                        Agendar
                      </button>
                    </Link>
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
