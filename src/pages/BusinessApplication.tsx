import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ArrowRight, Check, Building2, MapPin, UserCircle, FileText, Users, Info } from 'lucide-react';
import { BusinessApplicationData } from '@/types/database';

const STEPS = [
  { id: 1, title: 'Company Info', icon: Building2 },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Contact', icon: UserCircle },
  { id: 4, title: 'Legal', icon: FileText },
  { id: 5, title: 'Hiring', icon: Users },
  { id: 6, title: 'Additional', icon: Info },
];

const initialFormData: BusinessApplicationData = {
  legal_company_name: '',
  brand_name: '',
  company_website: '',
  company_email: '',
  company_phone: '',
  industry: '',
  company_size: '',
  year_founded: '',
  headquarters_address: '',
  city: '',
  state: '',
  country: '',
  work_type: 'onsite',
  contact_person_name: '',
  contact_designation: '',
  contact_email: '',
  contact_phone: '',
  contact_linkedin: '',
  business_registration_number: '',
  gst_tax_id: '',
  company_linkedin_page: '',
  roles_hiring_for: '',
  expected_monthly_hiring: '',
  employment_types: [],
  salary_range: '',
  fresher_friendly: false,
  company_description: '',
  reason_for_joining: '',
  terms_accepted: false,
};

