import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, LogOut, Plus, Briefcase, Users, Eye, 
  TrendingUp, CheckCircle2, Clock, XCircle, BarChart3
} from 'lucide-react';

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  shortlisted: number;
  rejected: number;
  pending: number;
}

interface Job {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  work_type: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  applications_count: number;
}

interface RecentApplication {
  id: string;
  status: string;
  applied_at: string;
  match_score: number | null;
  employee: {
    id: string;
    profile?: {
      full_name: string;
    };
  };
  job: {
    id: string;
    title: string;
  };
}

const BusinessDashboard = () => {
  const { user, dbUser, businessApplication, hasBusinessProfile, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [stats, setStats] = useState<JobStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    rejected: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !dbUser) {
        navigate('/auth');
        return;
      }
      if (dbUser.role !== 'business') {
        navigate('/dashboard');
        return;
      }
      // If profile doesn't exist or application is not approved, redirect to application
      if (!hasBusinessProfile || businessApplication?.status !== 'approved') {
        navigate('/business/application');
      }
    }
  }, [user, dbUser, businessApplication, hasBusinessProfile, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get business ID
        const { data: businessData } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!businessData) return;
        setBusinessId(businessData.id);

        // Fetch jobs with application counts
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });

        if (jobsData) {
          // Get application counts for each job
          const jobsWithCounts = await Promise.all(
            jobsData.map(async (job) => {
              const { count } = await supabase
                .from('job_applications')
                .select('*', { count: 'exact', head: true })
                .eq('job_id', job.id);
              
              return { ...job, applications_count: count || 0 };
            })
          );
          
          setJobs(jobsWithCounts);
          
          // Calculate job stats
          const activeJobs = jobsWithCounts.filter(j => j.is_active).length;
          const totalApps = jobsWithCounts.reduce((sum, j) => sum + j.applications_count, 0);
          
          setStats(prev => ({
            ...prev,
            totalJobs: jobsWithCounts.length,
            activeJobs,
            totalApplications: totalApps,
          }));
        }

        // Fetch all applications for this business's jobs
        const { data: applicationsData } = await supabase
          .from('job_applications')
          .select(`
            id, status, applied_at, match_score,
            employee:employees(id, profile:employee_profiles(full_name)),
            job:jobs!inner(id, title, business_id)
          `)
          .eq('job.business_id', businessData.id)
          .order('applied_at', { ascending: false })
          .limit(10);

        if (applicationsData) {
          setRecentApplications(applicationsData as unknown as RecentApplication[]);
          
          // Count application statuses
          const { data: allApps } = await supabase
            .from('job_applications')
            .select('status, job:jobs!inner(business_id)')
            .eq('job.business_id', businessData.id);

          if (allApps) {
            setStats(prev => ({
              ...prev,
              totalApplications: allApps.length,
              pending: allApps.filter(a => a.status === 'applied').length,
              shortlisted: allApps.filter(a => a.status === 'shortlisted').length,
              rejected: allApps.filter(a => a.status === 'rejected').length,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'shortlisted':
        return <Badge className="bg-success hover:bg-success/90"><CheckCircle2 className="w-3 h-3 mr-1" />Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your hiring activity</p>
        </div>
        <Link to="/business/jobs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">{stats.activeJobs} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">{stats.pending} pending review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.shortlisted}</div>
              <p className="text-xs text-muted-foreground">candidates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalApplications > 0 
                  ? Math.round(((stats.shortlisted + stats.rejected) / stats.totalApplications) * 100) 
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">reviewed applications</p>
            </CardContent>
          </Card>
        </div>

      {/* Application Funnel */}
      {stats.totalApplications > 0 && (
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Application Funnel
              </CardTitle>
              <CardDescription>Overview of your hiring pipeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pending Review</span>
                  <span className="font-medium">{stats.pending} ({Math.round((stats.pending / stats.totalApplications) * 100)}%)</span>
                </div>
                <Progress value={(stats.pending / stats.totalApplications) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-success">Shortlisted</span>
                  <span className="font-medium text-success">{stats.shortlisted} ({Math.round((stats.shortlisted / stats.totalApplications) * 100)}%)</span>
                </div>
                <Progress value={(stats.shortlisted / stats.totalApplications) * 100} className="h-2 [&>div]:bg-success" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-destructive">Rejected</span>
                  <span className="font-medium text-destructive">{stats.rejected} ({Math.round((stats.rejected / stats.totalApplications) * 100)}%)</span>
                </div>
                <Progress value={(stats.rejected / stats.totalApplications) * 100} className="h-2 [&>div]:bg-destructive" />
              </div>
            </CardContent>
          </Card>
        )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest candidates who applied</CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {app.employee?.profile?.full_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">{app.job?.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.match_score && (
                          <Badge variant="outline" className="text-xs">
                            {app.match_score}% match
                          </Badge>
                        )}
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  ))}
                  <Link to="/business/jobs">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Applications
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Jobs Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Active Job Listings</CardTitle>
              <CardDescription>Your currently active positions</CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.filter(j => j.is_active).length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No active jobs</p>
                  <Link to="/business/jobs/new">
                    <Button size="sm">Post a Job</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.filter(j => j.is_active).slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {job.applications_count}
                        </Badge>
                        <Link to={`/business/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <Link to="/business/jobs">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Jobs
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default BusinessDashboard;
