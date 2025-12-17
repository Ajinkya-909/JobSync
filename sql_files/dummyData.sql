-- =========================
-- JOBSYNC DUMMY DATA
-- =========================
-- This file contains comprehensive dummy data for testing the JobSync platform
-- NOTE: This data does NOT include auth.users entries, so authentication
-- will not work with these emails. This is intentional for demo purposes.

-- =========================
-- 1. ADMIN REFERENCE
-- =========================
-- Using your existing admin:
-- admin.id: e9a22a55-abbb-4a7f-b5c5-005770433dc7
-- admin.user_id: 5a2778ab-4d1b-46a9-af47-2b2875e4d0d0

-- =========================
-- 2. BUSINESS USER DATA (Different Application Statuses)
-- =========================

-- Create auth.users entries for businesses first
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_super_admin) values
('550e8400-e29b-41d4-a716-446655440201', 'techstartup@company.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440202', 'innovatorslab@company.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440203', 'creativestudios@company.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440204', 'microsoftindia@company.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440205', 'googleindia@company.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440206', 'dubioussolutions@company.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false);

-- Create users entries for businesses
insert into users (id, email, role, is_active) values
('550e8400-e29b-41d4-a716-446655440201', 'techstartup@company.com', 'business', true),
('550e8400-e29b-41d4-a716-446655440202', 'innovatorslab@company.com', 'business', true),
('550e8400-e29b-41d4-a716-446655440203', 'creativestudios@company.com', 'business', true),
('550e8400-e29b-41d4-a716-446655440204', 'microsoftindia@company.com', 'business', true),
('550e8400-e29b-41d4-a716-446655440205', 'googleindia@company.com', 'business', true),
('550e8400-e29b-41d4-a716-446655440206', 'dubioussolutions@company.com', 'business', true);

-- FIRST: Create PENDING businesses
insert into businesses (id, user_id, is_verified, job_post_limit) values
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', false, 4),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440202', false, 4),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440203', false, 4);

-- Business Applications for Pending Businesses
insert into business_applications (id, business_id, status, created_at) values
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301', 'pending', now()),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440302', 'pending', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440303', 'pending', now() - interval '5 days');

-- SECOND: Create APPROVED businesses
insert into businesses (id, user_id, is_verified, job_post_limit, approved_by, approved_at) values
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440204', true, 10, 'e9a22a55-abbb-4a7f-b5c5-005770433dc7', now() - interval '30 days'),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440205', true, 15, 'e9a22a55-abbb-4a7f-b5c5-005770433dc7', now() - interval '60 days');

insert into business_applications (id, business_id, status, reviewed_by, reviewed_at, created_at) values
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440304', 'approved', 'e9a22a55-abbb-4a7f-b5c5-005770433dc7', now() - interval '29 days', now() - interval '31 days'),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440305', 'approved', 'e9a22a55-abbb-4a7f-b5c5-005770433dc7', now() - interval '59 days', now() - interval '61 days');

-- THIRD: Create REJECTED business
insert into businesses (id, user_id, is_verified, job_post_limit) values
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440206', false, 0);

insert into business_applications (id, business_id, status, reviewed_by, reviewed_at, created_at) values
('550e8400-e29b-41d4-a716-446655440406', '550e8400-e29b-41d4-a716-446655440306', 'rejected', 'e9a22a55-abbb-4a7f-b5c5-005770433dc7', now() - interval '15 days', now() - interval '20 days');

