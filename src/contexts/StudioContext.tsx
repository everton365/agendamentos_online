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

  const studioId = import.meta.env.VITE_STUDIO_ID;
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudioInfo = async () => {
      if (!studioId) {
        setError("Studio ID não configurado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${baseURL}/informacoes/studios/${studioId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.studio) {
          setStudio(data.studio);
          setError(null);
        } else {
          throw new Error("Dados do studio não encontrados");
        }
      } catch (err) {
        console.error("❌ Erro ao buscar informações do studio:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao buscar informações do studio"
        );
        setStudio(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudioInfo();
  }, [studioId, baseURL]);

  return (
    <StudioContext.Provider value={{ studio, loading, error }}>
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
