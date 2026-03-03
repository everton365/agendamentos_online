import { useState, useEffect } from "react";
import { useStudio } from "@/contexts/StudioContext";

interface Result {
  id: number;
  titulo: string;
  descricao: string;
  imagem_url: string;
  created_at: string;
}

export const useResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseURL = import.meta.env.VITE_API_URL;
  const { studioId } = useStudio();

  useEffect(() => {
    const fetchResults = async () => {
      if (!studioId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/user/results/${studioId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Result[] = await response.json();
        setResults(data);
        setError(null);
      } catch (err) {
        console.error("❌ Erro ao buscar resultados:", err);
        setError(err instanceof Error ? err.message : "Erro ao buscar resultados");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [studioId, baseURL]);

  return { results, loading, error };
};
