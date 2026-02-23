import { de } from "date-fns/locale";
import { useState, useEffect } from "react";

interface Service {
  id: string;
  label: string;
  value: string;
  name: string;
  price: number | string;
  image?: string | null;
  duration?: string | null;
  link_service?: string | null;
  description?: string | null;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseURL = import.meta.env.VITE_API_URL;
  const studioId = import.meta.env.VITE_STUDIO_ID;

  useEffect(() => {
    const fetchServices = async () => {
      if (!studioId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/user/services/${studioId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 🔹 Converte o preço para número (mantém formato numérico limpo)
        const formattedData: Service[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          image: item.link_service || null,
          duration: item.duration || null,
          label: item.name,
          value: item.name,
          price: item.price
            ? Number(item.price).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            : "R$ 0,00",
          link_service: item.link_service || null,
          description: item.description || null,
        }));

        setServices(formattedData);
        setError(null);
      } catch (err) {
        console.error("❌ Erro ao buscar serviços:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao buscar serviços"
        );
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [studioId, baseURL]);

  return { services, loading, error };
};
