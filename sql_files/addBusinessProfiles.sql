-- Add Business Profiles table to store business details
-- This complements the existing businesses table with extended information

create table if not exists business_profiles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid unique references businesses(id) on delete cascade,

  -- Company Information
  legal_company_name text,
  brand_name text,
  company_website text,
  company_email text,
  company_phone text,
  industry text,
  company_size text,
  year_founded text,
  
  -- Location Details
  headquarters_address text,
  city text,
  state text,
  country text,
  work_type work_type,
  
  -- Contact Details
  contact_person_name text,
  contact_designation text,
  contact_email text,
  contact_phone text,
  contact_linkedin text,
  
  -- Legal & Verification
  business_registration_number text,
  gst_tax_id text,
  company_linkedin_page text,
  
  -- Hiring Intent
  roles_hiring_for text,
  expected_monthly_hiring text,
  employment_types text[],
  salary_range text,
  fresher_friendly boolean default false,
  
  -- Additional Details
  company_description text,
  reason_for_joining text,
  terms_accepted boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index if not exists idx_business_profiles_business_id on business_profiles(business_id);
