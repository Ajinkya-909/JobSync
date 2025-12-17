import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('employee' | 'business')[];
  requireApproval?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requireApproval = false 
}) => {
  const { user, dbUser, businessApplication, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user || !dbUser) {
    return <Navigate to="/auth" replace />;
  }

  // Check role permission
  if (allowedRoles && !allowedRoles.includes(dbUser.role as 'employee' | 'business')) {
    // Redirect to appropriate dashboard
    if (dbUser.role === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    } else if (dbUser.role === 'business') {
      if (businessApplication?.status === 'approved') {
        return <Navigate to="/business/dashboard" replace />;
      } else {
        return <Navigate to="/business/application" replace />;
      }
    }
    return <Navigate to="/auth" replace />;
  }

  // Business approval check
  if (requireApproval && dbUser.role === 'business') {
    if (businessApplication?.status !== 'approved') {
      return <Navigate to="/business/application" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