-- NOW insert business_profiles (after all businesses are created)
insert into business_profiles (business_id, legal_company_name, brand_name, company_website, company_email, company_phone, industry, company_size, year_founded, headquarters_address, city, state, country, work_type, contact_person_name, contact_designation, contact_email, contact_phone, contact_linkedin, business_registration_number, gst_tax_id, company_linkedin_page, roles_hiring_for, expected_monthly_hiring, employment_types, salary_range, fresher_friendly, company_description, reason_for_joining, terms_accepted) values
(
  '550e8400-e29b-41d4-a716-446655440301',
  'TechStartup Innovation Pvt Ltd',
  'TechStartup',
  'www.techstartup.com',
  'hr@techstartup.com',
  '+91-9876543210',
  'Software Development',
  '50-100',
  '2021',
  '123 Tech Park, Silicon Valley',
  'Bangalore',
  'Karnataka',
  'India',
  'hybrid',
  'Rahul Kumar',
  'HR Manager',
  'rahul@techstartup.com',
  '+91-9876543210',
  'linkedin.com/company/techstartup',
  'GSTIN123456789',
  '123456789GST',
  'linkedin.com/company/techstartup-innovation',
  'Full Stack Developers, UI/UX Designers',
  '5-10',
  ARRAY['full-time', 'internship'],
  '12,00,000 - 25,00,000',
  true,
  'Leading innovation in AI and ML solutions for enterprises',
  'Expanding our development team to accelerate product delivery',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440302',
  'Innovators Lab Solutions',
  'Innovators Lab',
  'www.innovatorslab.com',
  'careers@innovatorslab.com',
  '+91-8765432109',
  'Digital Marketing',
  '20-50',
  '2022',
  '456 Business Zone, MG Road',
  'Mumbai',
  'Maharashtra',
  'India',
  'onsite',
  'Priya Sharma',
  'Recruitment Head',
  'priya@innovatorslab.com',
  '+91-8765432109',
  'linkedin.com/company/innovators-lab',
  'GST456789ABC',
  '987654321GST',
  'linkedin.com/company/innovators-lab-solutions',
  'SEO Specialists, Content Writers, Social Media Managers',
  '3-7',
  ARRAY['full-time', 'contract'],
  '8,00,000 - 15,00,000',
  true,
  'Digital agency specializing in brand transformation and growth hacking',
  'Looking for talented professionals to join our creative team',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440303',
  'Creative Studios International',
  'Creative Studios',
  'www.creativestudios.in',
  'jobs@creativestudios.in',
  '+91-7654321098',
  'Design & Creative',
  '30-75',
  '2020',
  '789 Design Hub, Whitefield',
  'Hyderabad',
  'Telangana',
  'India',
  'remote',
  'Arun Patel',
  'Talent Manager',
  'arun@creativestudios.in',
  '+91-7654321098',
  'linkedin.com/company/creative-studios-intl',
  'GSTIN789ABC123',
  '456123789GST',
  'linkedin.com/company/creative-studios-international',
  'Graphic Designers, Video Editors, 3D Artists',
  '4-8',
  ARRAY['full-time', 'internship', 'contract'],
  '5,00,000 - 20,00,000',
  true,
  'World-class creative agency delivering premium content and design solutions',
  'Building a diverse creative force for global projects',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440304',
  'Microsoft India Private Limited',
  'Microsoft',
  'www.microsoft.com/en-in',
  'careers-india@microsoft.com',
  '+91-9999999999',
  'Technology',
  '5000+',
  '2004',
  'Microsoft Technology Center, Bangalore',
  'Bangalore',
  'Karnataka',
  'India',
  'hybrid',
  'Vikram Singh',
  'Director of Talent',
  'vikram.singh@microsoft.com',
  '+91-9999999999',
  'linkedin.com/company/microsoft-india',
  'MSFT123456789',
  '12AAPCU1234A1Z0',
  'linkedin.com/company/microsoft-india',
  'Software Engineers, Cloud Architects, Data Scientists',
  '20-50',
  ARRAY['full-time'],
  '15,00,000 - 50,00,000',
  false,
  'Global technology leader delivering cloud solutions, AI, and enterprise software',
  'Scaling technical teams for next-generation cloud initiatives',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440305',
  'Google India Private Limited',
  'Google',
  'www.google.co.in',
  'jobs-india@google.com',
  '+91-8888888888',
  'Technology',
  '3000+',
  '2002',
  'Google India Pvt Ltd, Bangalore',
  'Bangalore',
  'Karnataka',
  'India',
  'remote',
  'Sunita Jain',
  'Head of Recruitment',
  'sunita.jain@google.com',
  '+91-8888888888',
  'linkedin.com/company/google-india',
  'GOOG987654321',
  '27AAPTG1234B1Z5',
  'linkedin.com/company/google-india',
  'Software Engineers, Product Managers, UX Designers',
  '30-60',
  ARRAY['full-time'],
  '18,00,000 - 60,00,000',
  false,
  'Search, advertising, and cloud services technology company',
  'Building diverse technical talent for search and cloud initiatives',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440306',
  'Dubious Solutions Ltd',
  'Dubious Solutions',
  'www.dubiousolutions.com',
  'contact@dubiousolutions.com',
  '+91-6543210987',
  'Consultancy',
  '10-20',
  '2023',
  '999 Unknown Street, Unknown City',
  'Pune',
  'Maharashtra',
  'India',
  'onsite',
  'Unknown Person',
  'Manager',
  'unknown@dubiousolutions.com',
  '+91-6543210987',
  'linkedin.com/company/dubious-solutions',
  'INVALID123',
  'NOINVALID123',
  'linkedin.com/company/dubious-solutions',
  'Various',
  '100+',
  ARRAY['contract'],
  'Unspecified',
  false,
  'Consultancy firm',
  'Rapid expansion needed',
  true
);

