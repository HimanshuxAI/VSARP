-- Supabase Migration: Initial Schema
-- This migration sets up the database schema for VSARP

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'hod', 'placement_cell', 'admin')),
    student_id TEXT,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    skills TEXT[] DEFAULT '{}',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Careers table
CREATE TABLE IF NOT EXISTS public.careers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    average_salary INTEGER,
    growth_outlook TEXT CHECK (growth_outlook IN ('High', 'Very High', 'Moderate', 'Low')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning resources table
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT,
    provider TEXT,
    cost_type TEXT,
    difficulty TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Placement drives table
CREATE TABLE IF NOT EXISTS public.placement_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    role_offered TEXT NOT NULL,
    package_lpa DECIMAL(4,1),
    drive_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    eligibility_cgpa DECIMAL(2,1) NOT NULL,
    eligible_departments TEXT[] NOT NULL DEFAULT '{}',
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    openings INTEGER NOT NULL CHECK (openings >= 0),
    status TEXT NOT NULL CHECK (status IN ('open', 'upcoming', 'closed')) DEFAULT 'open',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Placement applications table
CREATE TABLE IF NOT EXISTS public.placement_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drive_id UUID REFERENCES public.placement_drives(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('applied', 'shortlisted', 'selected', 'rejected', 'offer')) DEFAULT 'applied',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(drive_id, student_id)
);

-- Placement notifications table
CREATE TABLE IF NOT EXISTS public.placement_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    drive_id UUID REFERENCES public.placement_drives(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('application_status', 'drive_reminder', 'general')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aptitude tests table
CREATE TABLE IF NOT EXISTS public.aptitude_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aptitude attempts table
CREATE TABLE IF NOT EXISTS public.aptitude_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES public.aptitude_tests(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_reg_no TEXT NOT NULL,
    department TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    outcome_type TEXT NOT NULL,
    skill_tag TEXT,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    description TEXT,
    proof_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'rejected')) DEFAULT 'pending',
    submitted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research papers table
CREATE TABLE IF NOT EXISTS public.research_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    faculty_name TEXT NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT,
    publication_date DATE,
    journal_conference TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Semester results table
CREATE TABLE IF NOT EXISTS public.semester_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    semester TEXT NOT NULL,
    subject TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    marks INTEGER NOT NULL CHECK (marks >= 0 AND marks <= 100),
    max_marks INTEGER NOT NULL DEFAULT 100,
    grade TEXT NOT NULL,
    grade_points INTEGER NOT NULL CHECK (grade_points >= 0 AND grade_points <= 10),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'pending')) DEFAULT 'pending',
    verification_hash TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    semester TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'enrolled', 'dropped')) DEFAULT 'enrolled',
    grade TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data for categories
