import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Building2, Mail, Phone, Globe, MapPin, Users, Calendar, Briefcase, FileText, CheckCircle } from 'lucide-react';

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
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

const BusinessProfile = () => {
  const { user, dbUser, businessApplication, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !dbUser || dbUser.role !== 'business') {
        navigate('/auth');
        return;
      }
    }
  }, [user, dbUser, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: businessData } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!businessData) return;

        const { data: profileData, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('business_id', businessData.id)
          .single();

        if (error) throw error;
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
            <p className="text-muted-foreground">
              {businessApplication?.status === 'pending' && 'Your application is pending review.'}
              {businessApplication?.status === 'rejected' && 'Your application was not approved.'}
              {!businessApplication && 'Complete your business application to get started.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Business Profile
        </h1>
        <p className="text-muted-foreground mt-1">Your registered business information</p>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Basic details about your company</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Legal Company Name</label>
              <p className="font-medium">{profile.legal_company_name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Brand Name</label>
              <p className="font-medium">{profile.brand_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Industry</label>
              <p className="font-medium">{profile.industry}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Company Size</label>
              <p className="font-medium">{profile.company_size}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Year Founded</label>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {profile.year_founded}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Work Type</label>
              <Badge variant="secondary">{profile.work_type}</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {profile.company_website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a href={profile.company_website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    {profile.company_website}
                  </a>
                </div>
              </div>
            )}
            {profile.company_email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Company Email</p>
                  <p className="font-medium">{profile.company_email}</p>
                </div>
              </div>
            )}
            {profile.company_phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Company Phone</p>
                  <p className="font-medium">{profile.company_phone}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Headquarters Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{profile.headquarters_address}</p>
          <p className="text-muted-foreground">
            {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
          </p>
        </CardContent>
      </Card>

      {/* Contact Person */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Primary Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="font-medium">{profile.contact_person_name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Designation</label>
              <p className="font-medium">{profile.contact_designation}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="font-medium">{profile.contact_email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <p className="font-medium">{profile.contact_phone}</p>
            </div>
          </div>
          {profile.contact_linkedin && (
            <div className="mt-3">
              <label className="text-sm text-muted-foreground">LinkedIn</label>
              <a href={profile.contact_linkedin} target="_blank" rel="noopener noreferrer" className="block font-medium text-primary hover:underline">
                {profile.contact_linkedin}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal & Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Legal & Registration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.business_registration_number && (
              <div>
                <label className="text-sm text-muted-foreground">Business Registration Number</label>
                <p className="font-medium">{profile.business_registration_number}</p>
              </div>
            )}
            {profile.gst_tax_id && (
              <div>
                <label className="text-sm text-muted-foreground">GST/Tax ID</label>
                <p className="font-medium">{profile.gst_tax_id}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hiring Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Hiring Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Roles Hiring For</label>
              <p className="font-medium">{profile.roles_hiring_for}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Expected Monthly Hiring</label>
              <p className="font-medium">{profile.expected_monthly_hiring}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Salary Range</label>
              <p className="font-medium">{profile.salary_range}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Fresher Friendly</label>
              <p className="font-medium flex items-center gap-2">
                {profile.fresher_friendly ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Yes
                  </>
                ) : (
                  'No'
                )}
              </p>
            </div>
          </div>

          {profile.employment_types && profile.employment_types.length > 0 && (
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Employment Types</label>
              <div className="flex flex-wrap gap-2">
                {profile.employment_types.map((type, idx) => (
                  <Badge key={idx} variant="outline">{type}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Description */}
      {profile.company_description && (
        <Card>
          <CardHeader>
            <CardTitle>Company Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.company_description}</p>
          </CardContent>
        </Card>
      )}

      {/* Reason for Joining */}
      {profile.reason_for_joining && (
        <Card>
          <CardHeader>
            <CardTitle>Why JobSync?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.reason_for_joining}</p>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      {profile.company_linkedin_page && (
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <a href={profile.company_linkedin_page} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Company LinkedIn Page
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessProfile;
