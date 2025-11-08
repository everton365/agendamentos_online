import { useEffect, useState } from "react";
import { serviceOptions } from "@/data/servicesData";
import { useServices } from "@/hooks/use-services"; // hook que puxa da API

export function useMergedServices() {
  const { services: apiServices, loading } = useServices();
  const [merged, setMerged] = useState(serviceOptions);

  useEffect(() => {
    if (!apiServices || apiServices.length === 0) return;

    // 🔹 Mescla dados estáticos com os vindos da API
    const updated = serviceOptions.map((item) => {
      const apiItem = apiServices.find(
        (s) => s.name?.toLowerCase() === item.value.toLowerCase()
      );

      return {
        ...item,
        price: apiItem
          ? Number(apiItem.price).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "R$ 0,00", // fallback de preço
        image: apiItem?.link_service || item.image || null, // 🔹 garante compatibilidade com o campo da API
      };
    });

    setMerged(updated);
  }, [apiServices]);

  return { services: merged, loading };
}
