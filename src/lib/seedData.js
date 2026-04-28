/**
 * VSARP Demo Seed Data
 * Pre-populated users and sample data for a presentable prototype.
 * Auto-seeds into localStorage on first mock-mode load.
 */

// ─── Deterministic UUIDs for cross-referencing ──────────────────────
const uid = (n) => `00000000-0000-4000-a000-${String(n).padStart(12, '0')}`;

// ─── SEED USERS ─────────────────────────────────────────────────────
export const SEED_USERS = [
    // ── 5 Students ──
    { id: uid(1), email: 'aarav.sharma@vsarp.edu', full_name: 'Aarav Sharma', role: 'student', student_id: 'CS-2023-001', department: 'Computer Science', status: 'active', skills: ['Python', 'Machine Learning', 'SQL'], phone: '9876543210' },
    { id: uid(2), email: 'priya.patel@vsarp.edu', full_name: 'Priya Patel', role: 'student', student_id: 'CS-2023-002', department: 'Computer Science', status: 'active', skills: ['Java', 'Spring Boot', 'AWS'], phone: '9876543211' },
    { id: uid(3), email: 'rohan.deshmukh@vsarp.edu', full_name: 'Rohan Deshmukh', role: 'student', student_id: 'EC-2023-003', department: 'Electronics', status: 'active', skills: ['Embedded C', 'VLSI', 'IoT'], phone: '9876543212' },
    { id: uid(4), email: 'sneha.kulkarni@vsarp.edu', full_name: 'Sneha Kulkarni', role: 'student', student_id: 'IT-2023-004', department: 'Information Technology', status: 'active', skills: ['React', 'Node.js', 'MongoDB'], phone: '9876543213' },
    { id: uid(5), email: 'arjun.mehta@vsarp.edu', full_name: 'Arjun Mehta', role: 'student', student_id: 'ME-2023-005', department: 'Mechanical', status: 'active', skills: ['AutoCAD', 'SolidWorks', 'MATLAB'], phone: '9876543214' },

    // ── 5 Faculty ──
    { id: uid(10), email: 'dr.joshi@vsarp.edu', full_name: 'Dr. Rajesh Joshi', role: 'faculty', department: 'Computer Science', status: 'active', skills: ['AI', 'Deep Learning'], phone: '9876500010' },
    { id: uid(11), email: 'dr.iyer@vsarp.edu', full_name: 'Dr. Lakshmi Iyer', role: 'faculty', department: 'Computer Science', status: 'active', skills: ['Databases', 'Data Mining'], phone: '9876500011' },
    { id: uid(12), email: 'dr.patil@vsarp.edu', full_name: 'Dr. Suresh Patil', role: 'faculty', department: 'Electronics', status: 'active', skills: ['Signal Processing', 'VLSI'], phone: '9876500012' },
    { id: uid(13), email: 'dr.gupta@vsarp.edu', full_name: 'Dr. Anita Gupta', role: 'faculty', department: 'Information Technology', status: 'active', skills: ['Cybersecurity', 'Networks'], phone: '9876500013' },
    { id: uid(14), email: 'dr.nair@vsarp.edu', full_name: 'Dr. Vikram Nair', role: 'faculty', department: 'Mechanical', status: 'active', skills: ['Thermodynamics', 'FEA'], phone: '9876500014' },

    // ── 2 HODs ──
    { id: uid(20), email: 'hod.cs@vsarp.edu', full_name: 'Prof. Manoj Deshpande', role: 'hod', department: 'Computer Science', status: 'active', skills: [], phone: '9876500020' },
    { id: uid(21), email: 'hod.ec@vsarp.edu', full_name: 'Prof. Kavita Rao', role: 'hod', department: 'Electronics', status: 'active', skills: [], phone: '9876500021' },

    // ── 2 Placement Cell ──
    { id: uid(30), email: 'placement@vsarp.edu', full_name: 'Mr. Sanjay Verma', role: 'placement_cell', department: 'Computer Science', status: 'active', skills: [], phone: '9876500030' },
    { id: uid(31), email: 'tpo@vsarp.edu', full_name: 'Ms. Deepa Chavan', role: 'placement_cell', department: 'General', status: 'active', skills: [], phone: '9876500031' },

    // ── 1 Admin ──
    { id: uid(40), email: 'admin@vsarp.edu', full_name: 'System Admin', role: 'admin', department: 'General', status: 'active', skills: [], phone: '9876500040' },
];