-- =========================
-- 3. EMPLOYEE USER DATA (Different Profile States)
-- =========================

-- Create auth.users entries for employees first
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_super_admin) values
('550e8400-e29b-41d4-a716-446655440301', 'arjun.verified@email.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440302', 'priya.verified@email.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440303', 'rohan.unverified@email.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440304', 'neha.unverified@email.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440305', 'amit.fresher@email.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false),
('550e8400-e29b-41d4-a716-446655440306', 'divya.fresher@email.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{}', '{}', false, false);

-- EMPLOYEES WITH COMPLETE PROFILES (Verified & Unverified)
insert into users (id, email, role, is_active) values
-- Profile Complete, Verified
('550e8400-e29b-41d4-a716-446655440301', 'arjun.verified@email.com', 'employee', true),
('550e8400-e29b-41d4-a716-446655440302', 'priya.verified@email.com', 'employee', true),
-- Profile Complete, Not Verified
('550e8400-e29b-41d4-a716-446655440303', 'rohan.unverified@email.com', 'employee', true),
('550e8400-e29b-41d4-a716-446655440304', 'neha.unverified@email.com', 'employee', true),
-- Profile Partial/Active (Fresher)
('550e8400-e29b-41d4-a716-446655440305', 'amit.fresher@email.com', 'employee', true),
('550e8400-e29b-41d4-a716-446655440306', 'divya.fresher@email.com', 'employee', true);

-- Create employee records
insert into employees (id, user_id, is_verified) values
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440301', true),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440302', true),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440303', false),
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440304', false),
('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440305', false),
('550e8400-e29b-41d4-a716-446655440506', '550e8400-e29b-41d4-a716-446655440306', false);

-- Create detailed employee profiles
insert into employee_profiles (employee_id, full_name, phone, location, experience_years, education, skills, resume_url) values
(
  '550e8400-e29b-41d4-a716-446655440501',
  'Arjun Kapoor',
  '+91-9876543210',
  'Bangalore, Karnataka',
  5,
  'B.Tech in Computer Science from IIT Delhi',
  ARRAY['Python', 'Java', 'Spring Boot', 'React', 'PostgreSQL', 'AWS'],
  'https://resume-storage.example.com/arjun-kapoor-resume.pdf'
),
(
  '550e8400-e29b-41d4-a716-446655440502',
  'Priya Sharma',
  '+91-8765432109',
  'Mumbai, Maharashtra',
  3,
  'B.Sc in Information Technology from Delhi University',
  ARRAY['UI/UX Design', 'Figma', 'Adobe XD', 'User Research', 'Prototyping', 'CSS'],
  'https://resume-storage.example.com/priya-sharma-resume.pdf'
),
(
  '550e8400-e29b-41d4-a716-446655440503',
  'Rohan Singh',
  '+91-7654321098',
  'Hyderabad, Telangana',
  7,
  'MBA from XLRI Jamshedpur',
  ARRAY['Business Analysis', 'Project Management', 'SQL', 'Tableau', 'Strategic Planning'],
  'https://resume-storage.example.com/rohan-singh-resume.pdf'
),
(
  '550e8400-e29b-41d4-a716-446655440504',
  'Neha Verma',
  '+91-6543210987',
  'Delhi, NCR',
  4,
  'B.Tech in Information Technology from BITS Pilani',
  ARRAY['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Git'],
  'https://resume-storage.example.com/neha-verma-resume.pdf'
),
(
  '550e8400-e29b-41d4-a716-446655440505',
  'Amit Patel',
  '+91-5432109876',
  'Ahmedabad, Gujarat',
  0,
  'B.Tech in Computer Science from NIT Surat',
  ARRAY['Java', 'Basic Web Development', 'HTML', 'CSS', 'Git'],
  null
),
(
  '550e8400-e29b-41d4-a716-446655440506',
  'Divya Srivastava',
  '+91-4321098765',
  'Pune, Maharashtra',
  1,
  'B.Sc in Computer Science, Diploma in Full Stack Development',
  ARRAY['React', 'Express', 'MongoDB', 'HTML', 'CSS', 'JavaScript'],
  'https://resume-storage.example.com/divya-srivastava-resume.pdf'
);

