export type UserRole = 'admin' | 'business' | 'employee';
export type EmploymentType = 'full-time' | 'internship' | 'contract';
export type WorkType = 'remote' | 'onsite' | 'hybrid';
export type ApplicationStatus = 'applied' | 'shortlisted' | 'rejected';
export type BusinessApplicationStatus = 'pending' | 'approved' | 'rejected';

// ==================== USER TYPES ====================
export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

// ==================== ADMIN TYPES ====================
export interface Admin {
  id: string;
  user_id: string;
  created_at: string;
}

// ==================== BUSINESS TYPES ====================
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
  work_type: WorkType;
  
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

export interface BusinessProfile {
  id: string;
  business_id: string;
  legal_company_name: string | null;
  brand_name: string | null;
  company_website: string | null;
  company_email: string | null;
  company_phone: string | null;
  industry: string | null;
  company_size: string | null;
  year_founded: string | null;
  headquarters_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  work_type: WorkType | null;
  contact_person_name: string | null;
  contact_designation: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_linkedin: string | null;
  business_registration_number: string | null;
  gst_tax_id: string | null;
  company_linkedin_page: string | null;
  roles_hiring_for: string | null;
  expected_monthly_hiring: string | null;
  employment_types: string[] | null;
  salary_range: string | null;
  fresher_friendly: boolean;
  company_description: string | null;
  reason_for_joining: string | null;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== EMPLOYEE TYPES ====================
export interface Employee {
  id: string;
  user_id: string;
  is_verified: boolean;
  created_at: string;
}

export interface EmployeeProfile {
  id: string;
  employee_id: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  experience_years: number;
  education: string | null;
  skills: string[];
  resume_url: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== JOB TYPES ====================
export interface Job {
  id: string;
  business_id: string;
  title: string;
  location: string | null;
  employment_type: EmploymentType | null;
  work_type: WorkType | null;
  min_experience: number;
  required_skills: string[] | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface JobRequirement {
  id: string;
  job_id: string;
  requirement_type: string;
  requirement_value: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  employee_id: string;
  match_score: number | null;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}

export interface JobApplicationCheck {
  id: string;
  application_id: string;
  meets_experience: boolean;
  meets_skills: boolean;
  meets_education: boolean;
  overall_eligible: boolean;
}

// ==================== SAVED JOBS ====================
export interface SavedJob {
  id: string;
  job_id: string;
  employee_id: string;
  saved_at: string;
}

// ==================== DOCUMENT TYPES ====================
export interface BusinessDocument {
  id: string;
  business_id: string;
  document_type: string;
  file_url: string;
  uploaded_at: string;
}

// ==================== REPORT TYPES ====================
export interface Report {
  id: string;
  reported_by: string | null;
  target_type: string;
  target_id: string | null;
  reason: string | null;
  created_at: string;
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ==================== SUBSCRIPTION TYPES ====================
export interface Subscription {
  id: string;
  business_id: string | null;
  plan_name: string | null;
  job_limit: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

// ==================== AUDIT LOG TYPES ====================
export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}
