import type { StudioData } from "@/hooks/use-studio-page";

interface AboutUsProps {
  studio: StudioData | null;
}

const AboutUs = ({ studio }: AboutUsProps) => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-cinzel font-bold text-foreground" data-aos="fade-right">
            Sobre o Studio
          </h2>
          <p className="text-lg font-poppins text-muted-foreground leading-relaxed" data-aos="fade-right">
            {studio?.sobre ? (
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
                ! Especialista em sobrancelhas naturais!
              </>
            )}
          </p>

          <div className="space-y-6">
            {["Técnicas modernas e seguras", "Produtos de alta qualidade", "Atendimento humanizado", "Resultados naturais e duradouros"].map((text) => (
              <div key={text} className="flex items-center gap-4">
                <div style={{ backgroundColor: "#D4AF37" }} className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-foreground font-poppins text-lg" data-aos="fade-right">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center md:justify-end" data-aos="fade-left">
          <img
            src={studio?.foto_studio || undefined}
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
