import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Instagram, Facebook, Mail } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const Footer = () => {
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
                Lariza Freitas
              </h3>
              <p className="text-background/80 mb-6 leading-relaxed">
                Especializada em design, microblading e técnicas avançadas para
                sobrancelhas. Transforme seu olhar com resultados naturais e
                duradouros.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/larizafreitas/"
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
                <a
                  href="https://www.tiktok.com/@seuusuario"
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

                <a
                  href="https://www.facebook.com/lariza.freitas"
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
                  href="mailto:larizafreitas73@gmail.com"
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
                  <span>(85) 98419-2379</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail
                    style={{ color: "#D4AF37" }}
                    className="w-4 h-4 text-primary"
                  />
                  <span>larizafreitas73@gmail.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin
                    style={{ color: "#D4AF37" }}
                    className="w-4 h-4 text-primary mt-1"
                  />
                  <div>
                    <div>Rua Otoni Sá, 395</div>
                    <div>Centro - Aquiraz - CE</div>
                    <div>CEP: 61700-000</div>
                  </div>
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
                      <div className="text-sm">Fechado</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Terça</div>
                      <div className="text-sm">9h às 14h</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Quarta</div>
                      <div className="text-sm">9h às 17h</div>
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
                      <div className="font-medium">Quinta e Sexta</div>
                      <div className="text-sm">9h às 18h</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Sabado</div>
                      <div className="text-sm">Fechado</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Domingo</div>
                      <div className="text-sm">Fechado</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-background/20 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-background/60">
                <p>&copy; 2024 Lariza Freitas. Todos os direitos reservados.</p>
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
