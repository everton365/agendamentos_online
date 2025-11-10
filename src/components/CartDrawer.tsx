import { ShoppingCart, X, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function CartDrawer() {
  const { appointments, removeAppointment, getTotalPrice, getTotalBookingFee } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (appointments.length > 0) {
      navigate("/pagamento");
    }
  };

  const totalServices = getTotalPrice();
  const totalBookingFee = getTotalBookingFee();
  const grandTotal = totalServices + totalBookingFee;

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
              : `${appointments.length} agendamento${appointments.length > 1 ? "s" : ""} no carrinho`}
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
              {appointments.map((appointment) => (
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
                      {appointment.services.map(s => s.label).join(", ")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString("pt-BR")} às {appointment.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duração: {appointment.duration}
                    </p>
                    {appointment.message && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        "{appointment.message}"
                      </p>
                    )}
                    <p className="text-lg font-bold mt-2">{appointment.price}</p>
                  </div>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal serviços:</span>
                  <span>R$ {totalServices.toFixed(2).replace(".", ",")}</span>
                </div>
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

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleCheckout}
              >
                Finalizar Pagamento
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
