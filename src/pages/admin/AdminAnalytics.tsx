import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, TrendingDown, Users, Building2, Briefcase, FileText, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  totalBusinesses: number;
  totalJobs: number;
  totalEmployees: number;
  totalApplications: number;
  pendingBusinesses: number;
  activeJobs: number;
  avgApplicationsPerJob: number;
  applicationsPerStatus: { status: string; count: number }[];
  jobsByType: { type: string; count: number }[];
  recentActivity: { date: string; businesses: number; jobs: number; applications: number }[];
  topSkillsInDemand: { skill: string; count: number }[];
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch all core data
      const [
        { count: totalBusinesses },
        { count: pendingBusinesses },
        { count: totalJobs },
        { count: activeJobs },
        { count: totalEmployees },
        { count: totalApplications },
        { data: applications },
        { data: jobs },
      ] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('business_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }),
        supabase.from('job_applications').select('status'),
        supabase.from('jobs').select('employment_type, required_skills'),
      ]);

      // Calculate applications per status
      const statusCounts: Record<string, number> = {};
      (applications || []).forEach((app: any) => {
        const status = app.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const applicationsPerStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));

      // Calculate jobs by type
      const typeCounts: Record<string, number> = {};
      (jobs || []).forEach((job: any) => {
        const type = job.employment_type || 'unspecified';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      const jobsByType = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count
      }));

      // Calculate top skills in demand
      const skillCounts: Record<string, number> = {};
      (jobs || []).forEach((job: any) => {
        (job.required_skills || []).forEach((skill: string) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      });
      const topSkillsInDemand = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate avg applications per job
      const avgApplicationsPerJob = totalJobs && totalApplications 
        ? Math.round((totalApplications / totalJobs) * 10) / 10 
        : 0;

      setAnalytics({
        totalBusinesses: totalBusinesses || 0,
        totalJobs: totalJobs || 0,
        totalEmployees: totalEmployees || 0,
        totalApplications: totalApplications || 0,
        pendingBusinesses: pendingBusinesses || 0,
        activeJobs: activeJobs || 0,
        avgApplicationsPerJob,
        applicationsPerStatus,
        jobsByType,
        recentActivity: [], // Would require more complex queries
        topSkillsInDemand,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'reviewing': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      case 'withdrawn': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-500';
      case 'internship': return 'bg-purple-500';
      case 'contract': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Failed to load analytics data.</p>
      </div>
    );
  }

  const totalStatusCount = analytics.applicationsPerStatus.reduce((sum, s) => sum + s.count, 0);
  const totalTypeCount = analytics.jobsByType.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">Platform performance and user engagement metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Businesses</p>
                <p className="text-2xl font-bold">{analytics.totalBusinesses}</p>
                {analytics.pendingBusinesses > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    {analytics.pendingBusinesses} pending review
                  </p>
                )}
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{analytics.totalJobs}</p>
                <p className="text-xs text-green-600 mt-1">
                  {analytics.activeJobs} active
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{analytics.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{analytics.totalApplications}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ~{analytics.avgApplicationsPerJob} per job
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Application Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of all job applications by status</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.applicationsPerStatus.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No application data</p>
            ) : (
              <div className="space-y-4">
                {analytics.applicationsPerStatus.map((item) => (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{item.status}</span>
                      <span className="font-medium">{item.count} ({Math.round(item.count / totalStatusCount * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStatusColor(item.status)} rounded-full transition-all`}
                        style={{ width: `${(item.count / totalStatusCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs by Employment Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Jobs by Employment Type
            </CardTitle>
            <CardDescription>Distribution of job listings by type</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.jobsByType.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No job data</p>
            ) : (
              <div className="space-y-4">
                {analytics.jobsByType.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{item.type}</span>
                      <span className="font-medium">{item.count} ({Math.round(item.count / totalTypeCount * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getTypeColor(item.type)} rounded-full transition-all`}
                        style={{ width: `${(item.count / totalTypeCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Skills in Demand */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Skills in Demand
          </CardTitle>
          <CardDescription>Most requested skills across all job listings</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topSkillsInDemand.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No skills data available</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {analytics.topSkillsInDemand.map((item, idx) => (
                <div key={item.skill} className="p-4 border rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{item.count}</p>
                  <p className="text-sm text-muted-foreground truncate" title={item.skill}>
                    {item.skill}
                  </p>
                  <p className="text-xs text-muted-foreground">#{idx + 1} skill</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health Metrics</CardTitle>
          <CardDescription>Key performance indicators for platform health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Job Activation Rate</span>
              </div>
              <p className="text-2xl font-bold">
                {analytics.totalJobs > 0 
                  ? Math.round((analytics.activeJobs / analytics.totalJobs) * 100) 
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">
                {analytics.activeJobs} of {analytics.totalJobs} jobs are active
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Avg Applications/Job</span>
              </div>
              <p className="text-2xl font-bold">{analytics.avgApplicationsPerJob}</p>
              <p className="text-xs text-muted-foreground">
                applications per job listing
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {analytics.pendingBusinesses > 5 ? (
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium">Pending Reviews</span>
              </div>
              <p className="text-2xl font-bold">{analytics.pendingBusinesses}</p>
              <p className="text-xs text-muted-foreground">
                business applications awaiting review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