-- =========================
-- 4. JOBS (Posted by Approved Businesses)
-- =========================

-- Jobs by Microsoft India
insert into jobs (id, business_id, title, location, employment_type, work_type, min_experience, required_skills, is_active, expires_at) values
-- Active Jobs
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440304', 'Senior Software Engineer - Cloud', 'Bangalore, Karnataka', 'full-time', 'hybrid', 5, ARRAY['Azure', 'C#', '.NET', 'Cloud Architecture'], true, now() + interval '60 days'),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440304', 'Cloud Architect', 'Bangalore, Karnataka', 'full-time', 'hybrid', 8, ARRAY['Azure', 'AWS', 'Kubernetes', 'DevOps'], true, now() + interval '45 days'),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440304', 'Data Scientist - ML', 'Remote', 'full-time', 'remote', 3, ARRAY['Python', 'Machine Learning', 'TensorFlow', 'Statistics'], true, now() + interval '50 days'),
-- Expired Job
('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440304', 'Frontend Developer', 'Bangalore, Karnataka', 'full-time', 'hybrid', 2, ARRAY['React', 'TypeScript', 'CSS'], false, now() - interval '10 days');

-- Jobs by Google India
insert into jobs (id, business_id, title, location, employment_type, work_type, min_experience, required_skills, is_active, expires_at) values
('550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440305', 'Software Engineer - Backend', 'Bangalore, Karnataka', 'full-time', 'remote', 4, ARRAY['Go', 'Distributed Systems', 'PostgreSQL', 'Linux'], true, now() + '70 days'::interval),
('550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440305', 'UX Designer', 'Remote', 'full-time', 'remote', 3, ARRAY['Figma', 'User Research', 'Prototyping', 'JavaScript'], true, now() + interval '55 days'),
('550e8400-e29b-41d4-a716-446655440607', '550e8400-e29b-41d4-a716-446655440305', 'Product Manager', 'Bangalore, Karnataka', 'full-time', 'onsite', 6, ARRAY['Product Strategy', 'Analytics', 'Communication'], true, now() + interval '65 days');

-- =========================
-- 5. JOB APPLICATIONS (Various Statuses)
-- =========================

-- Arjun (Verified, 5 yrs experience) - Multiple Applications
insert into job_applications (id, job_id, employee_id, match_score, status, applied_at) values
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440501', 85, 'shortlisted', now() - interval '10 days'),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440501', 72, 'applied', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440501', 65, 'rejected', now() - interval '8 days');

-- Priya (Verified, 3 yrs experience, Designer) - Application for UX role
insert into job_applications (id, job_id, employee_id, match_score, status, applied_at) values
('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440502', 90, 'shortlisted', now() - interval '7 days');

-- Rohan (Unverified, 7 yrs experience, Manager) - Product Manager role
insert into job_applications (id, job_id, employee_id, match_score, status, applied_at) values
('550e8400-e29b-41d4-a716-446655440705', '550e8400-e29b-41d4-a716-446655440607', '550e8400-e29b-41d4-a716-446655440503', 88, 'applied', now() - interval '3 days');

