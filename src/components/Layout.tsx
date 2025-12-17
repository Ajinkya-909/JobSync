import React from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Don't show sidebar on auth page
  // Show sidebar on /jobs page only if user is authenticated
  const shouldShowSidebar = 
    location.pathname !== '/auth';

  return (
    <div className="flex h-screen w-screen bg-background">
      {shouldShowSidebar && <Sidebar />}
      
      <main className={cn('flex-1 overflow-y-auto pt-16 md:pt-0', className)}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
