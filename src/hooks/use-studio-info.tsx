import { useState, useEffect } from "react";
import type { StudioData } from "@/hooks/use-studio-page";

export const useStudioInfo = () => {
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [loading, setLoading] = useState(true);

  const baseURL = import.meta.env.VITE_API_URL;
  const studioId = import.meta.env.VITE_STUDIO_ID;

  useEffect(() => {
    if (!studioId) {
      setLoading(false);
      return;
    }

    const fetchStudio = async () => {
      try {
        const response = await fetch(`${baseURL}/studio/${studioId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const json = await response.json();
        if (json.success) {
          const studioData = json.data.studio;
          if (typeof studioData.horario_funcionamento === "string") {
            try {
              studioData.horario_funcionamento = JSON.parse(studioData.horario_funcionamento || "{}");
            } catch {
              studioData.horario_funcionamento = {};
            }
          }
          setStudio(studioData);
        }
      } catch (err) {
        console.error("Erro ao buscar studio:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudio();
  }, [studioId, baseURL]);

  return { studio, loading };
};