-- Neha (Unverified, 4 yrs experience) - Multiple applications
insert into job_applications (id, job_id, employee_id, match_score, status, applied_at) values
('550e8400-e29b-41d4-a716-446655440706', '550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440504', 78, 'applied', now() - interval '12 days'),
('550e8400-e29b-41d4-a716-446655440707', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440504', 55, 'rejected', now() - interval '6 days');

-- Amit (Fresher, 0 yrs experience) - Internship/Entry role
insert into job_applications (id, job_id, employee_id, match_score, status, applied_at) values
('550e8400-e29b-41d4-a716-446655440708', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440505', 35, 'applied', now() - interval '2 days');

-- Divya (1 yr experience, Fresher-like) - Frontend/Backend role
insert into job_applications (id, job_id, employee_id, match_score, status, applied_at) values
('550e8400-e29b-41d4-a716-446655440709', '550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440506', 68, 'applied', now() - interval '4 days');

-- =========================
-- 6. APPLICATION ELIGIBILITY CHECKS
-- =========================
insert into job_application_checks (id, application_id, meets_experience, meets_skills, meets_education, overall_eligible) values
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440701', true, true, true, true),
('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440702', true, false, true, true),
('550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440703', true, true, true, true),
('550e8400-e29b-41d4-a716-446655440804', '550e8400-e29b-41d4-a716-446655440704', true, true, true, true),
('550e8400-e29b-41d4-a716-446655440805', '550e8400-e29b-41d4-a716-446655440705', true, true, true, true),
('550e8400-e29b-41d4-a716-446655440806', '550e8400-e29b-41d4-a716-446655440706', true, true, true, true),
('550e8400-e29b-41d4-a716-446655440807', '550e8400-e29b-41d4-a716-446655440707', true, false, true, false),
('550e8400-e29b-41d4-a716-446655440808', '550e8400-e29b-41d4-a716-446655440708', false, false, true, false),
('550e8400-e29b-41d4-a716-446655440809', '550e8400-e29b-41d4-a716-446655440709', true, true, true, true);

-- =========================
-- 7. SAVED JOBS (Employees bookmarking jobs)
-- =========================
insert into saved_jobs (id, job_id, employee_id, saved_at) values
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440501', now() - interval '15 days'),
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440502', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440503', now() - interval '20 days'),
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440504', now() - interval '1 day');

-- =========================
-- 8. JOB REQUIREMENTS (Skills, Experience, Education)
-- =========================
insert into job_requirements (id, job_id, requirement_type, requirement_value) values
-- Microsoft Cloud Engineer requirements
('550e8400-e29b-41d4-a716-446655440a01', '550e8400-e29b-41d4-a716-446655440601', 'skill', 'Azure'),
('550e8400-e29b-41d4-a716-446655440a02', '550e8400-e29b-41d4-a716-446655440601', 'skill', 'C#'),
('550e8400-e29b-41d4-a716-446655440a03', '550e8400-e29b-41d4-a716-446655440601', 'experience', '5+ years'),
('550e8400-e29b-41d4-a716-446655440a04', '550e8400-e29b-41d4-a716-446655440601', 'education', 'B.Tech/BE in Computer Science'),
-- Cloud Architect requirements
('550e8400-e29b-41d4-a716-446655440a05', '550e8400-e29b-41d4-a716-446655440602', 'skill', 'AWS'),
('550e8400-e29b-41d4-a716-446655440a06', '550e8400-e29b-41d4-a716-446655440602', 'skill', 'Kubernetes'),
('550e8400-e29b-41d4-a716-446655440a07', '550e8400-e29b-41d4-a716-446655440602', 'experience', '8+ years'),
('550e8400-e29b-41d4-a716-446655440a08', '550e8400-e29b-41d4-a716-446655440602', 'education', 'B.Tech/BE in Computer Science'),
-- Google Backend Engineer requirements
('550e8400-e29b-41d4-a716-446655440a09', '550e8400-e29b-41d4-a716-446655440605', 'skill', 'Go'),
('550e8400-e29b-41d4-a716-446655440a0a', '550e8400-e29b-41d4-a716-446655440605', 'skill', 'PostgreSQL'),
('550e8400-e29b-41d4-a716-446655440a0b', '550e8400-e29b-41d4-a716-446655440605', 'experience', '4+ years'),
('550e8400-e29b-41d4-a716-446655440a0c', '550e8400-e29b-41d4-a716-446655440605', 'education', 'B.Tech/BE in Computer Science'),
-- Google UX Designer requirements
('550e8400-e29b-41d4-a716-446655440a0d', '550e8400-e29b-41d4-a716-446655440606', 'skill', 'Figma'),
('550e8400-e29b-41d4-a716-446655440a0e', '550e8400-e29b-41d4-a716-446655440606', 'skill', 'User Research'),
('550e8400-e29b-41d4-a716-446655440a0f', '550e8400-e29b-41d4-a716-446655440606', 'experience', '3+ years'),
('550e8400-e29b-41d4-a716-446655440a10', '550e8400-e29b-41d4-a716-446655440606', 'education', 'Design certification or equivalent');

-- =========================
-- 9. NOTIFICATIONS
-- =========================
insert into notifications (id, user_id, message, is_read) values
-- Arjun - Shortlisted notification
('550e8400-e29b-41d4-a716-446655440b01', '550e8400-e29b-41d4-a716-446655440301', 'Congratulations! You have been shortlisted for Senior Software Engineer - Cloud at Microsoft', false),
-- Priya - Shortlisted notification
('550e8400-e29b-41d4-a716-446655440b02', '550e8400-e29b-41d4-a716-446655440302', 'Great news! Your application for UX Designer at Google has been shortlisted', true),
-- Neha - Rejection notification
('550e8400-e29b-41d4-a716-446655440b03', '550e8400-e29b-41d4-a716-446655440304', 'We appreciate your interest in Senior Software Engineer - Cloud at Microsoft. Your profile did not match the requirements at this time', true),
-- Rohan - New job notification
('550e8400-e29b-41d4-a716-446655440b04', '550e8400-e29b-41d4-a716-446655440303', 'A new job matching your profile: Product Manager at Google', false);

-- =========================
-- 10. AUDIT LOGS
-- =========================
insert into audit_logs (id, actor_id, action, entity_type, entity_id) values
('550e8400-e29b-41d4-a716-446655440c01', '5a2778ab-4d1b-46a9-af47-2b2875e4d0d0', 'APPROVED', 'business_application', '550e8400-e29b-41d4-a716-446655440404'),
('550e8400-e29b-41d4-a716-446655440c02', '5a2778ab-4d1b-46a9-af47-2b2875e4d0d0', 'APPROVED', 'business_application', '550e8400-e29b-41d4-a716-446655440405'),
('550e8400-e29b-41d4-a716-446655440c03', '5a2778ab-4d1b-46a9-af47-2b2875e4d0d0', 'REJECTED', 'business_application', '550e8400-e29b-41d4-a716-446655440406'),
('550e8400-e29b-41d4-a716-446655440c04', '550e8400-e29b-41d4-a716-446655440204', 'POSTED', 'job', '550e8400-e29b-41d4-a716-446655440601'),
('550e8400-e29b-41d4-a716-446655440c05', '550e8400-e29b-41d4-a716-446655440205', 'POSTED', 'job', '550e8400-e29b-41d4-a716-446655440605'),
('550e8400-e29b-41d4-a716-446655440c06', '550e8400-e29b-41d4-a716-446655440301', 'APPLIED', 'job_application', '550e8400-e29b-41d4-a716-446655440701'),
('550e8400-e29b-41d4-a716-446655440c07', '550e8400-e29b-41d4-a716-446655440302', 'APPLIED', 'job_application', '550e8400-e29b-41d4-a716-446655440704');

-- =========================
-- SUMMARY OF DUMMY DATA
-- =========================
-- BUSINESSES:
--   - 3 PENDING applications (TechStartup, Innovators Lab, Creative Studios)
--   - 2 APPROVED businesses (Microsoft, Google) - Verified & can post jobs
--   - 1 REJECTED business (Dubious Solutions)
--
-- EMPLOYEES (6 total):
--   - Arjun: Verified, 5 yrs exp, Skills: Python/Java/React/AWS
--   - Priya: Verified, 3 yrs exp, Skills: UI/UX/Figma
--   - Rohan: Unverified, 7 yrs exp, Skills: Business Analysis/PM
--   - Neha: Unverified, 4 yrs exp, Skills: JavaScript/React/Node
--   - Amit: No exp (Fresher), Skills: Basic Java/Web Dev
--   - Divya: 1 yr exp, Skills: React/Express/MongoDB
--
-- JOBS (7 total):
--   - 3 Active Microsoft jobs (Cloud Engineer, Architect, Data Scientist)
--   - 3 Active Google jobs (Backend, UX Designer, Product Manager)
--   - 1 Expired Microsoft job
--
-- APPLICATIONS (9 total):
--   - 2 Shortlisted (Arjun for Microsoft, Priya for Google)
--   - 4 Applied (Rohan, Neha, Amit, Divya)
--   - 2 Rejected (Arjun for Cloud Architect, Neha for Senior Engineer)
--
-- This data allows testing:
-- ✓ Admin dashboard with pending approvals
-- ✓ Business dashboards with job postings and applications
-- ✓ Employee dashboards with job matches and applications
-- ✓ Job browsing with various employment types
-- ✓ Application tracking with different statuses
-- ✓ Profile completion workflows
-- ✓ Notifications for various events
