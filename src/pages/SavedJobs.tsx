import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Bookmark, BookmarkCheck, MapPin, Briefcase, 
  Calendar, Trash2, ExternalLink, Building2
} from 'lucide-react';

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
    created_at: string;
    business: {
      id: string;
      business_profiles: {
        brand_name: string | null;
        legal_company_name: string | null;
      }[];
    };
  };
}

const SavedJobs = () => {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !dbUser) {
      navigate('/auth');
      return;
    }
    if (dbUser.role !== 'employee') {
      navigate('/dashboard');
      return;
    }
    fetchSavedJobs();
  }, [user, dbUser, navigate]);

  const fetchSavedJobs = async () => {
    if (!user) return;

    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employeeData) return;

      const { data: savedJobsData, error } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          saved_at,
          job:jobs (
            id,
            title,
            location,
            employment_type,
            work_type,
            is_active,
            created_at,
            business:businesses (
              id,
              business_profiles (
                brand_name,
                legal_company_name
              )
            )
          )
        `)
        .eq('employee_id', employeeData.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      setSavedJobs(savedJobsData as unknown as SavedJob[]);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved jobs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsaveJob = async (savedJobId: string) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', savedJobId);

      if (error) throw error;

      setSavedJobs(savedJobs.filter(sj => sj.id !== savedJobId));
      
      toast({
        title: 'Job Removed',
        description: 'Job has been removed from your saved list',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove job',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Saved Jobs</h1>
        <p className="text-muted-foreground">Jobs you've bookmarked for later</p>
      </div>

      {/* Saved Jobs List */}
      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Saved Jobs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start saving jobs you're interested in to view them here
            </p>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((savedJob) => (
            <Card key={savedJob.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <Link to={`/jobs/${savedJob.job.id}`}>
                          <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                            {savedJob.job.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>
                            {savedJob.job.business.business_profiles?.[0]?.brand_name || 
                             savedJob.job.business.business_profiles?.[0]?.legal_company_name || 
                             'Company'}
                          </span>
                        </div>
                      </div>
                      {!savedJob.job.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {savedJob.job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {savedJob.job.employment_type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Saved {new Date(savedJob.saved_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{savedJob.job.work_type}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link to={`/jobs/${savedJob.job.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUnsaveJob(savedJob.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
