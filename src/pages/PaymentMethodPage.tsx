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
  const { studio, studioId, slug } = useStudio();
  const [ruleStudio, setRuleStudio] = useState<
    { id: string; rules_orden: number; rules: string; studio_id: string }[]
  >([]);
  const baseURL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";
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
  const [userRole, setUserRole] = useState<string | null>("user");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  // Fetch rules do studio usando o slug do contexto
  useEffect(() => {
    if (!slug) return;
    const fetchRules = async () => {
      try {
        const response = await fetch(
          `${baseURL_API}/user/studioRules/${studio.studio_id}`,
        );
        if (response.ok) {
          const data = await response.json();

          const rules = data.data || [];
          setRuleStudio(rules);
        }
      } catch (err) {
        console.error("Erro ao buscar regras do studio:", err);
      }
    };
    fetchRules();
  }, [slug, baseURL_API]);

  // Redirect if no appointment data
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

  const studioTaxa = studio?.studio_taxa || "0";
  const taxaType = studio?.taxa_type || "fixed";

  const getTotalServicesPrice = () => {
    return appointments.reduce((total, apt) => {
      const priceStr = apt.price || "R$ 0";
      const priceValue = parseFloat(
        priceStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim(),
      );
      return total + (isNaN(priceValue) ? 0 : priceValue);
    }, 0);
  };

  const getIndividualBookingFee = (apt: AppointmentData) => {
    const taxaValue = parseFloat(studioTaxa);
    if (isNaN(taxaValue) || taxaValue === 0) return 0;

    if (taxaType === "percent") {
      const priceStr = apt.price || "R$ 0";
      const priceValue = parseFloat(
        priceStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim(),
      );
      return isNaN(priceValue) ? 0 : priceValue * (taxaValue / 100);
    }
    return taxaValue;
  };

  const getTotalBookingFee = () => {
    return appointments.reduce(
      (total, apt) => total + getIndividualBookingFee(apt),
      0,
    );
  };

  const totalBookingFee = getTotalBookingFee();
  useEffect(() => {
    if (!user) return;

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .eq("studio_id", studio.studio_id)
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

  const totalPrice = totalBookingFee;
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
          const individualFee = getIndividualBookingFee(apt);
          const bodyData = {
            ...apt,
            totalPrice: individualFee,
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

  return (
    <div className="min-h-screen bg-gradient-hero pt-16">
      <Header studioH={studio} />

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
                      Taxa de agendamento (
                      {taxaType === "percent"
                        ? `${studioTaxa}%`
                        : `${appointments.length} × R$ ${parseFloat(studioTaxa).toFixed(2).replace(".", ",")}`}
                      ):
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
                  {ruleStudio?.map((rule) => (
                    <li key={rule.rules_orden}>
                      •{" "}
                      {rule.rules
                        .split(" ")
                        .map((word, i) =>
                          word === word.toUpperCase() && word.match(/[A-Z]/) ? (
                            <strong key={i}>{word} </strong>
                          ) : (
                            word + " "
                          ),
                        )}
                    </li>
                  ))}
                </ul>
              </div>
              <CardHeader>
                <CardTitle className="text-foreground">
                  Confirmar e Pagar
                </CardTitle>
              </CardHeader>
              <CardContent>
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
