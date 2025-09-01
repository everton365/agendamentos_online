import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    review:
      "Simplesmente perfeito! A profissional é muito atenciosa e o resultado ficou exatamente como eu queria. Minhas sobrancelhas nunca estiveram tão bonitas!",
    rating: 5,
    service: "Microblading",
  },
  {
    name: "Ana Costa",
    review:
      "Excelente atendimento e resultado incrível. O design ficou perfeito para o meu rosto. Super recomendo!",
    rating: 5,
    service: "Design + Henna",
  },
  {
    name: "Carolina Santos",
    review:
      "Profissional muito qualificada e ambiente super limpo e organizado. O resultado da laminação superou minhas expectativas!",
    rating: 5,
    service: "Laminação",
  },
  {
    name: "Juliana Oliveira",
    review:
      "Amei o resultado! Finalmente encontrei uma profissional que entende exatamente o que preciso. Voltarei sempre!",
    rating: 5,
    service: "Design",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2
            className="text-4xl font-bold text-foreground mb-4"
            data-aos="fade-top"
          >
            O que nossas{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Clientes
            </span>{" "}
            dizem
          </h2>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            data-aos="fade-top"
          >
            A satisfação das nossas clientes é nossa maior conquista. Confira
            alguns depoimentos de quem já passou por aqui.
          </p>
        </div>

        <div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          data-aos="fade-top"
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-0 bg-white shadow-soft"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-elegant-gold fill-current"
                    />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.review}"
                </p>

                <div className="border-t border-border pt-4">
                  <div className="font-semibold text-foreground mb-1">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-primary">
                    {testimonial.service}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-8 py-4 rounded-2xl shadow-soft">
            <Star className="w-6 h-6 fill-current" />
            <span className="text-lg font-semibold">4.9/5 estrelas</span>
            <span className="text-white/80">• Mais de 200 avaliações</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
