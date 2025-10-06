import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { SuperAdminDashboard } from "@/pages/super-admin/SuperAdminDashboard";
import { AdminManagement } from "@/pages/super-admin/AdminManagement";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { VehicleManagement } from "@/pages/admin/VehicleManagement";
import { TrainerDashboard } from "@/pages/trainer/TrainerDashboard";
import { SecurityDashboard } from "@/pages/security/SecurityDashboard";
import { BookVehicle } from "@/pages/trainer/BookVehicle";
import { MyBookings } from "@/pages/trainer/MyBookings";
import NotFound from "./pages/NotFound";
import { IssueKeys } from "./pages/security/IssueKeyes";
import { VehicleReturns } from "./pages/security/VehicleReturns";
import { SecurityLogs } from "@/pages/security/SecurityLogs";
import { Analytics } from "./pages/admin/Analytics";
import { Users } from "./pages/admin/Users";
import { Bookings } from "./pages/admin/Bookings";

import { Reports } from "./pages/admin/Reports";
import ServiceRecords from "./pages/admin/ServiceRecords";
import { AllUsers } from "./pages/super-admin/AllUsers";
import AllVehicles from "./pages/super-admin/AllVehicles";
import { AllAnalytics } from "./pages/super-admin/AllAnalytics";



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
        
        {/* Super Admin Routes */}
        <Route path="/super_admin" element={user?.role === 'super_admin' ? <SuperAdminDashboard /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/super_admin/admins" element={user?.role === 'super_admin' ? <AdminManagement /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/super_admin/users" element={user?.role === 'super_admin' ? <AllUsers /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/super_admin/vehicles" element={user?.role === 'super_admin' ? <AllVehicles /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/super_admin/reports" element={user?.role === 'super_admin' ? <Reports /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/super_admin/analytics" element={user?.role === 'super_admin' ? <AllAnalytics /> : <Navigate to={`/${user?.role}`} />} />

        {/* Admin Routes */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/admin/vehicles" element={user?.role === 'admin' ? <VehicleManagement /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/admin/analytics" element={user?.role === 'admin' ? <Analytics /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/admin/users" element={user?.role === 'admin' ? <Users /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/admin/bookings" element={user?.role === 'admin' ? <Bookings /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/admin/service-records" element={user?.role === 'admin' ? <ServiceRecords /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/admin/reports" element={user?.role === 'admin' ? <Reports /> : <Navigate to={`/${user?.role}`} />} />

        {/* Trainer Routes */}
        <Route path="/trainer" element={user?.role === 'trainer' ? <TrainerDashboard /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/trainer/book" element={user?.role === 'trainer' ? <BookVehicle /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/trainer/bookings" element={user?.role === 'trainer' ? <MyBookings /> : <Navigate to={`/${user?.role}`} />} />
        
        {/* Security Routes */}
        <Route path="/security" element={user?.role === 'security' ? <SecurityDashboard /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/security/keys" element={user?.role === 'security' ? <IssueKeys/> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/security/returns" element={user?.role === 'security' ? <VehicleReturns /> : <Navigate to={`/${user?.role}`} />} />
        <Route path="/security/logs" element={user?.role === "security" ? <SecurityLogs /> : <Navigate to={`/${user?.role}`} />} />

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
