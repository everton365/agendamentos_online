import { useState, useEffect } from "react";
import type { ServiceData } from "@/hooks/use-studio-page";

export const useServices = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  const baseURL = import.meta.env.VITE_API_URL;
  const studioId = import.meta.env.VITE_STUDIO_ID;

  useEffect(() => {
    if (!studioId) {
      setLoading(false);
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await fetch(`${baseURL}/studio/${studioId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const json = await response.json();
        if (json.success) {
          const formattedServices: ServiceData[] = (json.data.services || []).map((item: any) => ({
            id: String(item.id),
            name: item.name,
            image: item.link_service || null,
            duration: item.duration || null,
            label: item.name,
            value: item.name,
            price: item.price
              ? Number(item.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : "R$ 0,00",
            link_service: item.link_service || null,
            description: item.description || null,
          }));
          setServices(formattedServices);
        }
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [studioId, baseURL]);

  return { services, loading };
};
