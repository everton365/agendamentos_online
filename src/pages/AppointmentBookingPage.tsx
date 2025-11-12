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
import { Calendar, Clock, ArrowLeft, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useStudio } from "@/contexts/StudioContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { serviceOptions } from "@/data/servicesData";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import WhatsAppButton from "../components/whatsappButton";
import { useServicesContext } from "@/contexts/ServicesContext";

const AppointmentBookingPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [selectedService, setSelectedService] = useState("");
  const { user } = useAuth();
  const { studio } = useStudio();
  const { appointments, addAppointment, getTotalBookingFee } = useCart();
  const navigate = useNavigate();

  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
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
  const studioId = import.meta.env.VITE_STUDIO_ID;
  const [openService, setOpenService] = useState<string | null>(null);
  type BlockedDateResponse =
    | {
        bloqueada: true;
        data: {
          date: string;
          motivo?: string;
          time_bloqueados?: string;
          horas_bloqueadas: string[];
        };
      }
    | {
        bloqueada: false;
      };

  const [blockedDate, setBlockedDate] = useState<BlockedDateResponse | null>(
    null
  );
  const { services: useService, loading } = useServicesContext();
  const toggleService = (value: string) => {
    setOpenService(openService === value ? null : value);
  };

  // Auto-fill user data and redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      // Auto-fill name, email e phone do user
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
  }, []);

  useEffect(() => {
    const service = queryParams.get("service");
    const price = queryParams.get("price");
    const duration = queryParams.get("duration");

    if (service) {
      // Normaliza o preço vindo da URL
      const numericPrice = price
        ? parseFloat(
            price
              .replace(/[^\d,.-]/g, "") // remove tudo que não for número, vírgula, ponto ou traço
              .replace(/\./g, "") // remove pontos de milhar
              .replace(",", ".") // troca vírgula por ponto para parseFloat entender
          )
        : 0;

      setSelectedServices([
        {
          value: service,
          label: decodeURIComponent(service),
          price: `R$ ${numericPrice.toFixed(2).replace(".", ",")}`,
          duration: duration ? decodeURIComponent(duration) : "10 min",
        },
      ]);
    }
  }, [location.search]);

  // Novo useEffect só para pegar o role do usuário
  useEffect(() => {
    if (!user) return;

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .eq("studio_id", studioId)
          .maybeSingle<{ role: string }>();

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
    if (!formData.date) return;

    fetch(
      `${baseURL}/user/appointments/date-bloqueada/${formData.date}?studioId=${studioId}`
    )
      .then((res) => res.json())
      .then((data: BlockedDateResponse) => {
        setBlockedDate(data);
      })
      .catch((err) => console.error("Erro ao buscar data bloqueada:", err));
  }, [formData.date, selectedServices]);

  // Calculate total duration and price from selected services
  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => {
      return total + parseDuration(service.duration);
    }, 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => {
      const priceStr = service.price || "R$ 0";
      const priceValue = parseFloat(
        priceStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
      );
      return total + (isNaN(priceValue) ? 0 : priceValue);
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
      const res = await fetch(
        `${baseURL}/user/appointments/status/${date}?studioId=${studioId}`
      );
      if (!res.ok) throw new Error("Erro ao buscar horários");

      const data = await res.json();

      if (!data.schedule) return [];

      // 🔹 Converte os dados vindos da API
      let slots = data.schedule.map(
        (slot: { time: string; status: string; duration?: string }) => ({
          time: slot.time.slice(0, 5), // HH:mm
          status:
            slot.status.toLowerCase() === "cancelled"
              ? "available"
              : slot.status,
        })
      );

      // 🔹 Adiciona os horários do carrinho local (appointments)
      appointments
        .filter((apt) => apt.date === date)
        .forEach((apt) => {
          const startTime = apt.time.slice(0, 5); // ex: "09:00"

          // 🕓 Calcula o horário final com base na duração
          let duration = 0;
          if (typeof apt.duration === "string") {
            const str = apt.duration.toLowerCase().replace(/\s/g, "");
            if (str.includes("h")) duration = parseInt(str) * 60;
            else duration = parseInt(str);
          } else {
            duration = apt.duration || 0;
          }

          const [h, m] = startTime.split(":").map(Number);
          const endMinutes = h * 60 + m + duration;
          const endH = Math.floor(endMinutes / 60)
            .toString()
            .padStart(2, "0");
          const endM = (endMinutes % 60).toString().padStart(2, "0");
          const endTime = `${endH}:${endM}`;

          // 🔸 Marca o horário inicial como CONFIRMED
          const existingSlot = slots.find((s) => s.time === startTime);
          if (existingSlot) {
            existingSlot.status = "CONFIRMED";
          } else {
            slots.push({ time: startTime, status: "CONFIRMED" });
          }

          // 🔸 Garante que o próximo horário (fim da duração) continue como available
          const hasEndSlot = slots.some((s) => s.time === endTime);
          if (!hasEndSlot) {
            slots.push({ time: endTime, status: "available" });
          }
        });

      // 🔹 Ordena os horários para manter ordem cronológica
      slots = slots.sort((a, b) => {
        const [ah, am] = a.time.split(":").map(Number);
        const [bh, bm] = b.time.split(":").map(Number);
        return ah * 60 + am - (bh * 60 + bm);
      });

      return slots;
    } catch (error) {
      console.error(error);
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

  const handleServiceToggle = (service: (typeof useService)[0]) => {
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
          price: String(service.price), // 👈 força string
          duration: service.duration,
        },
      ]);
    }

    updateTimeSlots();
  };

  useEffect(() => {
    updateTimeSlots();
  }, [selectedServices, appointments]);

  const handleAddToCart = async (e: React.FormEvent) => {
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
      // Check availability one more time
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

      // Add to cart
      addAppointment({
        service: selectedServices.map((s) => s.label).join(", "),
        services: selectedServices,
        price: `R$ ${getTotalPrice().toFixed(2).replace(".", ",")}`,
        duration: formatTotalDuration(getTotalDuration()),
        date: formData.date,
        time: formData.time,
        message: formData.message,
      });

      toast({
        title: "Agendamento adicionado!",
        description: "Adicione mais agendamentos ou finalize o pagamento.",
      });

      // Reset form for next appointment
      setSelectedServices([]);
      setFormData((prev) => ({ ...prev, date: "", time: "", message: "" }));
    } catch (error) {
      toast({
        title: "Erro ao adicionar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao adicionar ao carrinho:", error);
    }
  };

  const handleGoToPayment = () => {
    if (appointments.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione pelo menos um agendamento antes de pagar.",
        variant: "destructive",
      });
      return;
    }

    const formatPhoneForDB = (phone: string) => {
      let digits = phone.replace(/\D/g, "");
      if (!digits.startsWith("55")) {
        digits = "55" + digits;
      }
      return digits;
    };

    const studioId = import.meta.env.VITE_STUDIO_ID;

    navigate("/pagamento", {
      state: {
        appointments: appointments.map((apt) => ({
          name:
            formData.name ||
            user?.user_metadata?.name ||
            user?.email?.split("@")[0] ||
            "Cliente",
          email: formData.email,
          phone: formatPhoneForDB(formData.phone),
          service: apt.service,
          services: apt.services,
          price: apt.price,
          duration: apt.duration,
          date: apt.date,
          time: apt.time,
          message: apt.message,
          studio_id: studioId,
        })),
      },
    });
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  type Slot = { time: string; status: string };

  const canFitInSlot = (
    startTime: string,
    durationMinutes: number,
    slots: Slot[],
    date?: string,
    userRole?: string, // admin pode ignorar bloqueios
    blockedHours?: string[]
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

    // 🔥 Se for admin, ignora todas as regras de bloqueio de horário
    if (userRole === "admin") {
      const slotStatus = sortedSlots[startIndex]?.status;

      if (slotStatus === "CONFIRMED") {
        console.log(
          `⛔7 Slot ${startTime}: bloqueado (CONFIRMED mesmo para admin)`
        );
        return false;
      }

      console.log(
        `✅ Slot ${startTime}: liberado (admin ignora bloqueios comuns)`
      );
      return true;
    }

    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      const dayOfWeek = d.getDay(); // 0=Dom, 1=Seg, 2=Ter, ...

      if (dayOfWeek === 1) {
        console.log(
          `⛔6 Slot ${startTime}: bloqueado (nenhum horário permitido na segunda-feira)`
        );
        return false;
      }

      {
        /* if (dayOfWeek === 2) {
        const limiteFim = 14 * 60 + 30; // 14:30
        if (end > limiteFim) {
          console.log(
            `⛔5 Slot ${startTime}: bloqueado (não pode ultrapassar 14:30 na terça-feira)`
          );
          return false;
        }
      }*/
      }

      if (dayOfWeek === 3) {
        const limiteFim = 17 * 60; // 17:00
        if (end > limiteFim) {
          console.log(
            `⛔4 Slot ${startTime}: bloqueado (não pode ultrapassar 17:00 na quarta-feira)`
          );
          return false;
        }
      }
    }
    if (blockedHours?.includes("18:30")) {
      const limit1830 = 18 * 60 + 30;
      if (end > limit1830) {
        console.log(
          `⛔3 Slot ${startTime}: bloqueado → duração ultrapassa 18:30 (bloqueado na data)`
        );
        return false;
      }
      // 🔒 Bloqueia todos os slots que estejam dentro de uma hora bloqueada
      if (blockedHours && blockedHours.length > 0) {
        const [slotHour] = startTime.split(":").map(Number);

        // verifica se a hora do slot coincide com alguma hora bloqueada
        const isBlockedHour = blockedHours.some((blocked) => {
          const [bh] = blocked.split(":").map(Number);
          return bh === slotHour;
        });

        if (isBlockedHour) {
          console.log(
            `⛔ Slot ${startTime}: bloqueado (hora ${slotHour}:00 bloqueada)`
          );
          return false;
        }
      }
    }
    /* if (startTime === "18:30") {
      console.log(`⛔ Slot ${startTime}: bloqueado → não é permitido`);
      return false;
    }

     const limit = 18 * 60 + 30; // 18h30 em minutos
    if (end > limit) {
      console.log(
        `⛔ Slot ${startTime}: duração ${durationMinutes}min ultrapassa 18:30`
      );
      return false;
    }
*/
    const slotStatus = sortedSlots[startIndex].status;

    if (slotStatus !== "available") {
      console.log(
        `⛔2 Slot ${startTime}: status = aqui ${slotStatus} → duração = ${durationMinutes}min`
      );
      return false;
    }

    const startHour = Math.floor(start / 60);
    const endHour = Math.floor(end / 60);

    if (durationMinutes > 60 || (endHour > startHour && durationMinutes > 10)) {
      const nextSlot = sortedSlots[startIndex + 1];
      if (!nextSlot) {
        console.log(
          `✅ Slot ${startTime}: status = ${slotStatus} → duração = ${durationMinutes}min → não existe próximo slot`
        );
        return true;
      }

      for (let i = 0; i < sortedSlots.length; i++) {
        const slot = sortedSlots[i];
        const nextSlot = sortedSlots[i + 1];
        const slotStart = slot.minutes;
        const slotEnd = nextSlot ? nextSlot.minutes : slotStart + 10;

        if (slot.status === "CONFIRMED" && slotStart < end && slotEnd > start) {
          console.log(
            `⛔ Slot ${startTime}: conflito com ${String(
              Math.floor(slot.minutes / 60)
            ).padStart(2, "0")}:${String(slot.minutes % 60).padStart(
              2,
              "0"
            )} (CONFIRMED durante o intervalo do serviço)`
          );
          return false;
        }
      }

      if (
        nextSlot.minutes % 60 !== 0 && // não é hora cheia
        !(
          Math.floor(nextSlot.minutes / 60) === 18 &&
          nextSlot.minutes % 60 === 30
        ) // e também não é 18:30
      ) {
        console.log(
          `⛔1 Slot ${startTime}: status = ${slotStatus} → duração = ${durationMinutes}min → próximo slot ${String(
            Math.floor(nextSlot.minutes / 60)
          ).padStart(2, "0")}:${String(nextSlot.minutes % 60).padStart(
            2,
            "0"
          )} não é hora cheia ou 18:30`
        );
        return false;
      }
      // Bloqueia se próximo slot estiver confirmado
      // Bloqueia se próximo slot estiver confirmado OU se horário estiver bloqueado
      if (
        (nextSlot.status === "CONFIRMED" && end > nextSlot.minutes) ||
        (blockedHours &&
          blockedHours.some((blocked) => {
            const [bh, bm] = blocked.split(":").map(Number);
            const blockedMinutes = bh * 60 + bm;
            return start < blockedMinutes && end > blockedMinutes;
          }))
      ) {
        console.log(
          `⛔ Slot ${startTime}: bloqueado → ${
            nextSlot.status === "CONFIRMED" && end > nextSlot.minutes
              ? `próximo slot ${String(
                  Math.floor(nextSlot.minutes / 60)
                ).padStart(2, "0")}:${String(nextSlot.minutes % 60).padStart(
                  2,
                  "0"
                )} está CONFIRMED e a duração ultrapassa`
              : `ultrapassa horário bloqueado`
          }`
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

    const [year, month, day] = formData.date.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const dayOfWeek = selectedDate.getDay(); // 0 = domingo, 6 = sábado
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const blockedHours =
      blockedDate && blockedDate.bloqueada && "data" in blockedDate
        ? blockedDate.data.horas_bloqueadas
        : [];

    return timeSlots.map((slot) => {
      // Passa o userRole para canFitInSlot
      const slotSelectable = canFitInSlot(
        slot.time,
        totalDuration,
        timeSlots,
        formData.date,
        userRole, // <-- libera regras para admin
        blockedHours
      );

      const [h, m] = slot.time.split(":").map(Number);
      const slotDate = new Date(year, month - 1, day, h, m);

      const isToday = now.toISOString().split("T")[0] === formData.date;
      const isBeforeLimit = isToday && slotDate < nowPlus3h;

      const isBlockedHour = blockedHours.includes(slot.time);
      const isBlocked1830 = slot.time === "18:30" && isBlockedHour;

      // Se for admin, ignora todas as validações adicionais
      const finalSelectable =
        userRole === "admin"
          ? true
          : slotSelectable && !isBeforeLimit && !isWeekend && !isBlockedHour;

      if (isBlocked1830 && userRole !== "admin") {
        console.log(
          `⛔ Slot ${slot.time}: bloqueado → 18:30 está nas horas bloqueadas`
        );
      }

      return {
        ...slot,
        slotSelectable: finalSelectable,
      };
    });
  }, [timeSlots, selectedServices, formData.date, blockedDate, userRole]);

  return (
    <div className="min-h-screen bg-gradient-hero pt-16">
      <Header />

      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 md:mb-6 text-sm md:text-base"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Voltar
          </Button>

          {/* Page Header */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
              Agendar{" "}
              <span
                style={{ color: "#D4AF37" }}
                className="bg-gradient-primary bg-clip-text text-transparent"
              >
                Horário
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Preencha o formulário abaixo para agendar seu atendimento.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 md:gap-8 lg:gap-12">
            {/* Services Info */}
            <div className="space-y-4 md:space-y-6">
              {/*  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft">
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
                        <span
                          style={{ color: "#D4AF37" }}
                          className="text-primary font-semibold"
                        >
                          {service.price}
                        </span>
                      </div>

                      {/* Descrição aparece quando o serviço está aberto
                      {openService === service.value && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>*/}

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
                    <Clock
                      style={{ color: "#D4AF37" }}
                      className="w-4 h-4 md:w-5 md:h-5 text-primary"
                    />
                    Horário de Funcionamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                    {studio?.horario_funcionamento ? (
                      <>
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="hidden sm:inline">
                            Segunda-feira:
                          </span>
                          <span className="sm:hidden">Seg:</span>
                          <span className="font-medium">
                            {studio.horario_funcionamento?.segunda?.abertura &&
                            studio.horario_funcionamento?.segunda?.fechamento
                              ? `${studio.horario_funcionamento.segunda.abertura} às ${studio.horario_funcionamento.segunda.fechamento}`
                              : "Fechado"}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="hidden sm:inline">Terça-feira:</span>
                          <span className="sm:hidden">Ter:</span>
                          <span className="font-medium">
                            {studio.horario_funcionamento?.terca?.abertura &&
                            studio.horario_funcionamento?.terca?.fechamento
                              ? `${studio.horario_funcionamento.terca.abertura} às ${studio.horario_funcionamento.terca.fechamento}`
                              : "Fechado"}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="hidden sm:inline">
                            Quarta-feira:
                          </span>
                          <span className="sm:hidden">Qua:</span>
                          <span className="font-medium">
                            {studio.horario_funcionamento?.quarta?.abertura &&
                            studio.horario_funcionamento?.quarta?.fechamento
                              ? `${studio.horario_funcionamento.quarta.abertura} às ${studio.horario_funcionamento.quarta.fechamento}`
                              : "Fechado"}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="hidden sm:inline">
                            Quinta-feira:
                          </span>
                          <span className="sm:hidden">Qui:</span>
                          <span className="font-medium">
                            {studio.horario_funcionamento?.quinta?.abertura &&
                            studio.horario_funcionamento?.quinta?.fechamento
                              ? `${studio.horario_funcionamento.quinta.abertura} às ${studio.horario_funcionamento.quinta.fechamento}`
                              : "Fechado"}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="hidden sm:inline">Sexta-feira:</span>
                          <span className="sm:hidden">Sex:</span>
                          <span className="font-medium">
                            {studio.horario_funcionamento?.sexta?.abertura &&
                            studio.horario_funcionamento?.sexta?.fechamento
                              ? `${studio.horario_funcionamento.sexta.abertura} às ${studio.horario_funcionamento.sexta.fechamento}`
                              : "Fechado"}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="hidden sm:inline">Sábado:</span>
                          <span className="sm:hidden">Sáb:</span>
                          <span className="font-medium">
                            {studio.horario_funcionamento?.sabado?.abertura &&
                            studio.horario_funcionamento?.sabado?.fechamento
                              ? `${studio.horario_funcionamento.sabado.abertura} às ${studio.horario_funcionamento.sabado.fechamento}`
                              : "Fechado"}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="hidden sm:inline">Domingo:</span>
                          <span className="sm:hidden">Dom:</span>
                          <span className="font-medium">
                            {studio.horario_funcionamento?.domingo?.abertura &&
                            studio.horario_funcionamento?.domingo?.fechamento
                              ? `${studio.horario_funcionamento.domingo.abertura} às ${studio.horario_funcionamento.domingo.fechamento}`
                              : "Fechado"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground text-xs md:text-sm">
                        Carregando horários...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Form */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-foreground text-base md:text-lg">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  Dados do Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <form
                  onSubmit={handleAddToCart}
                  className="space-y-4 md:space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm md:text-base">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Seu nome"
                        className="bg-muted/50 text-sm md:text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm md:text-base">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        placeholder="exemplo@email.com"
                        className="bg-muted/50 text-sm md:text-base"
                        readOnly
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm md:text-base">
                        Telefone/WhatsApp
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="(11) 99999-9999"
                        className="text-sm md:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">
                      Serviços Desejados
                    </Label>
                    <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto border rounded-lg p-2 md:p-3">
                      {useService.map((service) => {
                        const isSelected = selectedServices.some(
                          (s) => s.value === service.value
                        );
                        return (
                          <div
                            key={service.value}
                            className={`p-2.5 md:p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleServiceToggle(service)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground text-xs md:text-sm">
                                  {service.label}
                                </span>
                                <span className="text-[10px] md:text-xs text-muted-foreground">
                                  {service.duration}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 md:gap-2">
                                <span className="text-primary font-semibold text-xs md:text-sm">
                                  {service.price}
                                </span>
                                <div
                                  className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded border ${
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "border-border"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-sm"></div>
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
                      <div className="p-2.5 md:p-3 bg-secondary/50 rounded-lg space-y-1.5 md:space-y-2">
                        <h4 className="font-medium text-foreground text-xs md:text-sm">
                          Serviços Selecionados:
                        </h4>
                        {selectedServices.map((service) => (
                          <div
                            key={service.value}
                            className="flex justify-between text-xs md:text-sm"
                          >
                            <span>{service.label}</span>
                            <span>{service.price}</span>
                          </div>
                        ))}
                        <div className="pt-1.5 md:pt-2 border-t border-border/50">
                          <div className="flex justify-between font-semibold text-xs md:text-sm">
                            <span>Total:</span>
                            <span>
                              R$ {getTotalPrice().toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Duração total:</span>
                            <span>
                              {formatTotalDuration(getTotalDuration())}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm md:text-base">
                        Data Preferida
                      </Label>
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
                        className="text-sm md:text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-sm md:text-base">
                        Horários Disponíveis
                      </Label>
                      {timeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                          {processedSlots.map((slot) => {
                            const isSelected = formData.time === slot.time;
                            const isAdmin = userRole === "admin"; // ✅ checa se é admin
                            const isSelectable =
                              isAdmin ||
                              (slot.status === "available" &&
                                slot.slotSelectable);

                            return (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() =>
                                  isSelectable
                                    ? handleInputChange("time", slot.time)
                                    : null
                                }
                                disabled={!isSelectable}
                                className={`
        p-2 md:p-3 rounded-lg text-xs md:text-sm font-medium transition-all border-2
        ${
          isSelected && isSelectable
            ? "border-primary bg-primary text-primary-foreground"
            : isSelectable
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
                                  <div className="text-[10px] md:text-xs mt-0.5 md:mt-1">
                                    {isAdmin
                                      ? "Admin"
                                      : slot.status === "available" &&
                                        slot.slotSelectable
                                      ? "Livre"
                                      : slot.status === "PENDING"
                                      ? "Pendente"
                                      : slot.status === "CONFIRMED"
                                      ? "Ocupado"
                                      : "Ocupado"}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center p-3 md:p-4 text-muted-foreground text-xs md:text-sm">
                          Selecione pelo menos um serviço e uma data para ver os
                          horários disponíveis
                        </div>
                      )}

                      {timeSlots.length > 0 && (
                        <div className="flex gap-3 md:gap-4 text-[10px] md:text-xs mt-3 md:mt-4">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[hsl(var(--status-available))]"></div>
                            <span>Disponível</span>
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
                    <Label htmlFor="message" className="text-sm md:text-base">
                      Observações (Opcional)
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      placeholder="Alguma informação adicional ou dúvida?"
                      rows={3}
                      className="text-sm md:text-base"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button
                      type="submit"
                      size="lg"
                      variant="outline"
                      className="flex-1 h-16 sm:h-14 text-base sm:text-lg font-semibold py-3 sm:py-2"
                    >
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      Adicionar ({appointments.length})
                    </Button>

                    <Button
                      type="button"
                      onClick={handleGoToPayment}
                      size="lg"
                      className="flex-1 text-white h-16 sm:h-14 text-base sm:text-lg font-semibold py-3 sm:py-2"
                      style={{ backgroundColor: "#D4AF37" }}
                      disabled={appointments.length === 0}
                    >
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      Finalizar (R$ {getTotalBookingFee()})
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* <WhatsAppButton />*/}
    </div>
  );
};

export default AppointmentBookingPage;
