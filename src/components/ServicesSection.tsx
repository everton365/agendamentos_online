// src/sections/ServicesSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMergedServices } from "@/hooks/use-mergeServices";
import { useServices } from "@/hooks/use-services";
const ServicesSection = () => {
  const { services: mergedServices, loading } = useServices();
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <section className="py-24 text-center">
        <div className="container mx-auto px-6">
          <p className="text-lg text-muted-foreground font-poppins animate-pulse">
            Carregando serviços...
          </p>
        </div>
      </section>
    );
  }

  // 🔹 Exibe apenas 4 serviços inicialmente
  const visibleServices = showAll ? mergedServices : mergedServices.slice(0, 4);

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        {/* 🔹 Cabeçalho */}
        <div className="text-center mb-20 animate-fade-in">
          <h2
            className="text-4xl font-cinzel font-bold text-foreground mb-6"
            data-aos="fade-left"
          >
            Nossos{" "}
            <span
              style={{ color: "#D4AF37" }}
              className="bg-gradient-primary bg-clip-text text-transparent"
            >
              Serviços
            </span>
          </h2>
          <p
            className="text-xl font-poppins text-muted-foreground max-w-3xl mx-auto"
            data-aos="fade-left"
          >
            Oferecemos uma gama completa de serviços especializados, utilizando
            técnicas modernas e produtos de alta qualidade.
          </p>
        </div>

        {/* 🔹 Lista de serviços */}
        <div className="flex flex-col items-center">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 w-full">
            {visibleServices.map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 flex flex-col justify-between h-full">
                  <div>
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-60 object-cover rounded-xl mb-4 shadow-md group-hover:scale-105 transition-transform"
                        data-aos="zoom-in"
                      />
                    )}

                    <h3
                      className="text-xl font-poppins font-semibold text-foreground mb-4"
                      data-aos="fade-left"
                    >
                      {service.name}
                    </h3>
                    <p
                      className="text-muted-foreground font-poppins mb-6 leading-relaxed max-h-32 overflow-y-auto"
                      data-aos="fade-right"
                    >
                      {service.description || "Sem descrição disponível."}
                    </p>
                  </div>

                  {/* 🔹 Preço e botão */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-left">
                      <div
                        style={{ color: "#D4AF37" }}
                        className="text-2xl font-poppins font-bold text-primary"
                        data-aos="fade-right"
                      >
                        {service.price || "—"}
                      </div>
                      {service.duration && (
                        <div
                          className="text-sm font-poppins text-muted-foreground"
                          data-aos="fade-right"
                        >
                          Duração: {service.duration}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/agendamento?service=${encodeURIComponent(
                        service.name
                      )}&price=${service.price}&duration=${service.duration}`}
                    >
                      <button
                        className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-button hover:shadow-elegant hover:scale-105 font-poppins font-medium"
                        style={{ backgroundColor: "#D4AF37" }}
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

          {/* 🔹 Botão "Ver todos" */}
          {mergedServices.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-12 px-8 py-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-button hover:shadow-elegant hover:scale-105 font-poppins font-medium text-lg"
              style={{ backgroundColor: "#D4AF37" }}
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
