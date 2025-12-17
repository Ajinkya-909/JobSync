import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, dbUser, businessApplication, hasBusinessProfile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !dbUser) {
        navigate('/auth');
        return;
      }

      // Redirect based on role
      if (dbUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (dbUser.role === 'employee') {
        navigate('/employee/dashboard', { replace: true });
      } else if (dbUser.role === 'business') {
        // Check if business profile exists and is approved
        if (hasBusinessProfile && businessApplication?.status === 'approved') {
          navigate('/business/dashboard', { replace: true });
        } else {
          navigate('/business/application', { replace: true });
        }
      }
    }
  }, [user, dbUser, businessApplication, hasBusinessProfile, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Dashboard;
