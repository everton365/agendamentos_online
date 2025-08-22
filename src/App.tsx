import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AppointmentBookingPage from "./pages/AppointmentBookingPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/agendamento" element={<AppointmentBookingPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/pagamento" element={<PaymentMethodPage />} />
            <Route path="/agendamento-confirmado" element={<PaymentConfirmationPage />} />
            <Route path="/pagamento-old" element={<PaymentPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
