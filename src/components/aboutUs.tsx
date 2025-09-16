import donaEstudio from "../assets/dona-estudio.jpg"; // troque pelo caminho da foto real

const AboutUs = () => {
  return (
    <section
      id="about"
      className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
    >
      {/* Texto */}
      <div className="space-y-6">
        <h2
          className="text-3xl font-bold text-foreground"
          data-aos="fade-right"
        >
          Sobre o Studio
        </h2>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-aos="fade-right"
        >
          Bem-vindo ao{" "}
          <span className="font-semibold">Lariza Freitas Studio</span>{" "}
          Especialista em sobrancelhas naturais! Aqui, minha paixão pela beleza
          e a precisão técnica se encontram. Minha missão é realçar a sua beleza
          única, criando um design de sobrancelhas impecável e totalmente
          personalizado. Eu uso as técnicas mais modernas e produtos da mais
          alta qualidade para garantir resultados espetaculares e a sua total
          satisfação.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: "#D4AF37" }}
              className="w-2 h-2 bg-primary rounded-full"
            ></div>
            <span className="text-foreground" data-aos="fade-right">
              Técnicas modernas e seguras
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: "#D4AF37" }}
              className="w-2 h-2 bg-primary rounded-full"
            ></div>
            <span className="text-foreground" data-aos="fade-right">
              Produtos de alta qualidade
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: "#D4AF37" }}
              className="w-2 h-2 bg-primary rounded-full"
            ></div>
            <span className="text-foreground" data-aos="fade-right">
              Atendimento humanizado
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: "#D4AF37" }}
              className="w-2 h-2 bg-primary rounded-full"
            ></div>
            <span className="text-foreground" data-aos="fade-right">
              Resultados naturais e duradouros
            </span>
          </div>
        </div>
      </div>

      {/* Foto da dona */}
      <div className="flex justify-center md:justify-end" data-aos="fade-left">
        <img
          src={donaEstudio}
          alt="Dona do Estúdio"
          className="w-full h-full object-cover rounded-2xl shadow-lg border-4 border-white"
          data-aos="fade-left"
        />
      </div>
    </section>
  );
};

export default AboutUs;
