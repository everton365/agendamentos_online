import donaEstudio from "../assets/estudio1.jpg";
import { useStudio } from "@/contexts/StudioContext";
import type { StudioData } from "@/hooks/use-studio-page";

interface AboutUs {
  studioA: StudioData | null;
}

const AboutUs = ({ studioA }: AboutUs) => {
  const { loading } = useStudio();
  const { studio } = useStudio();

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Texto */}
        <div className="space-y-8">
          <h2
            className="text-4xl font-cinzel font-bold text-foreground"
            data-aos="fade-right"
          >
            Sobre {studio?.nome_studio}
          </h2>
          <p
            className="text-lg font-poppins text-muted-foreground leading-relaxed"
            data-aos="fade-right"
          >
            {loading ? (
              "Carregando informações..."
            ) : studioA?.sobre ? (
              <>
                Bem-vindo ao{" "}
                <span className="font-semibold text-primary">
                  {studioA.nome_studio || "Nosso Studio"}
                </span>{" "}
                {studioA.sobre}
              </>
            ) : (
              <>
                Bem-vindo a{" "}
                <span className="font-semibold text-primary">
                  Nossa Pagina web{" "}
                </span>
              </>
            )}
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div
                style={{ backgroundColor: "#D4AF37" }}
                className="w-3 h-3 bg-primary rounded-full"
              ></div>
              <span
                className="text-foreground font-poppins text-lg"
                data-aos="fade-right"
              >
                Técnicas modernas e seguras
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div
                style={{ backgroundColor: "#D4AF37" }}
                className="w-3 h-3 bg-primary rounded-full"
              ></div>
              <span
                className="text-foreground font-poppins text-lg"
                data-aos="fade-right"
              >
                Produtos de alta qualidade
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div
                style={{ backgroundColor: "#D4AF37" }}
                className="w-3 h-3 bg-primary rounded-full"
              ></div>
              <span
                className="text-foreground font-poppins text-lg"
                data-aos="fade-right"
              >
                Atendimento humanizado
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div
                style={{ backgroundColor: "#D4AF37" }}
                className="w-3 h-3 bg-primary rounded-full"
              ></div>
              <span
                className="text-foreground font-poppins text-lg"
                data-aos="fade-right"
              >
                Resultados naturais e duradouros
              </span>
            </div>
          </div>
        </div>

        {/* Foto da dona */}
        <div
          className="flex justify-center md:justify-end"
          data-aos="fade-left"
        >
          <img
            src={studioA?.foto_studio}
            alt={`Studio ${studioA?.nome_studio || ""}`}
            loading="lazy"
            width={600}
            height={600}
            className="w-full h-full object-cover rounded-2xl shadow-elegant border-4 border-white"
            data-aos="fade-left"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
