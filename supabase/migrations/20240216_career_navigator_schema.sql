-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Careers Table
CREATE TABLE IF NOT EXISTS careers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    average_salary NUMERIC,
    growth_outlook TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT, -- Technical, Soft, Tool, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career Required Skills (Many-to-Many)
CREATE TABLE IF NOT EXISTS career_skills (
    career_id UUID REFERENCES careers(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    required_level TEXT CHECK (required_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    PRIMARY KEY (career_id, skill_id)
);

-- Student Profiles (Extends existing auth.users or public.users if applicable)
-- Assuming a 'users' table exists or we stick to auth.users. 
-- For this app, let's create a specific profile table linked to auth.users
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    university TEXT,
    degree TEXT,
    graduation_year INTEGER,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Career Goals
CREATE TABLE IF NOT EXISTS student_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    career_id UUID REFERENCES careers(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Skills (Current Skills)
CREATE TABLE IF NOT EXISTS student_skills (
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    current_level TEXT CHECK (current_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    verified BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_id, skill_id)
);

-- Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT CHECK (type IN ('Course', 'Book', 'Video', 'Article', 'Project')),
    provider TEXT, -- Coursera, Udemy, YouTube, etc.
    cost_type TEXT CHECK (cost_type IN ('Free', 'Paid')),
    difficulty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Resources (Many-to-Many)
CREATE TABLE IF NOT EXISTS skill_resources (
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES learning_resources(id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, resource_id)
);

-- RLS Policies
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_resources ENABLE ROW LEVEL SECURITY;

-- Public read access for reference tables
CREATE POLICY "Public careers are viewable by everyone" ON careers FOR SELECT USING (true);
CREATE POLICY "Public skills are viewable by everyone" ON skills FOR SELECT USING (true);
CREATE POLICY "Public career_skills are viewable by everyone" ON career_skills FOR SELECT USING (true);
CREATE POLICY "Public learning_resources are viewable by everyone" ON learning_resources FOR SELECT USING (true);
CREATE POLICY "Public skill_resources are viewable by everyone" ON skill_resources FOR SELECT USING (true);

-- Student specific access
CREATE POLICY "Users can view own profile" ON student_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON student_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON student_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own goals" ON student_goals FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can manage own goals" ON student_goals FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Users can view own skills" ON student_skills FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can manage own skills" ON student_skills FOR ALL USING (auth.uid() = student_id);
