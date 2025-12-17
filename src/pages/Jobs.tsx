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
import { 
  Loader2, Search, MapPin, Briefcase, Clock, Building2, 
  Filter, X, ChevronLeft
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
            business:businesses(id)
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
      case 'full-time': return 'bg-info-muted text-info-muted-foreground border-info/20';
      case 'internship': return 'bg-purple-muted text-purple-muted-foreground border-purple/20';
      case 'contract': return 'bg-orange-muted text-orange-muted-foreground border-orange/20';
      default: return '';
    }
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
              {dbUser && (
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
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-foreground truncate">
                                {job.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location || 'Not specified'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {job.min_experience === 0 
                                    ? 'Entry Level' 
                                    : `${job.min_experience}+ years`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Badge 
                              variant="outline" 
                              className={getEmploymentBadgeColor(job.employment_type)}
                            >
                              {job.employment_type?.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {job.work_type}
                            </Badge>
                            {job.min_experience === 0 && (
                              <Badge variant="outline" className="bg-success-muted text-success-muted-foreground border-success/20">
                                Fresher Friendly
                              </Badge>
                            )}
                          </div>

                          {/* Skills */}
                          {job.required_skills && job.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {job.required_skills.slice(0, 5).map((skill, idx) => (
                                <span 
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.required_skills.length > 5 && (
                                <span className="text-xs px-2 py-1 text-muted-foreground">
                                  +{job.required_skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground mt-3">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex sm:flex-col gap-2 sm:items-end">
                          <Button asChild className="flex-1 sm:flex-none">
                            <Link to={`/jobs/${job.id}`}>View Details</Link>
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
