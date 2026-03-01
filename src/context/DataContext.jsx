import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [categories, setCategories] = useState(['Academic', 'Sports', 'Cultural', 'Social Service', 'Leadership']);
    const [auditLog, setAuditLog] = useState([]);
    const [loading, setLoading] = useState(true);

    const [researchPapers, setResearchPapers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesterResults, setSemesterResults] = useState([]);
    const [placementDrives, setPlacementDrives] = useState([]);

    const isMockMode = supabase.supabaseKey.startsWith('sb_publishable_');

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setActivities([]);
            setResearchPapers([]);
            setAuditLog([]);
            setCourses([]);
            setSemesterResults([]);
            setPlacementDrives([]);
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);

        if (isMockMode) {
            // MOCK FETCH
            const localActivities = JSON.parse(localStorage.getItem('vsarp_activities') || '[]');
            const localPapers = JSON.parse(localStorage.getItem('vsarp_research_papers') || '[]');
            const localLogs = JSON.parse(localStorage.getItem('vsarp_logs') || '[]');
            const localCourses = JSON.parse(localStorage.getItem('vsarp_courses') || '[]');
            const localResults = JSON.parse(localStorage.getItem('vsarp_semester_results') || '[]');
            const localDrives = JSON.parse(localStorage.getItem('vsarp_placement_drives') || '[]');
            setActivities(localActivities);
            setResearchPapers(localPapers);
            setAuditLog(localLogs);
            setCourses(localCourses);
            setSemesterResults(localResults);
            setPlacementDrives(localDrives);
            setLoading(false);
            return;
        }

        // REAL FETCH
        const { data: catData } = await supabase.from('categories').select('name');
        if (catData && catData.length > 0) setCategories(catData.map(c => c.name));

        const { data: actData } = await supabase
            .from('activities')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (actData) setActivities(actData);

        const { data: paperData } = await supabase
            .from('research_papers')
            .select('*')
            .order('publication_date', { ascending: false });

        if (paperData) setResearchPapers(paperData);

        if (user?.role === 'admin') {
            const { data: logData } = await supabase
                .from('audit_logs')
                .select('*')
                .order('timestamp', { ascending: false });
            if (logData) setAuditLog(logData);
        }
        setLoading(false);
    };

    // Simple string hash for demo integrity
    const generateIntegrityHash = (activity, approverId, timestamp) => {
        const dataString = `${activity.id}|${activity.student_id}|${activity.title}|${approverId}|${timestamp}`;
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16) + "-" + Math.random().toString(36).substring(2, 8);
    };

    const addActivity = async (activity) => {
        const newActivity = {
            id: isMockMode ? crypto.randomUUID() : undefined,
            student_id: user.id,
            student_name: user.name,
            student_reg_no: user.student_id,
            department: user.department || activity.department || 'General',
            title: activity.title,
            category: activity.category,
            outcome_type: activity.outcome_type || 'Technical',
            skill_tag: activity.skill_tag || '',
            academic_year: activity.academic_year || '2024-25',
            semester: activity.semester || '1',
            description: activity.description,
            date: activity.date,
            proof_url: activity.proof_url,
            status: 'pending',
            submitted_at: new Date().toISOString()
        };

        if (isMockMode) {
            const updated = [newActivity, ...activities];
            setActivities(updated);
            localStorage.setItem('vsarp_activities', JSON.stringify(updated));
            logAction(user.id, user.role, 'SUBMISSION', newActivity.id, `Submitted: ${activity.title}`);
            return true;
        }

        const { data, error } = await supabase.from('activities').insert({
            ...newActivity,
            student_id: user.id
        }).select().single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            alert(`Submission Failed: ${error.message} (Code: ${error.code})`);
            return false;
        }

        setActivities([data, ...activities]);
        await logAction(user.id, user.role, 'SUBMISSION', data.id, `Submitted: ${activity.title}`);
        return true;
    };

    const addResearchPaper = async (paper) => {
        const newPaper = {
            id: isMockMode ? crypto.randomUUID() : undefined,
            faculty_id: user.id,
            faculty_name: user.name,
            title: paper.title,
            abstract: paper.abstract,
            publication_date: paper.publication_date,
            journal_conference: paper.journal_conference,
            url: paper.url,
            created_at: new Date().toISOString()
        };

        if (isMockMode) {
            const updated = [newPaper, ...researchPapers];
            setResearchPapers(updated);
            localStorage.setItem('vsarp_research_papers', JSON.stringify(updated));
            logAction(user.id, user.role, 'PUBLISH', newPaper.id, `Published Paper: ${paper.title}`);
            return true;
        }

        const { data, error } = await supabase.from('research_papers').insert(newPaper).select().single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            alert(`Publication Failed: ${error.message}`);
            return false;
        }

        setResearchPapers([data, ...researchPapers]);
        await logAction(user.id, user.role, 'PUBLISH', data.id, `Published Paper: ${paper.title}`);
        return true;
    };

    const updateStatus = async (id, status, comment, reviewerName, reviewerId) => {
        let target = activities.find(a => a.id === id);
        if (!target) return;

        const approvedAt = status === 'approved' ? new Date().toISOString() : null;
        const hash = status === 'approved' ? generateIntegrityHash(target, reviewerId, approvedAt) : null;

        if (isMockMode) {
            const updatedActivities = activities.map(a => {
                if (a.id === id) {
                    return {
                        ...a,
                        status,
                        reviewer_comment: comment,
                        approved_by: reviewerName,
                        approved_at: approvedAt,
                        integrity_hash: hash
                    };
                }
                return a;
            });
            setActivities(updatedActivities);
            localStorage.setItem('vsarp_activities', JSON.stringify(updatedActivities));
            logAction(reviewerId, 'faculty', status.toUpperCase(), id, `Status changed to ${status}`);
            return;
        }

        const { error } = await supabase.from('activities').update({
            status,
            reviewer_comment: comment,
            approved_by: reviewerName,
            approved_at: approvedAt,
            integrity_hash: hash
        }).eq('id', id);

        if (error) {
            alert("Update failed");
            return;
        }

        fetchData();
        logAction(reviewerId, 'faculty', status.toUpperCase(), id, `Status changed to ${status}`);
    };

    // HOD Level-2 verification
    const hodVerifyActivity = (id, status, comment, hodName, hodId) => {
        const updatedActivities = activities.map(a => {
            if (a.id === id) {
                return {
                    ...a,
                    hod_status: status,
                    hod_comment: comment,
                    hod_verified_by: hodName,
                    hod_verified_at: new Date().toISOString()
                };
            }
            return a;
        });
        setActivities(updatedActivities);
        localStorage.setItem('vsarp_activities', JSON.stringify(updatedActivities));
        logAction(hodId, 'hod', `HOD_${status.toUpperCase()}`, id, `HOD ${status}: ${comment}`);
    };

    const addCategory = async (category, adminId) => {
        if (!categories.includes(category)) {
            if (isMockMode) {
                setCategories([...categories, category]);
                logAction(adminId, 'admin', 'CONFIG_CHANGE', null, `Added category: ${category}`);
                return;
            }

            const { error } = await supabase.from('categories').insert({ name: category });
            if (!error) {
                setCategories([...categories, category]);
                logAction(adminId, 'admin', 'CONFIG_CHANGE', null, `Added category: ${category}`);
            }
        }
    };

    // Course enrollment
    const addCourse = (course) => {
        const newCourse = {
            id: crypto.randomUUID(),
            student_id: user.id,
            course_name: course.course_name,
            course_code: course.course_code,
            credits: Number(course.credits),
            semester: course.semester,
            status: course.status || 'enrolled',
            grade: course.grade || null,
            created_at: new Date().toISOString()
        };
        const updated = [newCourse, ...courses];
        setCourses(updated);
        localStorage.setItem('vsarp_courses', JSON.stringify(updated));
        return true;
    };

    // Semester results
    const addSemesterResult = (result) => {
        const newResult = {
            id: crypto.randomUUID(),
            student_id: user.id,
            semester: result.semester,
            subject: result.subject,
            subject_code: result.subject_code,
            credits: Number(result.credits),
            marks: Number(result.marks),
            max_marks: Number(result.max_marks) || 100,
            grade: result.grade,
            grade_points: Number(result.grade_points),
            created_at: new Date().toISOString()
        };
        const updated = [newResult, ...semesterResults];
        setSemesterResults(updated);
        localStorage.setItem('vsarp_semester_results', JSON.stringify(updated));
        return true;
    };

    // Placement drives
    const addPlacementDrive = (drive) => {
        const newDrive = {
            id: crypto.randomUUID(),
            company_name: drive.company_name,
            role_offered: drive.role_offered,
            package_lpa: drive.package_lpa,
            drive_date: drive.drive_date,
            eligibility_cgpa: drive.eligibility_cgpa || 0,
            eligible_departments: drive.eligible_departments || [],
            status: drive.status || 'upcoming',
            description: drive.description || '',
            registered_students: [],
            created_by: user.id,
            created_at: new Date().toISOString()
        };
        const updated = [newDrive, ...placementDrives];
        setPlacementDrives(updated);
        localStorage.setItem('vsarp_placement_drives', JSON.stringify(updated));
        logAction(user.id, user.role, 'DRIVE_CREATED', newDrive.id, `Created drive: ${drive.company_name}`);
        return true;
    };

    const updatePlacementDrive = (id, updates) => {
        const updated = placementDrives.map(d => d.id === id ? { ...d, ...updates } : d);
        setPlacementDrives(updated);
        localStorage.setItem('vsarp_placement_drives', JSON.stringify(updated));
    };

    const logAction = async (actorId, role, actionType, recordId, details) => {
        const newLog = {
            id: isMockMode ? crypto.randomUUID() : undefined,
            actor_id: actorId,
            role,
            action_type: actionType,
            record_id: recordId,
            details,
            timestamp: new Date().toISOString()
        };

        if (isMockMode) {
            setAuditLog(prev => [newLog, ...prev]);
            localStorage.setItem('vsarp_logs', JSON.stringify([newLog, ...(JSON.parse(localStorage.getItem('vsarp_logs') || '[]'))]));
            return;
        }

        await supabase.from('audit_logs').insert(newLog);
    };

    const getAllUsers = () => {
        return JSON.parse(localStorage.getItem('vsarp_users') || '[]');
    };

    // --- Mock Data Generators ---

    const fillRandomData = async () => {
        if (!user) return alert("Please login first");

        if (!window.confirm("This will add 5 random activities to your dashboard for testing. Continue?")) {
            return;
        }

        const titles = [
            "Hackathon Winner - TechNova",
            "IEEE Paper Presentation",
            "College Cricket Captain",
            "NGO Volunteer Lead",
            "National Debate Prize",
            "Robotics Club Secretary",
            "Coding Contest Finalist",
            "Industry Internship - Infosys",
            "AWS Cloud Certification",
            "Soft Skills Workshop"
        ];
        const descriptions = [
            "Led a team of 4 to build an AI-powered healthcare app, securing 1st place among 50 teams.",
            "Presented research on 'Sustainable Energy Grid' at the International IEEE Conference.",
            "Captained the university team to victory in the inter-collegiate T20 tournament.",
            "Organized a cleanliness drive and awareness campaign impacting 500+ local residents.",
            "Secured 2nd runner-up in the National Level Debate competition on 'AI Ethics'.",
            "Managed logistics and workshop coordination for the annual Robotics Symposium."
        ];
        const cats = ['Hackathon', 'Research Paper', 'Sports', 'Internship', 'Certification', 'Soft Skills Test', 'Leadership'];
        const outcomeTypes = ['Technical', 'Research', 'Leadership', 'Sports'];
        const skillTags = ['Python', 'Leadership', 'Communication', 'Cloud', 'ML', 'Web Dev', 'Data Analysis'];
        const years = ['2023-24', '2024-25'];
        const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

        const batch = Array.from({ length: 5 }).map(() => ({
            student_id: user.id,
            student_name: user.name,
            student_reg_no: user.student_id,
            department: user.department || 'Computer Science',
            title: titles[Math.floor(Math.random() * titles.length)],
            category: cats[Math.floor(Math.random() * cats.length)],
            outcome_type: outcomeTypes[Math.floor(Math.random() * outcomeTypes.length)],
            skill_tag: skillTags[Math.floor(Math.random() * skillTags.length)],
            academic_year: years[Math.floor(Math.random() * years.length)],
            semester: semesters[Math.floor(Math.random() * semesters.length)],
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
            proof_url: 'https://example.com/certificate.pdf',
            status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
            submitted_at: new Date().toISOString()
        }));

        if (isMockMode) {
            const mockBatch = batch.map(b => ({ ...b, id: crypto.randomUUID() }));
            const current = JSON.parse(localStorage.getItem('vsarp_activities') || '[]');
            const updated = [...mockBatch, ...current];
            localStorage.setItem('vsarp_activities', JSON.stringify(updated));
            setActivities(updated);
            alert("Added 5 random activities!");
            return;
        }

        const { data, error } = await supabase.from('activities').insert(batch).select();

        if (error) {
            console.error(error);
            alert("Failed to insert random data: " + error.message);
        } else {
            setActivities(prev => [...data, ...prev]);
            alert("Added 5 random activities!");
        }
    };

    const fillRandomResearchPapers = async () => {
        if (!user) return alert("Please login as faculty first");

        if (!window.confirm("This will add 3 random research papers. Continue?")) {
            return;
        }

        const topics = [
            "AI in Healthcare", "Blockchain for Supply Chain", "Quantum Computing Algorithms",
            "Sustainable Urban Planning", "IoT Security Protocols", "Machine Learning in Finance"
        ];
        const journals = [
            "IEEE Access", "Nature Machine Intelligence", "Springer AI Review",
            "ACM Transactions", "Elsevier Journal of Systems"
        ];

        const batch = Array.from({ length: 3 }).map(() => ({
            faculty_id: user.id,
            faculty_name: user.name,
            title: topics[Math.floor(Math.random() * topics.length)] + ": A Comprehensive Study",
            abstract: "This paper explores the latest advancements in the field, proposing a novel framework for optimization and scalability.",
            publication_date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
            journal_conference: journals[Math.floor(Math.random() * journals.length)],
            url: "https://doi.org/10.1109/ACCESS.2024.1234567",
            created_at: new Date().toISOString()
        }));

        if (isMockMode) {
            const mockBatch = batch.map(b => ({ ...b, id: crypto.randomUUID() }));
            const current = JSON.parse(localStorage.getItem('vsarp_research_papers') || '[]');
            const updated = [...mockBatch, ...current];
            localStorage.setItem('vsarp_research_papers', JSON.stringify(updated));
            setResearchPapers(updated);
            alert("Added 3 random research papers!");
            return;
        }

        const { data, error } = await supabase.from('research_papers').insert(batch).select();

        if (error) {
            console.error(error);
            alert("Failed to insert random papers: " + error.message);
        } else {
            setResearchPapers(prev => [...data, ...prev]);
            alert("Added 3 random research papers!");
        }
    };

    const fillRandomCourses = () => {
        if (!user) return alert("Please login first");
        const courseNames = [
            'Data Structures & Algorithms', 'Database Management Systems', 'Operating Systems',
            'Computer Networks', 'Software Engineering', 'Machine Learning',
            'Web Technologies', 'Discrete Mathematics', 'Digital Electronics',
            'Theory of Computation', 'Compiler Design', 'Cloud Computing'
        ];
        const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
        const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', null];
        const statuses = ['enrolled', 'completed', 'completed', 'completed'];

        const batch = Array.from({ length: 6 }).map((_, i) => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            return {
                id: crypto.randomUUID(),
                student_id: user.id,
                course_name: courseNames[i % courseNames.length],
                course_code: `CS${100 + i * 101}`,
                credits: [3, 4, 3, 4, 3, 2][i % 6],
                semester: semesters[Math.floor(Math.random() * semesters.length)],
                status,
                grade: status === 'completed' ? grades[Math.floor(Math.random() * (grades.length - 1))] : null,
                created_at: new Date().toISOString()
            };
        });

        const current = JSON.parse(localStorage.getItem('vsarp_courses') || '[]');
        const updated = [...batch, ...current];
        localStorage.setItem('vsarp_courses', JSON.stringify(updated));
        setCourses(updated);
        alert("Added 6 random courses!");
    };

    const fillRandomResults = () => {
        if (!user) return alert("Please login first");
        const subjects = [
            { name: 'Data Structures', code: 'CS201', credits: 4 },
            { name: 'DBMS', code: 'CS202', credits: 4 },
            { name: 'Operating Systems', code: 'CS301', credits: 3 },
            { name: 'Computer Networks', code: 'CS302', credits: 3 },
            { name: 'Mathematics III', code: 'MA201', credits: 3 },
            { name: 'Engineering Physics', code: 'PH101', credits: 3 },
            { name: 'Soft Skills', code: 'HS201', credits: 2 },
            { name: 'Machine Learning', code: 'CS401', credits: 4 },
        ];
        const gradeMap = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5 };
        const gradeKeys = Object.keys(gradeMap);

        const batch = [];
        for (let sem = 1; sem <= 4; sem++) {
            const semSubjects = subjects.slice((sem - 1) * 2, (sem - 1) * 2 + 3).concat(subjects[sem % subjects.length]);
            for (const subj of semSubjects) {
                const grade = gradeKeys[Math.floor(Math.random() * gradeKeys.length)];
                batch.push({
                    id: crypto.randomUUID(),
                    student_id: user.id,
                    semester: String(sem),
                    subject: subj.name,
                    subject_code: subj.code,
                    credits: subj.credits,
                    marks: Math.floor(Math.random() * 40) + 60,
                    max_marks: 100,
                    grade,
                    grade_points: gradeMap[grade],
                    created_at: new Date().toISOString()
                });
            }
        }

        const current = JSON.parse(localStorage.getItem('vsarp_semester_results') || '[]');
        const updated = [...batch, ...current];
        localStorage.setItem('vsarp_semester_results', JSON.stringify(updated));
        setSemesterResults(updated);
        alert(`Added ${batch.length} semester results across 4 semesters!`);
    };

    const fillRandomDrives = () => {
        if (!user) return alert("Please login first");
        const companies = [
            { name: 'TCS', role: 'Software Developer', pkg: '3.6' },
            { name: 'Infosys', role: 'Systems Engineer', pkg: '3.6' },
            { name: 'Wipro', role: 'Project Engineer', pkg: '3.5' },
            { name: 'Microsoft', role: 'SDE Intern', pkg: '18' },
            { name: 'Google', role: 'SWE Intern', pkg: '25' },
            { name: 'Amazon', role: 'SDE-1', pkg: '20' },
        ];
        const depts = ['Computer Science', 'Electronics', 'Mechanical', 'Information Technology'];
        const statuses = ['upcoming', 'ongoing', 'completed'];

        const batch = companies.map((c, i) => ({
            id: crypto.randomUUID(),
            company_name: c.name,
            role_offered: c.role,
            package_lpa: c.pkg,
            drive_date: new Date(Date.now() + (i - 2) * 7 * 86400000).toISOString().split('T')[0],
            eligibility_cgpa: (5 + Math.random() * 3).toFixed(1),
            eligible_departments: depts.slice(0, 2 + Math.floor(Math.random() * 3)),
            status: statuses[i % statuses.length],
            description: `Campus recruitment drive by ${c.name} for the role of ${c.role}.`,
            registered_students: [],
            created_by: user.id,
            created_at: new Date().toISOString()
        }));

        const current = JSON.parse(localStorage.getItem('vsarp_placement_drives') || '[]');
        const updated = [...batch, ...current];
        localStorage.setItem('vsarp_placement_drives', JSON.stringify(updated));
        setPlacementDrives(updated);
        alert(`Added ${batch.length} placement drives!`);
    };

    return (
        <DataContext.Provider value={{
            activities,
            researchPapers,
            categories,
            auditLog,
            courses,
            semesterResults,
            placementDrives,
            addActivity,
            addResearchPaper,
            updateStatus,
            hodVerifyActivity,
            addCategory,
            addCourse,
            addSemesterResult,
            addPlacementDrive,
            updatePlacementDrive,
            fillRandomData,
            fillRandomResearchPapers,
            fillRandomCourses,
            fillRandomResults,
            fillRandomDrives,
            getAllUsers,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);

