import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
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
import WhatsAppButton from "../components/whatsappButton";
const baseaCESS = import.meta.env.VITE_PAGO_ACESS;
initMercadoPago(baseaCESS);
interface AppointmentData {
  name: string;
  phone: string;
  email: string;
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const appointmentData = location.state?.appointmentData as AppointmentData;
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [preferenceUrl, setPreferenceUrl] = useState(null);
  const [appointmentId, setAppointmentId] = useState<string>(
    () => localStorage.getItem("appointmentId") || ""
  );
  const [userRole, setUserRole] = useState<string | null>(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [adjustedPrice, setAdjustedPrice] = useState(0);
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [pixPaymentData, setPixPaymentData] = useState<{
    payment_id: number;
    qr_code_base64: string;
    qr_code_text: string;
    status: string;
  } | null>(null);
  const studioId = import.meta.env.VITE_STUDIO_ID;
  // Redirect if no appointment data
  if (!appointmentData) {
    navigate("/agendamento");
    return null;
  }
  useEffect(() => {
    if (!user) return;

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .eq("studio_id", studioId)
          .single<{ role: string }>();

        if (error) throw error;

        setUserRole(data?.role || "user");
        console.log("Role do usuário:", data?.role);
      } catch (err) {
        console.error("Erro ao buscar role do usuário:", err);
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, []);
  useEffect(() => {
    const numericPrice = Number(appointmentData.price); // converte string para number
    const newPrice = numericPrice < 20 ? numericPrice : 20;
    setAdjustedPrice(newPrice);
  }, [appointmentData.price]);

  console.log("matadata", appointmentData);
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

  const formatPrice = (price: number): string => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
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

  const Price = getServicePrice(appointmentData.price);
  const bookingFee = 20; // R$ 20,00 booking fee
  const totalPrice = bookingFee; // Only charge booking fee via Stripe
  const baseURL = import.meta.env.VITE_API_PAGAMENTO;
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
    if (!appointmentData || appointmentId || !userRole) return;

    const runFlow = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw new Error("Usuário não autenticado");
        console.log("Usuário logado:", user);

        // Dados do agendamento
        const bodyData = {
          ...appointmentData,
          totalPrice,
          user_id: user.id,
        } as any;

        // Se for admin, já confirma o agendamento
        if (userRole === "admin") {
          bodyData.status = "CONFIRMED"; // envia para o backend já como confirmado
        }

        const response = await fetch(`${baseURL}/user/create-appointment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });

        if (!response.ok) throw new Error("Erro ao criar agendamento");

        const data = await response.json();
        const { appointmentId: newAppointmentId, status } = data;

        setAppointmentId(newAppointmentId);
        localStorage.setItem("appointmentId", newAppointmentId);

        // Se admin, redireciona direto
        if (userRole === "admin" || status === "CONFIRMED") {
          navigate("/perfil");
          return;
        }

        // Para usuários normais, calcula preço ajustado para PIX
        const numericPrice = Number(
          String(appointmentData.price)
            .replace(/[^\d,.-]/g, "")
            .replace(",", ".")
        );
        const newPrice = numericPrice < 20 ? numericPrice : 20;
        setAdjustedPrice(newPrice);
      } catch (error) {
        console.error("Erro no fluxo de agendamento:", error);
        toast({
          title: "Erro",
          description: "Não foi possível criar o agendamento.",
        });
      } finally {
        setLoading(false);
      }
    };

    runFlow();
  }, [appointmentData, appointmentId, userRole]);

  const handlePixPayment = async () => {
    if (!appointmentId) {
      toast({
        title: "Erro",
        description: "ID do agendamento não encontrado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("📌 Gerando PIX para appointmentId:", appointmentId);

      // Aqui você envia os dados do usuário diretamente
      const response = await fetch(`${baseURL}/user/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: appointmentId,
              title: "Taxa de agendamento",
              quantity: 1,
              unit_price: adjustedPrice,
              email: appointmentData.email,
              first_name: appointmentData.name,
              last_name: "", // ou você pode separar se tiver sobrenome
            },
          ],
        }),
      });

      console.log("📌 Resposta do backend:", response.status);

      if (!response.ok) throw new Error("Erro ao gerar PIX");

      const data = await response.json();
      console.log("📌 Dados do PIX recebidos:", data);

      setPixPaymentData(data);
      setShowPixDialog(true);
      localStorage.removeItem("appointmentId");
      localStorage.removeItem("preferenceUrl");

      toast({
        title: "PIX gerado com sucesso!",
        description: "Use o QR Code para efetuar o pagamento.",
      });
    } catch (error: any) {
      console.error("❌ Erro ao gerar PIX:", error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    if (pixPaymentData?.qr_code_text) {
      navigator.clipboard.writeText(pixPaymentData.qr_code_text);
      toast({
        title: "Copiado!",
        description: "O código PIX foi copiado para a área de transferência.",
      });
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
              Finalize seu{" "}
              <span
                style={{ color: "#D4AF37" }}
                className="bg-gradient-primary bg-clip-text text-transparent"
              >
                Pagamento
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Para confirmar seu agendamento, click em ' Finalizar pagamento'.
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
                      Rua Otoni Sá,395 -Centro-Aquiraz- CE
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
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
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
                  <li>
                    • O agendamento ficará reservado por 20 minutos. Após esse
                    período, se o pagamento não for confirmado, ele voltará a
                    ficar disponível.
                  </li>
                  <li>• Pagamento do serviço no lacal</li>
                  <li>• Pagamento da taxa via Pix</li>
                  <li>• Reagendamento gratuito até 3 horas antes do horário</li>
                  <li>
                    • Após o prazo de 3 horas, será necessário pagar nova taxa
                    para agendamento
                  </li>
                  <li>• Não comparecimento: taxa não será reembolsada</li>
                  <li>• Tolerância de atraso: 10 minutos</li>
                </ul>
              </div>
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

                <div className="space-y-4 mt-6">
                  {appointmentId && (
                    <Button
                      onClick={handlePixPayment}
                      disabled={loading || !acceptedPolicy}
                      size="lg"
                      className="w-full text-white flex justify-center items-center py-8"
                      style={{ backgroundColor: "#D4AF37" }}
                    >
                      {loading ? (
                        "Processando..."
                      ) : (
                        <>
                          <Smartphone className="w-5 h-5 mr-2" />
                          Pagar com PIX {formatPrice(adjustedPrice)}
                        </>
                      )}
                    </Button>
                  )}
                </div>
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
      <Dialog
        open={showPixDialog}
        onOpenChange={(open) => {
          // evita fechar clicando fora
          if (open) setShowPixDialog(true);
        }}
        modal={true} // importante: modo modal impede fechar fora/ESC
      >
        <DialogContent className="max-w-lg max-h-[90vh] mx-auto overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-cinzel text-center">
              PIX - Pagamento Instantâneo
            </DialogTitle>
            <DialogDescription className="text-center">
              Escaneie o QR Code ou copie o código para efetuar o pagamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* QR Code */}
            {pixPaymentData?.qr_code_base64 && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${pixPaymentData.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="w-64 h-64 border-2 border-primary/20 rounded-lg p-2"
                />
              </div>
            )}

            {/* Código PIX para copiar */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Código PIX (Copia e Cola):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixPaymentData?.qr_code_text || ""}
                  className="flex-1 px-3 py-2 border rounded-md text-sm bg-secondary/50"
                />
                <Button
                  onClick={copyPixCode}
                  size="sm"
                  style={{ backgroundColor: "#D4AF37" }}
                  className="text-white"
                >
                  Copiar
                </Button>
              </div>
            </div>

            {/* Informações do pagamento */}
            <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-semibold">
                  {formatPrice(adjustedPrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold capitalize">
                  {pixPaymentData?.status}
                </span>
              </div>
            </div>

            {/* Instruções de pagamento */}
            <div className="bg-primary/5 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Como pagar:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Abra o aplicativo do seu banco ou carteira digital</li>
                <li>Escolha a opção "PIX" ou "Ler QR Code"</li>
                <li>Escaneie o QR Code acima ou cole o código copiado</li>
                <li>Confirme os dados e finalize o pagamento</li>
                <li>O pagamento é processado instantaneamente</li>
              </ol>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowPixDialog(false);
                  navigate("/perfil");
                }}
                className="flex-1"
                style={{ backgroundColor: "#D4AF37" }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Já fiz o pagamento
              </Button>
              <Button
                onClick={() => setShowPixDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <WhatsAppButton />
    </div>
  );
};

export default PaymentMethodPage;
