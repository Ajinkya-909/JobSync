import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Search, Briefcase, Building2, MapPin, Clock, 
  Users, Eye, Edit, Trash2, CheckCircle2, XCircle, Calendar
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
  business: {
    id: string;
    is_verified: boolean;
    user: {
      email: string;
    };
    profile?: {
      legal_company_name: string;
    };
  };
  applications_count: number;
}

const AdminJobs = () => {
  const { toast } = useToast();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Edit modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    location: '',
    employment_type: '',
    work_type: '',
    min_experience: 0,
    is_active: true,
  });

  const fetchJobs = async () => {
    try {
      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select(`
          *,
          business:businesses(
            id, is_verified,
            user:users(email),
            profile:business_profiles(legal_company_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch applications count for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job: any) => {
          const { count } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);

          return {
            ...job,
            business: {
              ...job.business,
              profile: Array.isArray(job.business?.profile) 
                ? job.business.profile[0] 
                : job.business?.profile
            },
            applications_count: count || 0,
          };
        })
      );

      setJobs(jobsWithCounts);
      setFilteredJobs(jobsWithCounts);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.business?.profile?.legal_company_name?.toLowerCase().includes(query) ||
        job.business?.user?.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(job => 
        statusFilter === 'active' ? job.is_active : !job.is_active
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(job => job.employment_type === typeFilter);
    }

    setFilteredJobs(result);
  }, [jobs, searchQuery, statusFilter, typeFilter]);

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setEditFormData({
      title: job.title,
      location: job.location || '',
      employment_type: job.employment_type || 'full-time',
      work_type: job.work_type || 'onsite',
      min_experience: job.min_experience || 0,
      is_active: job.is_active,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedJob) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: editFormData.title,
          location: editFormData.location,
          employment_type: editFormData.employment_type,
          work_type: editFormData.work_type,
          min_experience: editFormData.min_experience,
          is_active: editFormData.is_active,
        })
        .eq('id', selectedJob.id);

      if (error) throw error;

      toast({
        title: 'Job Updated',
        description: 'Job has been updated successfully.',
      });

      setIsEditModalOpen(false);
      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update job.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (job: Job) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !job.is_active })
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: job.is_active ? 'Job Deactivated' : 'Job Activated',
        description: `Job has been ${job.is_active ? 'deactivated' : 'activated'}.`,
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (job: Job) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: 'Job Deleted',
        description: 'Job has been permanently deleted.',
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getEmploymentBadgeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'internship': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'contract': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return '';
    }
  };

  const activeCount = jobs.filter(j => j.is_active).length;
  const inactiveCount = jobs.filter(j => !j.is_active).length;

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
        <h1 className="text-3xl font-bold">Jobs Management</h1>
        <p className="text-muted-foreground">View and manage all job listings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{jobs.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Active</p>
                <p className="text-2xl font-bold text-green-800">{activeCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Inactive</p>
                <p className="text-2xl font-bold text-gray-800">{inactiveCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Applications</p>
                <p className="text-2xl font-bold text-blue-800">
                  {jobs.reduce((sum, j) => sum + j.applications_count, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title, company, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>All Jobs ({filteredJobs.length})</CardTitle>
          <CardDescription>Click on a job to edit or manage it</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No jobs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{job.title}</h3>
                      {!job.is_active && (
                        <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {job.business?.profile?.legal_company_name || job.business?.user?.email}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.applications_count} applications
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {job.employment_type && (
                        <Badge className={getEmploymentBadgeColor(job.employment_type)}>
                          {job.employment_type}
                        </Badge>
                      )}
                      {job.work_type && (
                        <Badge variant="outline" className="capitalize">
                          {job.work_type}
                        </Badge>
                      )}
                      {job.business?.is_verified && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Business
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(job)}
                      title={job.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {job.is_active ? (
                        <XCircle className="h-4 w-4 text-gray-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(job)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(job)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Make changes to this job listing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editFormData.location}
                onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select 
                  value={editFormData.employment_type} 
                  onValueChange={(v) => setEditFormData(prev => ({ ...prev, employment_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Type</Label>
                <Select 
                  value={editFormData.work_type} 
                  onValueChange={(v) => setEditFormData(prev => ({ ...prev, work_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Minimum Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={editFormData.min_experience}
                onChange={(e) => setEditFormData(prev => ({ ...prev, min_experience: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">Job is visible to applicants</p>
              </div>
              <Switch
                checked={editFormData.is_active}
                onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobs;
