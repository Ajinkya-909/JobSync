import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, ChevronLeft, Mail, Phone, MapPin, Calendar, 
  Briefcase, Award, FileText, Download, CheckCircle2, 
  XCircle, Clock, User, GraduationCap, Target, Eye
} from 'lucide-react';

interface EmployeeProfile {
  full_name: string;
  phone: string;
  location: string;
  experience_years: number;
  skills: string[];
  resume_url: string;
  education?: string;
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
    profile?: EmployeeProfile;
  };
  job: {
    id: string;
    title: string;
    location: string;
  };
}

const ApplicantDetail = () => {
  const { jobId, applicantId } = useParams<{ jobId: string; applicantId: string }>();
  const { user, dbUser, businessApplication, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [application, setApplication] = useState<Application | null>(null);
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
    const fetchApplication = async () => {
      if (!jobId || !applicantId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get business ID
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (businessError) {
          console.error('Error fetching business:', businessError);
          toast({
            title: 'Error',
            description: 'Failed to verify business account.',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }

        if (!businessData) {
          toast({
            title: 'Error',
            description: 'Business profile not found.',
            variant: 'destructive'
          });
          navigate('/business/application');
          setIsLoading(false);
          return;
        }

        // Verify job ownership
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('id, title')
          .eq('id', jobId)
          .eq('business_id', businessData.id)
          .maybeSingle();

        if (jobError) {
          console.error('Error fetching job:', jobError);
          toast({
            title: 'Error',
            description: 'Failed to fetch job details.',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }

        if (!jobData) {
          toast({
            title: 'Access Denied',
            description: 'This job does not belong to your business.',
            variant: 'destructive'
          });
          navigate('/business/jobs');
          setIsLoading(false);
          return;
        }

        // Fetch application with employee details
        const { data: appData, error: appError } = await supabase
          .from('job_applications')
          .select(`
            id, status, match_score, applied_at,
            employee:employees(
              id,
              user:users(email),
              profile:employee_profiles(
                full_name, phone, location, experience_years, 
                skills, resume_url, education
              )
            ),
            job:jobs(id, title, location)
          `)
          .eq('id', applicantId)
          .eq('job_id', jobId)
          .maybeSingle();

        if (appError) {
          console.error('Error fetching application:', appError);
          toast({
            title: 'Error',
            description: 'Failed to fetch application details.',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }

        if (!appData) {
          setApplication(null);
          setIsLoading(false);
          return;
        }

        setApplication(appData as unknown as Application);
      } catch (error) {
        console.error('Unexpected error fetching application:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [jobId, applicantId, user, toast, navigate]);

  const updateStatus = async (newStatus: 'shortlisted' | 'rejected') => {
    if (!application) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', application.id);

      if (error) throw error;

      setApplication(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        description: `Application ${newStatus} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-4 h-4" />Pending Review</Badge>;
      case 'shortlisted':
        return <Badge className="bg-green-600 hover:bg-green-700 gap-1"><CheckCircle2 className="w-4 h-4" />Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-4 h-4" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <Link to={jobId ? `/business/jobs/${jobId}` : '/business/jobs'}>
          <Button variant="ghost" className="gap-2 mb-6">
            <ChevronLeft className="h-4 w-4" />
            Back to {jobId ? 'Applications' : 'Jobs'}
          </Button>
        </Link>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The application you're looking for doesn't exist or has been removed.
            </p>
            <Link to={jobId ? `/business/jobs/${jobId}` : '/business/jobs'}>
              <Button>
                View All Applications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = application.employee.profile;
  const hasIncompleteProfile = !profile || !profile.full_name;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Link to={`/business/jobs/${jobId}`}>
        <Button variant="ghost" className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Applications
        </Button>
      </Link>

      {/* Incomplete Profile Warning */}
      {hasIncompleteProfile && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">Incomplete Profile</h3>
                <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                  This applicant has not completed their profile yet. Limited information is available.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-3xl">
                  {(profile?.full_name || application.employee.user.email)[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile?.full_name || 'Anonymous Applicant'}</h1>
                <p className="text-muted-foreground">Applied for {application.job.title}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {getStatusBadge(application.status)}
                  {application.match_score && (
                    <Badge variant="outline" className="gap-1">
                      <Target className="h-3 w-3" />
                      {application.match_score}% Match
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {application.status === 'applied' && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => updateStatus('shortlisted')}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Shortlist
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => updateStatus('rejected')}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{application.employee.user.email}</p>
              </div>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            )}
            {profile?.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="font-medium">{new Date(application.applied_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.experience_years !== undefined ? (
              <div>
                <p className="text-3xl font-bold">{profile.experience_years}</p>
                <p className="text-muted-foreground">Years of Experience</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No experience information provided</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">{skill}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No skills listed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Education */}
      {profile?.education && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.education}</p>
          </CardContent>
        </Card>
      )}

      {/* Resume */}
      {profile?.resume_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Resume
                </Button>
              </a>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={async () => {
                  console.log('=== DOWNLOAD RESUME CLICKED ===');
                  console.log('Resume URL:', profile.resume_url);
                  
                  try {
                    // Fetch the file as a blob to bypass CORS restrictions
                    console.log('Fetching file...');
                    const response = await fetch(profile.resume_url);
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const blob = await response.blob();
                    console.log('Blob created:', blob.type, blob.size, 'bytes');
                    
                    // Create a blob URL
                    const blobUrl = window.URL.createObjectURL(blob);
                    console.log('Blob URL:', blobUrl);
                    
                    // Create and click download link
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    const fileName = `resume_${profile.full_name || 'applicant'}.pdf`;
                    link.download = fileName;
                    
                    console.log('Download filename:', fileName);
                    
                    document.body.appendChild(link);
                    link.click();
                    console.log('Link clicked - download should start');
                    
                    // Cleanup
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                    console.log('Cleanup complete');
                    console.log('=== DOWNLOAD SUCCESSFUL ===');
                  } catch (error) {
                    console.error('=== DOWNLOAD FAILED ===');
                    console.error('Error:', error);
                    toast({
                      title: 'Download failed',
                      description: 'Failed to download resume. Please try viewing it instead.',
                      variant: 'destructive'
                    });
                  }
                }}
              >
                <Download className="h-4 w-4" />
                Download Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicantDetail;
