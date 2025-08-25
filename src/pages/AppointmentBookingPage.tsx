import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

const AppointmentBookingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    message: ""
  });
  
  const [timeSlots, setTimeSlots] = useState<{time: string, status: 'available' | 'pending' | 'confirmed' | 'blocked'}[]>([]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Get all time slots with their status for a specific date
  const getTimeSlotsForDate = async (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    
    // Sunday is closed
    if (dayOfWeek === 0) {
      return [];
    }
    
    // All possible slots based on day
    let allSlots: string[] = [];
    if (dayOfWeek === 6) { // Saturday
      allSlots = ["09:00", "10:00", "11:00", "14:00", "15:00"];
    } else { // Weekdays
      allSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
    }
    
    // Check existing appointments for this date
    const { data: existingAppointments, error } = await supabase
      .from('appointments')
      .select('appointment_time, status')
      .eq('appointment_date', date);
    
    if (error) {
      console.error('Error fetching appointments:', error);
      return allSlots.map(time => ({ time, status: 'available' as const }));
    }
    
    // Create time slots with status
    const slotsWithStatus = allSlots.map(time => {
      const appointment = existingAppointments.find(apt => apt.appointment_time === time);
      if (!appointment) {
        return { time, status: 'available' as const };
      }
      return { 
        time, 
        status: appointment.status === 'confirmed' ? 'confirmed' as const : 
                appointment.status === 'pending' ? 'pending' as const : 'available' as const
      };
    });
    
    return slotsWithStatus;
  };

  // Save appointment to Supabase
  const saveAppointment = async (appointmentData: typeof formData) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        name: appointmentData.name,
        phone: appointmentData.phone,
        service: appointmentData.service,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        message: appointmentData.message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving appointment:', error);
      throw error;
    }

    return data;
  };

  const handleInputChange = async (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update time slots when date changes
    if (field === "date") {
      const slots = await getTimeSlotsForDate(value);
      setTimeSlots(slots);
      // Reset time selection when date changes
      setFormData(prev => ({ ...prev, time: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.service || !formData.date || !formData.time) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check availability one more time before saving
      const slots = await getTimeSlotsForDate(formData.date);
      const selectedSlot = slots.find(slot => slot.time === formData.time);
      if (!selectedSlot || selectedSlot.status !== 'available') {
        toast({
          title: "Horário indisponível",
          description: "Este horário não está mais disponível. Por favor, escolha outro.",
          variant: "destructive"
        });
        return;
      }

      // Save appointment to database
      const savedAppointment = await saveAppointment(formData);
      
      if (savedAppointment) {
        // Navigate to payment page with appointment data
        navigate("/pagamento", { state: { appointmentData: formData, appointmentId: savedAppointment.id } });
      }
    } catch (error) {
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro ao salvar seu agendamento. Tente novamente.",
        variant: "destructive"
      });
      console.error('Error saving appointment:', error);
    }
  };

  const serviceOptions = [
    { value: "design", label: "Design de Sobrancelhas", price: "R$ 80,00" },
    { value: "microblading", label: "Microblading", price: "R$ 450,00" },
    { value: "henna", label: "Henna para Sobrancelhas", price: "R$ 60,00" },
    { value: "laminacao", label: "Laminação de Sobrancelhas", price: "R$ 120,00" },
    { value: "consulta", label: "Consulta/Avaliação", price: "R$ 50,00" },
  ];

  const getServicePrice = (serviceValue: string) => {
    const service = serviceOptions.find(s => s.value === serviceValue);
    return service?.price || "";
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Agendar <span className="bg-gradient-primary bg-clip-text text-transparent">Consulta</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Preencha o formulário abaixo para agendar seu atendimento. 
              Após o preenchimento, você será direcionado para o pagamento.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Services Info */}
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-foreground">Nossos Serviços</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serviceOptions.map((service) => (
                    <div key={service.value} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                      <span className="font-medium text-foreground">{service.label}</span>
                      <span className="text-primary font-semibold">{service.price}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Clock className="w-5 h-5 text-primary" />
                    Horário de Funcionamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Segunda - Sexta:</span>
                      <span className="font-medium">9h às 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado:</span>
                      <span className="font-medium">9h às 15h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo:</span>
                      <span className="font-medium">Fechado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Form */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <Calendar className="w-6 h-6 text-primary" />
                  Dados do Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone/WhatsApp</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço Desejado</Label>
                    <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{service.label}</span>
                              <span className="text-primary font-semibold ml-4">{service.price}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.service && (
                      <p className="text-sm text-muted-foreground">
                        Preço: {getServicePrice(formData.service)}
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data Preferida</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Horários Disponíveis</Label>
                      {timeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map(slot => {
                            const isSelected = formData.time === slot.time;
                            const isAvailable = slot.status === 'available';
                            
                            return (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => isAvailable ? handleInputChange("time", slot.time) : null}
                                disabled={!isAvailable}
                                className={`
                                  p-3 rounded-lg text-sm font-medium transition-all border-2
                                  ${isSelected && isAvailable ? 'border-primary bg-primary text-primary-foreground' : 
                                    isAvailable ? 'border-[hsl(var(--status-available))] bg-[hsl(var(--status-available)/0.1)] text-[hsl(var(--status-available))] hover:bg-[hsl(var(--status-available)/0.2)]' :
                                    slot.status === 'pending' ? 'border-[hsl(var(--status-pending))] bg-[hsl(var(--status-pending)/0.1)] text-[hsl(var(--status-pending))] cursor-not-allowed' :
                                    slot.status === 'confirmed' ? 'border-[hsl(var(--status-confirmed))] bg-[hsl(var(--status-confirmed)/0.1)] text-[hsl(var(--status-confirmed))] cursor-not-allowed' :
                                    'border-[hsl(var(--status-blocked))] bg-[hsl(var(--status-blocked)/0.1)] text-[hsl(var(--status-blocked))] cursor-not-allowed'
                                  }
                                `}
                              >
                                <div className="text-center">
                                  <div>{slot.time}</div>
                                  <div className="text-xs mt-1">
                                    {slot.status === 'available' ? 'Disponível' :
                                     slot.status === 'pending' ? 'Pendente' :
                                     slot.status === 'confirmed' ? 'Ocupado' : 'Bloqueado'}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          Selecione uma data para ver os horários disponíveis
                        </div>
                      )}
                      
                      {timeSlots.length > 0 && (
                        <div className="flex gap-4 text-xs mt-4">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[hsl(var(--status-available))]"></div>
                            <span>Disponível</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[hsl(var(--status-pending))]"></div>
                            <span>Pendente</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[hsl(var(--status-confirmed))]"></div>
                            <span>Ocupado</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Observações (Opcional)</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Alguma informação adicional ou dúvida?"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full">
                    <Calendar className="w-5 h-5 mr-2" />
                    Continuar para Pagamento
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;