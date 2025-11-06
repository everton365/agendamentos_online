import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface PixPaymentData {
  payment_id: number;
  qr_code_base64: string;
  qr_code_text: string;
  status: string;
}

const PixPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const pixPaymentData = location.state?.pixPaymentData as PixPaymentData;

  const [qrCodeError, setQrCodeError] = useState(false);
  const [qrCodeLoading, setQrCodeLoading] = useState(true);

  useEffect(() => {
    if (!pixPaymentData) {
      navigate("/pagamento");
    }
  }, [pixPaymentData, navigate]);

  const copyPixCode = () => {
    if (pixPaymentData?.qr_code_text) {
      navigator.clipboard.writeText(pixPaymentData.qr_code_text);
      toast({
        title: "Copiado!",
        description: "O código PIX foi copiado para a área de transferência.",
      });
    }
  };

  if (!pixPaymentData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
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
              Pagamento via{" "}
              <span className="text-primary">PIX</span>
            </h1>
            <p className="text-muted-foreground">
              Escaneie o QR Code ou use o código copia e cola
            </p>
          </div>

          <div className="space-y-4">
            {/* QR Code Section */}
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
            </Card>

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
                  Ou copie o código abaixo e cole no seu app de pagamento
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
                    <Button
                      onClick={copyPixCode}
                      className="w-full"
                      size="lg"
                    >
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
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Após realizar o pagamento:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Você receberá uma confirmação por e-mail</li>
                      <li>• Seu agendamento será confirmado automaticamente</li>
                      <li>• Pode levar alguns minutos para processar</li>
                    </ul>
                  </div>
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
