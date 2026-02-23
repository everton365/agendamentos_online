import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import StudioPage from "./pages/StudioPage";
import AuthPage from "./pages/AuthPage";
import AppointmentBookingPage from "./pages/AppointmentBookingPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import PixPaymentPage from "./pages/PixPaymentPage";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/agendamento" element={<AppointmentBookingPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/pagamento" element={<PaymentMethodPage />} />
              <Route path="/pagamento-pix" element={<PixPaymentPage />} />
              <Route path="/agendamento-confirmado" element={<PaymentConfirmationPage />} />
              <Route path="/:slug" element={<StudioPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
