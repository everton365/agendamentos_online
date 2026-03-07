import { useState, useEffect } from "react";

interface HorarioFuncionamento {
  abertura: string;
  fechamento: string;
}

export interface StudioData {
  id: number;
  studio_id: string;
  nome_studio: string;
  subtitle_studio: string;
  description_studio: string;
  endereco: string;
  sobre: string;
  contato: string;
  email: string;
  logoStudio: string;
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

export interface studioRules {
  id: string;
  rules_orden: number;
  rules: string;
  studio_id: string;
}

export interface ServiceData {
  id: string;
  name: string;
  label: string;
  value: string;
  price: string;
  image: string | null;
  duration: string | null;
  link_service: string | null;
  description: string | null;
}

export interface ResultData {
  id: number;
  titulo: string;
  descricao: string;
  imagem_url: string;
  created_at: string;
}

export interface ReviewData {
  id: number;
  nome: string;
  depoimento: string;
  estrelas: number;
  created_at: string;
}

interface UseStudioPageReturn {
  studio: StudioData | null;
  services: ServiceData[];
  subscription: any | null;
  results: ResultData[];
  ruleStudio: studioRules[];
  reviews: ReviewData[];
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export const useStudioPage = (
  slug: string | undefined,
): UseStudioPageReturn => {
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [results, setResults] = useState<ResultData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [ruleStudio, setRuleStudio] = useState<studioRules[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [subscription, setSubscription] = useState<any>(null); // Adicionado estado para assinatura
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (studio?.studio_id) {
      const currentStudio = localStorage.getItem("studio_id");

      if (currentStudio !== String(studio.studio_id)) {
        localStorage.setItem("studio_id", String(studio.studio_id));
      }
    }
  }, [studio?.studio_id]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!slug) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      try {
        setLoading(true);
        setNotFound(false);

        const response = await fetch(`${baseURL}/user/studio/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        if (!json.success) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const {
          studio: studioRaw,
          services: servicesRaw,
          results: resultsRaw,
          reviews: reviewsRaw,
          assinatura: assinaturaRaw,
          rules: ruleStudio,
        } = json.data;

        // Parse studio
        const studioData = { ...studioRaw };
        if (typeof studioData.horario_funcionamento === "string") {
          try {
            studioData.horario_funcionamento = JSON.parse(
              studioData.horario_funcionamento || "{}",
            );
          } catch {
            studioData.horario_funcionamento = {};
          }
        }
        setStudio(studioData);
        setSubscription(assinaturaRaw);
        setRuleStudio(ruleStudio);
        // 🔥 salva no localStorage
        if (studioData?.studio_id) {
          localStorage.setItem("studio_id", studioData.studio_id);
        }
        // Format services
        const formattedServices: ServiceData[] = (servicesRaw || []).map(
          (item: any) => ({
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
          }),
        );
        setServices(formattedServices);

        // Parse results
        setResults(resultsRaw || []);

        // Parse reviews with number coercion
        const parsedReviews: ReviewData[] = (reviewsRaw || []).map(
          (r: any) => ({
            ...r,
            estrelas: Number(r.estrelas) || 0,
          }),
        );
        setReviews(parsedReviews);

        setError(null);
      } catch (err) {
        console.error("❌ Erro ao buscar dados do studio:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao buscar dados do studio",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [slug, baseURL]);

  return {
    studio,
    services,
    subscription,
    results,
    ruleStudio,
    reviews,
    loading,
    error,
    notFound,
  };
};
