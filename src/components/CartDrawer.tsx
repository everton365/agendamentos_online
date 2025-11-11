import { ShoppingCart, Trash2, Calendar } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast"; // 🔔 garante que o toast existe

export function CartDrawer() {
  const { appointments, removeAppointment, getTotalPrice, getTotalBookingFee } =
    useCart();
  const navigate = useNavigate();
  const studioId = import.meta.env.VITE_STUDIO_ID;
  // 🕒 Função auxiliar: soma minutos a um horário (ex: 10:00 + 10 = 10:10)
  const addMinutesToTime = (time: string, minutes: number) => {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  };

  // 🛒 Redireciona para pagamento
  const handleGoToPayment = () => {
    if (appointments.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione pelo menos um agendamento antes de pagar.",
        variant: "destructive",
      });
      return;
    }

    navigate("/pagamento", {
      state: {
        appointments,
        studioId: studioId,
      },
    });
  };

  const totalBookingFee = getTotalBookingFee();
  const grandTotal = totalBookingFee; // Somente taxa

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {appointments.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {appointments.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Carrinho de Agendamentos</SheetTitle>
          <SheetDescription>
            {appointments.length === 0
              ? "Seu carrinho está vazio"
              : `${appointments.length} agendamento${
                  appointments.length > 1 ? "s" : ""
                } no carrinho`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento adicionado ainda</p>
            </div>
          ) : (
            <>
              {appointments.map((appointment) => {
                const endTime = addMinutesToTime(
                  appointment.time,
                  parseInt(appointment.duration || "0")
                );

                return (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 space-y-2 relative"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => removeAppointment(appointment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="pr-8">
                      <h4 className="font-semibold text-sm">
                        {appointment.services.map((s) => s.label).join(", ")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          appointment.date + "T00:00:00"
                        ).toLocaleDateString("pt-BR")}{" "}
                        • {appointment.time} - {endTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duração: {appointment.duration} minutos
                      </p>
                      {appointment.message && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          "{appointment.message}"
                        </p>
                      )}
                      <p className="text-lg font-bold mt-2">
                        {appointment.price}
                      </p>
                    </div>
                  </div>
                );
              })}

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Taxa de agendamento ({appointments.length}x R$ 20,00):
                  </span>
                  <span>R$ {totalBookingFee.toFixed(2).replace(".", ",")}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {grandTotal.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              {/*} <Button
                type="button"
                onClick={handleGoToPayment}
                size="lg"
                className="flex-1 text-white mt-4"
                style={{ backgroundColor: "#D4AF37" }}
                disabled={appointments.length === 0}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Finalizar Pagamento (R$ {totalBookingFee.toFixed(2)})
              </Button>*/}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
