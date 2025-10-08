import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Thais Santos",
    review:
      "Faço minhas sobrancelhas com a Lariza há mais de 2 anos e recomendo de olhos fechados! Ela é uma excelente profissional, sempre se atualizando para entregar um resultado natural e bonito. Fizemos juntas a reconstrução da minha sobrancelha, que hoje está muito mais preenchida e harmoniosa graças ao trabalho dela.",
    rating: 5,
    service: "",
  },
  {
    name: "Yully Guilherme",
    review:
      "Profissional excelente! O atendimento vai muito além das necessidades: ela não cuida apenas da sua sobrancelha, mas transforma sua autoestima e renova você por completo.",
    rating: 5,
    service: "",
  },
  {
    name: "Liana Fernandes",
    review:
      "Meu resultado ficou incrível! Superou minhas expectativas. Eu indico e voltarei sempre!",
    rating: 5,
    service: "",
  },
  {
    name: "erica oliveira feitosa",
    review:
      "Lariza é uma excelente profissional! ✨ Faço minha sobrancelha com ela há um tempinho e amo o resultado. Sempre dedicada, está em constante aperfeiçoamento, o que faz toda diferença no atendimento maravilhoso que oferece. 💖😍😘",
    rating: 5,
    service: "",
  },
  {
    name: "Aline Delfino Moreira",
    review:
      "Atendimento maravilhoso, espaço lindo e um resultado incrível! Lariza é maravilhosa, super acolhedora e a certeza de sobrancelhas impecáveis.",
    rating: 5,
    service: "",
  },
  {
    name: "Letícia Saraiva",
    review:
      "Ambiente acolhedor, organizado e que transmite uma sensação de cuidado em cada detalhe. A profissional é muito atenciosa e se preocupa em entregar o melhor resultado. Dá pra sentir que tudo é feito com carinho e dedicação. Saí me sentindo renovada e já quero voltar.",
    rating: 5,
    service: "",
  },
  {
    name: "Evelyn Vitoria",
    review:
      "Amei o atendimento, profissional de muita qualidade, ambiente maravilhoso e amei o resultado da minha sobrancelha",
    rating: 5,
    service: "",
  },
  {
    name: "Rayla Costa",
    review:
      "Maravilhosa!! Eu amo o trabalho dela. Só confio na melhor. Provem e vejam, tão bom quanto possam imaginar.",
    rating: 5,
    service: "",
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

                <p className="text-muted-foreground font-poppins mb-6 leading-relaxed max-h-32 overflow-y-auto italic">
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
          <div className="ext-center mt-20 inline-flex items-center gap-3 bg-gradient-to-r from-black to-yellow-400 text-white px-10 py-5 rounded-2xl shadow-elegant">
            <Star
              style={{ color: "#D4AF37" }}
              className="w-7 h-7 fill-current"
            />
            <span className="text-xl font-poppins font-semibold">
              5/5 estrelas
            </span>
            <span className="text-white/80 font-poppins">
              • Mais de 40 avaliações
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
