import { useState, useEffect } from "react";

interface Service {
  id: string;
  name: string;
  price: number;
  link_service?: string | null;
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
          price: Number(item.price ?? 0),
          link_service: item.link_service || null,
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

  console.log("✅ Serviços carregados:", services);
  return { services, loading, error };
};
