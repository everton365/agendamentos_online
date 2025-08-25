import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Camera, Calendar, Clock, Phone, User, Mail, RotateCcw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

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
  appointment_date: string;
  appointment_time: string;
  status: string;
  message: string | null;
  created_at: string;
}

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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAppointments();
    }
  }, [user]);

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
      setAppointments(data || []);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setIsEditing(true);
    setSelectedFile(file);

    // Criar preview local da imagem
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);

      let finalAvatarUrl = profile.avatar_url;

      // Se há um arquivo selecionado, fazer upload primeiro
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `avatar-${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        // Upload da imagem para o bucket clientes
        const { error: uploadError } = await supabase.storage
          .from("clientes")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Obter a URL pública da imagem
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

      // Atualizar o estado com a nova URL
      setProfile((prev) => ({ ...prev, avatar_url: finalAvatarUrl }));

      // Limpar seleção e preview
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

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

  const futureAppointments = appointments.filter((apt) => {
    const appointmentDate = parseISO(
      `${apt.appointment_date}T${apt.appointment_time}`
    );
    return isFuture(appointmentDate);
  });

  const pastAppointments = appointments.filter((apt) => {
    const appointmentDate = parseISO(
      `${apt.appointment_date}T${apt.appointment_time}`
    );
    return isPast(appointmentDate);
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      confirmed: { label: "Confirmado", variant: "default" as const },
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

      // Atualizar lista de agendamentos
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

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      toast({
        title: "Erro",
        description: "Selecione uma data e horário para reagendar.",
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
          status: "pending"
        })
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      toast({
        title: "Agendamento reagendado",
        description: "Seu agendamento foi reagendado com sucesso.",
      });

      // Limpar estados e fechar modal
      setSelectedAppointment(null);
      setRescheduleDate("");
      setRescheduleTime("");
      setDialogOpen(false);
      
      // Atualizar lista de agendamentos
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

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header do Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Meu Perfil
              </CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e visualize seus agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
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

              {/* Informações do Perfil */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Email (sempre visual) */}
                <div className="space-y-2">
                  {isEditing && <Label htmlFor="email">Email</Label>}
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>

                {/* Nome */}
                <div className="space-y-2">
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
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {profile.display_name || "Sem nome"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Telefone */}
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
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {profile.phone || "Telefone não informado"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => {
                  if (isEditing) {
                    handleProfileUpdate();
                  } else {
                    setIsEditing(true);
                  }
                }}
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
                <Calendar className="w-5 h-5" />
                Próximos Agendamentos
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
                    <Dialog key={appointment.id} open={dialogOpen && selectedAppointment?.id === appointment.id} onOpenChange={(open) => {
                      if (!open) {
                        setSelectedAppointment(null);
                        setRescheduleDate("");
                        setRescheduleTime("");
                      }
                      setDialogOpen(open);
                    }}>
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
                                    {appointment.service}
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
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Gerenciar Agendamento</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">{appointment.service}</h4>
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
                          
                          <div className="space-y-3">
                            <Label>Nova data</Label>
                            <Input
                              type="date"
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <Label>Novo horário</Label>
                            <select
                              className="w-full p-2 border rounded-md"
                              value={rescheduleTime}
                              onChange={(e) => setRescheduleTime(e.target.value)}
                            >
                              <option value="">Selecione um horário</option>
                              {generateTimeSlots().map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={handleRescheduleAppointment}
                              disabled={loading || !rescheduleDate || !rescheduleTime}
                              className="flex-1"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              {loading ? "Reagendando..." : "Reagendar"}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="flex-1">
                                  <X className="w-4 h-4 mr-2" />
                                  Cancelar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      handleCancelAppointment(appointment.id);
                                      setDialogOpen(false);
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Cancelar agendamento
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Histórico de Atendimentos
              </CardTitle>
              <CardDescription>Seus atendimentos anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Você ainda não teve atendimentos
                </p>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <Dialog key={appointment.id} open={dialogOpen && selectedAppointment?.id === appointment.id} onOpenChange={(open) => {
                      if (!open) {
                        setSelectedAppointment(null);
                        setRescheduleDate("");
                        setRescheduleTime("");
                      }
                      setDialogOpen(open);
                    }}>
                      <DialogTrigger asChild>
                        <Card
                          className="border-l-4 border-l-muted cursor-pointer hover:shadow-md transition-shadow"
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
                                    {appointment.service}
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
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reagendar Atendimento</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">{appointment.service}</h4>
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
                          
                          <div className="space-y-3">
                            <Label>Nova data</Label>
                            <Input
                              type="date"
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <Label>Novo horário</Label>
                            <select
                              className="w-full p-2 border rounded-md"
                              value={rescheduleTime}
                              onChange={(e) => setRescheduleTime(e.target.value)}
                            >
                              <option value="">Selecione um horário</option>
                              {generateTimeSlots().map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <Button
                            onClick={handleRescheduleAppointment}
                            disabled={loading || !rescheduleDate || !rescheduleTime}
                            className="w-full"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {loading ? "Reagendando..." : "Reagendar"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