INSERT INTO public.categories (id, name) VALUES
('00000000-0000-4000-b000-000000000001', 'Academic'),
('00000000-0000-4000-b000-000000000002', 'Sports'),
('00000000-0000-4000-b000-000000000003', 'Cultural'),
('00000000-0000-4000-b000-000000000004', 'Social Service'),
('00000000-0000-4000-b000-000000000005', 'Leadership'),
('00000000-0000-4000-b000-000000000006', 'Internship'),
('00000000-0000-4000-b000-000000000007', 'Certification'),
('00000000-0000-4000-b000-000000000008', 'Hackathon'),
('00000000-0000-4000-b000-000000000009', 'Research Paper'),
('00000000-0000-4000-b000-000000000010', 'Soft Skills Test')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for skills
INSERT INTO public.skills (id, name, category_id, description) VALUES
('00000000-0000-4000-c000-000000000001', 'Python', (SELECT id FROM public.categories WHERE name = 'Technical'), 'Programming for automation, analytics, and backend work'),
('00000000-0000-4000-c000-000000000002', 'JavaScript', (SELECT id FROM public.categories WHERE name = 'Technical'), 'Web application development and frontend logic'),
('00000000-0000-4000-c000-000000000003', 'SQL', (SELECT id FROM public.categories WHERE name = 'Technical'), 'Database querying and data modeling'),
('00000000-0000-4000-c000-000000000004', 'Communication', (SELECT id FROM public.categories WHERE name = 'Soft'), 'Clear written and verbal communication'),
('00000000-0000-4000-c000-000000000005', 'Problem Solving', (SELECT id FROM public.categories WHERE name = 'Soft'), 'Structured reasoning and analytical thinking'),
('00000000-0000-4000-c000-000000000006', 'Cloud', (SELECT id FROM public.categories WHERE name = 'Tool'), 'Cloud deployment and infrastructure basics'),
('00000000-0000-4000-c000-000000000007', 'Data Visualization', (SELECT id FROM public.categories WHERE name = 'Technical'), 'Presenting insights through charts and dashboards'),
('00000000-0000-4000-c000-000000000008', 'Leadership', (SELECT id FROM public.categories WHERE name = 'Soft'), 'Initiative, planning, and team coordination')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for careers
INSERT INTO public.careers (id, title, description, industry, average_salary, growth_outlook) VALUES
('00000000-0000-4000-d000-000000000001', 'Software Developer', 'Build and maintain modern software systems.', 'Technology', 800000, 'High'),
('00000000-0000-4000-d000-000000000002', 'Data Analyst', 'Interpret operational data and produce business insights.', 'Data Science', 700000, 'Very High'),
('00000000-0000-4000-d000-000000000003', 'Product Manager', 'Drive product direction and cross-functional delivery.', 'Technology', 1200000, 'High'),
('00000000-0000-4000-d000-000000000004', 'Digital Marketing Specialist', 'Run multi-channel campaigns and optimize digital growth.', 'Marketing', 500000, 'Moderate')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for learning resources
INSERT INTO public.learning_resources (id, title, url, type, provider, cost_type, difficulty) VALUES
('00000000-0000-4000-e000-000000000001', 'Python for Everybody', 'https://www.coursera.org/specializations/python', 'Course', 'Coursera', 'Paid', 'Beginner'),
('00000000-0000-4000-e000-000000000002', 'SQLBolt', 'https://sqlbolt.com', 'Course', 'SQLBolt', 'Free', 'Beginner'),
('00000000-0000-4000-e000-000000000003', 'Communication Foundations', 'https://www.linkedin.com/learning/', 'Course', 'LinkedIn Learning', 'Paid', 'Intermediate')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for placement drives
INSERT INTO public.placement_drives (id, company_name, role_offered, package_lpa, drive_date, application_deadline, eligibility_cgpa, eligible_departments, required_skills, openings, status, description) VALUES
('00000000-0000-4000-f000-000000000001', 'TCS Digital', 'Software Engineer', 7.5, '2026-05-15', '2026-05-10', 7.0, ARRAY['Computer Science'], ARRAY['Java', 'SQL', 'Spring Boot'], 25, 'open', 'TCS Digital hiring for their innovation labs across India.'),
('00000000-0000-4000-f000-000000000002', 'Infosys', 'Systems Engineer', 4.5, '2026-05-20', '2026-05-15', 6.0, ARRAY['Computer Science'], ARRAY['Python', 'Cloud', 'SQL'], 50, 'open', 'Mass hiring drive for Computer Science students.'),
('00000000-0000-4000-f000-000000000003', 'Wipro', 'Project Engineer', 3.8, '2026-06-01', '2026-05-25', 6.0, ARRAY['Computer Science'], ARRAY['Communication', 'Problem Solving'], 40, 'upcoming', 'Wipro campus recruitment for Computer Science students.'),
('00000000-0000-4000-f000-000000000004', 'Microsoft', 'SDE Intern', 15.0, '2026-04-10', '2026-04-05', 8.0, ARRAY['Computer Science'], ARRAY['Data Structures', 'Algorithms', 'System Design'], 5, 'closed', 'Premium internship opportunity at Microsoft IDC Hyderabad.'),
('00000000-0000-4000-f000-000000000005', 'LTIMindtree', 'Graduate Software Engineer', 5.0, '2026-06-10', '2026-06-01', 6.5, ARRAY['Computer Science'], ARRAY['Python', 'SQL'], 15, 'open', 'Software engineering role for application development and analytics teams.')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for users (using deterministic UUIDs from seedData.js)
INSERT INTO public.users (id, email, full_name, role, student_id, department, status, skills, phone) VALUES
-- 10 Computer Science Students
('00000000-0000-4000-a000-000000000001', 'aarav.sharma@vsarp.edu', 'Aarav Sharma', 'student', 'CS-2023-001', 'Computer Science', 'active', ARRAY['Python', 'Machine Learning', 'SQL'], '9876543210'),
('00000000-0000-4000-a000-000000000002', 'priya.patel@vsarp.edu', 'Priya Patel', 'student', 'CS-2023-002', 'Computer Science', 'active', ARRAY['Java', 'Spring Boot', 'AWS'], '9876543211'),
('00000000-0000-4000-a000-000000000003', 'rohan.deshmukh@vsarp.edu', 'Rohan Deshmukh', 'student', 'CS-2023-003', 'Computer Science', 'active', ARRAY['Python', 'IoT', 'Data Structures'], '9876543212'),
('00000000-0000-4000-a000-000000000004', 'sneha.kulkarni@vsarp.edu', 'Sneha Kulkarni', 'student', 'CS-2023-004', 'Computer Science', 'active', ARRAY['React', 'Node.js', 'MongoDB'], '9876543213'),
('00000000-0000-4000-a000-000000000005', 'arjun.mehta@vsarp.edu', 'Arjun Mehta', 'student', 'CS-2023-005', 'Computer Science', 'active', ARRAY['Java', 'Data Structures', 'System Design'], '9876543214'),
('00000000-0000-4000-a000-000000000006', 'neha.reddy@vsarp.edu', 'Neha Reddy', 'student', 'CS-2023-006', 'Computer Science', 'active', ARRAY['Python', 'Data Visualization', 'SQL'], '9876543215'),
('00000000-0000-4000-a000-000000000007', 'vikram.singh@vsarp.edu', 'Vikram Singh', 'student', 'CS-2023-007', 'Computer Science', 'active', ARRAY['Cloud', 'DevOps', 'Linux'], '9876543216'),
('00000000-0000-4000-a000-000000000008', 'kavya.menon@vsarp.edu', 'Kavya Menon', 'student', 'CS-2023-008', 'Computer Science', 'active', ARRAY['Cybersecurity', 'Networking', 'Python'], '9876543217'),
('00000000-0000-4000-a000-000000000009', 'ishaan.kapoor@vsarp.edu', 'Ishaan Kapoor', 'student', 'CS-2023-009', 'Computer Science', 'active', ARRAY['JavaScript', 'React', 'UI Engineering'], '9876543218'),
('00000000-0000-4000-a000-000000000015', 'tanvi.rao@vsarp.edu', 'Tanvi Rao', 'student', 'CS-2023-010', 'Computer Science', 'active', ARRAY['AI', 'NLP', 'Python'], '9876543219'),

