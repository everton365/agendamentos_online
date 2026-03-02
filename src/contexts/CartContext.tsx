import { createContext, useContext, useState, ReactNode } from "react";

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
  getTotalBookingFee: (studioTaxa?: string, taxaType?: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<CartAppointment[]>([]);

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

  const getTotalPrice = () => {
    return appointments.reduce((total, apt) => {
      const priceStr = apt.price || "R$ 0";
      const priceValue = parseFloat(
        priceStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
      );
      return total + (isNaN(priceValue) ? 0 : priceValue);
    }, 0);
  };

  const getTotalBookingFee = (studioTaxa?: string, taxaType?: string) => {
    const taxaValue = parseFloat(studioTaxa || "0");
    if (isNaN(taxaValue) || taxaValue === 0) return 0;

    if (taxaType === "percent") {
      // Aplica porcentagem sobre o valor total dos serviços
      const totalServices = getTotalPrice();
      return totalServices * (taxaValue / 100);
    }
    // fixed: multiplica quantidade de serviços pelo valor fixo da taxa
    const totalServices = appointments.reduce((total, apt) => {
      return total + apt.services.length;
    }, 0);
    return totalServices * taxaValue;
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
