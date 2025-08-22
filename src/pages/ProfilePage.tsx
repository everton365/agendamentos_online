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
import { Camera, Calendar, Clock, Phone, User, Mail } from "lucide-react";
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
                    <Card
                      key={appointment.id}
                      className="border-l-4 border-l-primary"
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
                    <Card
                      key={appointment.id}
                      className="border-l-4 border-l-muted"
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
