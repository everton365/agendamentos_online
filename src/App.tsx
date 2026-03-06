import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { StudioProvider } from "@/contexts/StudioContext";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all pages
const Index = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AppointmentBookingPage = lazy(() => import("./pages/AppointmentBookingPage"));
const PaymentMethodPage = lazy(() => import("./pages/PaymentMethodPage"));
const PixPaymentPage = lazy(() => import("./pages/PixPaymentPage"));
const PaymentConfirmationPage = lazy(() => import("./pages/PaymentConfirmationPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min cache
      gcTime: 10 * 60 * 1000,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="space-y-4 w-full max-w-2xl px-6">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-8 w-1/2 mx-auto" />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StudioProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/:slug" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/agendamento" element={<AppointmentBookingPage />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/pagamento" element={<PaymentMethodPage />} />
                  <Route path="/pagamento-pix" element={<PixPaymentPage />} />
                  <Route path="/agendamento-confirmado" element={<PaymentConfirmationPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </StudioProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
