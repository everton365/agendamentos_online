import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useReviews } from "@/hooks/use-reviews";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { ReviewData } from "@/hooks/use-studio-page";

interface TestimonialsSection {
  reviews: ReviewData[];
}

const TestimonialsSection = ({ reviews }: TestimonialsSection) => {
  const { loading, error } = useReviews();
  const [showAll, setShowAll] = useState(false);

  if (error) {
    return null;
  }

  const visibleReviews = showAll ? reviews : reviews.slice(0, 5);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.estrelas, 0) / reviews.length
        ).toFixed(1)
      : "5.0";

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

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhuma avaliação disponível no momento.
          </p>
        ) : (
          <>
            <div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-10"
              data-aos="fade-top"
            >
              {visibleReviews.map((review) => (
                <Card
                  key={review.id}
                  className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-0 bg-white shadow-soft"
                >
                  <CardContent className="p-10">
                    <div className="flex items-center mb-4">
                      {[...Array(review.estrelas)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-elegant-gold fill-current"
                        />
                      ))}
                    </div>

                    <p className="text-muted-foreground font-poppins mb-6 leading-relaxed max-h-32 overflow-y-auto italic">
                      "{review.depoimento}"
                    </p>

                    <div className="border-t border-border pt-6">
                      <div className="font-semibold font-poppins text-foreground mb-2">
                        {review.nome}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!showAll && reviews.length > 5 && (
              <div className="text-center mt-10">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  className="font-poppins"
                >
                  Ver todas ({reviews.length})
                </Button>
              </div>
            )}
          </>
        )}

        {reviews.length > 0 && (
          <div className="text-center mt-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-black to-yellow-400 text-white px-10 py-5 rounded-2xl shadow-elegant">
              <Star
                style={{ color: "#D4AF37" }}
                className="w-7 h-7 fill-current"
              />
              <span className="text-xl font-poppins font-semibold">
                {averageRating}/5 estrelas
              </span>
              <span className="text-white/80 font-poppins">
                • {reviews.length} avaliações
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
