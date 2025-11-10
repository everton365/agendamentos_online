import donaEstudio from "../assets/estudio1.jpg";
import { useStudio } from "@/contexts/StudioContext";

const AboutUs = () => {
  const { studio, loading } = useStudio();
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Texto */}
        <div className="space-y-8">
          <h2
            className="text-4xl font-cinzel font-bold text-foreground"
            data-aos="fade-right"
          >
            Sobre o Studio
          </h2>
          <p
            className="text-lg font-poppins text-muted-foreground leading-relaxed"
            data-aos="fade-right"
          >
            {loading ? (
              "Carregando informações..."
            ) : studio?.sobre ? (
              <>
                Bem-vindo ao{" "}
                <span className="font-semibold text-primary">
                  {studio.nome_studio || "Nosso Studio"}
                </span>{" "}
                {studio.sobre}
              </>
            ) : (
              <>
                Bem-vindo ao{" "}
                <span className="font-semibold text-primary">Nosso Studio</span>
                ! Especialista em sobrancelhas naturais! Aqui, minha paixão pela
                beleza e a precisão técnica se encontram. Minha missão é realçar
                a sua beleza única, criando um design de sobrancelhas impecável
                e totalmente personalizado.
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
            src={studio?.foto_studio || donaEstudio}
            alt={`Studio ${studio?.nome_studio || ""}`}
            className="w-full h-full object-cover rounded-2xl shadow-elegant border-4 border-white"
            data-aos="fade-left"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
