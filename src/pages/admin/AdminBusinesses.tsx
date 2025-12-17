import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Search, Building2, CheckCircle2, XCircle, Clock, 
  Mail, Phone, MapPin, Globe, Calendar, Users, ExternalLink
} from 'lucide-react';

interface Business {
  id: string;
  user_id: string;
  is_verified: boolean;
  job_post_limit: number;
  created_at: string;
  user: {
    email: string;
  };
  application: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
  };
  profile?: BusinessProfile;
  jobs_count?: number;
}

interface BusinessProfile {
  legal_company_name: string;
  brand_name: string;
  company_website: string;
  company_email: string;
  company_phone: string;
  industry: string;
  company_size: string;
  year_founded: string;
  headquarters_address: string;
  city: string;
  state: string;
  country: string;
  work_type: string;
  contact_person_name: string;
  contact_designation: string;
  contact_email: string;
  contact_phone: string;
  contact_linkedin: string;
  business_registration_number: string;
  gst_tax_id: string;
  company_linkedin_page: string;
  roles_hiring_for: string;
  expected_monthly_hiring: string;
  employment_types: string[];
  salary_range: string;
  fresher_friendly: boolean;
  company_description: string;
  reason_for_joining: string;
}

const AdminBusinesses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  // Review modal
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id, user_id, is_verified, job_post_limit, created_at,
          user:users(email),
          application:business_applications(id, status, created_at),
          profile:business_profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data to flatten structure
      const processedData = data?.map((b: any) => ({
        ...b,
        user: b.user,
        application: Array.isArray(b.application) ? b.application[0] : b.application,
        profile: Array.isArray(b.profile) ? b.profile[0] : b.profile,
      })) || [];

      setBusinesses(processedData);
      setFilteredBusinesses(processedData);

      // Check if we should auto-open a review
      const reviewId = searchParams.get('review');
      if (reviewId) {
        const businessToReview = processedData.find((b: Business) => b.id === reviewId);
        if (businessToReview) {
          setSelectedBusiness(businessToReview);
          setIsReviewModalOpen(true);
        }
        searchParams.delete('review');
        setSearchParams(searchParams);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    let result = [...businesses];

    // Filter by tab status
    if (activeTab !== 'all') {
      result = result.filter(b => b.application?.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.user?.email?.toLowerCase().includes(query) ||
        b.profile?.legal_company_name?.toLowerCase().includes(query) ||
        b.profile?.brand_name?.toLowerCase().includes(query)
      );
    }

    setFilteredBusinesses(result);
  }, [businesses, activeTab, searchQuery]);

  const handleApprove = async () => {
    if (!selectedBusiness || !user) return;
    setIsSubmitting(true);

    try {
      // Get admin ID
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Update business application
      const { error } = await supabase
        .from('business_applications')
        .update({
          status: 'approved',
          reviewed_by: adminData?.id || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('business_id', selectedBusiness.id);

      if (error) throw error;

      // Update business verification
      await supabase
        .from('businesses')
        .update({
          is_verified: true,
          approved_by: adminData?.id || null,
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedBusiness.id);

      toast({
        title: 'Business Approved',
        description: 'The business has been approved successfully.',
      });

      setIsReviewModalOpen(false);
      fetchBusinesses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve business.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBusiness || !user) return;
    setIsSubmitting(true);

    try {
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('business_applications')
        .update({
          status: 'rejected',
          reviewed_by: adminData?.id || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('business_id', selectedBusiness.id);

      if (error) throw error;

      toast({
        title: 'Business Rejected',
        description: 'The business application has been rejected.',
      });

      setIsReviewModalOpen(false);
      fetchBusinesses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject business.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success-muted text-success-muted-foreground border-success/20">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-warning-muted text-warning-muted-foreground border-warning/20">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = businesses.filter(b => b.application?.status === 'pending').length;
  const approvedCount = businesses.filter(b => b.application?.status === 'approved').length;
  const rejectedCount = businesses.filter(b => b.application?.status === 'rejected').length;

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
        <h1 className="text-3xl font-bold">Businesses Management</h1>
        <p className="text-muted-foreground">Review and manage business applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                <p className="text-lg md:text-2xl font-bold">{businesses.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning-muted">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-warning-muted-foreground">Pending Review</p>
                <p className="text-lg md:text-2xl font-bold text-warning">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/20 bg-success-muted">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-success-muted-foreground">Approved</p>
                <p className="text-lg md:text-2xl font-bold text-success">{approvedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-destructive/80">Rejected</p>
                <p className="text-lg md:text-2xl font-bold text-destructive">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs & List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedCount})
          </TabsTrigger>
          <TabsTrigger value="all">All ({businesses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {filteredBusinesses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No businesses found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBusinesses.map((business) => (
                    <div
                      key={business.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {business.profile?.legal_company_name || business.user?.email}
                            </p>
                            {business.is_verified && (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{business.user?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(business.application?.status)}
                            {business.profile?.industry && (
                              <Badge variant="outline">{business.profile.industry}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {new Date(business.created_at).toLocaleDateString()}
                        </p>
                        <Button
                          size="sm"
                          variant={business.application?.status === 'pending' ? 'default' : 'outline'}
                          onClick={() => {
                            setSelectedBusiness(business);
                            setIsReviewModalOpen(true);
                          }}
                        >
                          {business.application?.status === 'pending' ? 'Review' : 'View'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Application Review
            </DialogTitle>
            <DialogDescription>
              Review the business details and approve or reject the application
            </DialogDescription>
          </DialogHeader>

          {selectedBusiness && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <div className="mt-1">{getStatusBadge(selectedBusiness.application?.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Applied On</p>
                  <p className="font-medium">
                    {new Date(selectedBusiness.application?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Company Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Legal Name</p>
                    <p className="font-medium">{selectedBusiness.profile?.legal_company_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Brand Name</p>
                    <p className="font-medium">{selectedBusiness.profile?.brand_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Industry</p>
                    <p className="font-medium">{selectedBusiness.profile?.industry || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Company Size</p>
                    <p className="font-medium">{selectedBusiness.profile?.company_size || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Year Founded</p>
                    <p className="font-medium">{selectedBusiness.profile?.year_founded || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Website</p>
                    {selectedBusiness.profile?.company_website ? (
                      <a 
                        href={selectedBusiness.profile.company_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary flex items-center gap-1"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="font-medium">-</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{selectedBusiness.profile?.contact_person_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Designation</p>
                    <p className="font-medium">{selectedBusiness.profile?.contact_designation || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedBusiness.profile?.contact_email || selectedBusiness.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedBusiness.profile?.contact_phone || '-'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedBusiness.profile?.headquarters_address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium">{selectedBusiness.profile?.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">State</p>
                    <p className="font-medium">{selectedBusiness.profile?.state || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Country</p>
                    <p className="font-medium">{selectedBusiness.profile?.country || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Work Type</p>
                    <p className="font-medium capitalize">{selectedBusiness.profile?.work_type || '-'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Legal & Verification */}
              <div>
                <h3 className="font-semibold mb-3">Legal & Verification</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Registration Number</p>
                    <p className="font-medium font-mono">{selectedBusiness.profile?.business_registration_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">GST/Tax ID</p>
                    <p className="font-medium font-mono">{selectedBusiness.profile?.gst_tax_id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">LinkedIn Page</p>
                    {selectedBusiness.profile?.company_linkedin_page ? (
                      <a 
                        href={selectedBusiness.profile.company_linkedin_page} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="font-medium">-</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Hiring Intent */}
              <div>
                <h3 className="font-semibold mb-3">Hiring Intent</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Roles Hiring For</p>
                    <p className="font-medium">{selectedBusiness.profile?.roles_hiring_for || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expected Monthly Hiring</p>
                    <p className="font-medium">{selectedBusiness.profile?.expected_monthly_hiring || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Salary Range</p>
                    <p className="font-medium">{selectedBusiness.profile?.salary_range || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Employment Types</p>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {selectedBusiness.profile?.employment_types?.map((type) => (
                        <Badge key={type} variant="outline" className="capitalize">{type}</Badge>
                      )) || '-'}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fresher Friendly</p>
                    <p className="font-medium">{selectedBusiness.profile?.fresher_friendly ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Company Description */}
              <div>
                <h3 className="font-semibold mb-3">Company Description</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {selectedBusiness.profile?.company_description || 'No description provided'}
                </p>
              </div>

              {/* Reason for Joining */}
              <div>
                <h3 className="font-semibold mb-3">Reason for Joining</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {selectedBusiness.profile?.reason_for_joining || 'No reason provided'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedBusiness?.application?.status === 'pending' ? (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBusinesses;