-- 5 Faculty
('00000000-0000-4000-a000-000000000010', 'dr.joshi@vsarp.edu', 'Dr. Rajesh Joshi', 'faculty', NULL, 'Computer Science', 'active', ARRAY['AI', 'Deep Learning'], '9876500010'),
('00000000-0000-4000-a000-000000000011', 'dr.iyer@vsarp.edu', 'Dr. Lakshmi Iyer', 'faculty', NULL, 'Computer Science', 'active', ARRAY['Databases', 'Data Mining'], '9876500011'),
('00000000-0000-4000-a000-000000000012', 'dr.patil@vsarp.edu', 'Dr. Suresh Patil', 'faculty', NULL, 'Electronics', 'active', ARRAY['Signal Processing', 'VLSI'], '9876500012'),
('00000000-0000-4000-a000-000000000013', 'dr.gupta@vsarp.edu', 'Dr. Anita Gupta', 'faculty', NULL, 'Information Technology', 'active', ARRAY['Cybersecurity', 'Networks'], '9876500013'),
('00000000-0000-4000-a000-000000000014', 'dr.nair@vsarp.edu', 'Dr. Vikram Nair', 'faculty', NULL, 'Mechanical', 'active', ARRAY['Thermodynamics', 'FEA'], '9876500014'),

-- 2 HODs
('00000000-0000-4000-a000-000000000020', 'hod.cs@vsarp.edu', 'Prof. Manoj Deshpande', 'hod', NULL, 'Computer Science', 'active', ARRAY[]::text[], '9876500020'),
('00000000-0000-4000-a000-000000000021', 'hod.ec@vsarp.edu', 'Prof. Kavita Rao', 'hod', NULL, 'Electronics', 'active', ARRAY[]::text[], '9876500021'),

-- 2 Placement Cell
('00000000-0000-4000-a000-000000000030', 'placement@vsarp.edu', 'Mr. Sanjay Verma', 'placement_cell', NULL, 'Computer Science', 'active', ARRAY[]::text[], '9876500030'),
('00000000-0000-4000-a000-000000000031', 'tpo@vsarp.edu', 'Ms. Deepa Chavan', 'placement_cell', NULL, 'General', 'active', ARRAY[]::text[], '9876500031'),

