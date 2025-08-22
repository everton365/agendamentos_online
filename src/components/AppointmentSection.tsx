import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Phone, User } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AppointmentSection = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    message: ""
  });
  
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check available times based on date and existing appointments
  const getAvailableTimesForDate = async (date: string) => {
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
      .select('appointment_time')
      .eq('appointment_date', date)
      .eq('status', 'confirmed');
    
    if (error) {
      console.error('Error fetching appointments:', error);
      return allSlots; // Return all slots if there's an error
    }
    
    // Filter out booked times
    const bookedTimes = existingAppointments.map(apt => apt.appointment_time);
    return allSlots.filter(time => !bookedTimes.includes(time));
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

    // If user is not logged in, redirect to login/register
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Save appointment to database
      const { data: savedAppointment, error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          name: formData.name,
          phone: formData.phone,
          service: formData.service,
          appointment_date: formData.date,
          appointment_time: formData.time,
          message: formData.message,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to payment page with appointment data
      navigate("/pagamento", { state: { appointmentData: formData, appointmentId: savedAppointment.id } });
    } catch (error) {
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro ao salvar seu agendamento. Tente novamente.",
        variant: "destructive"
      });
      console.error('Error saving appointment:', error);
    }
  };

  const handleInputChange = async (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update available times when date changes
    if (field === "date") {
      const times = await getAvailableTimesForDate(value);
      setAvailableTimes(times);
      // Reset time selection when date changes
      setFormData(prev => ({ ...prev, time: "" }));
    }
  };

  return (
    <section id="agendamento" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Agende sua <span className="bg-gradient-primary bg-clip-text text-transparent">Consulta</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Preencha o formulário abaixo e entraremos em contato para confirmar 
              seu agendamento no melhor horário para você.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <div className="space-y-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-foreground">
                    <Phone className="w-6 h-6 text-primary" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">(11) 99999-9999</div>
                      <div className="text-sm text-muted-foreground">WhatsApp disponível</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Horário de Funcionamento</div>
                      <div className="text-sm text-muted-foreground">
                        Seg - Sex: 9h às 18h<br />
                        Sáb: 9h às 15h
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Localização</div>
                      <div className="text-sm text-muted-foreground">
                        Rua das Sobrancelhas, 123<br />
                        Centro - São Paulo, SP
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Form */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <Calendar className="w-6 h-6 text-primary" />
                  Formulário de Agendamento
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
                        <SelectItem value="design">Design de Sobrancelhas</SelectItem>
                        <SelectItem value="microblading">Microblading</SelectItem>
                        <SelectItem value="henna">Henna para Sobrancelhas</SelectItem>
                        <SelectItem value="laminacao">Laminação de Sobrancelhas</SelectItem>
                        <SelectItem value="consulta">Consulta/Avaliação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data Preferida</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Horário Preferido</Label>
                      <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimes.length > 0 ? (
                            availableTimes.map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-times" disabled>
                              Selecione uma data primeiro
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
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
                    Solicitar Agendamento
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;