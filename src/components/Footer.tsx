import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Instagram, Facebook, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Sobrancelhas Perfeitas
              </h3>
              <p className="text-background/80 mb-6 leading-relaxed">
                Especializada em design, microblading e técnicas avançadas para sobrancelhas. 
                Transforme seu olhar com resultados naturais e duradouros.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="text-background hover:text-primary hover:bg-background/10">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-background hover:text-primary hover:bg-background/10">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-background hover:text-primary hover:bg-background/10">
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-background">
                Contato
              </h4>
              <div className="space-y-3 text-background/80">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>(11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>contato@sobrancelhas.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <div>Rua das Sobrancelhas, 123</div>
                    <div>Centro - São Paulo, SP</div>
                    <div>CEP: 01000-000</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-background">
                Horário de Funcionamento
              </h4>
              <div className="space-y-2 text-background/80">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-medium">Segunda - Sexta</div>
                    <div className="text-sm">9h às 18h</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-medium">Sábado</div>
                    <div className="text-sm">9h às 15h</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary" />
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
              <p>
                &copy; 2024 Sobrancelhas Perfeitas. Todos os direitos reservados.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Termos de Uso
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;