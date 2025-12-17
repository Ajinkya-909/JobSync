import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Home from "./pages/Home";
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

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBusinesses from "./pages/admin/AdminBusinesses";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Public Job Routes */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            
            {/* Dashboard redirect */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Employee Routes */}
            <Route 
              path="/employee/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <Layout>
                    <EmployeeDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Business Routes */}
            <Route 
              path="/business/application" 
              element={
                <ProtectedRoute allowedRoles={['business']}>
                  <Layout>
                    <BusinessApplication />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/business/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['business']} requireApproval>
                  <Layout>
                    <BusinessDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/business/jobs/new" 
              element={
                <ProtectedRoute allowedRoles={['business']} requireApproval>
                  <Layout>
                    <CreateJob />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/business/jobs/:id" 
              element={
                <ProtectedRoute allowedRoles={['business']} requireApproval>
                  <Layout>
                    <ManageJob />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/businesses" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminBusinesses />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminJobs />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/employees" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminEmployees />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminAnalytics />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
