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
  const { user, dbUser, businessApplication, signOut, isLoading: authLoading } = useAuth();
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
      if (businessApplication?.status !== 'approved') {
        navigate('/business/application');
      }
    }
  }, [user, dbUser, businessApplication, authLoading, navigate]);

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
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Business Dashboard</h1>
              <p className="text-sm text-muted-foreground">{dbUser?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link to="/business/jobs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Job
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs md:text-sm text-muted-foreground">{stats.activeJobs} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs md:text-sm text-muted-foreground">{stats.pending} pending review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Shortlisted</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-success">{stats.shortlisted}</div>
              <p className="text-xs md:text-sm text-muted-foreground">candidates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">
                {stats.totalApplications > 0 
                  ? Math.round(((stats.shortlisted + stats.rejected) / stats.totalApplications) * 100) 
                  : 0}%
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">reviewed applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Funnel */}
        {stats.totalApplications > 0 && (
          <Card className="mb-8">
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
                  <span className="font-medium">{stats.pending}</span>
                </div>
                <Progress value={(stats.pending / stats.totalApplications) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-success">Shortlisted</span>
                  <span className="font-medium text-success">{stats.shortlisted}</span>
                </div>
                <Progress value={(stats.shortlisted / stats.totalApplications) * 100} className="h-2 [&>div]:bg-success" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-destructive">Rejected</span>
                  <span className="font-medium text-destructive">{stats.rejected}</span>
                </div>
                <Progress value={(stats.rejected / stats.totalApplications) * 100} className="h-2 [&>div]:bg-destructive" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Jobs and Applications */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">My Job Listings ({jobs.length})</TabsTrigger>
            <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            {jobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Jobs Posted Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first job listing to start receiving applications.</p>
                  <Button asChild>
                    <Link to="/business/jobs/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Post Your First Job
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{job.title}</h3>
                            {job.is_active ? (
                              <Badge variant="outline" className="bg-success-muted text-success-muted-foreground border-success/20">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{job.location}</span>
                            <span>•</span>
                            <span className="capitalize">{job.employment_type}</span>
                            <span>•</span>
                            <span className="capitalize">{job.work_type}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{job.applications_count}</p>
                            <p className="text-xs text-muted-foreground">Applications</p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/business/jobs/${job.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Manage
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {recentApplications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground">Applications will appear here once candidates start applying.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {app.employee?.profile?.full_name || 'Anonymous Applicant'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Applied for <span className="font-medium">{app.job?.title}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {app.match_score && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Match</p>
                              <p className="font-semibold">{app.match_score}%</p>
                            </div>
                          )}
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BusinessDashboard;
