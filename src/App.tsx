import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessApplication from "./pages/BusinessApplication";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CreateJob from "./pages/CreateJob";
import ManageJob from "./pages/ManageJob";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Dashboard redirect */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Employee Routes */}
            <Route 
              path="/employee/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Business Routes */}
            <Route 
              path="/business/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['business']} requireApproval>
                  <BusinessDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/business/application" 
              element={
                <ProtectedRoute allowedRoles={['business']}>
                  <BusinessApplication />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/business/jobs/new" 
              element={
                <ProtectedRoute allowedRoles={['business']} requireApproval>
                  <CreateJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/business/jobs/:id" 
              element={
                <ProtectedRoute allowedRoles={['business']} requireApproval>
                  <ManageJob />
                </ProtectedRoute>
              } 
            />

            {/* Public Job Routes */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
