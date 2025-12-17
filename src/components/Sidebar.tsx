import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  Home,
  Search,
  Plus,
  Settings,
  BarChart3,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sun,
  Moon,
  Monitor,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { user, dbUser, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    // Exact match for the path
    if (location.pathname === path) return true;
    
    // For parent paths, only match if the current path starts with it but isn't a more specific route
    // This prevents /business/jobs from being active when on /business/jobs/new
    if (path === '/business/jobs' && location.pathname.startsWith('/business/jobs/')) {
      return location.pathname === '/business/jobs' || location.pathname.startsWith('/business/jobs?');
    }
    
    return location.pathname.startsWith(path + '/');
  };

  const NavLink = ({ to, icon: Icon, label, badge }: any) => (
    <Link
      to={to}
      onClick={() => setIsMobileOpen(false)}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group relative',
        isActive(to)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {isOpen && (
        <>
          <span className="text-sm font-medium">{label}</span>
          {badge && (
            <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
      {!isOpen && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs z-50">
          {label}
        </div>
      )}
    </Link>
  );

  // Don't show sidebar on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  // Don't show sidebar on /jobs routes if user is not authenticated
  if ((!user || !dbUser) && location.pathname.startsWith('/jobs')) {
    return null;
  }

  // Don't show sidebar if user is not authenticated on other pages
  if (!user || !dbUser) {
    return null;
  }

  return (
    <div className='overflow-hidden '>
      {/* Mobile Toggle Button */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b md:hidden flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="/icon.svg" alt="JobSync" className="h-8 w-8" />
          <h1 className="font-bold text-lg">JobSync</h1>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed  md:relative left-0 top-0 h-screen md:h-full bg-background border-r transition-all duration-300 z-50 ',
          isOpen ? 'w-64 overflow-y-auto' : 'w-20 overflow-hidden',
          'md:relative md:z-0 pt-0 md:pt-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background">
          {isOpen && (
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="JobSync" className="h-8 w-8" />
              <h1 className="font-bold text-xl">JobSync</h1>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-muted rounded-lg hidden md:block"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {/* EMPLOYEE NAVIGATION */}
          {dbUser?.role === 'employee' && (
            <>
              <div className={cn('text-xs font-semibold text-muted-foreground px-4 py-2', !isOpen && 'hidden')}>
                MAIN
              </div>
              <NavLink
                to="/employee/dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
              />
              <NavLink
                to="/jobs"
                icon={Search}
                label="Browse Jobs"
              />
              
              <div className={cn('text-xs font-semibold text-muted-foreground px-4 py-2 mt-4', !isOpen && 'hidden')}>
                MY ACTIVITY
              </div>
              <NavLink
                to="/employee/applications"
                icon={FileText}
                label="My Applications"
              />
              <NavLink
                to="/employee/saved-jobs"
                icon={Briefcase}
                label="Saved Jobs"
              />
              
              <div className={cn('text-xs font-semibold text-muted-foreground px-4 py-2 mt-4', !isOpen && 'hidden')}>
                SETTINGS
              </div>
              <NavLink
                to="/employee/profile"
                icon={User}
                label="My Profile"
              />
            </>
          )}

          {/* BUSINESS NAVIGATION */}
          {dbUser?.role === 'business' && (
            <>
              <div className={cn('text-xs font-semibold text-muted-foreground px-4 py-2', !isOpen && 'hidden')}>
                MAIN
              </div>
              <NavLink
                to="/business/dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
              />
              <NavLink
                to="/business/jobs"
                icon={Briefcase}
                label="Jobs Posted"
              />
              <NavLink
                to="/business/jobs/new"
                icon={Plus}
                label="Post New Job"
              />
              
              <div className={cn('text-xs font-semibold text-muted-foreground px-4 py-2 mt-4', !isOpen && 'hidden')}>
                SETTINGS
              </div>
              <NavLink
                to="/business/profile"
                icon={User}
                label="My Profile"
              />
            </>
          )}

          {/* ADMIN NAVIGATION */}
          {dbUser?.role === 'admin' && (
            <>
              <div className={cn('text-xs font-semibold text-muted-foreground px-4 py-2', !isOpen && 'hidden')}>
                MAIN
              </div>
              <NavLink
                to="/admin/dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
              />

              <div className={cn('text-xs font-semibold text-muted-foreground px-4 py-2 mt-4', !isOpen && 'hidden')}>
                MANAGEMENT
              </div>
              <NavLink
                to="/admin/businesses"
                icon={Users}
                label="Businesses"
              />
              <NavLink
                to="/admin/jobs"
                icon={Briefcase}
                label="Jobs"
              />
              <NavLink
                to="/admin/employees"
                icon={Users}
                label="Employees"
              />

              <div className={cn('text-xs font-semibold text-muted-foreground px-4 py-2 mt-4', !isOpen && 'hidden')}>
                INSIGHTS
              </div>
              <NavLink
                to="/admin/analytics"
                icon={BarChart3}
                label="Analytics"
              />
            </>
          )}
        </nav>

        {/* Footer with User Info & Logout */}
        <div className={cn('absolute bottom-0 left-0 right-0 border-t space-y-2 bg-background overflow-hidden', isOpen ? 'p-4' : 'p-2')}>
          {/* Theme Toggle */}
          <div className={cn('flex items-center gap-2 px-3 py-2', !isOpen && 'flex-col justify-center')}>
            {isOpen && <span className="text-xs text-muted-foreground">Theme</span>}
            <div className={cn('flex items-center gap-1', !isOpen && 'flex-col w-full')}>
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
                title="Light mode"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
                title="Dark mode"
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  theme === 'system' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
                title="System theme"
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>
          </div>
          {isOpen && (
            <div className="px-3 py-2 bg-muted rounded-lg text-sm truncate">
              <p className="font-medium text-foreground truncate">{dbUser?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{dbUser?.role}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            className={cn('gap-2', isOpen ? 'w-full justify-start' : 'w-full justify-center')}
            size="sm"
          >
            <LogOut className="h-4 w-4" />
            {isOpen && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
