import React, { createContext, useContext, useState, useEffect } from "react";

interface HorarioFuncionamento {
  abertura: string;
  fechamento: string;
}

interface Studio {
  id: number;
  studio_id: string;
  nome_studio: string;
  endereco: string;
  sobre: string;
  contato: string;
  email: string;
  instagramLink: string;
  facebookLink: string;
  tiktokLink: string;
  foto_capa: string | null;
  foto_studio: string | null;
  horario_funcionamento: {
    segunda: HorarioFuncionamento;
    terca: HorarioFuncionamento;
    quarta: HorarioFuncionamento;
    quinta: HorarioFuncionamento;
    sexta: HorarioFuncionamento;
    sabado: HorarioFuncionamento;
    domingo: HorarioFuncionamento;
  };
}

interface StudioContextType {
  studio: Studio | null;
  studioId: string | null;
  slug: string | null;
  setSlug: (slug: string) => void;
  loading: boolean;
  error: string | null;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlugState] = useState<string | null>(() => localStorage.getItem("studio_slug"));
  const [studioId, setStudioId] = useState<string | null>(null);

  const setSlug = (newSlug: string) => {
    setSlugState(newSlug);
    localStorage.setItem("studio_slug", newSlug);
  };
  const baseURL = import.meta.env.VITE_API_URL;

  console.log("id aqui", studioId);
  useEffect(() => {
    const fetchStudioInfo = async () => {
      const id = localStorage.getItem("studio_id");
      setStudioId(id);
      if (!studioId) {
        setError("Studio ID não configurado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${baseURL}/user/informacoes/studios/${studioId}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // ✅ Ajuste principal:
        // Se o backend retorna { studio: { ... } }, pega o objeto interno
        const studioData = data.studio || data;

        // ✅ Se vier string, converte para objeto
        if (typeof studioData.horario_funcionamento === "string") {
          try {
            studioData.horario_funcionamento = JSON.parse(
              studioData.horario_funcionamento || "{}",
            );
          } catch (e) {
            console.warn("Erro ao parsear horario_funcionamento:", e);
            studioData.horario_funcionamento = {};
          }
        }

        setStudio(studioData);
        setError(null);
      } catch (err) {
        console.error("❌ Erro ao buscar informações do studio:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao buscar informações do studio",
        );
        setStudio(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudioInfo();
  }, [studioId, baseURL]);

  return (
    <StudioContext.Provider value={{ studio, studioId, slug, setSlug, loading, error }}>
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error("useStudio deve ser usado dentro de um StudioProvider");
  }
  return context;
};
