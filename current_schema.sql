-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text,
  entity_type text,
  entity_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id)
);
CREATE TABLE public.business_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid,
  status USER-DEFINED DEFAULT 'pending'::business_application_status,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT business_applications_pkey PRIMARY KEY (id),
  CONSTRAINT business_applications_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT business_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.admins(id)
);
CREATE TABLE public.business_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid,
  document_type text,
  file_url text,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT business_documents_pkey PRIMARY KEY (id),
  CONSTRAINT business_documents_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.business_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid UNIQUE,
  legal_company_name text,
  brand_name text,
  company_website text,
  company_email text,
  company_phone text,
  industry text,
  company_size text,
  year_founded text,
  headquarters_address text,
  city text,
  state text,
  country text,
  work_type USER-DEFINED,
  contact_person_name text,
  contact_designation text,
  contact_email text,
  contact_phone text,
  contact_linkedin text,
  business_registration_number text,
  gst_tax_id text,
  company_linkedin_page text,
  roles_hiring_for text,
  expected_monthly_hiring text,
  employment_types ARRAY,
  salary_range text,
  fresher_friendly boolean DEFAULT false,
  company_description text,
  reason_for_joining text,
  terms_accepted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT business_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT business_profiles_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.businesses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  is_verified boolean DEFAULT false,
  job_post_limit integer DEFAULT 4,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT businesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT businesses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.admins(id)
);
CREATE TABLE public.employee_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid UNIQUE,
  full_name text NOT NULL,
  phone text,
  location text,
  experience_years integer DEFAULT 0,
  education text,
  skills ARRAY,
  resume_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employee_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT employee_profiles_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.job_application_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid,
  meets_experience boolean,
  meets_skills boolean,
  meets_education boolean,
  overall_eligible boolean,
  CONSTRAINT job_application_checks_pkey PRIMARY KEY (id),
  CONSTRAINT job_application_checks_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.job_applications(id)
);
CREATE TABLE public.job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  employee_id uuid,
  match_score integer,
  status USER-DEFINED DEFAULT 'applied'::application_status,
  applied_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT job_applications_pkey PRIMARY KEY (id),
  CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT job_applications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.job_requirements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  requirement_type text,
  requirement_value text,
  CONSTRAINT job_requirements_pkey PRIMARY KEY (id),
  CONSTRAINT job_requirements_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid,
  title text NOT NULL,
  location text,
  employment_type USER-DEFINED,
  work_type USER-DEFINED,
  min_experience integer DEFAULT 0,
  required_skills ARRAY,
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reported_by uuid,
  target_type text,
  target_id uuid,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(id)
);
CREATE TABLE public.saved_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  employee_id uuid,
  saved_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT saved_jobs_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid,
  plan_name text,
  job_limit integer,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  is_active boolean DEFAULT false,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role USER-DEFINED NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);