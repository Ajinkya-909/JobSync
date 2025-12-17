import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, MapPin, Clock, Briefcase, Building2, ChevronLeft,
  Bookmark, BookmarkCheck, Send, CheckCircle2, Calendar,
  AlertCircle
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
  business_id: string;
}

interface JobRequirement {
  id: string;
  requirement_type: string;
  requirement_value: string;
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        // Fetch job details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (jobError) throw jobError;
        setJob(jobData);

        // Fetch job requirements
        const { data: reqData } = await supabase
          .from('job_requirements')
          .select('*')
          .eq('job_id', id);

        if (reqData) setRequirements(reqData);

        // Check if user has applied (if logged in as employee)
        if (user && dbUser?.role === 'employee') {
          const { data: employeeData } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (employeeData) {
            setEmployeeId(employeeData.id);

            // Check application status
            const { data: appData } = await supabase
              .from('job_applications')
              .select('id')
              .eq('job_id', id)
              .eq('employee_id', employeeData.id)
              .maybeSingle();

            setHasApplied(!!appData);

            // Check if saved
            const { data: savedData } = await supabase
              .from('saved_jobs')
              .select('id')
              .eq('job_id', id)
              .eq('employee_id', employeeData.id)
              .maybeSingle();

            setIsSaved(!!savedData);
          }
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, user, dbUser]);

  const handleApply = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!employeeId || !job) return;

    setIsApplying(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          employee_id: employeeId,
          status: 'applied'
        });

      if (error) throw error;

      setHasApplied(true);
      toast({
        title: 'Application Submitted',
        description: 'Your application has been sent successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application.',
        variant: 'destructive'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!employeeId || !job) return;

    setIsSaving(true);
    try {
      if (isSaved) {
        // Remove from saved
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('job_id', job.id)
          .eq('employee_id', employeeId);
        
        setIsSaved(false);
        toast({ description: 'Job removed from saved.' });
      } else {
        // Add to saved
        await supabase
          .from('saved_jobs')
          .insert({
            job_id: job.id,
            employee_id: employeeId
          });
        
        setIsSaved(true);
        toast({ description: 'Job saved!' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save job.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Job Not Found</h3>
            <p className="text-muted-foreground mb-4">This job listing doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/jobs">Browse All Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEmployee = dbUser?.role === 'employee';

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/jobs">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location || 'Location not specified'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="capitalize">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {job.employment_type?.replace('-', ' ')}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {job.work_type}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {job.min_experience === 0 ? 'Entry Level' : `${job.min_experience}+ years`}
                  </Badge>
                  {!job.is_active && (
                    <Badge variant="destructive">Closed</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {requirements.map((req) => (
                      <li key={req.id} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium capitalize">{req.requirement_type}: </span>
                          <span className="text-muted-foreground">{req.requirement_value}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Login prompt for unauthenticated users */}
            {!user && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <Link to="/auth" className="font-medium underline">
                    Sign in
                  </Link>{' '}
                  to apply for jobs and save your favorite listings.
                </AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardContent className="pt-6">{hasApplied ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">Already Applied</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You've already applied to this job.
                    </p>
                    <Button asChild variant="outline" className="mt-4 w-full">
                      <Link to="/dashboard">View Applications</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleApply}
                      disabled={isApplying || !job.is_active || !isEmployee}
                    >
                      {isApplying ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {!user 
                        ? 'Sign In to Apply' 
                        : !isEmployee 
                        ? 'Employees Only' 
                        : !job.is_active 
                        ? 'Job Closed' 
                        : 'Apply Now'}
                    </Button>
                    
                    {isEmployee && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : isSaved ? (
                          <BookmarkCheck className="h-4 w-4 mr-2" />
                        ) : (
                          <Bookmark className="h-4 w-4 mr-2" />
                        )}
                        {isSaved ? 'Saved' : 'Save Job'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Info Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Type</span>
                  <span className="font-medium capitalize">{job.employment_type?.replace('-', ' ')}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work Mode</span>
                  <span className="font-medium capitalize">{job.work_type}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">
                    {job.min_experience === 0 ? 'Entry Level' : `${job.min_experience}+ years`}
                  </span>
                </div>
                {job.expires_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">{new Date(job.expires_at).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;
