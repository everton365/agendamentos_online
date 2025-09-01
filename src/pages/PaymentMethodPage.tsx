import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  DollarSign,
  Info,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentData {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message?: string;
}

const PaymentMethodPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const appointmentData = location.state?.appointmentData as AppointmentData;
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [loading, setLoading] = useState(false);

  // Redirect if no appointment data
  if (!appointmentData) {
    navigate("/agendamento");
    return null;
  }

  const getServicePrice = (service: string): number => {
    const prices: Record<string, number> = {
      design: 8000, // R$ 80,00 in cents
      microblading: 45000, // R$ 450,00 in cents
      henna: 6000, // R$ 60,00 in cents
      laminacao: 12000, // R$ 120,00 in cents
      consulta: 5000, // R$ 50,00 in cents
    };
    return prices[service] || 0;
  };

  const getServiceName = (service: string): string => {
    const names: Record<string, string> = {
      design: "Design de Sobrancelhas",
      microblading: "Microblading",
      henna: "Henna para Sobrancelhas",
      laminacao: "Laminação de Sobrancelhas",
      consulta: "Consulta/Avaliação",
    };
    return names[service] || service;
  };

  const formatPrice = (priceInCents: number): string => {
    return `R$ ${(priceInCents / 100).toFixed(2).replace(".", ",")}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const servicePrice = getServicePrice(appointmentData.service);
  const bookingFee = 2000; // R$ 20,00 booking fee
  const totalPrice = bookingFee; // Only charge booking fee via Stripe

  const paymentMethods = [
    {
      id: "credit_card",
      name: "Cartão de Crédito",
      description: "Visa, Mastercard, American Express",
      icon: CreditCard,
      popular: true,
    },
    {
      id: "pix",
      name: "PIX",
      description: "Pagamento instantâneo",
      icon: Smartphone,
      popular: false,
    },
  ];

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;

    setLoading(true);

    try {
      // Pega o usuário logado no Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Usuário não autenticado");

      console.log("Usuário logado:", user);

      if (selectedPaymentMethod === "pix") {
        // Inclui user_id nos dados do agendamento
        const bodyData = { ...appointmentData, totalPrice, user_id: user.id };

        console.log("Dados enviados para create-pix:", bodyData);

        const response = await fetch("http://localhost:3000/user/create-pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentData,
            totalPrice,
          }),
        });

        const data = await response.json();
        console.log("Resposta do backend PIX:", data);

        if (data.error) throw new Error(data.error);

        setPixQRCode(data.qrCodeBase64);
        toast({
          title: "PIX gerado com sucesso!",
          description: "Use o QR Code para efetuar o pagamento.",
        });
      } else {
        // Stripe: chama backend para criar checkout session
        const { supabase } = await import("@/integrations/supabase/client");

        console.log("Chamando supabase function create-payment...");
        const { data, error } = await supabase.functions.invoke(
          "create-payment",
          {
            body: { appointmentData },
          }
        );

        console.log("Supabase response data:", data);
        console.log("Supabase response error:", error);

        if (error) throw error;
        if (data?.url) {
          console.log("Abrindo Stripe checkout URL:", data.url);
          window.open(data.url, "_blank");
        }
      }
    } catch (error: any) {
      console.error("Erro no handlePayment:", error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/agendamento")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao agendamento
          </Button>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Escolha o{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Pagamento
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Selecione sua forma de pagamento preferida para confirmar o
              agendamento.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Appointment Summary */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Resumo do Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-medium">{appointmentData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="font-medium">{appointmentData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviço:</span>
                    <span className="font-medium">
                      {getServiceName(appointmentData.service)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium">
                      {formatDate(appointmentData.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-medium">{appointmentData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Local:</span>
                    <span className="font-medium">
                      Rua das Sobrancelhas, 123 - Centro, SP
                    </span>
                  </div>
                  {appointmentData.message && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground">
                        Observações:
                      </span>
                      <p className="mt-1 text-sm">{appointmentData.message}</p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span>Serviço:</span>
                    <span>{formatPrice(servicePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxa de agendamento:</span>
                    <span>{formatPrice(bookingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Payment Policy */}
                <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Política de Pagamento
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Pagamento necessário para confirmar agendamento</li>
                    <li>
                      • Cancelamento com 24h de antecedência: reembolso total
                    </li>
                    <li>• Reagendamento gratuito até 12h antes do horário</li>
                    <li>• Não comparecimento: valor não será reembolsado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Métodos de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="space-y-4"
                >
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="relative">
                      <Label
                        htmlFor={method.id}
                        className="flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <method.icon className="w-6 h-6 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{method.name}</span>
                            {method.popular && (
                              <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Payment Details Dialog */}
                {selectedPaymentMethod && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-4">
                        <Info className="w-4 h-4 mr-2" />
                        Ver detalhes do método selecionado
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detalhes do Pagamento</DialogTitle>
                        <DialogDescription>
                          {selectedPaymentMethod === "credit_card" && (
                            <div className="space-y-2">
                              <p>
                                • Pagamento processado via cartão de crédito
                              </p>
                              <p>• Cobrança aparecerá como "Beauty Clinic"</p>
                              <p>
                                • Parcelamento disponível em até 3x sem juros
                              </p>
                              <p>• Pagamento seguro via SSL</p>
                            </div>
                          )}
                          {selectedPaymentMethod === "pix" && (
                            <div className="space-y-2">
                              <p>• Pagamento instantâneo via PIX</p>
                              <p>• QR Code será gerado para pagamento</p>
                              <p>• Confirmação automática em poucos segundos</p>
                              <p>• Disponível 24h por dia</p>
                            </div>
                          )}
                          {selectedPaymentMethod === "cash" && (
                            <div className="space-y-2">
                              <p>• Pagamento em dinheiro na clínica</p>
                              <p>• Disponível no dia do atendimento</p>
                              <p>• Recomendamos levar o valor exato</p>
                              <p>
                                • Agendamento será confirmado antecipadamente
                              </p>
                            </div>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || loading}
                  variant="primary"
                  size="lg"
                  className="w-full mt-6"
                >
                  {loading ? (
                    "Processando..."
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirmar e Paga {formatPrice(totalPrice)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Modal PIX */}
      {pixQRCode && (
        <Dialog open={true} onOpenChange={() => setPixQRCode(null)}>
          <DialogContent className="max-w-sm mx-auto text-center">
            <DialogHeader>
              <DialogTitle>PIX - Pague usando o QR Code</DialogTitle>
              <DialogDescription>
                Abra o aplicativo do seu banco e escaneie o QR Code abaixo:
              </DialogDescription>
            </DialogHeader>
            <img src={pixQRCode} alt="QR Code PIX" className="mx-auto my-4" />
            <Button onClick={() => setPixQRCode(null)}>Fechar</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PaymentMethodPage;
