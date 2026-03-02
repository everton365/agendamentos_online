import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Instagram, Facebook, Mail } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useStudio } from "@/contexts/StudioContext";
import type { StudioData } from "@/hooks/use-studio-page";

interface Footer {
  studio: StudioData | null;
}

const Footer = () => {
  const { studio } = useStudio();
  if (!studio) return null;

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3
                style={{ color: "#D4AF37" }}
                className="text-2xl font-cinzel font-extrabold text-foreground mb-4 text-[#D4AF37] bg-clip-text text-transparent"
              >
                {studio?.nome_studio}
              </h3>
              <p className="text-background/80 mb-6 leading-relaxed">
                {studio?.description_studio ||
                  "Descrição do estúdio não informada."}
              </p>
              <div className="flex gap-4">
                <a
                  href={studio?.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-background hover:text-[#D4AF37] hover:bg-background/10"
                  >
                    <Instagram className="w-5 h-5" />
                  </Button>
                </a>
                {studio?.tiktokLink ? (
                  <a
                    href={studio.tiktokLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-background hover:text-[#D4AF37] hover:bg-background/10"
                    >
                      <SiTiktok className="w-5 h-5" />
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    className="text-gray-500 cursor-not-allowed"
                  >
                    <SiTiktok className="w-5 h-5" />
                  </Button>
                )}
                <a
                  href={studio?.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-background hover:text-[#D4AF37] hover:bg-background/10"
                  >
                    <Facebook className="w-5 h-5" />
                  </Button>
                </a>

                <a
                  href={`mailto:${studio?.email}`}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-background hover:text-[#D4AF37] hover:bg-background/10 transition"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-background">
                Contato
              </h4>
              <div className="space-y-3 text-background/80">
                <div className="flex items-center gap-3">
                  <Phone
                    style={{ color: "#D4AF37" }}
                    className="w-4 h-4 text-primary"
                  />
                  <span>{studio?.contato}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail
                    style={{ color: "#D4AF37" }}
                    className="w-4 h-4 text-primary"
                  />
                  <span>{studio?.email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin
                    style={{ color: "#D4AF37" }}
                    className="w-4 h-4 text-primary mt-1"
                  />
                  {studio?.endereco ? (
                    <div className="whitespace-pre-line">
                      {studio.endereco.replace(/ {2,}/g, "\n")}
                    </div>
                  ) : (
                    <div className="text-background/60 italic">
                      Endereço não informado
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-background">
                Horário de Funcionamento
              </h4>
              <div className="grid grid-cols-2 gap-2 text-background/80">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Segunda</div>
                      <div className="text-sm">
                        {" "}
                        {studio.horario_funcionamento?.segunda?.abertura &&
                        studio.horario_funcionamento?.segunda?.fechamento
                          ? `${studio.horario_funcionamento.segunda.abertura} às ${studio.horario_funcionamento.segunda.fechamento}`
                          : "Fechado"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Terça</div>
                      <div className="text-sm">
                        {" "}
                        {studio.horario_funcionamento?.terca?.abertura &&
                        studio.horario_funcionamento?.terca?.fechamento
                          ? `${studio.horario_funcionamento.terca.abertura} às ${studio.horario_funcionamento.terca.fechamento}`
                          : "Fechado"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Quarta</div>
                      <div className="text-sm">
                        {" "}
                        {studio.horario_funcionamento?.quarta?.abertura &&
                        studio.horario_funcionamento?.quarta?.fechamento
                          ? `${studio.horario_funcionamento.quarta.abertura} às ${studio.horario_funcionamento.quarta.fechamento}`
                          : "Fechado"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 min-w-[150px]">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Quinta</div>
                      <div className="text-sm">
                        {" "}
                        {studio.horario_funcionamento?.quinta?.abertura &&
                        studio.horario_funcionamento?.quinta?.fechamento
                          ? `${studio.horario_funcionamento.quinta.abertura} às ${studio.horario_funcionamento.quinta.fechamento}`
                          : "Fechado"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">sexta</div>
                      <div className="text-sm">
                        {" "}
                        {studio.horario_funcionamento?.sexta?.abertura &&
                        studio.horario_funcionamento?.sexta?.fechamento
                          ? `${studio.horario_funcionamento.sexta.abertura} às ${studio.horario_funcionamento.sexta.fechamento}`
                          : "Fechado"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Sabado</div>
                      <div className="text-sm">
                        {" "}
                        {studio.horario_funcionamento?.sabado?.abertura &&
                        studio.horario_funcionamento?.sabado?.fechamento
                          ? `${studio.horario_funcionamento.sabado.abertura} às ${studio.horario_funcionamento.sabado.fechamento}`
                          : "Fechado"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Domingo</div>
                      <div className="text-sm">
                        {" "}
                        {studio.horario_funcionamento?.domingo?.abertura &&
                        studio.horario_funcionamento?.domingo?.fechamento
                          ? `${studio.horario_funcionamento.domingo.abertura} às ${studio.horario_funcionamento.domingo.fechamento}`
                          : "Fechado"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-background/20 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-background/60">
                <p>
                  &copy; 2024 {studio?.nome_studio}. Todos os direitos
                  reservados.
                </p>
                <div className="flex gap-6 text-sm">
                  <a
                    href="#"
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    Política de Privacidade
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    Termos de Uso
                  </a>
                  <a
                    href="https://sistema-agendamento-online.vercel.app/"
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    Tenha seu próprio site
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
