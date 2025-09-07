import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { serviceOptions } from "@/data/servicesData";
import { useMemo } from "react";

const AppointmentBookingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [emailValid, setEmailValid] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    price: "",
    date: "",
    time: "",
    duration: "",
    message: "",
    cpf: "",
  });

  const [timeSlots, setTimeSlots] = useState<
    {
      time: string;
      status: "available" | "PENDING" | "CONFIRMED" | "blocked";
    }[]
  >([]);
  const baseURL = import.meta.env.VITE_API_URL;
  const [openService, setOpenService] = useState<string | null>(null);
  const [blockedDate, setBlockedDate] = useState<{ bloqueada: boolean }>({
    bloqueada: false,
  });

  const toggleService = (value: string) => {
    setOpenService(openService === value ? null : value);
  };
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!formData.date) return;

    fetch(`${baseURL}/user/appointments/date-bloqueada/${formData.date}`)
      .then((res) => res.json())
      .then((data) => setBlockedDate(data))
      .catch((err) => console.error(err));
  }, [formData.date]);

  const parseDuration = (duration?: string): number => {
    if (!duration) return 10;
    const hourMatch = duration.match(/(\d+)h\s*(\d+)?/);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1], 10);
      const minutes = hourMatch[2] ? parseInt(hourMatch[2], 10) : 0;
      return hours * 60 + minutes;
    }
    const minMatch = duration.match(/(\d+)\s*min/);
    if (minMatch) return parseInt(minMatch[1], 10);
    return 10;
  };

  const getTimeSlotsForDate = async (
    date: string,
    serviceDuration?: string
  ) => {
    try {
      const durationMinutes = parseDuration(serviceDuration);
      const res = await fetch(`${baseURL}/user/appointments/status/${date}`);
      if (!res.ok) throw new Error("Erro ao buscar horários");

      const data = await res.json();
      if (!data.schedule) return [];
      console.log(data);

      // Primeiro, transformamos cada slot em um objeto com start e end
      const slotsWithTime = data.schedule.map(
        (slot: { time: string; status: string; duration?: string }) => {
          const slotStart = new Date(`${date}T${slot.time}`);
          const slotDuration = parseDuration(slot.duration);
          const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

          return {
            time: slot.time.slice(0, 5),
            status:
              slot.status.toLowerCase() === "cancelled"
                ? "available"
                : slot.status,
            slotStart,
            slotEnd,
          };
        }
      );

      // Filtra os horários disponíveis considerando a duração do serviço
      const slotsWithStatus = slotsWithTime.map((slot: any) => {
        // Calcula o horário final do slot baseado na duração do serviço selecionado
        const slotEnd = new Date(
          slot.slotStart.getTime() + durationMinutes * 60000
        );

        // Verifica conflito com qualquer outro agendamento ativo
        const conflict = slotsWithTime.some((other: any) => {
          if (other === slot) return false;
          return (
            slot.slotStart < other.slotEnd &&
            slotEnd > other.slotStart &&
            other.status !== "available"
          );
        });

        return {
          time: slot.time,
          status: conflict ? "blocked" : slot.status,
        };
      });

      return slotsWithStatus;
    } catch (err) {
      console.error("Erro ao buscar horários:", err);
      return [];
    }
  };

  const handleInputChange = async (field: string, value: string) => {
    console.log("📝 handleInputChange chamado com:", field, value);

    setFormData((prev) => ({ ...prev, [field]: value }));

    // Só entra se o campo alterado for a data ou o serviço
    if (field === "date" || field === "service") {
      const selectedService = serviceOptions.find((s) =>
        field === "service" ? s.value === value : s.value === formData.service
      );
      const serviceDuration = selectedService?.duration || "10min";

      const slots = await getTimeSlotsForDate(
        field === "date" ? value : formData.date,
        serviceDuration
      );

      setTimeSlots(slots);
      setFormData((prev) => ({ ...prev, time: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.cpf ||
      !formData.email ||
      !formData.phone ||
      !formData.service ||
      !formData.date ||
      !formData.time ||
      !formData.duration
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check availability one more time before navigating
      const slots = await getTimeSlotsForDate(formData.date);
      const selectedSlot = slots.find((slot) => slot.time === formData.time);
      if (!selectedSlot || selectedSlot.status !== "available") {
        toast({
          title: "Horário indisponível",
          description:
            "Este horário não está mais disponível. Por favor, escolha outro.",
          variant: "destructive",
        });
        return;
      }

      // Apenas navega para a página de pagamento, sem salvar ainda
      navigate("/pagamento", {
        state: {
          appointmentData: formData,
        },
      });
    } catch (error) {
      toast({
        title: "Erro ao agendar",
        description:
          "Ocorreu um erro ao processar seu agendamento. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao processar agendamento:", error);
    }
  };

  const getServicePrice = (serviceValue: string) => {
    const service = serviceOptions.find((s) => s.value === serviceValue);
    return service?.price || "";
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }
  const getServiceDescription = (value: string) => {
    const service = serviceOptions.find((s) => s.value === value);
    return service ? service.description : "";
  };

  const getServiceDuration = (value: string) => {
    const service = serviceOptions.find((s) => s.value === value);
    return service ? service.duration : "";
  };

  type Slot = { time: string; status: string };

  const canFitInSlot = (
    startTime: string,
    durationMinutes: number,
    slots: Slot[]
  ): boolean => {
    const [sh, sm] = startTime.split(":").map(Number);
    const start = sh * 60 + sm;
    const end = start + durationMinutes;

    const sortedSlots = slots
      .map((s) => {
        const [h, m] = s.time.split(":").map(Number);
        return {
          minutes: h * 60 + m,
          status: s.status,
        };
      })
      .sort((a, b) => a.minutes - b.minutes);

    const startIndex = sortedSlots.findIndex((s) => s.minutes === start);
    if (startIndex === -1) {
      console.log(
        `⛔ Slot ${startTime}: não encontrado → duração = ${durationMinutes}min`
      );
      return false;
    }
    if (startTime === "17:00") {
      console.log(`⛔ Slot ${startTime}: bloqueado → não é permitido`);
      return false;
    }

    const limit = 17 * 60 + 30; // 17h30 em minutos
    if (end > limit) {
      console.log(
        `⛔ Slot ${startTime}: duração ${durationMinutes}min ultrapassa 17:30`
      );
      return false;
    }

    const slotStatus = sortedSlots[startIndex].status;

    if (slotStatus !== "available") {
      console.log(
        `⛔ Slot ${startTime}: status = ${slotStatus} → duração = ${durationMinutes}min`
      );
      return false;
    }

    const startHour = Math.floor(start / 60);
    const endHour = Math.floor(end / 60);

    if (durationMinutes > 60 || (endHour > startHour && durationMinutes > 10)) {
      const nextSlot = sortedSlots[startIndex + 1];
      if (!nextSlot) {
        console.log(
          `⛔ Slot ${startTime}: status = ${slotStatus} → duração = ${durationMinutes}min → não existe próximo slot`
        );
        return false;
      }

      if (nextSlot.minutes % 60 !== 0) {
        console.log(
          `⛔ Slot ${startTime}: status = ${slotStatus} → duração = ${durationMinutes}min → próximo slot ${String(
            Math.floor(nextSlot.minutes / 60)
          ).padStart(2, "0")}:${String(nextSlot.minutes % 60).padStart(
            2,
            "0"
          )} não é hora cheia`
        );
        return false;
      }

      console.log(
        `✅ Slot ${startTime}: status = ${slotStatus} → duração = ${durationMinutes}min → próximo slot em hora cheia OK`
      );
    } else {
      console.log(
        `✅ Slot ${startTime}: status = ${slotStatus} → duração = ${durationMinutes}min (termina na mesma hora) liberado`
      );
    }

    return true;
  };
  const processedSlots = useMemo(() => {
    if (!formData.duration) return [];
    const durationMinutes = parseDuration(formData.duration);

    const now = new Date();
    const nowPlus3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    // 🔥 monta a data local sem UTC
    const [year, month, day] = formData.date.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day); // mês começa em 0
    const dayOfWeek = selectedDate.getDay(); // 0 = domingo, 6 = sábado
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return timeSlots.map((slot) => {
      const slotSelectable = canFitInSlot(
        slot.time,
        durationMinutes,
        timeSlots
      );

      // monta o Date do slot
      const [h, m] = slot.time.split(":").map(Number);
      const slotDate = new Date(year, month - 1, day, h, m);

      // só aplica a regra se a data do form for HOJE
      const isToday = now.toISOString().split("T")[0] === formData.date;

      // se for hoje, bloqueia horários antes de 3h do horário atual
      const isBeforeLimit = isToday && slotDate < nowPlus3h;

      // 🔥 verifica se a data está bloqueada
      const isBlockedDate = blockedDate.bloqueada;

      return {
        ...slot,
        slotSelectable:
          slotSelectable && !isBeforeLimit && !isWeekend && !isBlockedDate,
      };
    });
  }, [timeSlots, formData.duration, formData.date, blockedDate]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Agendar{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Consulta
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Preencha o formulário abaixo para agendar seu atendimento. Após o
              preenchimento, você será direcionado para o pagamento.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Services Info */}
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Nossos Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {serviceOptions.map((service) => (
                    <div
                      key={service.value}
                      className="p-3 rounded-lg bg-secondary/50 cursor-pointer"
                      onClick={() => toggleService(service.value)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {service.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {service.duration}
                          </span>
                        </div>
                        <span className="text-primary font-semibold">
                          {service.price}
                        </span>
                      </div>

                      {/* Descrição aparece quando o serviço está aberto */}
                      {openService === service.value && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      )}
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
                      <span className="font-medium">8h às 17h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado:</span>
                      <span className="font-medium">Fechado</span>
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
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleInputChange("email", value);

                          // validação do email
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          setEmailValid(emailRegex.test(value));
                        }}
                        placeholder="exemplo@email.com"
                        className={!emailValid ? "border-red-500" : ""}
                        required
                      />{" "}
                      {!emailValid && (
                        <p className="text-red-500 text-sm">
                          Digite um email válido.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">CPF</Label>
                      <Input
                        id="cpf"
                        type="text"
                        maxLength={14}
                        value={formData.cpf}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, ""); // mantém só números

                          // aplica a máscara 000.000.000-00
                          if (value.length > 3) {
                            value = value.replace(/^(\d{3})(\d)/, "$1.$2");
                          }
                          if (value.length > 6) {
                            value = value.replace(
                              /^(\d{3})\.(\d{3})(\d)/,
                              "$1.$2.$3"
                            );
                          }
                          if (value.length > 9) {
                            value = value.replace(
                              /^(\d{3})\.(\d{3})\.(\d{3})(\d)/,
                              "$1.$2.$3-$4"
                            );
                          }

                          handleInputChange("cpf", value);
                        }}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone/WhatsApp</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço Desejado</Label>
                    <Select
                      value={formData.service}
                      onValueChange={(value) => {
                        const selectedService = serviceOptions.find(
                          (s) => s.value === value
                        );
                        if (selectedService) {
                          setFormData((prev) => ({
                            ...prev,
                            service: selectedService.value,
                            price: selectedService.price,
                            duration: selectedService.duration,
                          }));
                          handleInputChange("service", selectedService.value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{service.label}</span>
                              <span className="text-primary font-semibold ml-4">
                                {service.price}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.service && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Duração: {getServiceDuration(formData.service)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getServiceDescription(formData.service)}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data Preferida</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Horários Disponíveis</Label>
                      {timeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {processedSlots.map((slot) => {
                            const isSelected = formData.time === slot.time;
                            const isAvailable = slot.status === "available";

                            return (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() =>
                                  isAvailable && slot.slotSelectable
                                    ? handleInputChange("time", slot.time)
                                    : null
                                }
                                disabled={!isAvailable || !slot.slotSelectable}
                                className={`
        p-3 rounded-lg text-sm font-medium transition-all border-2
        ${
          isSelected && isAvailable && slot.slotSelectable
            ? "border-primary bg-primary text-primary-foreground"
            : isAvailable && slot.slotSelectable
            ? "border-[hsl(var(--status-available))] bg-[hsl(var(--status-available)/0.1)] text-[hsl(var(--status-available))] hover:bg-[hsl(var(--status-available)/0.2)]"
            : slot.status === "PENDING"
            ? "border-[hsl(var(--status-pending))] bg-[hsl(var(--status-pending)/0.1)] text-[hsl(var(--status-pending))] cursor-not-allowed"
            : slot.status === "CONFIRMED"
            ? "border-[hsl(var(--status-confirmed))] bg-[hsl(var(--status-confirmed)/0.1)] text-[hsl(var(--status-confirmed))] cursor-not-allowed"
            : "border-[hsl(var(--status-blocked))] bg-[hsl(var(--status-blocked)/0.1)] text-[hsl(var(--status-blocked))] cursor-not-allowed"
        }
      `}
                              >
                                <div className="text-center">
                                  <div>{slot.time}</div>
                                  <div className="text-xs mt-1">
                                    {isAvailable && slot.slotSelectable
                                      ? "Disponível"
                                      : slot.status === "PENDING"
                                      ? "Pendente"
                                      : slot.status === "CONFIRMED"
                                      ? "Ocupado"
                                      : "Bloqueado"}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          Selecione um serviço e uma data para ver os horários
                          disponíveis
                        </div>
                      )}

                      {timeSlots.length > 0 && (
                        <div className="flex gap-4 text-xs mt-4">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[hsl(var(--status-available))]"></div>
                            <span>Disponível</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[hsl(var(--status-confirmed))]"></div>
                            <span>Ocupado</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[hsl(var(--status-blocked))]"></div>
                            <span>Excede o horário disponível</span>
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
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      placeholder="Alguma informação adicional ou dúvida?"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
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
