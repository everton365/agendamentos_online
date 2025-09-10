import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Camera, Calendar, Clock, Phone, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isFuture, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import Header from "@/components/Header";

interface Profile {
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface Appointment {
  id: string;
  name: string;
  phone: string;
  service: string;
  price: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  message: string | null;
  duration?: string | number;
  created_at: string;
}

type Slot = {
  time: string;
  status: string;
  slotSelectable?: boolean;
  displayStatus?: string;
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    display_name: null,
    phone: null,
    avatar_url: null,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<
    {
      time: string;
      status: "available" | "PENDING" | "CONFIRMED" | "blocked";
    }[]
  >([]);

  const baseURL = import.meta.env.VITE_API_URL;

  const blockedDate = { bloqueada: false }; // Definição mínima

  const parseDuration = (duration: string | number) => {
    if (typeof duration === "number") return duration; // já é em minutos
    const hoursMatch = duration.match(/(\d+)\s*h/);
    const minutesMatch = duration.match(/(\d+)\s*min/);

    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) * 60 : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

    return hours + minutes;
  };
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setProfile({
          display_name: data.display_name || null,
          phone: data.phone || null,
          avatar_url: (data as any).avatar_url || null,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user?.id)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      const appointmentsWithPrice: Appointment[] = (data || []).map(
        (a: any) => ({
          ...a,
          price: a.price ?? "R$ 0,00",
        })
      );
      setAppointments(appointmentsWithPrice);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setIsEditing(true);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      let finalAvatarUrl = profile.avatar_url;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `avatar-${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("clientes")
          .upload(filePath, selectedFile);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("clientes").getPublicUrl(filePath);
        finalAvatarUrl = publicUrl;
      }

      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user?.id,
          display_name: profile.display_name,
          phone: profile.phone,
          avatar_url: finalAvatarUrl,
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;

      setProfile((prev) => ({ ...prev, avatar_url: finalAvatarUrl }));
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAppointments();
    }
  }, [user]);

  const canReschedule = (appointmentDate: string, appointmentTime: string) => {
    const appointmentDateTime = parseISO(
      `${appointmentDate}T${appointmentTime}`
    );
    const diffHours =
      (appointmentDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return diffHours >= 3;
  };
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);
      if (error) throw error;
      toast({
        title: "Agendamento cancelado",
        description: "Seu agendamento foi cancelado com sucesso.",
      });
      fetchAppointments();
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlotsForDate = async (date: string) => {
    try {
      const res = await fetch(`${baseURL}/user/appointments/status/${date}`);
      if (!res.ok) throw new Error("Erro ao buscar horários");
      const data = await res.json();
      if (!data.schedule) return [];

      return data.schedule.map((slot: { time: string; status: string }) => ({
        time: slot.time.slice(0, 5),
        status: slot.status as
          | "available"
          | "PENDING"
          | "CONFIRMED"
          | "blocked",
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleDateChange = async (date: string) => {
    setRescheduleDate(date);
    const slots = await getTimeSlotsForDate(date);
    setAvailableTimes(slots);
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      toast({
        title: "Erro",
        description: "Selecione uma data e horário para reagendar.",
        variant: "destructive",
      });
      return;
    }
    if (
      !canReschedule(
        selectedAppointment.appointment_date,
        selectedAppointment.appointment_time
      )
    ) {
      toast({
        title: "Reagendamento não permitido",
        description:
          "Só é possível reagendar até 3 horas antes do horário marcado.",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase
        .from("appointments")
        .update({
          appointment_date: rescheduleDate,
          appointment_time: rescheduleTime,
          status: "CONFIRMED",
        })
        .eq("id", selectedAppointment.id);
      if (error) throw error;
      toast({
        title: "Agendamento reagendado",
        description: "Seu agendamento foi reagendado com sucesso.",
      });
      setSelectedAppointment(null);
      setRescheduleDate("");
      setRescheduleTime("");
      setDialogOpen(false);
      fetchAppointments();
    } catch (error: any) {
      toast({
        title: "Erro ao reagendar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const futureAppointments = appointments.filter((apt) =>
    isFuture(parseISO(`${apt.appointment_date}T${apt.appointment_time}`))
  );
  const pastAppointments = appointments.filter((apt) =>
    isPast(parseISO(`${apt.appointment_date}T${apt.appointment_time}`))
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { label: "Pendente", variant: "secondary" as const },
      CONFIRMED: { label: "Confirmado", variant: "default" as const },
      completed: { label: "Concluído", variant: "secondary" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "secondary" as const,
      }
    );
  };

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
    console.log(date);
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
    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      const d = new Date(year, month - 1, day); // cria data local
      const dayOfWeek = d.getDay(); // 0=Dom, 1=Seg, ..., 3=Qua
      if (dayOfWeek === 3 && start >= 14 * 60) {
        console.log(`⛔ Slot ${startTime}: bloqueado (quarta-feira após 14h)`);
        return false;
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
    if (!rescheduleDate || !selectedAppointment) return [];
    const durationMinutes = parseDuration(selectedAppointment.duration || 30);
    const now = new Date();
    const nowPlus3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const [year, month, day] = rescheduleDate.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const dayOfWeek = selectedDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return availableTimes.map((slot) => {
      const slotSelectable = canFitInSlot(
        slot.time,
        durationMinutes,
        availableTimes,
        rescheduleDate
      );

      const [h, m] = slot.time.split(":").map(Number);
      const slotDate = new Date(year, month - 1, day, h, m);
      const isToday = now.toISOString().split("T")[0] === rescheduleDate;
      const isBeforeLimit = isToday && slotDate < nowPlus3h;

      let displayStatus = slot.status;
      if (
        !slotSelectable ||
        isBeforeLimit ||
        isWeekend ||
        blockedDate.bloqueada
      ) {
        displayStatus = "blocked";
      }

      return {
        ...slot,
        slotSelectable:
          slotSelectable &&
          !isBeforeLimit &&
          !isWeekend &&
          !blockedDate.bloqueada,
        displayStatus,
      };
    });
  }, [availableTimes, rescheduleDate, selectedAppointment]);

  const formatDuration = (duration: string | number) => {
    const minutes = parseDuration(duration);
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    return `${minutes}min`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> Meu Perfil
              </CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e visualize seus agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={previewUrl || profile.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                    {profile.display_name?.charAt(0) ||
                      user.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Camera className="w-4 h-4" />
                      {selectedFile ? "Foto selecionada" : "Selecionar foto"}
                    </div>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Clique em "Salvar Alterações" para confirmar
                    </p>
                  )}
                </div>
              </div>

              {/* Nome e telefone */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-0">
                <div className="space-y-0 p-1">
                  {isEditing ? (
                    <>
                      <Label htmlFor="display_name">Nome</Label>
                      <Input
                        id="display_name"
                        value={profile.display_name || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            display_name: e.target.value,
                          }))
                        }
                        placeholder="Seu nome completo"
                      />
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.display_name || "Sem nome"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {isEditing ? (
                    <>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profile.phone || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="(00) 00000-0000"
                      />
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.phone || "Telefone não informado"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() =>
                  isEditing ? handleProfileUpdate() : setIsEditing(true)
                }
                disabled={loading}
              >
                {loading
                  ? "Salvando..."
                  : isEditing
                  ? "Salvar Alterações"
                  : "Editar Perfil"}
              </Button>
            </CardContent>
          </Card>

          {/* Agendamentos Futuros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Próximos Agendamentos
              </CardTitle>
              <CardDescription>Seus atendimentos futuros</CardDescription>
            </CardHeader>
            <CardContent>
              {futureAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Você não tem agendamentos futuros
                </p>
              ) : (
                <div className="space-y-4">
                  {futureAppointments.map((appointment) => (
                    <Dialog
                      key={appointment.id}
                      open={
                        dialogOpen && selectedAppointment?.id === appointment.id
                      }
                      onOpenChange={(open) => {
                        if (!open) {
                          setSelectedAppointment(null);
                          setRescheduleDate("");
                          setRescheduleTime("");
                        }
                        setDialogOpen(open);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Card
                          className="border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setDialogOpen(true);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">
                                    {appointment.service} {appointment.price}
                                  </h4>
                                  <Badge
                                    {...getStatusBadge(appointment.status)}
                                  >
                                    {getStatusBadge(appointment.status).label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(
                                      parseISO(appointment.appointment_date),
                                      "dd 'de' MMMM 'de' yyyy",
                                      { locale: ptBR }
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {appointment.appointment_time}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Gerenciar Agendamento</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          {/* Info */}
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">
                              {appointment.service}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(
                                  parseISO(appointment.appointment_date),
                                  "dd 'de' MMMM 'de' yyyy",
                                  { locale: ptBR }
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {appointment.appointment_time}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDuration(appointment.duration)}
                              </div>
                            </div>
                          </div>

                          {/* Reagendamento */}
                          {appointment.status !== "cancelled" &&
                            appointment.status !== "PENDING" && (
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <Label>Nova data</Label>
                                  <Input
                                    type="date"
                                    value={rescheduleDate}
                                    onChange={(e) =>
                                      handleDateChange(e.target.value)
                                    }
                                    min={new Date().toISOString().split("T")[0]}
                                  />
                                </div>

                                <Label>Novo horário</Label>
                                <div>
                                  {processedSlots.map((slot) => {
                                    const isSelected =
                                      rescheduleTime === slot.time;
                                    const isAvailable =
                                      slot.displayStatus === "available";

                                    return (
                                      <button
                                        key={slot.time}
                                        type="button"
                                        onClick={() =>
                                          isAvailable &&
                                          slot.slotSelectable &&
                                          setRescheduleTime(slot.time)
                                        }
                                        disabled={
                                          !isAvailable || !slot.slotSelectable
                                        }
                                        className={`
          p-3 rounded-lg text-sm font-medium transition-all border-2
          ${
            isSelected && isAvailable && slot.slotSelectable
              ? "border-primary bg-primary text-primary-foreground"
              : isAvailable && slot.slotSelectable
              ? "border-[hsl(var(--status-available))] bg-[hsl(var(--status-available)/0.1)] text-[hsl(var(--status-available))] hover:bg-[hsl(var(--status-available)/0.2)]"
              : slot.displayStatus === "PENDING"
              ? "border-[hsl(var(--status-pending))] bg-[hsl(var(--status-pending)/0.1)] text-[hsl(var(--status-pending))] cursor-not-allowed"
              : slot.displayStatus === "CONFIRMED"
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
                                              : slot.displayStatus === "PENDING"
                                              ? "Pendente"
                                              : slot.displayStatus ===
                                                "CONFIRMED"
                                              ? "Ocupado"
                                              : "Bloqueado"}
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleRescheduleAppointment}
                                    disabled={
                                      loading ||
                                      !rescheduleDate ||
                                      !rescheduleTime
                                    }
                                    className="flex-1"
                                  >
                                    Reagendar
                                  </Button>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        className="flex-1"
                                      >
                                        Cancelar agendamento
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Tem certeza?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Ao confirmar, o agendamento será
                                          cancelado.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleCancelAppointment(
                                              appointment.id
                                            )
                                          }
                                        >
                                          Confirmar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Agendamentos</CardTitle>
              <CardDescription>Agendamentos anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum agendamento concluído
                </p>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="border-l-4 border-l-muted"
                    >
                      <CardContent>
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {appointment.service} {appointment.price}
                              </h4>
                              <Badge {...getStatusBadge(appointment.status)}>
                                {getStatusBadge(appointment.status).label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(
                                  parseISO(appointment.appointment_date),
                                  "dd 'de' MMMM 'de' yyyy",
                                  { locale: ptBR }
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {appointment.appointment_time}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