-- 1 Admin
('00000000-0000-4000-a000-000000000040', 'admin@vsarp.edu', 'System Admin', 'admin', NULL, 'General', 'active', ARRAY[]::text[], '9876500040')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for placement applications
INSERT INTO public.placement_applications (id, drive_id, student_id, status, applied_at) VALUES
('60000000-0000-4000-8000-000000000001', '00000000-0000-4000-f000-000000000001', '00000000-0000-4000-a000-000000000001', 'shortlisted', NOW() - INTERVAL '10 days'),
('60000000-0000-4000-8000-000000000002', '00000000-0000-4000-f000-000000000002', '00000000-0000-4000-a000-000000000002', 'applied', NOW() - INTERVAL '7 days'),
('60000000-0000-4000-8000-000000000003', '00000000-0000-4000-f000-000000000002', '00000000-0000-4000-a000-000000000003', 'selected', NOW() - INTERVAL '5 days'),
('60000000-0000-4000-8000-000000000004', '00000000-0000-4000-f000-000000000003', '00000000-0000-4000-a000-000000000004', 'applied', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for placement notifications
INSERT INTO public.placement_notifications (id, profile_id, drive_id, title, message, notification_type, is_read, created_at) VALUES
('80000000-0000-4000-8000-000000000001', '00000000-0000-4000-a000-000000000001', '00000000-0000-4000-f000-000000000001', 'TCS shortlist published', 'You have been shortlisted for the TCS systems engineer drive. Prepare for the next round.', 'application_status', false, NOW() - INTERVAL '5 days'),
('80000000-0000-4000-8000-000000000002', '00000000-0000-4000-a000-000000000003', '00000000-0000-4000-f000-000000000002', 'Infosys final status', 'Congratulations, you are marked as selected for the Infosys digital specialist role.', 'application_status', false, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for aptitude tests
INSERT INTO public.aptitude_tests (id, title, description, total_questions, created_at) VALUES
('50000000-0000-4000-8000-000000000001', 'TCS NQT', 'TCS National Qualifier Test', 3, NOW() - INTERVAL '10 days'),
('50000000-0000-4000-8000-000000000002', 'Infosys Springboard', 'Infosys Springboard Aptitude Test', 3, NOW() - INTERVAL '8 days'),
('50000000-0000-4000-8000-000000000003', 'Wipro Elite', 'Wipro Elite Aptitude Test', 3, NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for aptitude attempts
INSERT INTO public.aptitude_attempts (id, test_id, student_id, score, total_questions, passed, answers, submitted_at) VALUES
('70000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '00000000-0000-4000-a000-000000000001', 100, 3, true, '{"tcs_q1":0,"tcs_q2":1,"tcs_q3":1}'::jsonb, NOW() - INTERVAL '6 days'),
('70000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002', '00000000-0000-4000-a000-000000000002', 67, 3, true, '{"inf_q1":0,"inf_q2":1,"inf_q3":2}'::jsonb, NOW() - INTERVAL '4 days'),
('70000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003', '00000000-0000-4000-a000-000000000004', 33, 3, false, '{"wip_q1":0,"wip_q2":0,"wip_q3":2}'::jsonb, NOW() - INTERVAL '1 day'),
('70000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000001', '00000000-0000-4000-a000-000000000006', 88, 3, true, '{"tcs_q1":0,"tcs_q2":1,"tcs_q3":1}'::jsonb, NOW() - INTERVAL '3 days'),
('70000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000002', '00000000-0000-4000-a000-000000000007', 74, 3, true, '{"inf_q1":0,"inf_q2":1,"inf_q3":0}'::jsonb, NOW() - INTERVAL '3 days'),
('70000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000003', '00000000-0000-4000-a000-000000000008', 82, 3, true, '{"wip_q1":0,"wip_q2":2,"wip_q3":0}'::jsonb, NOW() - INTERVAL '2 days'),
('70000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000001', '00000000-0000-4000-a000-000000000009', 69, 3, true, '{"tcs_q1":0,"tcs_q2":1,"tcs_q3":2}'::jsonb, NOW() - INTERVAL '2 days'),
('70000000-0000-4000-8000-000000000008', '50000000-0000-4000-8000-000000000002', '00000000-0000-4000-a000-000000000010', 90, 3, true, '{"inf_q1":0,"inf_q2":1,"inf_q3":0}'::jsonb, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for activities
INSERT INTO public.activities (id, student_id, student_name, student_reg_no, department, title, category, outcome_type, skill_tag, academic_year, semester, description, proof_url, status, submitted_at) VALUES
('00000000-0000-4000-a000-000000000100', '00000000-0000-4000-a000-000000000001', 'Aarav Sharma', 'CS-2023-001', 'Computer Science', 'Smart India Hackathon - Winner', 'Hackathon', 'Technical', 'Python', '2025-26', '6', 'Led a 6-member team to build an AI-based crop disease detection system. Won 1st prize at national level.', 'https://example.com/sih_cert.pdf', 'approved', '2025-12-16T10:00:00Z'),
('00000000-0000-4000-a000-000000000101', '00000000-0000-4000-a000-000000000001', 'Aarav Sharma', 'CS-2023-001', 'Computer Science', 'AWS Solutions Architect Certification', 'Certification', 'Technical', 'Cloud', '2025-26', '5', 'Cleared AWS SAA-C03 certification with a score of 890/1000.', 'https://example.com/aws_cert.pdf', 'approved', '2025-09-21T10:00:00Z'),
('00000000-0000-4000-a000-000000000102', '00000000-0000-4000-a000-000000000001', 'Aarav Sharma', 'CS-2023-001', 'Computer Science', 'Machine Learning Internship at TCS', 'Internship', 'Technical', 'ML', '2025-26', '6', '6-month paid internship working on NLP pipelines for customer support automation.', 'https://example.com/tcs_intern.pdf', 'approved', '2026-01-11T10:00:00Z'),
('00000000-0000-4000-a000-000000000103', '00000000-0000-4000-a000-000000000002', 'Priya Patel', 'CS-2023-002', 'Computer Science', 'IEEE Paper - Blockchain in Healthcare', 'Research Paper', 'Research', 'Blockchain', '2025-26', '5', 'Published a paper on applying blockchain for secure medical records at IEEE ICECA 2025.', 'https://example.com/ieee_paper.pdf', 'approved', '2025-10-06T10:00:00Z'),
('00000000-0000-4000-a000-000000000104', '00000000-0000-4000-a000-000000000002', 'Priya Patel', 'CS-2023-002', 'Computer Science', 'Google Cloud Associate Certification', 'Certification', 'Technical', 'Cloud', '2025-26', '6', 'Cleared Google ACE certification.', 'https://example.com/gcp_cert.pdf', 'approved', '2025-11-19T10:00:00Z'),
('00000000-0000-4000-a000-000000000105', '00000000-0000-4000-a000-000000000002', 'Priya Patel', 'CS-2023-002', 'Computer Science', 'Backend Internship at Infosys', 'Internship', 'Technical', 'Java', '2025-26', '5', '3-month remote internship building Spring Boot microservices.', 'https://example.com/infosys.pdf', 'approved', '2025-08-02T10:00:00Z'),
('00000000-0000-4000-a000-000000000106', '00000000-0000-4000-a000-000000000003', 'Rohan Deshmukh', 'CS-2023-003', 'Computer Science', 'AI Robotics Simulation Challenge - 2nd Place', 'Hackathon', 'Technical', 'Python', '2025-26', '6', 'Built a Python-based autonomous navigation simulator for agricultural monitoring robots.', 'https://example.com/robo.pdf', 'approved', '2026-02-11T10:00:00Z'),
('00000000-0000-4000-a000-000000000107', '00000000-0000-4000-a000-000000000003', 'Rohan Deshmukh', 'CS-2023-003', 'Computer Science', 'IoT Data Pipeline Certification', 'Certification', 'Technical', 'IoT', '2025-26', '5', 'Completed a 40-hour IoT data ingestion and analytics workshop conducted by CDAC Pune.', 'https://example.com/iot.pdf', 'approved', '2025-07-16T10:00:00Z'),
('00000000-0000-4000-a000-000000000108', '00000000-0000-4000-a000-000000000004', 'Sneha Kulkarni', 'CS-2023-004', 'Computer Science', 'Full-Stack Development Internship', 'Internship', 'Technical', 'React', '2025-26', '6', 'Built a customer dashboard using React + Node.js for a Bangalore startup.', 'https://example.com/fs_intern.pdf', 'approved', '2026-01-21T10:00:00Z'),
('00000000-0000-4000-a000-000000000109', '00000000-0000-4000-a000-000000000004', 'Sneha Kulkarni', 'CS-2023-004', 'Computer Science', 'Soft Skills Leadership Workshop', 'Soft Skills Test', 'Leadership', 'Communication', '2025-26', '5', 'Completed TCS iON leadership and communication workshop.', 'https://example.com/soft.pdf', 'approved', '2025-09-11T10:00:00Z'),
('00000000-0000-4000-a000-000000000110', '00000000-0000-4000-a000-000000000005', 'Arjun Mehta', 'CS-2023-005', 'Computer Science', 'Algorithms Club Mentor', 'Leadership', 'Leadership', 'Data Structures', '2025-26', '6', 'Mentored juniors through weekly DSA practice labs and mock coding interviews.', 'https://example.com/dsa_mentor.pdf', 'approved', '2026-03-06T10:00:00Z'),
('00000000-0000-4000-a000-000000000111', '00000000-0000-4000-a000-000000000005', 'Arjun Mehta', 'CS-2023-005', 'Computer Science', 'Microsoft Azure Fundamentals Certification', 'Certification', 'Technical', 'Cloud', '2025-26', '5', 'Achieved Microsoft Azure Fundamentals credential for cloud services and deployment basics.', 'https://example.com/azure.pdf', 'approved', '2025-08-23T10:00:00Z'),
('00000000-0000-4000-a000-000000000112', '00000000-0000-4000-a000-000000000006', 'Neha Reddy', 'CS-2023-006', 'Computer Science', 'Data Analytics Internship at Zoho', 'Internship', 'Technical', 'SQL', '2025-26', '6', 'Analyzed support ticket trends and built SQL dashboards for product operations.', 'https://example.com/zoho_analytics.pdf', 'approved', '2026-02-02T10:00:00Z'),
('00000000-0000-4000-a000-000000000113', '00000000-0000-4000-a000-000000000007', 'Vikram Singh', 'CS-2023-007', 'Computer Science', 'DevOps Deployment Sprint', 'Hackathon', 'Technical', 'DevOps', '2025-26', '6', 'Built a CI/CD workflow with containerized deployment and monitoring during a campus sprint.', 'https://example.com/devops_sprint.pdf', 'approved', '2026-02-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000114', '00000000-0000-4000-a000-000000000008', 'Kavya Menon', 'CS-2023-008', 'Computer Science', 'Cybersecurity Capture The Flag Finalist', 'Hackathon', 'Technical', 'Cybersecurity', '2025-26', '6', 'Reached the final round of a national CTF by solving web security and network forensics challenges.', 'https://example.com/ctf.pdf', 'approved', '2026-03-13T10:00:00Z'),
('00000000-0000-4000-a000-000000000115', '00000000-0000-4000-a000-000000000009', 'Ishaan Kapoor', 'CS-2023-009', 'Computer Science', 'React UI Engineering Internship', 'Internship', 'Technical', 'React', '2025-26', '6', 'Implemented reusable React components and accessibility fixes for a SaaS dashboard.', 'https://example.com/react_intern.pdf', 'approved', '2026-01-29T10:00:00Z'),
('00000000-0000-4000-a000-000000000116', '00000000-0000-4000-a000-000000000015', 'Tanvi Rao', 'CS-2023-010', 'Computer Science', 'NLP Research Poster', 'Research Paper', 'Research', 'NLP', '2025-26', '6', 'Presented an NLP research poster on multilingual text classification for academic support chatbots.', 'https://example.com/nlp_poster.pdf', 'approved', '2026-02-25T10:00:00Z'),
('00000000-0000-4000-a000-000000000120', '00000000-0000-4000-a000-000000000001', 'Aarav Sharma', 'CS-2023-001', 'Computer Science', 'Google Summer of Code 2026', 'Internship', 'Technical', 'Python', '2025-26', '6', 'Selected for GSoC 2026 under TensorFlow organization.', 'https://example.com/gsoc.pdf', 'pending', '2026-04-16T10:00:00Z'),
('00000000-0000-4000-a000-000000000121', '00000000-0000-4000-a000-000000000004', 'Sneha Kulkarni', 'CS-2023-004', 'Computer Science', 'College Coding Contest Winner', 'Hackathon', 'Technical', 'DSA', '2025-26', '6', 'Won 1st place in intra-college competitive programming contest.', 'https://example.com/cc.pdf', 'pending', '2026-04-02T10:00:00Z'),
('00000000-0000-4000-a000-000000000122', '00000000-0000-4000-a000-000000000003', 'Rohan Deshmukh', 'CS-2023-003', 'Computer Science', 'Peer Coding Bootcamp Organizer', 'Leadership', 'Leadership', 'Leadership', '2025-26', '6', 'Organized a peer coding bootcamp for first-year Computer Science students.', 'https://example.com/bootcamp.pdf', 'pending', '2026-03-21T10:00:00Z')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for research papers
INSERT INTO public.research_papers (id, faculty_id, faculty_name, title, abstract, publication_date, journal_conference, url, created_at) VALUES
('00000000-0000-4000-a000-000000000200', '00000000-0000-4000-a000-000000000010', 'Dr. Rajesh Joshi', 'Deep Reinforcement Learning for Smart Traffic Control', 'A novel DRL framework for optimizing urban traffic signals using real-time sensor data.', '2025-11-15', 'IEEE Transactions on ITS', 'https://doi.org/10.1109/TITS.2025.001', '2025-11-16T10:00:00Z'),
('00000000-0000-4000-a000-000000000201', '00000000-0000-4000-a000-000000000010', 'Dr. Rajesh Joshi', 'Federated Learning in Healthcare: Privacy-Preserving Diagnostics', 'Explores FL techniques for collaborative medical imaging without sharing patient data.', '2026-01-20', 'Nature Machine Intelligence', 'https://doi.org/10.1038/s42256.2026.001', '2026-01-21T10:00:00Z'),
('00000000-0000-4000-a000-000000000202', '00000000-0000-4000-a000-000000000011', 'Dr. Lakshmi Iyer', 'Graph Neural Networks for Anomaly Detection in Financial Systems', 'Proposes a GNN-based approach for detecting fraudulent transactions in real-time.', '2025-09-10', 'ACM Computing Surveys', 'https://doi.org/10.1145/ACM.2025.001', '2025-09-11T10:00:00Z'),
('00000000-0000-4000-a000-000000000203', '00000000-0000-4000-a000-000000000012', 'Dr. Suresh Patil', 'Low-Power VLSI Design for Edge AI Applications', 'Presents a 7nm accelerator architecture optimized for on-device ML inference.', '2025-12-05', 'IEEE JSSC', 'https://doi.org/10.1109/JSSC.2025.001', '2025-12-06T10:00:00Z'),
('00000000-0000-4000-a000-000000000204', '00000000-0000-4000-a000-000000000013', 'Dr. Anita Gupta', 'Zero-Trust Architecture for Campus Networks', 'Implementing ZTA principles in educational institution network infrastructure.', '2026-02-18', 'Elsevier Computer Networks', 'https://doi.org/10.1016/j.comnet.2026.001', '2026-02-19T10:00:00Z')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for semester results
INSERT INTO public.semester_results (id, student_id, semester, subject, subject_code, credits, marks, max_marks, grade, grade_points, verification_status, verification_hash, verified_by, verified_at, created_at) VALUES
('00000000-0000-4000-a000-000000000400', '00000000-0000-4000-a000-000000000001', '5', 'Machine Learning', 'CS501', 4, 92, 100, 'A+', 10, 'verified', 'result_demo_001', 'Controller of Examinations', '2025-12-20T10:00:00Z', '2025-12-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000401', '00000000-0000-4000-a000-000000000001', '5', 'Database Systems', 'CS502', 4, 85, 100, 'A', 9, 'verified', 'result_demo_002', 'Controller of Examinations', '2025-12-20T10:00:00Z', '2025-12-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000402', '00000000-0000-4000-a000-000000000001', '5', 'Computer Networks', 'CS503', 3, 78, 100, 'B+', 8, 'verified', 'result_demo_003', 'Controller of Examinations', '2025-12-20T10:00:00Z', '2025-12-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000403', '00000000-0000-4000-a000-000000000002', '5', 'Machine Learning', 'CS501', 4, 88, 100, 'A', 9, 'verified', 'result_demo_004', 'Controller of Examinations', '2025-12-20T10:00:00Z', '2025-12-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000404', '00000000-0000-4000-a000-000000000006', '5', 'Data Mining', 'CS505', 4, 86, 100, 'A', 9, 'verified', 'result_demo_005', 'Controller of Examinations', '2025-12-20T10:00:00Z', '2025-12-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000405', '00000000-0000-4000-a000-000000000007', '5', 'Cloud Computing', 'CS506', 4, 84, 100, 'A', 9, 'verified', 'result_demo_006', 'Controller of Examinations', '2025-12-20T10:00:00Z', '2025-12-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000406', '00000000-0000-4000-a000-000000000008', '5', 'Network Security', 'CS507', 4, 89, 100, 'A', 9, 'verified', 'result_demo_007', 'Controller of Examinations', '2025-12-20T10:00:00Z', '2025-12-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000407', '00000000-0000-4000-a000-000000000009', '5', 'Human Computer Interaction', 'CS508', 3, 91, 100, 'A+', 10, 'verified', 'result_demo_008', 'Controller of Examinations', '2025-12-20T10:00:00Z', '2025-12-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000408', '00000000-0000-4000-a000-000000000015', '5', 'Natural Language Processing', 'CS509', 4, 93, 100, 'A+', 10, 'verified', 'result_demo_009', 'Controller of Examinations', '2025-12-20T10:00:00Z', '2025-12-15T10:00:00Z'),
('00000000-0000-4000-a000-000000000410', '00000000-0000-4000-a000-000000000004', '6', 'Cloud Computing', 'CS601', 4, 82, 100, 'A', 9, 'pending', NULL, NULL, NULL, '2026-04-20T10:00:00Z'),
('00000000-0000-4000-a000-000000000411', '00000000-0000-4000-a000-000000000004', '6', 'DevOps Engineering', 'CS602', 3, 75, 100, 'B+', 8, 'pending', NULL, NULL, NULL, '2026-04-20T10:00:00Z')
ON CONFLICT (id) DO NOT INSERT;

-- Insert initial data for courses
INSERT INTO public.courses (id, student_id, course_name, course_code, credits, semester, status, grade) VALUES
('00000000-0000-4000-a000-000000000500', '00000000-0000-4000-a000-000000000001', 'Machine Learning', 'CS501', 4, '5', 'completed', 'A+'),
('00000000-0000-4000-a000-000000000501', '00000000-0000-4000-a000-000000000001', 'Database Systems', 'CS502', 4, '5', 'completed', 'A'),
('00000000-0000-4000-a000-000000000502', '00000000-0000-4000-a000-000000000001', 'Computer Networks', 'CS503', 3, '5', 'completed', 'B+'),
('00000000-0000-4000-a000-000000000503', '00000000-0000-4000-a000-000000000001', 'Deep Learning', 'CS601', 4, '6', 'enrolled', NULL),
('00000000-0000-4000-a000-000000000504', '00000000-0000-4000-a000-000000000002', 'Machine Learning', 'CS501', 4, '5', 'completed', 'A'),
('00000000-0000-4000-a000-000000000505', '00000000-0000-4000-a000-000000000002', 'Software Engineering', 'CS504', 3, '5', 'completed', 'A'),
('00000000-0000-4000-a000-000000000506', '00000000-0000-4000-a000-000000000004', 'Cloud Computing', 'CS601', 4, '6', 'enrolled', NULL),
('00000000-0000-4000-a000-000000000507', '00000000-0000-4000-a000-000000000004', 'Full Stack Development', 'CS501', 4, '5', 'completed', 'A+'),
('00000000-0000-4000-a000-000000000508', '00000000-0000-4000-a000-000000000006', 'Data Mining', 'CS505', 4, '5', 'completed', 'A'),
('00000000-0000-4000-a000-000000000509', '00000000-0000-4000-a000-000000000007', 'Cloud Computing', 'CS506', 4, '5', 'completed', 'A'),
('00000000-0000-4000-a000-000000000510', '00000000-0000-4000-a000-000000000008', 'Network Security', 'CS507', 4, '5', 'completed', 'A'),
('00000000-0000-4000-a000-000000000511', '00000000-0000-4000-a000-000000000009', 'Human Computer Interaction', 'CS508', 3, '5', 'completed', 'A+'),
('00000000-0000-4000-a000-000000000512', '00000000-0000-4000-a000-000000000015', 'Natural Language Processing', 'CS509', 4, '5', 'completed', 'A+')
ON CONFLICT (id) DO NOT INSERT;

-- Updated at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_placement_drives_updated_at BEFORE UPDATE ON public.placement_drives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';