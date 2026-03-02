import { useEffect, useState, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { useCart } from "@/contexts/CartContext";

interface PixPaymentData {
  payment_id: number;
  qr_code_base64: string;
  qr_code_text: string;
  status: string;
}

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

const PixPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart, appointments } = useCart();
  const appointmentId = location.state?.appointmentIds;
  const appointmentData = location.state?.appointments as AppointmentData[];
  const adjustedPrice = location.state?.adjustedPrice;
  const baseURL = import.meta.env.VITE_API_PAGAMENTO || "http://localhost:3001";
  // tenta carregar um PIX salvo
  const savedPix = JSON.parse(localStorage.getItem("pixPaymentData") || "null");

  const [pixPaymentData, setPixPaymentData] = useState<PixPaymentData | null>(
    null,
  );
  const [qrCodeError, setQrCodeError] = useState(false);
  const [qrCodeLoading, setQrCodeLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId?.length || !appointmentData?.length || !baseURL) {
      toast({
        title: "Erro",
        description: "Dados do(s) agendamento(s) não encontrados",
        variant: "destructive",
      });
      navigate("/pagamento");
      return;
    }
    if (savedPix) {
      setPixPaymentData(savedPix);
      setLoading(false);
      return;
    }
    const fetchPixPayment = async () => {
      setLoading(true);

      const maxRetries = 2;

      try {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await fetch(`${baseURL}/user/checkout/taxa`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: appointmentData.map((apt, index) => ({
                  id: appointmentId[index],
                  title: `Agendamento - ${apt.service}`,
                  quantity: 1,
                  unit_price: adjustedPrice,
                  email: apt.email,
                  studioId: apt.studio_id,
                  first_name: apt.name,
                  last_name: "",
                })),
              }),
            });

            if (!response.ok) throw new Error("Erro ao gerar PIX");

            const data = await response.json();

            setPixPaymentData(data);
            localStorage.setItem("pixPaymentData", JSON.stringify(data));

            toast({
              title: "PIX gerado com sucesso!",
              description: "Use o QR Code ou código para pagar.",
            });

            return; // sucesso → sai do loop
          } catch (error: any) {
            console.error(`❌ Tentativa ${attempt} falhou`, error);

            if (attempt === maxRetries) {
              toast({
                title: "Erro no pagamento",
                description: error.message || "Tente novamente.",
                variant: "destructive",
              });

              navigate("/pagamento");
            } else {
              await new Promise((r) => setTimeout(r, 2000));
            }
          }
        }
      } finally {
        setLoading(false); // 🔥 sempre executa
      }
    };

    fetchPixPayment();
  }, [appointmentId, appointmentData, adjustedPrice, baseURL, navigate, toast]);

  const copyPixCode = () => {
    if (pixPaymentData?.qr_code_text) {
      navigator.clipboard.writeText(pixPaymentData.qr_code_text);
      toast({
        title: "Copiado!",
        description: "O código PIX foi copiado para a área de transferência.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero pt-16">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                Gerando pagamento PIX...
              </h2>
              <p className="text-muted-foreground text-center">
                Aguarde enquanto processamos sua solicitação
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pixPaymentData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero pt-16">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/pagamento")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Pagamento via <span className="text-primary">PIX</span>
            </h1>
            <p className="text-muted-foreground">
              Escaneie o QR Code ou use o código copia e cola
            </p>
          </div>

          <div className="space-y-4">
            {/* QR Code Section 
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">
                    1
                  </span>
                  Escaneie o QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Abra o app do seu banco e escaneie o QR Code abaixo
                </p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  {pixPaymentData?.qr_code_base64 && !qrCodeError ? (
                    <div className="relative">
                      {qrCodeLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                      )}
                      <img
                        src={`data:image/png;base64,${pixPaymentData.qr_code_base64}`}
                        alt="QR Code PIX"
                        className="w-64 h-64"
                        onLoad={() => setQrCodeLoading(false)}
                        onError={() => {
                          setQrCodeError(true);
                          setQrCodeLoading(false);
                          toast({
                            title: "Erro ao carregar QR Code",
                            description: "Use o código copia e cola abaixo.",
                            variant: "destructive",
                          });
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 flex flex-col items-center justify-center text-center p-4">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        QR Code não disponível.
                        <br />
                        Use o código copia e cola abaixo.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>*/}

            {/* Copy and Paste Section */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  Código Copia e Cola
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Copie o código abaixo e cole no seu app de pagamento
                </p>
                {pixPaymentData?.qr_code_text ? (
                  <>
                    <div className="relative">
                      <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                        <code className="text-xs font-mono break-all">
                          {pixPaymentData.qr_code_text}
                        </code>
                      </div>
                    </div>
                    <Button onClick={copyPixCode} className="w-full" size="lg">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar código PIX
                    </Button>
                  </>
                ) : (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">
                        Código PIX não disponível no momento
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Por favor, tente novamente ou entre em contato conosco.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="bg-primary/5 rounded-lg p-3">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Como pagar:
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Abra o aplicativo do seu banco ou carteira digital</li>
                    <li>Escolha a opção "PIX" </li>
                    <li>Cole o código copiado</li>
                    <li>Confirme os dados e finalize o pagamento</li>
                    <li>O pagamento é processado instantaneamente</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/perfil")}
                size="lg"
                className="flex-1"
                style={{ backgroundColor: "#D4AF37" }}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Já Paguei
              </Button>
              <Button
                onClick={() => navigate("/perfil")}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Perfil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixPaymentPage;
