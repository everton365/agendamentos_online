import { createContext, useContext, useState, ReactNode } from "react";
import { useStudio } from "@/contexts/StudioContext";
interface CartAppointment {
  id: string;
  service: string;
  services: Array<{
    value: string;
    label: string;
    price: string;
    duration: string;
  }>;
  price: string;
  duration: string;
  date: string;
  time: string;
  message?: string;
}

interface CartContextType {
  appointments: CartAppointment[];
  addAppointment: (appointment: Omit<CartAppointment, "id">) => void;
  removeAppointment: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalBookingFee: (taxa?: string, tipo?: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<CartAppointment[]>([]);
  const { studio } = useStudio(); // 👈 dados do estúdio

  const addAppointment = (appointment: Omit<CartAppointment, "id">) => {
    const newAppointment = {
      ...appointment,
      id: `${Date.now()}-${Math.random()}`,
    };
    setAppointments((prev) => [...prev, newAppointment]);
  };

  const removeAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  };

  const clearCart = () => {
    setAppointments([]);
  };

  // 💰 TOTAL DOS SERVIÇOS
  const getTotalPrice = () => {
    return appointments.reduce((total, apt) => {
      const priceStr = apt.price || "R$ 0";

      const priceValue = parseFloat(
        priceStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim(),
      );

      return total + (isNaN(priceValue) ? 0 : priceValue);
    }, 0);
  };

  // 🏦 TAXA DO SISTEMA
  const getTotalBookingFee = (taxa?: string, tipo?: string) => {
    if (!studio && !taxa && !tipo) return 0;

    const totalServicos = getTotalPrice();

    const taxaValue = Number(taxa || studio?.studio_taxa || "0");
    const type = tipo || studio?.taxa_type || "percent";

    let taxaCalculada = 0;

    if (type === "percent") {
      taxaCalculada = (totalServicos * taxaValue) / 100;
    }

    if (type === "fixed") {
      taxaCalculada = appointments.length * taxaValue;
    }

    return Number(taxaCalculada.toFixed(2));
  };

  return (
    <CartContext.Provider
      value={{
        appointments,
        addAppointment,
        removeAppointment,
        clearCart,
        getTotalPrice,
        getTotalBookingFee,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
