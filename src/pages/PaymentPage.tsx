import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Phone,
  User,
  MapPin,
  CreditCard,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AppointmentData {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message: string;
}

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const appointmentData = location.state?.appointmentData as AppointmentData;

  if (!appointmentData) {
    navigate("/");
    return null;
  }

  const getServicePrice = (service: string) => {
    const prices: { [key: string]: number } = {
      design: 80,
      microblading: 350,
      henna: 60,
      laminacao: 120,
      consulta: 50,
    };
    return prices[service] || 0;
  };

  const getServiceName = (service: string) => {
    const names: { [key: string]: string } = {
      design: "Design de Sobrancelhas",
      microblading: "Microblading",
      henna: "Henna para Sobrancelhas",
      laminacao: "Laminação de Sobrancelhas",
      consulta: "Consulta/Avaliação",
    };
    return names[service] || service;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const servicePrice = getServicePrice(appointmentData.service);
  const serviceFee = 10; // Taxa de agendamento
  const totalPrice = servicePrice + serviceFee;

  const handlePayment = () => {
    toast({
      title: "Agendamento Confirmado!",
      description: "Você receberá um WhatsApp com a confirmação em breve.",
    });

    // Simulate payment processing
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const handleBack = () => {
    navigate("/", { state: { appointmentData } });
  };

  return (
    <main className="min-h-screen bg-gradient-hero py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button variant="outline" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Confirme seu{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Agendamento
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Revise os dados e confirme o pagamento para finalizar
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Appointment Details */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <CheckCircle className="w-6 h-6 text-primary" />
                Detalhes do Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">Cliente</div>
                    <div className="text-muted-foreground">
                      {appointmentData.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">
                      Telefone
                    </div>
                    <div className="text-muted-foreground">
                      {appointmentData.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">Data</div>
                    <div className="text-muted-foreground">
                      {formatDate(appointmentData.date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">Horário</div>
                    <div className="text-muted-foreground">
                      {appointmentData.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">Local</div>
                    <div className="text-muted-foreground">
                      Rua das Sobrancelhas, 123
                      <br />
                      Centro - São Paulo, SP
                    </div>
                  </div>
                </div>

                {appointmentData.message && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground">
                        Observações
                      </div>
                      <div className="text-muted-foreground">
                        {appointmentData.message}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <CreditCard className="w-6 h-6 text-primary" />
                Resumo do Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Serviço</div>
                    <div className="text-sm text-muted-foreground">
                      {getServiceName(appointmentData.service)}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-primary text-white"
                  >
                    R$ {servicePrice},00
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">
                      Taxa de Agendamento
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Garantia de horário
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    R$ {serviceFee},00
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-lg font-bold">
                  <div className="text-foreground">Total</div>
                  <div className="text-primary">R$ {totalPrice},00</div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                  <div className="text-sm text-foreground">
                    <strong>Política de Pagamento:</strong>
                    <br />
                    • Taxa de agendamento não reembolsável
                    <br />
                    • Reagendamento até 3h antes
                    <br />• Pagamento do serviço no local
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Confirmar e Pagar R$ {totalPrice},00
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ao confirmar, você concorda com nossos termos de serviço
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;
