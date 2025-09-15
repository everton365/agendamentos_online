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
import { useLocation } from "react-router-dom";

const AppointmentBookingPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [selectedService, setSelectedService] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [emailValid, setEmailValid] = useState(true);
  const [selectedServices, setSelectedServices] = useState<
    Array<{
      value: string;
      label: string;
      price: string;
      duration: string;
    }>
  >([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
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
  // Auto-fill user data and redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      // Auto-fill name, email and phone from user
      setFormData((prev) => ({
        ...prev,
        name:
          user.user_metadata?.display_name || user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
      }));
    }
  }, [user, navigate]);

  useEffect(() => {
    // Remove do localStorage depois de pegar
    localStorage.removeItem("appointmentId");
    console.log("appointmentId removido do localStorage");
  }, []);

  useEffect(() => {
    const service = queryParams.get("service");

    if (service) {
      const selected = serviceOptions.find((s) => s.value === service);
      if (selected) {
        setSelectedServices([
          {
            value: selected.value,
            label: selected.label,
            price: selected.price,
            duration: selected.duration,
          },
        ]);
      }
    }
  }, [location.search]);

  useEffect(() => {
    if (!formData.date) return;

    fetch(`${baseURL}/user/appointments/date-bloqueada/${formData.date}`)
      .then((res) => res.json())
      .then((data) => setBlockedDate(data))
      .catch((err) => console.error(err));
  }, [formData.date]);

  // Calculate total duration and price from selected services
  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => {
      return total + parseDuration(service.duration);
    }, 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => {
      const priceValue = parseFloat(
        service.price.replace("R$ ", "").replace(",", ".")
      );
      return total + priceValue;
    }, 0);
  };

  const formatTotalDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

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
    totalDurationMinutes?: number
  ) => {
    try {
      const durationMinutes = totalDurationMinutes || getTotalDuration() || 10;
      const res = await fetch(`${baseURL}/user/appointments/status/${date}`);
      if (!res.ok) throw new Error("Erro ao buscar horários");

      const data = await res.json();
      if (!data.schedule) return [];

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

      // Filtra os horários disponíveis considerando a duração total dos serviços
      const slotsWithStatus = slotsWithTime.map((slot: any) => {
        // Calcula o horário final do slot baseado na duração total dos serviços selecionados
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
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Só entra se o campo alterado for a data
    if (field === "date") {
      const totalDuration = getTotalDuration();
      const slots = await getTimeSlotsForDate(value, totalDuration);
      setTimeSlots(slots);
      setFormData((prev) => ({ ...prev, time: "" }));
    }
  };

  const updateTimeSlots = async () => {
    if (formData.date && selectedServices.length > 0) {
      const totalDuration = getTotalDuration();
      const slots = await getTimeSlotsForDate(formData.date, totalDuration);
      setTimeSlots(slots);
      setFormData((prev) => ({ ...prev, time: "" }));
    }
  };

  const handleServiceToggle = (service: (typeof serviceOptions)[0]) => {
    const isSelected = selectedServices.some((s) => s.value === service.value);

    if (isSelected) {
      setSelectedServices((prev) =>
        prev.filter((s) => s.value !== service.value)
      );
    } else {
      setSelectedServices((prev) => [
        ...prev,
        {
          value: service.value,
          label: service.label,
          price: service.price,
          duration: service.duration,
        },
      ]);
    }

    // Update time slots after service change
    setTimeout(updateTimeSlots, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.phone ||
      selectedServices.length === 0 ||
      !formData.date ||
      !formData.time
    ) {
      toast({
        title: "Campos obrigatórios",
        description:
          "Por favor, preencha todos os campos obrigatórios e selecione pelo menos um serviço.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check availability one more time before navigating
      const totalDuration = getTotalDuration();
      const slots = await getTimeSlotsForDate(formData.date, totalDuration);
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

      // Prepare appointment data with services info
      const appointmentData = {
        ...formData,
        service: selectedServices.map((s) => s.label).join(", "),
        price: `R$ ${getTotalPrice().toFixed(2).replace(".", ",")}`,
        duration: formatTotalDuration(getTotalDuration()),
        services: selectedServices,
        name:
          user?.user_metadata?.name || user?.email?.split("@")[0] || "Cliente",
      };

      // Navigate to payment page
      navigate("/pagamento", {
        state: {
          appointmentData,
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

  if (!user) {
    return null; // Will redirect via useEffect
  }

  type Slot = { time: string; status: string };

  const canFitInSlot = (
    startTime: string,
    durationMinutes: number,
    slots: Slot[],
    date?: string
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
      return false;
    }
    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      const dayOfWeek = d.getDay(); // 0=Dom, 1=Seg, 2=Ter, ...

      if (dayOfWeek === 1) {
        // segunda-feira
        console.log(
          `⛔ Slot ${startTime}: bloqueado (nenhum horário permitido na segunda-feira)`
        );
        return false;
      }

      if (dayOfWeek === 2) {
        // terça-feira
        const limiteFim = 14 * 60 + 30; // 14:30
        if (end > limiteFim) {
          console.log(
            `⛔ Slot ${startTime}: bloqueado (não pode ultrapassar 14:30 na terça-feira)`
          );
          return false;
        }
      }
    }
    if (startTime === "18:30") {
      console.log(`⛔ Slot ${startTime}: bloqueado → não é permitido`);
      return false;
    }

    const limit = 18 * 60 + 40; // 18h30 em minutos
    if (end > limit) {
      console.log(
        `⛔ Slot ${startTime}: duração ${durationMinutes}min ultrapassa 18:30`
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
    const totalDuration = getTotalDuration();
    if (!totalDuration || !formData.date) return [];

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
        totalDuration,
        timeSlots,
        formData.date
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
  }, [timeSlots, selectedServices, formData.date, blockedDate]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <div className="mx-auto w-4/5 px-4 py-8">
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
                Horario
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
                      <span>Terça-feira:</span>
                      <span className="font-medium">9h às 14h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quarta-feira:</span>
                      <span className="font-medium">9h às 17h</span>
                    </div>
                    <div className="flex justify-between">
                      <span> Quinta-feira:</span>
                      <span className="font-medium">9 às 18:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sexta-feira:</span>
                      <span className="font-medium"> 9h às 18:30</span>
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
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        placeholder="Seu nome"
                        className="bg-muted/50"
                        readOnly
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        placeholder="exemplo@email.com"
                        className="bg-muted/50"
                        readOnly
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
                    <Label>Serviços Desejados</Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                      {serviceOptions.map((service) => {
                        const isSelected = selectedServices.some(
                          (s) => s.value === service.value
                        );
                        return (
                          <div
                            key={service.value}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleServiceToggle(service)}
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
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-semibold">
                                  {service.price}
                                </span>
                                <div
                                  className={`w-4 h-4 rounded border ${
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "border-border"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedServices.length > 0 && (
                      <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
                        <h4 className="font-medium text-foreground">
                          Serviços Selecionados:
                        </h4>
                        {selectedServices.map((service) => (
                          <div
                            key={service.value}
                            className="flex justify-between text-sm"
                          >
                            <span>{service.label}</span>
                            <span>{service.price}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-border/50">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>
                              R$ {getTotalPrice().toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Duração total:</span>
                            <span>
                              {formatTotalDuration(getTotalDuration())}
                            </span>
                          </div>
                        </div>
                      </div>
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
                        autoComplete="off"
                        name="appointment_date_x"
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
                          Selecione pelo menos um serviço e uma data para ver os
                          horários disponíveis
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
