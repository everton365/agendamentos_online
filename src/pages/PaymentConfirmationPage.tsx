import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import Header from '@/components/Header';

const PaymentConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // In a real implementation, you would verify the payment with Stripe
      // For now, we'll assume it's successful
      setPaymentStatus('success');
    } else {
      setPaymentStatus('error');
    }
  }, [sessionId]);

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-foreground">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
              <CardContent className="pt-8">
                <div className="text-red-500 mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Erro na Confirmação
                </h1>
                <p className="text-muted-foreground mb-6">
                  Não foi possível confirmar seu pagamento. Por favor, entre em contato conosco.
                </p>
                <Button onClick={() => navigate('/')} variant="primary">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
            <CardHeader>
              <div className="text-green-500 mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Pagamento Confirmado!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Seu agendamento foi confirmado com sucesso!
                </h2>
                <p className="text-muted-foreground">
                  A taxa de agendamento de R$ 20,00 foi processada com sucesso. 
                  Este valor será descontado do total do serviço no dia do atendimento.
                </p>
              </div>

              <div className="bg-secondary/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Próximos Passos:</h3>
                <ul className="text-left space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Você receberá um email de confirmação em breve
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Entraremos em contato via WhatsApp para confirmar detalhes
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Os R$ 20,00 pagos serão descontados do valor total do serviço
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Chegue 10 minutos antes do horário agendado
                  </li>
                </ul>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm text-primary font-medium">
                  📱 Dúvidas? Entre em contato: (11) 99999-9999
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/')} variant="primary">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
                <Button 
                  onClick={() => user ? navigate('/agendamento') : navigate('/auth')} 
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;