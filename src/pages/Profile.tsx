// src/pages/ClientProfile.tsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, LogOut, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// --- CONFIGURAR SUPABASE ---
const supabase = createClient(
  "https://tndmjofklolancbhchbl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZG1qb2ZrbG9sYW5jYmhjaGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjE1NjAsImV4cCI6MjA3MTI5NzU2MH0.OUynHXWf8Ak8z9S0lWd_FtlPcOjJ4p-B_1yE-BfuzaI"
);

export default function ClientProfile() {
  const [client, setClient] = useState<any>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const { user, signOut } = useAuth();
  const clientId = "13842a47-07c2-4d92-9253-16ded7d63838";
  useEffect(() => {
    if (!user) return;

    // Buscar dados da cliente
    supabase
      .from("profiles")
      .select("*")
      .eq("id", clientId)
      .single()
      .then(({ data }) => setClient(data));

    // Buscar histórico de procedimentos da cliente
    supabase
      .from("procedures")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setProcedures(data || []));

    // Buscar agendamentos futuros
    supabase
      .from("appointments")
      .select("*")
      .eq("client_id", user.id)
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .then(({ data }) => setAppointments(data || []));
  }, [user]);

  // Upload de foto de perfil
  const handleUpload = async () => {
    if (!file || !clientId) return;

    try {
      // Definir nome do arquivo diretamente no bucket "clientes"
      const fileExtension = file.name.split(".").pop();
      const fileName = `clientes/${clientId}-${Date.now()}.${fileExtension}`; // caminho dentro do bucket

      console.log("Nome do arquivo:", fileName);

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from("clientes")
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        console.error("Erro no upload:", uploadError.message);
        return;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from("clientes")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log("URL pública:", publicUrl);

      // Atualizar avatar na tabela profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", clientId);

      if (updateError) {
        console.error("Erro ao atualizar perfil:", updateError.message);
        return;
      }

      // Atualizar estado local
      setClient((prev: any) => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      // Limpar arquivo selecionado
      setFile(null);
      console.log("Upload e atualização concluídos com sucesso");
    } catch (err) {
      console.error("Erro inesperado no upload:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho com sair */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={signOut}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Perfil da Cliente */}
        {client && (
          <div className="flex items-center gap-6 mb-10">
            <img
              src={client.avatar_url || "https://via.placeholder.com/120"}
              alt="Foto da Cliente"
              className="w-28 h-28 rounded-full border-4 border-pink-300 shadow-md"
            />
            <div>
              <h1 className="text-2xl font-bold text-pink-600">
                {client.display_name}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-500 text-sm">{client.phone}</p>

              {/* Upload de nova foto */}
              <div className="mt-3 flex gap-2 items-center">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleUpload}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Últimos Procedimentos */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-pink-600 mb-4">
            Histórico de Procedimentos
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {procedures.map((proc) => (
              <Card key={proc.id} className="shadow-lg rounded-2xl">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800">{proc.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(proc.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {proc.notes || "Sem observações"}
                  </p>
                  <CheckCircle className="w-5 h-5 text-pink-500 mt-2" />
                </CardContent>
              </Card>
            ))}
            {procedures.length === 0 && (
              <p className="text-gray-500">Nenhum procedimento realizado.</p>
            )}
          </div>
        </section>

        {/* Agendamentos */}
        <section>
          <h2 className="text-xl font-semibold text-pink-600 mb-4">
            Próximos Agendamentos
          </h2>
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <Card key={app.id} className="rounded-2xl shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {app.service}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(app.date).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="text-pink-600 border-pink-300 hover:bg-pink-100"
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                Nenhum agendamento futuro encontrado.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
