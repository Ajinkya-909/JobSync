import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, Search, MapPin, Briefcase, Clock, Building2, 
  Filter, X, ChevronLeft, GraduationCap, Users, Laptop, 
  Calendar, ArrowRight, Sparkles, Globe, TrendingUp
} from 'lucide-react';

interface BusinessProfile {
  brand_name: string | null;
  legal_company_name: string | null;
  industry: string | null;
  company_size: string | null;
  city: string | null;
  fresher_friendly: boolean;
}

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
    business_profiles: BusinessProfile[] | null;
  };
}

const Jobs = () => {
  const { user, dbUser } = useAuth();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [employmentType, setEmploymentType] = useState<string>('all');
  const [workType, setWorkType] = useState<string>('all');
  const [experienceLevel, setExperienceLevel] = useState<string>('all');
  const [fresherFriendly, setFresherFriendly] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            business:businesses(
              id,
              business_profiles(
                brand_name,
                legal_company_name,
                industry,
                company_size,
                city,
                fresher_friendly
              )
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
        setFilteredJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let result = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        job => 
          job.title.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.required_skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (locationFilter) {
      result = result.filter(job => 
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Employment type filter
    if (employmentType !== 'all') {
      result = result.filter(job => job.employment_type === employmentType);
    }

    // Work type filter
    if (workType !== 'all') {
      result = result.filter(job => job.work_type === workType);
    }

    // Experience level filter
    if (experienceLevel !== 'all') {
      const maxExp = parseInt(experienceLevel);
      result = result.filter(job => job.min_experience <= maxExp);
    }

    // Fresher friendly filter
    if (fresherFriendly) {
      result = result.filter(job => job.min_experience === 0);
    }

    setFilteredJobs(result);
  }, [jobs, searchQuery, locationFilter, employmentType, workType, experienceLevel, fresherFriendly]);

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setEmploymentType('all');
    setWorkType('all');
    setExperienceLevel('all');
    setFresherFriendly(false);
  };

  const hasActiveFilters = searchQuery || locationFilter || employmentType !== 'all' || 
    workType !== 'all' || experienceLevel !== 'all' || fresherFriendly;

  const getEmploymentBadgeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
      case 'internship': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      case 'contract': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getWorkTypeIcon = (type: string) => {
    switch (type) {
      case 'remote': return <Globe className="h-4 w-4" />;
      case 'hybrid': return <Laptop className="h-4 w-4" />;
      case 'onsite': return <Building2 className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getCompanyName = (job: Job) => {
    const profile = job.business?.business_profiles?.[0];
    return profile?.brand_name || profile?.legal_company_name || 'Company';
  };

  const getCompanyIndustry = (job: Job) => {
    const profile = job.business?.business_profiles?.[0];
    return profile?.industry || null;
  };

  const formatEmploymentType = (type: string) => {
    return type?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Full Time';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!dbUser ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Home
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <h1 className="text-2xl font-bold text-foreground">Browse Jobs</h1>
            </div>
            {!user && (
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-72 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Job title, skills..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="City, country..."
                      className="pl-9"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                </div>

                {/* Employment Type */}
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select value={employmentType} onValueChange={setEmploymentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Type */}
                <div className="space-y-2">
                  <Label>Work Type</Label>
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label>Max Experience Required</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Experience</SelectItem>
                      <SelectItem value="0">Entry Level (0 years)</SelectItem>
                      <SelectItem value="2">Up to 2 years</SelectItem>
                      <SelectItem value="5">Up to 5 years</SelectItem>
                      <SelectItem value="10">Up to 10 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fresher Friendly */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fresher"
                    checked={fresherFriendly}
                    onCheckedChange={(checked) => setFresherFriendly(checked as boolean)}
                  />
                  <Label htmlFor="fresher" className="cursor-pointer">
                    Fresher Friendly Only
                  </Label>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Job Listings */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
              </p>
            </div>

            {/* Job Cards */}
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Jobs Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters to see more results.' 
                      : 'No jobs are currently available.'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card 
                    key={job.id} 
                    className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Main Content */}
                        <div className="flex-1 p-6">
                          {/* Header Section */}
                          <div className="flex items-start gap-4 mb-4">
                            {/* Company Logo Placeholder */}
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10">
                              <Building2 className="h-7 w-7 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Job Title & Company */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {job.title}
                                  </h3>
                                  <p className="text-muted-foreground font-medium mt-0.5">
                                    {getCompanyName(job)}
                                    {getCompanyIndustry(job) && (
                                      <span className="text-muted-foreground/60"> • {getCompanyIndustry(job)}</span>
                                    )}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                                  <Calendar className="h-3 w-3" />
                                  {getTimeAgo(job.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Employment Type Tag - Highlighted like the image */}
                          <div className="mb-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold border ${getEmploymentBadgeColor(job.employment_type)}`}>
                              {formatEmploymentType(job.employment_type)}
                            </span>
                          </div>

                          {/* Feature List - Icon based like the image */}
                          <div className="space-y-2.5 mb-4">
                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 text-primary/70 flex-shrink-0" />
                              <span>{job.location || 'Location not specified'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                              {getWorkTypeIcon(job.work_type)}
                              <span className="capitalize">{job.work_type || 'On-site'} Work</span>
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                              <TrendingUp className="h-4 w-4 text-primary/70 flex-shrink-0" />
                              <span>
                                {job.min_experience === 0 
                                  ? 'Entry Level / Freshers Welcome' 
                                  : `${job.min_experience}+ years experience required`}
                              </span>
                            </div>

                            {job.min_experience === 0 && (
                              <div className="flex items-center gap-2.5 text-sm text-success">
                                <GraduationCap className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">Fresher Friendly Position</span>
                              </div>
                            )}
                          </div>

                          {/* Skills Tags */}
                          {job.required_skills && job.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {job.required_skills.slice(0, 4).map((skill, idx) => (
                                <span 
                                  key={idx}
                                  className="text-xs px-2.5 py-1 bg-secondary/80 hover:bg-secondary rounded-full text-muted-foreground font-medium transition-colors"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.required_skills.length > 4 && (
                                <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                  +{job.required_skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Section - Right Side */}
                        <div className="lg:w-48 flex lg:flex-col items-center justify-center gap-3 p-6 lg:border-l border-t lg:border-t-0 bg-muted/30">
                          <Button asChild className="w-full group/btn">
                            <Link to={`/jobs/${job.id}`} className="flex items-center justify-center gap-2">
                              Apply Now
                              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                          </Button>
                          <Button variant="outline" asChild className="w-full">
                            <Link to={`/jobs/${job.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
