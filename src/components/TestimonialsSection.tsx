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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 animate-fade-in">
          <h2
            className="text-4xl font-cinzel font-bold text-foreground mb-6"
            data-aos="fade-top"
          >
            O que nossas{" "}
            <span
              style={{ color: "#D4AF37" }}
              className="bg-gradient-primary bg-clip-text text-transparent"
            >
              Clientes
            </span>{" "}
            dizem
          </h2>
          <p
            className="text-xl font-poppins text-muted-foreground max-w-3xl mx-auto"
            data-aos="fade-top"
          >
            A satisfação das nossas clientes é nossa maior conquista. Confira
            alguns depoimentos de quem já passou por aqui.
          </p>
        </div>

        <div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-10"
          data-aos="fade-top"
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-0 bg-white shadow-soft"
            >
              <CardContent className="p-10">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-elegant-gold fill-current"
                    />
                  ))}
                </div>

                <p className="text-muted-foreground font-poppins mb-8 leading-relaxed italic">
                  "{testimonial.review}"
                </p>

                <div className="border-t border-border pt-6">
                  <div className="font-semibold font-poppins text-foreground mb-2">
                    {testimonial.name}
                  </div>
                  <div className="text-sm font-poppins text-primary">
                    {testimonial.service}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-black to-yellow-400 text-white px-10 py-5 rounded-2xl shadow-elegant">
            <Star
              style={{ color: "#D4AF37" }}
              className="w-7 h-7 fill-current"
            />
            <span className="text-xl font-poppins font-semibold">4.9/5 estrelas</span>
            <span className="text-white/80 font-poppins">• Mais de 200 avaliações</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
