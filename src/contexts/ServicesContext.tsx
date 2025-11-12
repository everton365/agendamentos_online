import React, { createContext, useContext, useState, useEffect } from "react";
import { serviceOptions } from "@/data/servicesData";

interface Service {
  id?: string;
  label: string;
  value: string;
  name: string;
  price: number | string;
  image?: string | null;
  duration?: string | null;
  link_service?: string | null;
  description?: string | null;
  icon?: any;
}

interface ServicesContextType {
  services: Service[];
  loading: boolean;
  error: string | null;
}

const ServicesContext = createContext<ServicesContextType | undefined>(
  undefined
);

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [services, setServices] = useState<Service[]>(serviceOptions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseURL = import.meta.env.VITE_API_URL;
  const studioId = import.meta.env.VITE_STUDIO_ID;

  useEffect(() => {
    const fetchServices = async () => {
      if (!studioId) {
        setServices(serviceOptions);
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

        // Mescla dados estáticos com os vindos da API
        const mergedServices = serviceOptions.map((item) => {
          const apiItem = data.find(
            (s: any) => s.name?.toLowerCase() === item.value.toLowerCase()
          );

          return {
            ...item,
            id: apiItem?.id ? String(apiItem.id) : item.value,
            price: apiItem
              ? Number(apiItem.price).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : item.price || "R$ 0,00",
            image: apiItem?.link_service || item.image || null,
            duration: apiItem?.duration || item.duration || null,
            description: apiItem?.description || item.description || null,
            link_service: apiItem?.link_service || null,
          };
        });

        setServices(mergedServices);
        setError(null);
      } catch (err) {
        console.error("❌ Erro ao buscar serviços:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao buscar serviços"
        );
        setServices(serviceOptions); // Fallback para dados estáticos
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [studioId, baseURL]);

  return (
    <ServicesContext.Provider value={{ services, loading, error }}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServicesContext = () => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error(
      "useServicesContext must be used within a ServicesProvider"
    );
  }
  return context;
};
