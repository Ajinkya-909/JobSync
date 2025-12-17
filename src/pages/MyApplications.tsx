import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, FileText, MapPin, Briefcase, Calendar, 
  Clock, CheckCircle2, XCircle, Building2, TrendingUp, ExternalLink
} from 'lucide-react';

interface JobApplication {
  id: string;
  status: 'applied' | 'shortlisted' | 'rejected';
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
      business_profiles: {
        brand_name: string | null;
        legal_company_name: string | null;
      }[];
    };
  };
}

interface ApplicationStats {
  total: number;
  applied: number;
  shortlisted: number;
  rejected: number;
}

const MyApplications = () => {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, applied: 0, shortlisted: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'applied' | 'shortlisted' | 'rejected'>('all');

  useEffect(() => {
    if (!user || !dbUser) {
      navigate('/auth');
      return;
    }
    if (dbUser.role !== 'employee') {
      navigate('/dashboard');
      return;
    }
    fetchApplications();
  }, [user, dbUser, navigate]);

  useEffect(() => {
    filterApplications();
  }, [applications, activeTab]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employeeData) return;

      const { data: applicationsData, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          match_score,
          applied_at,
          job:jobs (
            id,
            title,
            location,
            employment_type,
            work_type,
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
        .order('applied_at', { ascending: false });

      if (error) throw error;

      setApplications(applicationsData as unknown as JobApplication[]);

      // Calculate stats
      const total = applicationsData?.length || 0;
      const applied = applicationsData?.filter(a => a.status === 'applied').length || 0;
      const shortlisted = applicationsData?.filter(a => a.status === 'shortlisted').length || 0;
      const rejected = applicationsData?.filter(a => a.status === 'rejected').length || 0;

      setStats({ total, applied, shortlisted, rejected });
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    if (activeTab === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === activeTab));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'shortlisted':
        return <Badge className="bg-green-600 hover:bg-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">Track your job application status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.applied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shortlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.shortlisted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="applied">Pending ({stats.applied})</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted ({stats.shortlisted})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === 'all' 
                ? "You haven't applied to any jobs yet" 
                : `No ${activeTab} applications`}
            </p>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <Link to={`/jobs/${application.job.id}`}>
                          <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                            {application.job.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>
                            {application.job.business.business_profiles?.[0]?.brand_name || 
                             application.job.business.business_profiles?.[0]?.legal_company_name || 
                             'Company'}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {application.job.employment_type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied {new Date(application.applied_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{application.job.work_type}</Badge>
                      {application.match_score && (
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {application.match_score}% Match
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Link to={`/jobs/${application.job.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View Job
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
