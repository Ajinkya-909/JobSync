-- =========================
-- VERIFIED JOB PLATFORM
-- COMPLETE DATABASE SCHEMA
-- =========================

-- ENUMS
create type user_role as enum ('admin', 'business', 'employee');
create type employment_type as enum ('full-time', 'internship', 'contract');
create type work_type as enum ('remote', 'onsite', 'hybrid');
create type application_status as enum ('applied', 'shortlisted', 'rejected');
create type business_application_status as enum ('pending', 'approved', 'rejected');

-- =========================
-- USERS (AUTH MAPPING)
-- =========================
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role user_role not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =========================
-- ADMINS
-- =========================
create table admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  created_at timestamptz default now()
);

-- =========================
-- EMPLOYEES
-- =========================
create table employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  is_verified boolean default false, -- employee verification badge
  created_at timestamptz default now()
);

create table employee_profiles (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid unique references employees(id) on delete cascade,

  full_name text not null,
  phone text,
  location text,

  experience_years int default 0,
  education text,
  skills text[], -- used for job matching
  resume_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- BUSINESSES
-- =========================
create table businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,

  is_verified boolean default false, -- verification badge
  job_post_limit int default 4,

  approved_by uuid references admins(id),
  approved_at timestamptz,

  created_at timestamptz default now()
);

create table business_applications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,

  status business_application_status default 'pending',
  reviewed_by uuid references admins(id),
  reviewed_at timestamptz,

  created_at timestamptz default now()
);

create table business_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,

  document_type text, -- logo, registration, license, tax
  file_url text,

  uploaded_at timestamptz default now()
);

-- =========================
-- JOBS
-- =========================
create table jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,

  title text not null,
  location text,
  employment_type employment_type,
  work_type work_type,

  min_experience int default 0,
  required_skills text[], -- used for eligibility checks

  is_active boolean default true,
  expires_at timestamptz,

  created_at timestamptz default now()
);

create table job_requirements (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,

  requirement_type text, -- skill, experience, education
  requirement_value text
);

-- =========================
-- JOB APPLICATIONS
-- =========================
create table job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,

  match_score int, -- suitability score
  status application_status default 'applied',

  applied_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (job_id, employee_id)
);

create table job_application_checks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references job_applications(id) on delete cascade,

  meets_experience boolean,
  meets_skills boolean,
  meets_education boolean,
  overall_eligible boolean
);

-- =========================
-- SAVED JOBS
-- =========================
create table saved_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  saved_at timestamptz default now(),

  unique (job_id, employee_id)
);

-- =========================
-- REPORTS & TRUST
-- =========================
create table reports (
  id uuid primary key default gen_random_uuid(),
  reported_by uuid references users(id),
  target_type text, -- job, business
  target_id uuid,
  reason text,
  created_at timestamptz default now()
);

-- =========================
-- NOTIFICATIONS
-- =========================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =========================
-- SUBSCRIPTIONS (FUTURE)
-- =========================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,

  plan_name text,
  job_limit int,

  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default false
);

-- =========================
-- AUDIT LOGS
-- =========================
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  action text,
  entity_type text,
  entity_id uuid,
  created_at timestamptz default now()
);
