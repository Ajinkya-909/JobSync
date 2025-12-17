import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Building2, Users, Briefcase, Clock, 
  CheckCircle2, XCircle, TrendingUp, AlertTriangle,
  ArrowRight, FileText
} from 'lucide-react';

interface DashboardStats {
  totalBusinesses: number;
  approvedBusinesses: number;
  pendingBusinesses: number;
  rejectedBusinesses: number;
  totalJobs: number;
  activeJobs: number;
  totalEmployees: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  totalReports: number;
}

interface PendingBusiness {
  id: string;
  created_at: string;
  business: {
    id: string;
    user: {
      email: string;
    };
  };
}

interface RecentActivity {
  id: string;
  type: 'business_approved' | 'job_posted' | 'application' | 'report';
  description: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch business stats
        const { data: businessApps } = await supabase
          .from('business_applications')
          .select('status');

        const approved = businessApps?.filter(b => b.status === 'approved').length || 0;
        const pending = businessApps?.filter(b => b.status === 'pending').length || 0;
        const rejected = businessApps?.filter(b => b.status === 'rejected').length || 0;

        // Fetch pending businesses for quick review
        const { data: pendingData } = await supabase
          .from('business_applications')
          .select(`
            id, created_at,
            business:businesses(id, user:users(email))
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: true })
          .limit(5);

        setPendingBusinesses(pendingData as unknown as PendingBusiness[] || []);

        // Fetch jobs stats
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('is_active');

        const totalJobs = jobsData?.length || 0;
        const activeJobs = jobsData?.filter(j => j.is_active).length || 0;

        // Fetch employees count
        const { count: employeesCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true });

        // Fetch applications stats
        const { data: applicationsData } = await supabase
          .from('job_applications')
          .select('status');

        const totalApplications = applicationsData?.length || 0;
        const pendingApplications = applicationsData?.filter(a => a.status === 'applied').length || 0;
        const shortlistedApplications = applicationsData?.filter(a => a.status === 'shortlisted').length || 0;

        // Fetch reports count
        const { count: reportsCount } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalBusinesses: approved + pending + rejected,
          approvedBusinesses: approved,
          pendingBusinesses: pending,
          rejectedBusinesses: rejected,
          totalJobs,
          activeJobs,
          totalEmployees: employeesCount || 0,
          totalApplications,
          pendingApplications,
          shortlistedApplications,
          totalReports: reportsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage the platform</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBusinesses}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                {stats?.approvedBusinesses} Approved
              </Badge>
              <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                {stats?.pendingBusinesses} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeJobs} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Registered job seekers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.shortlistedApplications} shortlisted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews Alert */}
      {(stats?.pendingBusinesses || 0) > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-yellow-800">Pending Reviews</CardTitle>
              </div>
              <Button asChild size="sm">
                <Link to="/admin/businesses">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription className="text-yellow-700">
              {stats?.pendingBusinesses} business applications waiting for your review
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Businesses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Business Reviews</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/businesses">View All</Link>
              </Button>
            </div>
            <CardDescription>Businesses awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingBusinesses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>All caught up! No pending reviews.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBusinesses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.business?.user?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Applied {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/admin/businesses?review=${item.business?.id}`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Quick stats at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Approved Businesses</p>
                  <p className="text-sm text-muted-foreground">Verified and active</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{stats?.approvedBusinesses}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Active Job Listings</p>
                  <p className="text-sm text-muted-foreground">Currently accepting applications</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{stats?.activeJobs}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Pending Applications</p>
                  <p className="text-sm text-muted-foreground">Awaiting business response</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{stats?.pendingApplications}</span>
            </div>

            {(stats?.totalReports || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-800">Reports</p>
                    <p className="text-sm text-red-600">Require attention</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats?.totalReports}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used admin actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/admin/businesses">
                <Building2 className="h-6 w-6" />
                <span>Manage Businesses</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/admin/jobs">
                <Briefcase className="h-6 w-6" />
                <span>Manage Jobs</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/admin/employees">
                <Users className="h-6 w-6" />
                <span>View Employees</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/admin/analytics">
                <TrendingUp className="h-6 w-6" />
                <span>Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
