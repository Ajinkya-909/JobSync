import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, LogOut, Briefcase, FileText, BookmarkCheck, 
  TrendingUp, Clock, CheckCircle2, XCircle, Send
} from 'lucide-react';

interface ApplicationStats {
  total: number;
  applied: number;
  shortlisted: number;
  rejected: number;
}

interface JobApplication {
  id: string;
  status: string;
  match_score: number | null;
  applied_at: string;
  job: {
    id: string;
    title: string;
    location: string;
    employment_type: string;
    work_type: string;
    business: {
      id: string;
    };
  };
}

interface SavedJob {
  id: string;
  saved_at: string;
  job: {
    id: string;
    title: string;
    location: string;
    employment_type: string;
    work_type: string;
    is_active: boolean;
  };
}

const EmployeeDashboard = () => {
  const { user, dbUser, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, applied: 0, shortlisted: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !dbUser || dbUser.role !== 'employee')) {
      navigate('/auth');
    }
  }, [user, dbUser, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get employee ID
        const { data: employeeData } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!employeeData) return;
        setEmployeeId(employeeData.id);

        // Fetch applications
        const { data: applicationsData } = await supabase
          .from('job_applications')
          .select(`
            id, status, match_score, applied_at,
            job:jobs(id, title, location, employment_type, work_type, business:businesses(id))
          `)
          .eq('employee_id', employeeData.id)
          .order('applied_at', { ascending: false });

        if (applicationsData) {
          setApplications(applicationsData as unknown as JobApplication[]);
          
          // Calculate stats
          const newStats: ApplicationStats = {
            total: applicationsData.length,
            applied: applicationsData.filter(a => a.status === 'applied').length,
            shortlisted: applicationsData.filter(a => a.status === 'shortlisted').length,
            rejected: applicationsData.filter(a => a.status === 'rejected').length,
          };
          setStats(newStats);
        }

        // Fetch saved jobs
        const { data: savedData } = await supabase
          .from('saved_jobs')
          .select(`
            id, saved_at,
            job:jobs(id, title, location, employment_type, work_type, is_active)
          `)
          .eq('employee_id', employeeData.id)
          .order('saved_at', { ascending: false });

        if (savedData) {
          setSavedJobs(savedData as unknown as SavedJob[]);
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
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Applied</Badge>;
      case 'shortlisted':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Shortlisted</Badge>;
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
              <h1 className="text-2xl font-bold text-foreground">Employee Dashboard</h1>
              <p className="text-sm text-muted-foreground">{dbUser?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link to="/jobs">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Browse Jobs
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applied}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.shortlisted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
              <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savedJobs.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Success Rate Card */}
        {stats.total > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Application Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(stats.shortlisted / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.shortlisted / stats.total) * 100) : 0}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {stats.shortlisted} shortlisted out of {stats.total} applications
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Applications and Saved Jobs */}
        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="applications">My Applications ({applications.length})</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs ({savedJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">Start applying to jobs to track your progress here.</p>
                  <Button asChild>
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link to={`/jobs/${app.job?.id}`} className="hover:underline">
                            <h3 className="font-semibold text-foreground">{app.job?.title}</h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{app.job?.location}</span>
                            <span>•</span>
                            <span className="capitalize">{app.job?.employment_type}</span>
                            <span>•</span>
                            <span className="capitalize">{app.job?.work_type}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Applied {new Date(app.applied_at).toLocaleDateString()}
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

          <TabsContent value="saved" className="space-y-4">
            {savedJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookmarkCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Jobs</h3>
                  <p className="text-muted-foreground mb-4">Save jobs you're interested in to apply later.</p>
                  <Button asChild>
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {savedJobs.map((saved) => (
                  <Card key={saved.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link to={`/jobs/${saved.job?.id}`} className="hover:underline">
                            <h3 className="font-semibold text-foreground">{saved.job?.title}</h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{saved.job?.location}</span>
                            <span>•</span>
                            <span className="capitalize">{saved.job?.employment_type}</span>
                            <span>•</span>
                            <span className="capitalize">{saved.job?.work_type}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Saved {new Date(saved.saved_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!saved.job?.is_active && (
                            <Badge variant="outline">Closed</Badge>
                          )}
                          <Button asChild size="sm">
                            <Link to={`/jobs/${saved.job?.id}`}>View</Link>
                          </Button>
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

export default EmployeeDashboard;
