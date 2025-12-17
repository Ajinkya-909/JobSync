export type UserRole = 'admin' | 'business' | 'employee';
export type BusinessApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  is_verified: boolean;
  job_post_limit: number;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface BusinessApplication {
  id: string;
  business_id: string;
  status: BusinessApplicationStatus;
  application_data: BusinessApplicationData | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface BusinessApplicationData {
  // Company Information
  legal_company_name: string;
  brand_name: string;
  company_website: string;
  company_email: string;
  company_phone: string;
  industry: string;
  company_size: string;
  year_founded: string;
  
  // Location Details
  headquarters_address: string;
  city: string;
  state: string;
  country: string;
  work_type: 'remote' | 'onsite' | 'hybrid';
  
  // Contact Details
  contact_person_name: string;
  contact_designation: string;
  contact_email: string;
  contact_phone: string;
  contact_linkedin: string;
  
  // Legal & Verification
  business_registration_number: string;
  gst_tax_id: string;
  company_linkedin_page: string;
  
  // Hiring Intent
  roles_hiring_for: string;
  expected_monthly_hiring: string;
  employment_types: string[];
  salary_range: string;
  fresher_friendly: boolean;
  
  // Additional Details
  company_description: string;
  reason_for_joining: string;
  terms_accepted: boolean;
}

export interface Employee {
  id: string;
  user_id: string;
  is_verified: boolean;
  created_at: string;
}