// ─── SEED ACTIVITIES (across multiple students) ─────────────────────
export const SEED_ACTIVITIES = [
    // Aarav's activities
    { id: uid(100), student_id: uid(1), student_name: 'Aarav Sharma', student_reg_no: 'CS-2023-001', department: 'Computer Science', title: 'Smart India Hackathon - Winner', category: 'Hackathon', outcome_type: 'Technical', skill_tag: 'Python', academic_year: '2025-26', semester: '6', description: 'Led a 6-member team to build an AI-based crop disease detection system. Won 1st prize at national level.', date: '2025-12-15', proof_url: 'https://example.com/sih_cert.pdf', status: 'approved', submitted_at: '2025-12-16T10:00:00Z' },
    { id: uid(101), student_id: uid(1), student_name: 'Aarav Sharma', student_reg_no: 'CS-2023-001', department: 'Computer Science', title: 'AWS Solutions Architect Certification', category: 'Certification', certification_tier: 'tier1', outcome_type: 'Technical', skill_tag: 'Cloud', academic_year: '2025-26', semester: '5', description: 'Cleared AWS SAA-C03 certification with a score of 890/1000.', date: '2025-09-20', proof_url: 'https://example.com/aws_cert.pdf', status: 'approved', submitted_at: '2025-09-21T10:00:00Z' },
    { id: uid(102), student_id: uid(1), student_name: 'Aarav Sharma', student_reg_no: 'CS-2023-001', department: 'Computer Science', title: 'Machine Learning Internship at TCS', category: 'Internship', internship_type: 'paid_onsite_long', outcome_type: 'Technical', skill_tag: 'ML', academic_year: '2025-26', semester: '6', description: '6-month paid internship working on NLP pipelines for customer support automation.', date: '2026-01-10', proof_url: 'https://example.com/tcs_intern.pdf', status: 'approved', submitted_at: '2026-01-11T10:00:00Z' },

    // Priya's activities
    { id: uid(103), student_id: uid(2), student_name: 'Priya Patel', student_reg_no: 'CS-2023-002', department: 'Computer Science', title: 'IEEE Paper - Blockchain in Healthcare', category: 'Research Paper', outcome_type: 'Research', skill_tag: 'Blockchain', academic_year: '2025-26', semester: '5', description: 'Published a paper on applying blockchain for secure medical records at IEEE ICECA 2025.', date: '2025-10-05', proof_url: 'https://example.com/ieee_paper.pdf', status: 'approved', submitted_at: '2025-10-06T10:00:00Z' },
    { id: uid(104), student_id: uid(2), student_name: 'Priya Patel', student_reg_no: 'CS-2023-002', department: 'Computer Science', title: 'Google Cloud Associate Certification', category: 'Certification', certification_tier: 'tier1', outcome_type: 'Technical', skill_tag: 'Cloud', academic_year: '2025-26', semester: '6', description: 'Cleared Google ACE certification.', date: '2025-11-18', proof_url: 'https://example.com/gcp_cert.pdf', status: 'approved', submitted_at: '2025-11-19T10:00:00Z' },
    { id: uid(105), student_id: uid(2), student_name: 'Priya Patel', student_reg_no: 'CS-2023-002', department: 'Computer Science', title: 'Backend Internship at Infosys', category: 'Internship', internship_type: 'paid_remote', outcome_type: 'Technical', skill_tag: 'Java', academic_year: '2025-26', semester: '5', description: '3-month remote internship building Spring Boot microservices.', date: '2025-08-01', proof_url: 'https://example.com/infosys.pdf', status: 'approved', submitted_at: '2025-08-02T10:00:00Z' },

    // Rohan's activities
    { id: uid(106), student_id: uid(3), student_name: 'Rohan Deshmukh', student_reg_no: 'EC-2023-003', department: 'Electronics', title: 'National Robotics Competition - 2nd Place', category: 'Hackathon', outcome_type: 'Technical', skill_tag: 'Embedded C', academic_year: '2025-26', semester: '6', description: 'Built an autonomous drone for agricultural monitoring using STM32 microcontroller.', date: '2026-02-10', proof_url: 'https://example.com/robo.pdf', status: 'approved', submitted_at: '2026-02-11T10:00:00Z' },
    { id: uid(107), student_id: uid(3), student_name: 'Rohan Deshmukh', student_reg_no: 'EC-2023-003', department: 'Electronics', title: 'IoT Workshop Certification', category: 'Certification', certification_tier: 'tier2', outcome_type: 'Technical', skill_tag: 'IoT', academic_year: '2025-26', semester: '5', description: 'Completed a 40-hour IoT workshop conducted by CDAC Pune.', date: '2025-07-15', proof_url: 'https://example.com/iot.pdf', status: 'approved', submitted_at: '2025-07-16T10:00:00Z' },

    // Sneha's activities
    { id: uid(108), student_id: uid(4), student_name: 'Sneha Kulkarni', student_reg_no: 'IT-2023-004', department: 'Information Technology', title: 'Full-Stack Development Internship', category: 'Internship', internship_type: 'paid_remote', outcome_type: 'Technical', skill_tag: 'React', academic_year: '2025-26', semester: '6', description: 'Built a customer dashboard using React + Node.js for a Bangalore startup.', date: '2026-01-20', proof_url: 'https://example.com/fs_intern.pdf', status: 'approved', submitted_at: '2026-01-21T10:00:00Z' },
    { id: uid(109), student_id: uid(4), student_name: 'Sneha Kulkarni', student_reg_no: 'IT-2023-004', department: 'Information Technology', title: 'Soft Skills Leadership Workshop', category: 'Soft Skills Test', outcome_type: 'Leadership', skill_tag: 'Communication', academic_year: '2025-26', semester: '5', description: 'Completed TCS iON leadership and communication workshop.', date: '2025-09-10', proof_url: 'https://example.com/soft.pdf', status: 'approved', submitted_at: '2025-09-11T10:00:00Z' },

    // Arjun's activities
    { id: uid(110), student_id: uid(5), student_name: 'Arjun Mehta', student_reg_no: 'ME-2023-005', department: 'Mechanical', title: 'BAJA SAE India - Team Captain', category: 'Leadership', outcome_type: 'Leadership', skill_tag: 'Leadership', academic_year: '2025-26', semester: '6', description: 'Captained a 20-member team for BAJA SAE India, designing and building an all-terrain vehicle.', date: '2026-03-05', proof_url: 'https://example.com/baja.pdf', status: 'approved', submitted_at: '2026-03-06T10:00:00Z' },
    { id: uid(111), student_id: uid(5), student_name: 'Arjun Mehta', student_reg_no: 'ME-2023-005', department: 'Mechanical', title: 'SolidWorks CSWA Certification', category: 'Certification', certification_tier: 'tier1', outcome_type: 'Technical', skill_tag: 'SolidWorks', academic_year: '2025-26', semester: '5', description: 'Achieved Certified SolidWorks Associate credential.', date: '2025-08-22', proof_url: 'https://example.com/cswa.pdf', status: 'approved', submitted_at: '2025-08-23T10:00:00Z' },

    // Pending activities for review demo
    { id: uid(120), student_id: uid(1), student_name: 'Aarav Sharma', student_reg_no: 'CS-2023-001', department: 'Computer Science', title: 'Google Summer of Code 2026', category: 'Internship', internship_type: 'paid_remote', outcome_type: 'Technical', skill_tag: 'Python', academic_year: '2025-26', semester: '6', description: 'Selected for GSoC 2026 under TensorFlow organization.', date: '2026-04-15', proof_url: 'https://example.com/gsoc.pdf', status: 'pending', submitted_at: '2026-04-16T10:00:00Z' },
    { id: uid(121), student_id: uid(4), student_name: 'Sneha Kulkarni', student_reg_no: 'IT-2023-004', department: 'Information Technology', title: 'College Coding Contest Winner', category: 'Hackathon', outcome_type: 'Technical', skill_tag: 'DSA', academic_year: '2025-26', semester: '6', description: 'Won 1st place in intra-college competitive programming contest.', date: '2026-04-01', proof_url: 'https://example.com/cc.pdf', status: 'pending', submitted_at: '2026-04-02T10:00:00Z' },
    { id: uid(122), student_id: uid(3), student_name: 'Rohan Deshmukh', student_reg_no: 'EC-2023-003', department: 'Electronics', title: 'NSS Blood Donation Camp Organizer', category: 'Social Service', outcome_type: 'Leadership', skill_tag: 'Leadership', academic_year: '2025-26', semester: '6', description: 'Organized a blood donation drive collecting 150+ units.', date: '2026-03-20', proof_url: 'https://example.com/nss.pdf', status: 'pending', submitted_at: '2026-03-21T10:00:00Z' },
];

