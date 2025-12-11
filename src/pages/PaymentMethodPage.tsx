import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  DollarSign,
  Info,
  CheckCircle,
} from "lucide-react";
import { useStudio } from "@/contexts/StudioContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import WhatsAppButton from "../components/whatsappButton";
const baseaCESS = import.meta.env.VITE_PAGO_ACESS;
initMercadoPago(baseaCESS);
import { useCart } from "@/contexts/CartContext";

interface AppointmentData {
  name: string;
  phone: string;
  email: string;
  service: string;
  price: string;
  date: string;
  time: string;
  studio_id: string;
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
  const { studio } = useStudio();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const appointments = (location.state?.appointments ||
    []) as AppointmentData[];
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [preferenceUrl, setPreferenceUrl] = useState(null);
  const [appointmentIds, setAppointmentIds] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const studioId = import.meta.env.VITE_STUDIO_ID;
  const [paymentDataLoading, setPaymentDataLoading] = useState(true);

  // Redirect if no appointment data
  if (!appointments || appointments.length === 0) {
    navigate("/agendamento");
    return null;
  }
  useEffect(() => {
    if (!appointments || appointments.length === 0) {
      navigate("/agendamento", { replace: true });
    }
  }, [appointments, navigate]);
  useEffect(() => {
    const saved = localStorage.getItem("appointmentIds");
    if (saved) {
      setAppointmentIds(JSON.parse(saved));
    }
  }, []);

  const totalBookingFee = appointments.length * 20; // R$ 20 por agendamento

  const getTotalServicesPrice = () => {
    return appointments.reduce((total, apt) => {
      const priceStr = apt.price || "R$ 0";
      const priceValue = parseFloat(
        priceStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
      );
      return total + (isNaN(priceValue) ? 0 : priceValue);
    }, 0);
  };
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
      } catch (err) {
        console.error("Erro ao buscar role do usuário:", err);
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const savedAppointmentId = localStorage.getItem("appointmentId");

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

  const Price = 0; // Not used anymore
  const bookingFee = 20; // R$ 20,00 booking fee per appointment
  const totalPrice = totalBookingFee; // Total booking fee
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
    if (!userRole) return;
    if (!appointments || appointments.length === 0 || appointmentIds.length > 0)
      return;

    const runFlow = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw new Error("Usuário não autenticado");

        const createdIds: string[] = [];

        // Criar todos os agendamentos
        for (const apt of appointments) {
          const bodyData = {
            ...apt,
            totalPrice: bookingFee,
            user_id: user.id,
          } as any;

          // Se for admin, já confirma o agendamento
          if (userRole === "admin") {
            bodyData.status = "CONFIRMED";
          }

          const response = await fetch(`${baseURL}/user/create-appointment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData),
          });

          if (!response.ok) throw new Error("Erro ao criar agendamento");

          const data = await response.json();
          createdIds.push(data.appointmentId);
        }

        setAppointmentIds(createdIds);
        localStorage.setItem("appointmentIds", JSON.stringify(createdIds));

        // Se admin, redireciona direto
        if (userRole === "admin") {
          clearCart();
          navigate("/perfil");
          return;
        }
      } catch (error) {
        console.error("Erro no fluxo de agendamento:", error);
        toast({
          title: "Erro",
          description:
            "Não foi possível criar os agendamentos. Tente escolher outro horário.",
        });
        clearCart();
        navigate("/agendamento", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    runFlow();
  }, [appointments, appointmentIds, userRole]);

  const handlePixPayment = () => {
    if (!appointmentIds || appointmentIds.length === 0) {
      toast({
        title: "Erro",
        description: "IDs dos agendamentos não encontrados",
        variant: "destructive",
      });
      return;
    }

    // Redireciona para página PIX com múltiplos agendamentos
    navigate("/pagamento-pix", {
      state: {
        appointmentIds,
        appointments,
        adjustedPrice: totalPrice,
        baseURL,
      },
    });
  };
  console.log("studioId", totalPrice);
  return (
    <div className="min-h-screen bg-gradient-hero pt-16">
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
                  Resumo dos Agendamentos ({appointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {appointments.map((apt, index) => (
                  <div
                    key={index}
                    className="space-y-3 pb-4 border-b last:border-0"
                  >
                    <h3 className="font-semibold text-lg">
                      Agendamento {index + 1}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente:</span>
                        <span className="font-medium">{apt.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Serviço:</span>
                        <span className="font-medium">{apt.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span className="font-medium">{apt.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-medium">
                          {formatDate(apt.date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horário:</span>
                        <span className="font-medium">{apt.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Valor do serviço:
                        </span>
                        <span className="font-medium">{apt.price}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Price Breakdown */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span>Total dos serviços:</span>
                    <span>{formatPrice(getTotalServicesPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Taxa de agendamento ({appointments.length} × R$ 20):
                    </span>
                    <span>{formatPrice(totalBookingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total a pagar agora:</span>
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
                        Pagar com PIX {formatPrice(totalBookingFee)}
                      </>
                    )}
                  </Button>
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
      {/*  <WhatsAppButton />*/}
    </div>
  );
};

export default PaymentMethodPage;
