import { useState, useEffect } from "react";

interface Review {
  id: number;
  nome: string;
  depoimento: string;
  estrelas: number;
  created_at: string;
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseURL = import.meta.env.VITE_API_URL;
  const studioId = import.meta.env.VITE_STUDIO_ID;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!studioId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/user/reviews/${studioId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Review[] = await response.json();
        setReviews(data);
        setError(null);
      } catch (err) {
        console.error("❌ Erro ao buscar avaliações:", err);
        setError(err instanceof Error ? err.message : "Erro ao buscar avaliações");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [studioId, baseURL]);

  return { reviews, loading, error };
};