// ─── SEED RESEARCH PAPERS (faculty) ─────────────────────────────────
export const SEED_PAPERS = [
    { id: uid(200), faculty_id: uid(10), faculty_name: 'Dr. Rajesh Joshi', title: 'Deep Reinforcement Learning for Smart Traffic Control', abstract: 'A novel DRL framework for optimizing urban traffic signals using real-time sensor data.', publication_date: '2025-11-15', journal_conference: 'IEEE Transactions on ITS', url: 'https://doi.org/10.1109/TITS.2025.001', created_at: '2025-11-16T10:00:00Z' },
    { id: uid(201), faculty_id: uid(10), faculty_name: 'Dr. Rajesh Joshi', title: 'Federated Learning in Healthcare: Privacy-Preserving Diagnostics', abstract: 'Explores FL techniques for collaborative medical imaging without sharing patient data.', publication_date: '2026-01-20', journal_conference: 'Nature Machine Intelligence', url: 'https://doi.org/10.1038/s42256.2026.001', created_at: '2026-01-21T10:00:00Z' },
    { id: uid(202), faculty_id: uid(11), faculty_name: 'Dr. Lakshmi Iyer', title: 'Graph Neural Networks for Anomaly Detection in Financial Systems', abstract: 'Proposes a GNN-based approach for detecting fraudulent transactions in real-time.', publication_date: '2025-09-10', journal_conference: 'ACM Computing Surveys', url: 'https://doi.org/10.1145/ACM.2025.001', created_at: '2025-09-11T10:00:00Z' },
    { id: uid(203), faculty_id: uid(12), faculty_name: 'Dr. Suresh Patil', title: 'Low-Power VLSI Design for Edge AI Applications', abstract: 'Presents a 7nm accelerator architecture optimized for on-device ML inference.', publication_date: '2025-12-05', journal_conference: 'IEEE JSSC', url: 'https://doi.org/10.1109/JSSC.2025.001', created_at: '2025-12-06T10:00:00Z' },
    { id: uid(204), faculty_id: uid(13), faculty_name: 'Dr. Anita Gupta', title: 'Zero-Trust Architecture for Campus Networks', abstract: 'Implementing ZTA principles in educational institution network infrastructure.', publication_date: '2026-02-18', journal_conference: 'Elsevier Computer Networks', url: 'https://doi.org/10.1016/j.comnet.2026.001', created_at: '2026-02-19T10:00:00Z' },
];

