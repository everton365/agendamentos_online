import { useEffect, useState } from "react";
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
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

initMercadoPago("APP_USR-0c010b18-da83-4d1b-8aef-318f67dcf14d");
interface AppointmentData {
  name: string;
  phone: string;
  service: string;
  price: string;
  date: string;
  time: string;
  duration: string;
  message?: string;
}
interface PixResponse {
  pixId: string;
  expiresAt: string;
  qrCodeBase64: string;
  copiaEcola: string;
  error?: string;
}

const PaymentMethodPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const appointmentData = location.state?.appointmentData as AppointmentData;
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [preferenceUrl, setPreferenceUrl] = useState(null);
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  // Redirect if no appointment data
  if (!appointmentData) {
    navigate("/agendamento");
    return null;
  }

  useEffect(() => {
    const savedAppointmentId = localStorage.getItem("appointmentId");
    console.log("tem salvo", savedAppointmentId);
    if (savedAppointmentId) {
      setPreferenceUrl(savedAppointmentId);
    }
  }, []);
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
  console.log("dados passados", appointmentData.price);
  const Price = getServicePrice(appointmentData.price);
  const bookingFee = 2000; // R$ 20,00 booking fee
  const totalPrice = bookingFee; // Only charge booking fee via Stripe
  const baseURL = import.meta.env.VITE_API_URL;
  const paymentMethods = [
    {
      id: "pix",
      name: "PIX",
      description: "Pagamento instantâneo",
      icon: Smartphone,
      popular: false,
    },
  ];

  {
    /*const handlePayment = async () => {
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

        const response = await fetch(`${baseURL}/user/create-pix`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData), // <-- enviar direto
        });
        console.log("Status da resposta:", response.status);
        const data: PixResponse = await response.json();
        console.log(data);

        if (data.error) throw new Error(data.error);

        setPixQRCode(data.qrCodeBase64);
        setPixData(data);
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
  };*/
  }

  useEffect(() => {
    if (!appointmentData || preferenceUrl) return;
    const savedAppointmentId = localStorage.getItem("appointmentId");
    if (savedAppointmentId) {
      setAppointmentId(savedAppointmentId);

      return; // não cria novo agendamento nem preferência
    }
    const runFlow = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Usuário não autenticado");
        console.log("Usuário logado:", user);
        // Função interna para criar o agendamento
        const createAppointment = async (appointmentData: AppointmentData) => {
          const bodyData = { ...appointmentData, totalPrice, user_id: user.id }; // adicione totalPrice e user_id se precisar
          console.log("dados para o banco ", bodyData);
          const response = await fetch(`${baseURL}/user/create-appointment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData),
          });

          if (!response.ok) throw new Error("Erro ao criar agendamento");

          const data = await response.json();
          console.log("📥 Resposta do backend:", data);
          return data.appointmentId;
        };

        // Função interna para criar a preferência de pagamento
        const createPreference = async (appointmentId: string) => {
          const response = await fetch(`${baseURL}/user/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: [
                {
                  id: appointmentId,
                  title: "Taxa de agendamento",
                  quantity: 1,
                  unit_price: 1,
                },
              ],
            }),
          });
          if (!response.ok)
            throw new Error("Erro ao criar preferência de pagamento");
          const data = await response.json();
          setPreferenceUrl(data.preference_url);
          localStorage.setItem("appointmentId", data.preference_url);
        };

        const id = await createAppointment(appointmentData);
        setAppointmentId(id);
        await createPreference(id);
      } catch (error) {
        console.error("Erro no fluxo de agendamento e checkout:", error);
        toast({
          title: "Erro",
          description: "Não foi possível criar o agendamento ou checkout.",
        });
      } finally {
        setLoading(false);
      }
    };

    runFlow();
  }, [appointmentData, appointmentId]);
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
              Para confirmar seu agendamento, selecione sua forma de pagamento
              clicando em 'Pagar com Mercado Pago'.
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
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">
                      {appointmentData.duration}
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
                    <span>{appointmentData.price}</span>
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
                    Política de Pagamento e reagendamento
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Taxa de agendamento de R$ 20,00 para confirmar o horário
                      (será descontada do valor do serviço)
                    </li>
                    <li>• Pagamento do serviço no lacal</li>
                    <li>• Pagamento da taxa via Pix ou cartão de crédito</li>
                    <li>
                      • Reagendamento gratuito até 3 horas antes do horário
                    </li>
                    <li>
                      • Após o prazo de 3 horas, será necessário pagar nova taxa
                      para reagendamento
                    </li>
                    <li>• Não comparecimento: taxa não será reembolsada</li>
                    <li>• Tolerância de atraso: 10 minutos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Confirmar e Pagar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/*
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
*/}

                <label className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    checked={acceptedPolicy}
                    onChange={(e) => setAcceptedPolicy(e.target.checked)}
                    className="accent-primary w-6 h-6"
                  />
                  <span className="text-sm text-muted-foreground">
                    Li e aceito a política de pagamento e reagendamento
                  </span>
                </label>
                {preferenceUrl && (
                  <Button
                    onClick={() => {
                      localStorage.removeItem("appointmentId");
                      // Redireciona para a preferência de pagamento
                      window.location.href = preferenceUrl;
                    }}
                    disabled={loading || !acceptedPolicy}
                    variant="primary"
                    size="lg"
                    className="w-full mt-6 flex justify-center items-center py-8"
                  >
                    {loading ? (
                      "Processando..."
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Pagar com Mercado Pago {formatPrice(totalPrice)}
                      </>
                    )}
                  </Button>
                )}
                {/*
                <Button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || loading}
                  variant="primary"
                  size="lg"
                  className="w-full mt-6 flex justify-center items-center"
                >
                  {loading ? (
                    "Processando..."
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirmar e Pagar {formatPrice(totalPrice)}
                    </>
                  )}
                </Button>
                */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Modal PIX */}
      {pixQRCode && (
        <Dialog
          open={!!pixQRCode}
          onOpenChange={(open) => {
            // bloqueia fechamento automático
            if (!open) setPixQRCode(pixQRCode);
          }}
        >
          <DialogContent className="max-w-lg max-h-[100vh] mx-auto text-center overflow-y-auto">
            <DialogHeader>
              <DialogTitle>PIX - Pague usando o QR Code</DialogTitle>
              <DialogDescription>
                Abra o aplicativo do seu banco e escaneie o QR Code abaixo:
              </DialogDescription>
            </DialogHeader>

            {/* QR Code */}
            <img src={pixQRCode} alt="QR Code PIX" className="mx-auto my-4" />

            {/* Informações do PIX */}
            <div className="text-left text-sm mt-1">
              <p>
                <strong>Identificação:</strong> {pixData?.pixId}
              </p>
              <p>
                <strong>Expira em:</strong>{" "}
                {new Date(pixData?.expiresAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>

            {/* Copia e cola do PIX */}
            {pixData?.copiaEcola && (
              <div className="flex flex-col items-center mt-1 space-y-2">
                <input
                  type="text"
                  readOnly
                  value={pixData.copiaEcola}
                  className="flex-1 w-full border rounded py-1 text-sm text-center"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.copiaEcola);
                    toast({
                      title: "Copiado!",
                      description:
                        "O código PIX foi copiado para a área de transferência.",
                    });
                  }}
                >
                  Copiar
                </Button>
              </div>
            )}

            {/* Passo a passo do pagamento */}
            <div className="text-left mt-1 p-2 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Como pagar:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra o aplicativo do seu banco ou carteira digital.</li>
                <li>Escolha a opção "PIX" ou "Pagamento via QR Code".</li>
                <li>Escaneie o QR Code exibido acima.</li>
                <li>Confirme os dados do pagamento.</li>
                <li>Finalize a transação.</li>
              </ol>
            </div>

            {/* Botão Fechar */}
            <Button
              onClick={() => {
                setPixQRCode(null);
                navigate("/perfil");
              }}
              className="mt-4"
            >
              Ja fiz o pagamento
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PaymentMethodPage;
