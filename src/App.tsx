import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { TrainerDashboard } from "@/pages/trainer/TrainerDashboard";
import { SecurityDashboard } from "@/pages/security/SecurityDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Routes>
        {/* Redirect root to role-specific dashboard */}
        <Route path="/" element={<Navigate to={`/${user?.role}`} replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to={`/${user?.role}`} />} />
        
        {/* Trainer Routes */}
        <Route path="/trainer" element={user?.role === 'trainer' ? <TrainerDashboard /> : <Navigate to={`/${user?.role}`} />} />
        
        {/* Security Routes */}
        <Route path="/security" element={user?.role === 'security' ? <SecurityDashboard /> : <Navigate to={`/${user?.role}`} />} />
        
        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
