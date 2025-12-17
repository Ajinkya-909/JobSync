import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, ChevronLeft, Users, Clock, CheckCircle2, XCircle, 
  Eye, Briefcase, MapPin, Calendar
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  work_type: string;
  min_experience: number;
  required_skills: string[];
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

interface Application {
  id: string;
  status: 'applied' | 'shortlisted' | 'rejected';
  match_score: number | null;
  applied_at: string;
  employee: {
    id: string;
    user: {
      email: string;
    };
    profile?: {
      full_name: string;
      phone: string;
      location: string;
      experience_years: number;
      skills: string[];
      resume_url: string;
    };
  };
}

const ManageJob = () => {
  const { id } = useParams<{ id: string }>();
  const { user, dbUser, businessApplication, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !dbUser || dbUser.role !== 'business') {
        navigate('/auth');
        return;
      }
      if (businessApplication?.status !== 'approved') {
        navigate('/business/application');
      }
    }
  }, [user, dbUser, businessApplication, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      try {
        // Get business ID
        const { data: businessData } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!businessData) return;

        // Fetch job (verify ownership)
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessData.id)
          .single();

        if (jobError || !jobData) {
          toast({
            title: 'Error',
            description: 'Job not found or access denied.',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }

        setJob(jobData);

        // Fetch applications
        const { data: appData } = await supabase
          .from('job_applications')
          .select(`
            id, status, match_score, applied_at,
            employee:employees(
              id,
              user:users(email),
              profile:employee_profiles(full_name, phone, location, experience_years, skills, resume_url)
            )
          `)
          .eq('job_id', id)
          .order('applied_at', { ascending: false });

        if (appData) {
          setApplications(appData as unknown as Application[]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const toggleJobStatus = async () => {
    if (!job) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !job.is_active })
        .eq('id', job.id);

      if (error) throw error;

      setJob(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
      toast({
        description: `Job ${job.is_active ? 'deactivated' : 'activated'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: 'shortlisted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast({
        description: `Application ${newStatus === 'shortlisted' ? 'shortlisted' : 'rejected'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
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

  if (!job) {
    return null;
  }

  const pendingApps = applications.filter(a => a.status === 'applied');
  const shortlistedApps = applications.filter(a => a.status === 'shortlisted');
  const rejectedApps = applications.filter(a => a.status === 'rejected');

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {job.title}
                  {job.is_active ? (
                    <Badge variant="outline" className="bg-success-muted text-success-muted-foreground border-success/20">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location || 'Not specified'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.employment_type?.replace('-', ' ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="job-status" className="text-sm">
                  {job.is_active ? 'Active' : 'Inactive'}
                </Label>
                <Switch
                  id="job-status"
                  checked={job.is_active}
                  onCheckedChange={toggleJobStatus}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{pendingApps.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
              <div className="text-center p-4 bg-success-muted rounded-lg">
                <p className="text-2xl font-bold text-success">{shortlistedApps.length}</p>
                <p className="text-sm text-muted-foreground">Shortlisted</p>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">{rejectedApps.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingApps.length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({shortlistedApps.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApps.length})</TabsTrigger>
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          </TabsList>

          {['pending', 'shortlisted', 'rejected', 'all'].map((tab) => {
            const tabApps = tab === 'all' 
              ? applications 
              : tab === 'pending' 
              ? pendingApps 
              : tab === 'shortlisted' 
              ? shortlistedApps 
              : rejectedApps;

            return (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {tabApps.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Applications</h3>
                      <p className="text-muted-foreground">
                        {tab === 'pending' && 'No pending applications to review.'}
                        {tab === 'shortlisted' && 'No shortlisted candidates yet.'}
                        {tab === 'rejected' && 'No rejected applications.'}
                        {tab === 'all' && 'No applications received yet.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tabApps.map((app) => (
                      <Card key={app.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium">
                                    {(app.employee?.profile?.full_name || app.employee?.user?.email || 'A')[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground">
                                    {app.employee?.profile?.full_name || 'Anonymous Applicant'}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {app.employee?.user?.email}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                                {app.employee?.profile?.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {app.employee.profile.location}
                                  </span>
                                )}
                                {app.employee?.profile?.experience_years !== undefined && (
                                  <span>
                                    {app.employee.profile.experience_years} years experience
                                  </span>
                                )}
                                <span>
                                  Applied {new Date(app.applied_at).toLocaleDateString()}
                                </span>
                              </div>

                              {app.employee?.profile?.skills && app.employee.profile.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {app.employee.profile.skills.slice(0, 4).map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {app.employee.profile.skills.length > 4 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{app.employee.profile.skills.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {app.match_score && (
                                <div className="text-center">
                                  <p className="text-xl font-bold">{app.match_score}%</p>
                                  <p className="text-xs text-muted-foreground">Match</p>
                                </div>
                              )}
                              
                              <div className="flex flex-col gap-2">
                                {getStatusBadge(app.status)}
                                
                                {app.status === 'applied' && (
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-success hover:text-success/90 hover:bg-success-muted"
                                      onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                      onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
};

export default ManageJob;
