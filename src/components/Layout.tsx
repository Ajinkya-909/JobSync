import React from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const location = useLocation();
  
  // Don't use layout for auth and public pages
  const shouldShowSidebar = 
    location.pathname !== '/auth' && 
    !location.pathname.startsWith('/jobs');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {shouldShowSidebar && <Sidebar />}
      
      <main className={cn('flex-1 overflow-y-auto', className)}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
