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

    const isMockMode = supabase.supabaseKey.startsWith('sb_publishable_');

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setActivities([]);
            setResearchPapers([]);
            setAuditLog([]);
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);

        if (isMockMode) {
            // MOCK FETCH
            const localActivities = JSON.parse(localStorage.getItem('vsarp_activities') || '[]');
            const localPapers = JSON.parse(localStorage.getItem('vsarp_research_papers') || '[]');
            const localLogs = JSON.parse(localStorage.getItem('vsarp_logs') || '[]');
            setActivities(localActivities);
            setResearchPapers(localPapers);
            setAuditLog(localLogs);
            setLoading(false);
            return;
        }

        // REAL FETCH
        // Fetch Categories
        const { data: catData } = await supabase.from('categories').select('name');
        if (catData && catData.length > 0) setCategories(catData.map(c => c.name));

        // Fetch Activities
        const { data: actData } = await supabase
            .from('activities')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (actData) setActivities(actData);

        // Fetch Research Papers
        const { data: paperData } = await supabase
            .from('research_papers')
            .select('*')
            .order('publication_date', { ascending: false });

        if (paperData) setResearchPapers(paperData);

        // Fetch Logs (if Admin)
        if (user?.role === 'admin') {
            const { data: logData } = await supabase
                .from('audit_logs')
                .select('*')
                .order('timestamp', { ascending: false });
            if (logData) setAuditLog(logData);
        }
        setLoading(false);
    };

    // Simple string hash for demo integrity (Replace with SHA-256 in production)
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
            id: isMockMode ? crypto.randomUUID() : undefined, // Generate ID locally for mock
            student_id: user.id, // Enforce Auth ownership
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
            student_id: user.id // Ensure strict ownership
        }).select().single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            alert(`Submission Failed: ${error.message} (Code: ${error.code})`);
            return false;
        }

        setActivities([data, ...activities]);
        // Log action only if success
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
        // Optimistic Update
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

        // Refresh Data
        fetchData();
        logAction(reviewerId, 'faculty', status.toUpperCase(), id, `Status changed to ${status}`);
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

        // Real Mode - Insert and Optimistic Update
        const { data, error } = await supabase.from('activities').insert(batch).select();

        if (error) {
            console.error(error);
            alert("Failed to insert random data: " + error.message);
        } else {
            // Prepend new data to current state for instant update without reload
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

    return (
        <DataContext.Provider value={{
            activities,
            researchPapers,
            categories,
            auditLog,
            addActivity,
            addResearchPaper,
            updateStatus,
            addCategory,
            fillRandomData,
            fillRandomResearchPapers,
            getAllUsers,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