const BusinessApplication = () => {
  const { user, dbUser, businessApplication, isLoading, refreshBusinessApplication } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BusinessApplicationData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || !dbUser) {
        navigate('/auth');
        return;
      }

      if (dbUser.role !== 'business') {
        navigate('/dashboard');
        return;
      }

      if (businessApplication?.status === 'approved') {
        navigate('/dashboard');
        return;
      }

      // Load existing business profile data if available
      const loadBusinessProfile = async () => {
        if (!user) return;
        const { data: businessData } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (businessData) {
          const { data: profileData } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('business_id', businessData.id)
            .maybeSingle();

          if (profileData) {
            const { created_at, updated_at, id, business_id, ...formFields } = profileData;
            setFormData(prev => ({ ...prev, ...formFields }));
          }
        }
      };

      loadBusinessProfile();
    }
  }, [user, dbUser, businessApplication, isLoading, navigate]);

  const updateField = (field: keyof BusinessApplicationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmploymentTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      employment_types: checked 
        ? [...prev.employment_types, type]
        : prev.employment_types.filter(t => t !== type)
    }));
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.legal_company_name && formData.company_email && formData.industry);
      case 2:
        return !!(formData.city && formData.country && formData.work_type);
      case 3:
        return !!(formData.contact_person_name && formData.contact_email);
      case 4:
        return !!(formData.business_registration_number);
      case 5:
        return !!(formData.roles_hiring_for && formData.employment_types.length > 0);
      case 6:
        return !!(formData.company_description && formData.terms_accepted);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in all required fields before continuing.',
        variant: 'destructive'
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get business ID
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (!businessData) throw new Error('Business not found');

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('business_id', businessData.id)
        .maybeSingle();

      // Upsert business profile with form data
      const { error } = await supabase
        .from('business_profiles')
        .upsert({
          business_id: businessData.id,
          ...formData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'business_id'
        });

      if (error) throw error;

      await refreshBusinessApplication();

      toast({
        title: 'Application Submitted',
        description: 'Your business application has been submitted for review.',
      });
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending status if application already submitted
  if (businessApplication?.status === 'pending') {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Application Under Review</CardTitle>
              <CardDescription>
                Your business application has been submitted and is currently under review. 
                You will be notified once it's approved.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Application</h1>
          <p className="text-muted-foreground">Complete your profile to start posting jobs</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((step) => (
            <div 
              key={step.id} 
              className={`flex flex-col items-center min-w-[80px] ${
                step.id === currentStep ? 'text-primary' : 
                step.id < currentStep ? 'text-primary/60' : 'text-muted-foreground'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step.id === currentStep ? 'bg-primary text-primary-foreground' :
                step.id < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted'
              }`}>
                {step.id < currentStep ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <span className="text-xs font-medium">{step.title}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="legal_company_name">Legal Company Name *</Label>
                    <Input
                      id="legal_company_name"
                      value={formData.legal_company_name}
                      onChange={(e) => updateField('legal_company_name', e.target.value)}
                      placeholder="ABC Pvt Ltd"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand_name">Brand Name</Label>
                    <Input
                      id="brand_name"
                      value={formData.brand_name}
                      onChange={(e) => updateField('brand_name', e.target.value)}
                      placeholder="ABC"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_website">Company Website</Label>
                    <Input
                      id="company_website"
                      value={formData.company_website}
                      onChange={(e) => updateField('company_website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_email">Company Email *</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={formData.company_email}
                      onChange={(e) => updateField('company_email', e.target.value)}
                      placeholder="hr@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_phone">Phone Number</Label>
                    <Input
                      id="company_phone"
                      value={formData.company_phone}
                      onChange={(e) => updateField('company_phone', e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select value={formData.company_size} onValueChange={(v) => updateField('company_size', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year_founded">Year Founded</Label>
                    <Input
                      id="year_founded"
                      value={formData.year_founded}
                      onChange={(e) => updateField('year_founded', e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Location Details */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="headquarters_address">Headquarters Address</Label>
                  <Input
                    id="headquarters_address"
                    value={formData.headquarters_address}
                    onChange={(e) => updateField('headquarters_address', e.target.value)}
                    placeholder="123 Business Street"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="USA"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Work Type *</Label>
                  <Select value={formData.work_type} onValueChange={(v: 'remote' | 'onsite' | 'hybrid') => updateField('work_type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 3: Contact Details */}
            {currentStep === 3 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person_name">Contact Person Name *</Label>
                    <Input
                      id="contact_person_name"
                      value={formData.contact_person_name}
                      onChange={(e) => updateField('contact_person_name', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_designation">Designation</Label>
                    <Input
                      id="contact_designation"
                      value={formData.contact_designation}
                      onChange={(e) => updateField('contact_designation', e.target.value)}
                      placeholder="HR Manager"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Official Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => updateField('contact_email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Phone Number</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => updateField('contact_phone', e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_linkedin">LinkedIn Profile URL</Label>
                  <Input
                    id="contact_linkedin"
                    value={formData.contact_linkedin}
                    onChange={(e) => updateField('contact_linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
              </>
            )}

            {/* Step 4: Legal & Verification */}
            {currentStep === 4 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_registration_number">Business Registration Number *</Label>
                    <Input
                      id="business_registration_number"
                      value={formData.business_registration_number}
                      onChange={(e) => updateField('business_registration_number', e.target.value)}
                      placeholder="REG123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst_tax_id">GST / Tax ID</Label>
                    <Input
                      id="gst_tax_id"
                      value={formData.gst_tax_id}
                      onChange={(e) => updateField('gst_tax_id', e.target.value)}
                      placeholder="GST123456"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_linkedin_page">Company LinkedIn Page</Label>
                  <Input
                    id="company_linkedin_page"
                    value={formData.company_linkedin_page}
                    onChange={(e) => updateField('company_linkedin_page', e.target.value)}
                    placeholder="https://linkedin.com/company/example"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Document uploads (company logo, registration certificate, license) will be available after initial approval.
                </p>
              </>
            )}

            {/* Step 5: Hiring Intent */}
            {currentStep === 5 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="roles_hiring_for">Roles Being Hired For *</Label>
                  <Textarea
                    id="roles_hiring_for"
                    value={formData.roles_hiring_for}
                    onChange={(e) => updateField('roles_hiring_for', e.target.value)}
                    placeholder="Software Engineer, Product Manager, Designer..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expected_monthly_hiring">Expected Monthly Hiring</Label>
                    <Select value={formData.expected_monthly_hiring} onValueChange={(v) => updateField('expected_monthly_hiring', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 hires</SelectItem>
                        <SelectItem value="6-15">6-15 hires</SelectItem>
                        <SelectItem value="16-30">16-30 hires</SelectItem>
                        <SelectItem value="30+">30+ hires</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_range">Salary Range (Optional)</Label>
                    <Input
                      id="salary_range"
                      value={formData.salary_range}
                      onChange={(e) => updateField('salary_range', e.target.value)}
                      placeholder="$50,000 - $150,000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Employment Types *</Label>
                  <div className="flex flex-wrap gap-4">
                    {['full-time', 'internship', 'contract'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={formData.employment_types.includes(type)}
                          onCheckedChange={(checked) => handleEmploymentTypeChange(type, checked as boolean)}
                        />
                        <Label htmlFor={type} className="capitalize">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fresher_friendly"
                    checked={formData.fresher_friendly}
                    onCheckedChange={(checked) => updateField('fresher_friendly', checked)}
                  />
                  <Label htmlFor="fresher_friendly">We hire freshers / entry-level candidates</Label>
                </div>
              </>
            )}

            {/* Step 6: Additional Details */}
            {currentStep === 6 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company_description">Company Description *</Label>
                  <Textarea
                    id="company_description"
                    value={formData.company_description}
                    onChange={(e) => updateField('company_description', e.target.value)}
                    placeholder="Tell us about your company, culture, and what makes you a great employer..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason_for_joining">Why do you want to join our platform?</Label>
                  <Textarea
                    id="reason_for_joining"
                    value={formData.reason_for_joining}
                    onChange={(e) => updateField('reason_for_joining', e.target.value)}
                    placeholder="What are you hoping to achieve by using our platform..."
                    rows={3}
                  />
                </div>
                <div className="flex items-start space-x-2 pt-4 border-t">
                  <Checkbox
                    id="terms_accepted"
                    checked={formData.terms_accepted}
                    onCheckedChange={(checked) => updateField('terms_accepted', checked)}
                  />
                  <Label htmlFor="terms_accepted" className="text-sm leading-relaxed">
                    I confirm that all information provided is accurate and authentic. I agree to the platform's terms of service and privacy policy. *
                  </Label>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              {currentStep < 6 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessApplication;