// ─── SEED PLACEMENT DRIVES ──────────────────────────────────────────
export const SEED_DRIVES = [
    { id: uid(300), company_name: 'TCS Digital', role_offered: 'Software Engineer', package_lpa: 7.5, drive_date: '2026-05-15', application_deadline: '2026-05-10', eligibility_cgpa: 7.0, eligible_departments: ['Computer Science', 'Information Technology'], required_skills: ['Java', 'SQL', 'Spring Boot'], openings: 25, status: 'open', description: 'TCS Digital hiring for their innovation labs across India.', created_at: '2026-04-01T10:00:00Z' },
    { id: uid(301), company_name: 'Infosys', role_offered: 'Systems Engineer', package_lpa: 4.5, drive_date: '2026-05-20', application_deadline: '2026-05-15', eligibility_cgpa: 6.0, eligible_departments: ['Computer Science', 'Information Technology', 'Electronics'], required_skills: ['Python', 'Cloud', 'SQL'], openings: 50, status: 'open', description: 'Mass hiring drive for Infosys Mysore campus.', created_at: '2026-04-02T10:00:00Z' },
    { id: uid(302), company_name: 'Wipro', role_offered: 'Project Engineer', package_lpa: 3.8, drive_date: '2026-06-01', application_deadline: '2026-05-25', eligibility_cgpa: 6.0, eligible_departments: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'], required_skills: ['Communication', 'Problem Solving'], openings: 40, status: 'upcoming', description: 'Wipro campus recruitment for all branches.', created_at: '2026-04-03T10:00:00Z' },
    { id: uid(303), company_name: 'Microsoft', role_offered: 'SDE Intern', package_lpa: 15.0, drive_date: '2026-04-10', application_deadline: '2026-04-05', eligibility_cgpa: 8.0, eligible_departments: ['Computer Science'], required_skills: ['Data Structures', 'Algorithms', 'System Design'], openings: 5, status: 'closed', description: 'Premium internship opportunity at Microsoft IDC Hyderabad.', created_at: '2026-03-15T10:00:00Z' },
    { id: uid(304), company_name: 'L&T Technology Services', role_offered: 'Graduate Engineer Trainee', package_lpa: 5.0, drive_date: '2026-06-10', application_deadline: '2026-06-01', eligibility_cgpa: 6.5, eligible_departments: ['Mechanical', 'Electronics', 'Civil'], required_skills: ['AutoCAD', 'MATLAB'], openings: 15, status: 'open', description: 'LTTS hiring for core engineering roles.', created_at: '2026-04-05T10:00:00Z' },
];

// ─── SEED SEMESTER RESULTS (for Aarav) ──────────────────────────────
export const SEED_RESULTS = [
    { id: uid(400), student_id: uid(1), semester: '5', subject: 'Machine Learning', subject_code: 'CS501', credits: 4, marks: 92, max_marks: 100, grade: 'A+', grade_points: 10, verification_status: 'verified', verification_hash: 'result_demo_001', verified_by: 'Controller of Examinations', verified_at: '2025-12-20T10:00:00Z', created_at: '2025-12-15T10:00:00Z' },
    { id: uid(401), student_id: uid(1), semester: '5', subject: 'Database Systems', subject_code: 'CS502', credits: 4, marks: 85, max_marks: 100, grade: 'A', grade_points: 9, verification_status: 'verified', verification_hash: 'result_demo_002', verified_by: 'Controller of Examinations', verified_at: '2025-12-20T10:00:00Z', created_at: '2025-12-15T10:00:00Z' },
    { id: uid(402), student_id: uid(1), semester: '5', subject: 'Computer Networks', subject_code: 'CS503', credits: 3, marks: 78, max_marks: 100, grade: 'B+', grade_points: 8, verification_status: 'verified', verification_hash: 'result_demo_003', verified_by: 'Controller of Examinations', verified_at: '2025-12-20T10:00:00Z', created_at: '2025-12-15T10:00:00Z' },
    { id: uid(403), student_id: uid(2), semester: '5', subject: 'Machine Learning', subject_code: 'CS501', credits: 4, marks: 88, max_marks: 100, grade: 'A', grade_points: 9, verification_status: 'verified', verification_hash: 'result_demo_004', verified_by: 'Controller of Examinations', verified_at: '2025-12-20T10:00:00Z', created_at: '2025-12-15T10:00:00Z' },
    // Pending results for faculty review demo
    { id: uid(410), student_id: uid(4), semester: '6', subject: 'Cloud Computing', subject_code: 'IT601', credits: 4, marks: 82, max_marks: 100, grade: 'A', grade_points: 9, verification_status: 'pending', verification_hash: null, verified_by: null, verified_at: null, created_at: '2026-04-20T10:00:00Z' },
    { id: uid(411), student_id: uid(4), semester: '6', subject: 'DevOps Engineering', subject_code: 'IT602', credits: 3, marks: 75, max_marks: 100, grade: 'B+', grade_points: 8, verification_status: 'pending', verification_hash: null, verified_by: null, verified_at: null, created_at: '2026-04-20T10:00:00Z' },
];

// ─── SEED COURSES ───────────────────────────────────────────────────
export const SEED_COURSES = [
    { id: uid(500), student_id: uid(1), course_name: 'Machine Learning', course_code: 'CS501', credits: 4, semester: '5', status: 'completed', grade: 'A+' },
    { id: uid(501), student_id: uid(1), course_name: 'Database Systems', course_code: 'CS502', credits: 4, semester: '5', status: 'completed', grade: 'A' },
    { id: uid(502), student_id: uid(1), course_name: 'Computer Networks', course_code: 'CS503', credits: 3, semester: '5', status: 'completed', grade: 'B+' },
    { id: uid(503), student_id: uid(1), course_name: 'Deep Learning', course_code: 'CS601', credits: 4, semester: '6', status: 'enrolled', grade: null },
    { id: uid(504), student_id: uid(2), course_name: 'Machine Learning', course_code: 'CS501', credits: 4, semester: '5', status: 'completed', grade: 'A' },
    { id: uid(505), student_id: uid(2), course_name: 'Software Engineering', course_code: 'CS504', credits: 3, semester: '5', status: 'completed', grade: 'A' },
    { id: uid(506), student_id: uid(4), course_name: 'Cloud Computing', course_code: 'IT601', credits: 4, semester: '6', status: 'enrolled', grade: null },
    { id: uid(507), student_id: uid(4), course_name: 'Full Stack Development', course_code: 'IT501', credits: 4, semester: '5', status: 'completed', grade: 'A+' },
];

// ─── SEED APTITUDE ATTEMPTS ─────────────────────────────────────────
export const SEED_APTITUDE_ATTEMPTS = [
    { id: uid(600), student_id: uid(1), test_id: 'demo-test', score: 92, total: 100, passed: true, submitted_at: '2026-03-10T10:00:00Z' },
    { id: uid(601), student_id: uid(2), test_id: 'demo-test', score: 78, total: 100, passed: true, submitted_at: '2026-03-10T10:15:00Z' },
    { id: uid(602), student_id: uid(3), test_id: 'demo-test', score: 65, total: 100, passed: true, submitted_at: '2026-03-10T10:30:00Z' },
    { id: uid(603), student_id: uid(4), test_id: 'demo-test', score: 85, total: 100, passed: true, submitted_at: '2026-03-10T10:45:00Z' },
    { id: uid(604), student_id: uid(5), test_id: 'demo-test', score: 45, total: 100, passed: false, submitted_at: '2026-03-10T11:00:00Z' },
];

// ─── SEEDER FUNCTION ────────────────────────────────────────────────
const SEED_FLAG = 'vsarp_demo_seeded_v3';

export function seedDemoData() {
    if (localStorage.getItem(SEED_FLAG)) return false;

    const write = (key, data) => {
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        if (existing.length === 0) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    };

    write('vsarp_users', SEED_USERS);
    write('vsarp_activities', SEED_ACTIVITIES);
    write('vsarp_research_papers', SEED_PAPERS);
    write('vsarp_placement_drives', SEED_DRIVES);
    write('vsarp_semester_results', SEED_RESULTS);
    write('vsarp_courses', SEED_COURSES);
    write('vsarp_aptitude_attempts', SEED_APTITUDE_ATTEMPTS);

    localStorage.setItem(SEED_FLAG, 'true');
    return true;
}

/**
 * Clears all seed data and re-seeds fresh. Useful for presentations.
 */
export function resetDemoData() {
    const keys = [
        'vsarp_users', 'vsarp_activities', 'vsarp_research_papers',
        'vsarp_placement_drives', 'vsarp_semester_results', 'vsarp_courses',
        'vsarp_placement_applications', 'vsarp_placement_notifications',
        'vsarp_aptitude_tests', 'vsarp_aptitude_attempts', 'vsarp_logs',
        SEED_FLAG, 'vsarp_fake_session', 'vsarp_demo_seeded_v2',
    ];
    keys.forEach(k => localStorage.removeItem(k));
    seedDemoData();
}

// ─── Quick Login Presets ────────────────────────────────────────────
export const DEMO_LOGINS = [
    { label: 'Aarav (Student)', email: 'aarav.sharma@vsarp.edu', role: 'student', dept: 'CS' },
    { label: 'Priya (Student)', email: 'priya.patel@vsarp.edu', role: 'student', dept: 'CS' },
    { label: 'Dr. Joshi (Faculty)', email: 'dr.joshi@vsarp.edu', role: 'faculty', dept: 'CS' },
    { label: 'Dr. Iyer (Faculty)', email: 'dr.iyer@vsarp.edu', role: 'faculty', dept: 'CS' },
    { label: 'HOD CS', email: 'hod.cs@vsarp.edu', role: 'hod', dept: 'CS' },
    { label: 'Placement Cell', email: 'placement@vsarp.edu', role: 'placement_cell', dept: '' },
    { label: 'Admin', email: 'admin@vsarp.edu', role: 'admin', dept: '' },
];

