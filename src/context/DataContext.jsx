import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
    buildDefaultAptitudeQuestions,
    createResultRecord,
    generateVerificationHash,
    parseSkillInput,
} from '../lib/placement';
import { seedDemoData } from '../lib/seedData';

// Auto-seed demo data on first mock-mode load
if (!isSupabaseConfigured) { seedDemoData(); }

const DataContext = createContext(null);

const DEFAULT_CATEGORIES = [
    'Academic',
    'Sports',
    'Cultural',
    'Social Service',
    'Leadership',
    'Internship',
    'Certification',
    'Hackathon',
    'Research Paper',
    'Soft Skills Test',
];

const STORAGE_KEYS = {
    activities: 'vsarp_activities',
    researchPapers: 'vsarp_research_papers',
    auditLogs: 'vsarp_logs',
    courses: 'vsarp_courses',
    semesterResults: 'vsarp_semester_results',
    placementDrives: 'vsarp_placement_drives',
    placementApplications: 'vsarp_placement_applications',
    placementNotifications: 'vsarp_placement_notifications',
    aptitudeTests: 'vsarp_aptitude_tests',
    aptitudeAttempts: 'vsarp_aptitude_attempts',
    users: 'vsarp_users',
};

function readStorage(key, fallback = []) {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function createNotification({
    profileId,
    driveId = null,
    title,
    message,
    notificationType = 'placement_drive',
}) {
    return {
        id: crypto.randomUUID(),
        profile_id: profileId,
        drive_id: driveId,
        title,
        message,
        notification_type: notificationType,
        is_read: false,
        created_at: new Date().toISOString(),
    };
}

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const isMockMode = !isSupabaseConfigured;

    const [activities, setActivities] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [auditLog, setAuditLog] = useState([]);
    const [researchPapers, setResearchPapers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesterResults, setSemesterResults] = useState([]);
    const [placementDrives, setPlacementDrives] = useState([]);
    const [placementApplications, setPlacementApplications] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [aptitudeTests, setAptitudeTests] = useState([]);
    const [aptitudeAttempts, setAptitudeAttempts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const resetState = useCallback(() => {
        setActivities([]);
        setResearchPapers([]);
        setAuditLog([]);
        setCourses([]);
        setSemesterResults([]);
        setPlacementDrives([]);
        setPlacementApplications([]);
        setNotifications([]);
        setAptitudeTests([]);
        setAptitudeAttempts([]);
        setUsers([]);
        setCategories(DEFAULT_CATEGORIES);
    }, []);

    const logAction = useCallback(
        async (actorId, role, actionType, recordId, details) => {
            const newLog = {
                id: crypto.randomUUID(),
                actor_id: actorId,
                role,
                action_type: actionType,
                record_id: recordId,
                details,
                timestamp: new Date().toISOString(),
            };

            if (isMockMode) {
                const nextLogs = [newLog, ...readStorage(STORAGE_KEYS.auditLogs)];
                writeStorage(STORAGE_KEYS.auditLogs, nextLogs);
                setAuditLog(nextLogs);
                return;
            }

            await supabase.from('audit_logs').insert(newLog);
        },
        [isMockMode]
    );

    const fetchData = useCallback(async () => {
        if (!user) {
            resetState();
            setLoading(false);
            return;
        }

        setLoading(true);

        if (isMockMode) {
            setActivities(readStorage(STORAGE_KEYS.activities));
            setResearchPapers(readStorage(STORAGE_KEYS.researchPapers));
            setAuditLog(readStorage(STORAGE_KEYS.auditLogs));
            setCourses(readStorage(STORAGE_KEYS.courses));
            setSemesterResults(readStorage(STORAGE_KEYS.semesterResults));
            setPlacementDrives(readStorage(STORAGE_KEYS.placementDrives));
            setPlacementApplications(readStorage(STORAGE_KEYS.placementApplications));
            setNotifications(readStorage(STORAGE_KEYS.placementNotifications));
            setAptitudeTests(readStorage(STORAGE_KEYS.aptitudeTests));
            setAptitudeAttempts(readStorage(STORAGE_KEYS.aptitudeAttempts));
            setUsers(readStorage(STORAGE_KEYS.users));
            setLoading(false);
            return;
        }

        const canViewAllUsers = ['admin', 'faculty', 'hod', 'placement_cell'].includes(
            user.role
        );
        const shouldLoadAudit = user.role === 'admin';

        const queryResults = await Promise.all([
            supabase.from('categories').select('name').order('name'),
            supabase.from('activities').select('*').order('submitted_at', { ascending: false }),
            supabase
                .from('research_papers')
                .select('*')
                .order('publication_date', { ascending: false }),
            supabase.from('courses').select('*').order('created_at', { ascending: false }),
            supabase
                .from('semester_results')
                .select('*')
                .order('created_at', { ascending: false }),
            supabase
                .from('placement_drives')
                .select('*')
                .order('drive_date', { ascending: true }),
            supabase
                .from('placement_applications')
                .select('*')
                .order('applied_at', { ascending: false }),
            supabase
                .from('placement_notifications')
                .select('*')
                .order('created_at', { ascending: false }),
            supabase.from('aptitude_tests').select('*').order('created_at', { ascending: false }),
            supabase
                .from('aptitude_attempts')
                .select('*')
                .order('submitted_at', { ascending: false }),
            canViewAllUsers
                ? supabase.from('profiles').select('*').order('created_at', { ascending: false })
                : supabase.from('profiles').select('*').eq('id', user.id),
            shouldLoadAudit
                ? supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })
                : Promise.resolve({ data: [] }),
        ]);

        const [
            categoriesResult,
            activitiesResult,
            papersResult,
            coursesResult,
            resultsResult,
            drivesResult,
            applicationsResult,
            notificationsResult,
            testsResult,
            attemptsResult,
            usersResult,
            auditResult,
        ] = queryResults;

        setCategories(
            categoriesResult.data?.length
                ? categoriesResult.data.map((item) => item.name)
                : DEFAULT_CATEGORIES
        );
        setActivities(activitiesResult.data || []);
        setResearchPapers(papersResult.data || []);
        setCourses(coursesResult.data || []);
        setSemesterResults(resultsResult.data || []);
        setPlacementDrives(drivesResult.data || []);
        setPlacementApplications(applicationsResult.data || []);
        setNotifications(notificationsResult.data || []);
        setAptitudeTests(testsResult.data || []);
        setAptitudeAttempts(attemptsResult.data || []);
        setUsers(usersResult.data || []);
        setAuditLog(auditResult.data || []);
        setLoading(false);
    }, [isMockMode, resetState, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getAllUsers = useCallback(() => users, [users]);

    const addActivity = useCallback(
        async (activity) => {
            const newActivity = {
                id: crypto.randomUUID(),
                student_id: user.id,
                student_name: user.name,
                student_reg_no: user.student_id,
                department: user.department || activity.department || 'General',
                title: activity.title,
                category: activity.category,
                outcome_type: activity.outcome_type || 'Technical',
                skill_tag: activity.skill_tag || '',
                academic_year: activity.academic_year || '2025-26',
                semester: activity.semester || '1',
                description: activity.description,
                date: activity.date,
                proof_url: activity.proof_url,
                status: 'pending',
                submitted_at: new Date().toISOString(),
            };

            if (isMockMode) {
                const nextActivities = [newActivity, ...activities];
                writeStorage(STORAGE_KEYS.activities, nextActivities);
                setActivities(nextActivities);
                await logAction(user.id, user.role, 'SUBMISSION', newActivity.id, `Submitted: ${activity.title}`);
                return true;
            }

            const { data, error } = await supabase
                .from('activities')
                .insert(newActivity)
                .select()
                .single();

            if (error) {
                alert(`Submission failed: ${error.message}`);
                return false;
            }

            setActivities((current) => [data, ...current]);
            await logAction(user.id, user.role, 'SUBMISSION', data.id, `Submitted: ${activity.title}`);
            return true;
        },
        [activities, isMockMode, logAction, user]
    );

    const deleteRejectedActivity = useCallback(
        async (activityId) => {
            const targetActivity = activities.find((activity) => activity.id === activityId);

            if (!targetActivity || targetActivity.status !== 'rejected') {
                return false;
            }

            if (isMockMode) {
                const nextActivities = activities.filter((activity) => activity.id !== activityId);
                writeStorage(STORAGE_KEYS.activities, nextActivities);
                setActivities(nextActivities);
                await logAction(user.id, user.role, 'DELETE_REJECTED_ACTIVITY', activityId, `Deleted rejected activity: ${targetActivity.title}`);
                return true;
            }

            const { error } = await supabase.from('activities').delete().eq('id', activityId);

            if (error) {
                alert(`Delete failed: ${error.message}`);
                return false;
            }

            setActivities((current) => current.filter((activity) => activity.id !== activityId));
            await logAction(user.id, user.role, 'DELETE_REJECTED_ACTIVITY', activityId, `Deleted rejected activity: ${targetActivity.title}`);
            return true;
        },
        [activities, isMockMode, logAction, user]
    );

    const addResearchPaper = useCallback(
        async (paper) => {
            const newPaper = {
                id: crypto.randomUUID(),
                faculty_id: user.id,
                faculty_name: user.name,
                title: paper.title,
                abstract: paper.abstract,
                publication_date: paper.publication_date,
                journal_conference: paper.journal_conference,
                url: paper.url,
                created_at: new Date().toISOString(),
            };

            if (isMockMode) {
                const nextPapers = [newPaper, ...researchPapers];
                writeStorage(STORAGE_KEYS.researchPapers, nextPapers);
                setResearchPapers(nextPapers);
                await logAction(user.id, user.role, 'PUBLISH', newPaper.id, `Published paper: ${paper.title}`);
                return true;
            }

            const { data, error } = await supabase
                .from('research_papers')
                .insert(newPaper)
                .select()
                .single();

            if (error) {
                alert(`Publication failed: ${error.message}`);
                return false;
            }

            setResearchPapers((current) => [data, ...current]);
            await logAction(user.id, user.role, 'PUBLISH', data.id, `Published paper: ${paper.title}`);
            return true;
        },
        [isMockMode, logAction, researchPapers, user]
    );

    const updateStatus = useCallback(
        async (id, status, comment = '', reviewerName = user?.name, reviewerId = user?.id) => {
            const target = activities.find((activity) => activity.id === id);

            if (!target) {
                return;
            }

            const approvedAt = status === 'approved' ? new Date().toISOString() : null;
            const integrityHash =
                status === 'approved' ? generateVerificationHash('activity') : null;

            const updates = {
                status,
                reviewer_comment: comment,
                approved_by: reviewerName,
                approved_at: approvedAt,
                integrity_hash: integrityHash,
            };

            if (isMockMode) {
                const nextActivities = activities.map((activity) =>
                    activity.id === id ? { ...activity, ...updates } : activity
                );
                writeStorage(STORAGE_KEYS.activities, nextActivities);
                setActivities(nextActivities);

                const nextNotifications = [
                    createNotification({
                        profileId: target.student_id,
                        title:
                            status === 'approved'
                                ? 'Activity approved'
                                : 'Activity needs resubmission',
                        message:
                            status === 'approved'
                                ? `${target.title} was approved and is now verifiable.`
                                : `${target.title} was rejected. Review the faculty note and delete or resubmit it.`,
                        notificationType: 'activity_review',
                    }),
                    ...readStorage(STORAGE_KEYS.placementNotifications),
                ];

                writeStorage(STORAGE_KEYS.placementNotifications, nextNotifications);
                setNotifications(nextNotifications);

                await logAction(reviewerId, user?.role || 'faculty', status.toUpperCase(), id, `Status changed to ${status}`);
                return;
            }

            const { error } = await supabase.from('activities').update(updates).eq('id', id);

            if (error) {
                alert(`Update failed: ${error.message}`);
                return;
            }

            await supabase.from('placement_notifications').insert({
                profile_id: target.student_id,
                title: status === 'approved' ? 'Activity approved' : 'Activity needs attention',
                message:
                    status === 'approved'
                        ? `${target.title} was approved and added to your verified portfolio.`
                        : `${target.title} was rejected. Check the faculty comment and either delete or resubmit it.`,
                notification_type: 'activity_review',
                drive_id: null,
            });

            await fetchData();
            await logAction(reviewerId, user?.role || 'faculty', status.toUpperCase(), id, `Status changed to ${status}`);
        },
        [activities, fetchData, isMockMode, logAction, user]
    );

    const addCategory = useCallback(
        async (category, adminId) => {
            if (!category || categories.includes(category)) {
                return;
            }

            if (isMockMode) {
                const nextCategories = [...categories, category];
                setCategories(nextCategories);
                await logAction(adminId, 'admin', 'CONFIG_CHANGE', null, `Added category: ${category}`);
                return;
            }

            const { error } = await supabase.from('categories').insert({ name: category });

            if (!error) {
                setCategories((current) => [...current, category]);
                await logAction(adminId, 'admin', 'CONFIG_CHANGE', null, `Added category: ${category}`);
            }
        },
        [categories, isMockMode, logAction]
    );

    const addCourse = useCallback(
        async (course) => {
            const newCourse = {
                id: crypto.randomUUID(),
                student_id: user.id,
                course_name: course.course_name,
                course_code: course.course_code,
                credits: Number(course.credits),
                semester: course.semester,
                status: course.status || 'enrolled',
                grade: course.grade || null,
                created_at: new Date().toISOString(),
            };

            if (isMockMode) {
                const nextCourses = [newCourse, ...courses];
                writeStorage(STORAGE_KEYS.courses, nextCourses);
                setCourses(nextCourses);
                return true;
            }

            const { data, error } = await supabase
                .from('courses')
                .insert(newCourse)
                .select()
                .single();

            if (error) {
                alert(`Course save failed: ${error.message}`);
                return false;
            }

            setCourses((current) => [data, ...current]);
            return true;
        },
        [courses, isMockMode, user]
    );

    const addSemesterResult = useCallback(
        async (result) => {
            const newResult = {
                id: crypto.randomUUID(),
                ...createResultRecord(user, result),
            };

            if (isMockMode) {
                const nextResults = [newResult, ...semesterResults];
                writeStorage(STORAGE_KEYS.semesterResults, nextResults);
                setSemesterResults(nextResults);
                return true;
            }

            const { data, error } = await supabase
                .from('semester_results')
                .insert(newResult)
                .select()
                .single();

            if (error) {
                alert(`Result save failed: ${error.message}`);
                return false;
            }

            setSemesterResults((current) => [data, ...current]);
            return true;
        },
        [isMockMode, semesterResults, user]
    );

    const updateResultStatus = useCallback(
        async (resultId, status, reviewerName = user?.name) => {
            const target = semesterResults.find(r => r.id === resultId);
            if (!target) return false;

            const updates = {
                verification_status: status,
                verified_by: status === 'verified' ? reviewerName : null,
                verified_at: status === 'verified' ? new Date().toISOString() : null,
                verification_hash: status === 'verified' ? generateVerificationHash('result') : null,
            };

            if (isMockMode) {
                const nextResults = semesterResults.map(r =>
                    r.id === resultId ? { ...r, ...updates } : r
                );
                writeStorage(STORAGE_KEYS.semesterResults, nextResults);
                setSemesterResults(nextResults);
                await logAction(user?.id, user?.role || 'faculty', `RESULT_${status.toUpperCase()}`, resultId, `Result ${status}: ${target.subject}`);
                return true;
            }

            const { error } = await supabase.from('semester_results').update(updates).eq('id', resultId);
            if (error) { alert(`Update failed: ${error.message}`); return false; }
            await fetchData();
            await logAction(user?.id, user?.role || 'faculty', `RESULT_${status.toUpperCase()}`, resultId, `Result ${status}: ${target.subject}`);
            return true;
        },
        [fetchData, isMockMode, logAction, semesterResults, user]
    );

    const addPlacementDrive = useCallback(
        async (drive) => {
            const requiredSkills = parseSkillInput(drive.required_skills);
            const newDrive = {
                id: crypto.randomUUID(),
                company_name: drive.company_name,
                role_offered: drive.role_offered,
                package_lpa: Number(drive.package_lpa),
                drive_date: drive.drive_date,
                application_deadline: drive.application_deadline || drive.drive_date,
                eligibility_cgpa: Number(drive.eligibility_cgpa || 0),
                eligible_departments: drive.eligible_departments || [],
                required_skills: requiredSkills,
                openings: Number(drive.openings || 1),
                status: drive.status || 'upcoming',
                description: drive.description || '',
                created_by: user.id,
                created_at: new Date().toISOString(),
            };

            const defaultTest = {
                id: crypto.randomUUID(),
                drive_id: newDrive.id,
                title: `${newDrive.company_name} Aptitude Round`,
                company_name: newDrive.company_name,
                description: `Practice test for ${newDrive.role_offered}`,
                duration_minutes: 30,
                passing_score: 60,
                questions: buildDefaultAptitudeQuestions(requiredSkills, newDrive.company_name),
                created_by: user.id,
                created_at: new Date().toISOString(),
            };

            if (isMockMode) {
                const nextDrives = [newDrive, ...placementDrives];
                const nextTests = [defaultTest, ...aptitudeTests];
                const studentUsers = readStorage(STORAGE_KEYS.users).filter(
                    (profile) => profile.role === 'student'
                );
                const generatedNotifications = studentUsers.map((studentProfile) =>
                    createNotification({
                        profileId: studentProfile.id,
                        driveId: newDrive.id,
                        title: `${newDrive.company_name} drive is live`,
                        message: `${newDrive.role_offered} applications are now open. Check eligibility and apply before the deadline.`,
                    })
                );

                writeStorage(STORAGE_KEYS.placementDrives, nextDrives);
                writeStorage(STORAGE_KEYS.aptitudeTests, nextTests);
                writeStorage(STORAGE_KEYS.placementNotifications, [
                    ...generatedNotifications,
                    ...readStorage(STORAGE_KEYS.placementNotifications),
                ]);

                setPlacementDrives(nextDrives);
                setAptitudeTests(nextTests);
                setNotifications(readStorage(STORAGE_KEYS.placementNotifications));
                await logAction(user.id, user.role, 'DRIVE_CREATED', newDrive.id, `Created drive: ${newDrive.company_name}`);
                return true;
            }

            const { data: driveData, error: driveError } = await supabase
                .from('placement_drives')
                .insert(newDrive)
                .select()
                .single();

            if (driveError) {
                alert(`Drive creation failed: ${driveError.message}`);
                return false;
            }

            await supabase.from('aptitude_tests').insert({
                ...defaultTest,
                drive_id: driveData.id,
            });

            await fetchData();
            await logAction(user.id, user.role, 'DRIVE_CREATED', driveData.id, `Created drive: ${newDrive.company_name}`);
            return true;
        },
        [aptitudeTests, fetchData, isMockMode, logAction, placementDrives, user]
    );

    const updatePlacementDrive = useCallback(
        async (id, updates) => {
            const sanitizedUpdates = {
                ...updates,
                required_skills: updates.required_skills
                    ? parseSkillInput(updates.required_skills)
                    : updates.required_skills,
            };

            if (isMockMode) {
                const nextDrives = placementDrives.map((drive) =>
                    drive.id === id ? { ...drive, ...sanitizedUpdates } : drive
                );
                writeStorage(STORAGE_KEYS.placementDrives, nextDrives);
                setPlacementDrives(nextDrives);
                return true;
            }

            const { error } = await supabase
                .from('placement_drives')
                .update(sanitizedUpdates)
                .eq('id', id);

            if (error) {
                alert(`Drive update failed: ${error.message}`);
                return false;
            }

            await fetchData();
            return true;
        },
        [fetchData, isMockMode, placementDrives]
    );

    const applyToDrive = useCallback(
        async (driveId) => {
            const alreadyApplied = placementApplications.some(
                (application) =>
                    application.drive_id === driveId && application.student_id === user.id
            );

            if (alreadyApplied) {
                return false;
            }

            const newApplication = {
                id: crypto.randomUUID(),
                drive_id: driveId,
                student_id: user.id,
                status: 'applied',
                applied_at: new Date().toISOString(),
            };

            if (isMockMode) {
                const nextApplications = [newApplication, ...placementApplications];
                writeStorage(STORAGE_KEYS.placementApplications, nextApplications);
                setPlacementApplications(nextApplications);

                const drive = placementDrives.find((item) => item.id === driveId);
                const nextNotifications = [
                    createNotification({
                        profileId: user.id,
                        driveId,
                        title: 'Application submitted',
                        message: `You successfully applied to ${drive?.company_name || 'the placement drive'}.`,
                        notificationType: 'application_status',
                    }),
                    ...readStorage(STORAGE_KEYS.placementNotifications),
                ];
                writeStorage(STORAGE_KEYS.placementNotifications, nextNotifications);
                setNotifications(nextNotifications);
                await logAction(user.id, user.role, 'PLACEMENT_APPLY', driveId, `Applied to ${drive?.company_name || 'drive'}`);
                return true;
            }

            const { error } = await supabase.from('placement_applications').insert(newApplication);

            if (error) {
                alert(`Application failed: ${error.message}`);
                return false;
            }

            await supabase.from('placement_notifications').insert({
                profile_id: user.id,
                drive_id: driveId,
                title: 'Application submitted',
                message: 'Your placement-drive application was recorded successfully.',
                notification_type: 'application_status',
            });

            await fetchData();
            await logAction(user.id, user.role, 'PLACEMENT_APPLY', driveId, 'Applied to placement drive');
            return true;
        },
        [fetchData, isMockMode, logAction, placementApplications, placementDrives, user]
    );

    const markNotificationRead = useCallback(
        async (notificationId) => {
            if (isMockMode) {
                const nextNotifications = notifications.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                );
                writeStorage(STORAGE_KEYS.placementNotifications, nextNotifications);
                setNotifications(nextNotifications);
                return;
            }

            await supabase
                .from('placement_notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        },
        [isMockMode, notifications]
    );

    const submitAptitudeAttempt = useCallback(
        async ({ testId, answers, score, totalQuestions, passed }) => {
            const newAttempt = {
                id: crypto.randomUUID(),
                test_id: testId,
                student_id: user.id,
                score,
                total_questions: totalQuestions,
                passed,
                answers,
                submitted_at: new Date().toISOString(),
            };

            if (isMockMode) {
                const nextAttempts = [newAttempt, ...aptitudeAttempts];
                writeStorage(STORAGE_KEYS.aptitudeAttempts, nextAttempts);
                setAptitudeAttempts(nextAttempts);
                await logAction(user.id, user.role, 'APTITUDE_ATTEMPT', testId, `Scored ${score}%`);
                return newAttempt;
            }

            const { data, error } = await supabase
                .from('aptitude_attempts')
                .insert(newAttempt)
                .select()
                .single();

            if (error) {
                alert(`Test submission failed: ${error.message}`);
                return null;
            }

            setAptitudeAttempts((current) => [data, ...current]);
            await logAction(user.id, user.role, 'APTITUDE_ATTEMPT', testId, `Scored ${score}%`);
            return data;
        },
        [aptitudeAttempts, isMockMode, logAction, user]
    );

    const fillRandomData = useCallback(async () => {
        if (!user) {
            alert('Please login first');
            return;
        }

        if (!window.confirm('This will add 5 random activities for testing. Continue?')) {
            return;
        }

        const titles = [
            'Hackathon Winner - TechNova',
            'IEEE Paper Presentation',
            'College Cricket Captain',
            'NGO Volunteer Lead',
            'National Debate Prize',
            'Industry Internship - Infosys',
            'AWS Cloud Certification',
            'Soft Skills Workshop',
        ];
        const descriptions = [
            'Led a team of four to build an AI-powered healthcare app and secured first place.',
            'Presented research on sustainable energy grids at an international conference.',
            'Coordinated a student sports team through regional qualifiers.',
            'Organized a social-impact campaign across the local community.',
            'Completed a high-impact internship focused on backend services and deployment.',
        ];
        const categoriesPool = [
            'Hackathon',
            'Research Paper',
            'Sports',
            'Internship',
            'Certification',
            'Soft Skills Test',
            'Leadership',
        ];
        const skillTags = ['Python', 'Communication', 'Cloud', 'ML', 'SQL', 'Leadership'];

        const batch = Array.from({ length: 5 }).map(() => ({
            id: crypto.randomUUID(),
            student_id: user.id,
            student_name: user.name,
            student_reg_no: user.student_id,
            department: user.department || 'Computer Science',
            title: titles[Math.floor(Math.random() * titles.length)],
            category: categoriesPool[Math.floor(Math.random() * categoriesPool.length)],
            outcome_type: ['Technical', 'Research', 'Leadership', 'Sports'][Math.floor(Math.random() * 4)],
            skill_tag: skillTags[Math.floor(Math.random() * skillTags.length)],
            academic_year: '2025-26',
            semester: String(Math.ceil(Math.random() * 8)),
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
            proof_url: 'https://example.com/certificate.pdf',
            status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
            integrity_hash: null,
            submitted_at: new Date().toISOString(),
        }));

        if (isMockMode) {
            const nextActivities = [...batch, ...activities];
            writeStorage(STORAGE_KEYS.activities, nextActivities);
            setActivities(nextActivities);
            return;
        }

        const { data, error } = await supabase.from('activities').insert(batch).select();

        if (error) {
            alert(`Failed to insert demo activities: ${error.message}`);
            return;
        }

        setActivities((current) => [...data, ...current]);
    }, [activities, isMockMode, user]);

    const fillRandomResearchPapers = useCallback(async () => {
        if (!user) {
            alert('Please login as faculty first');
            return;
        }

        if (!window.confirm('This will add 3 random research papers. Continue?')) {
            return;
        }

        const topics = [
            'AI in Healthcare',
            'Blockchain for Supply Chain',
            'IoT Security Protocols',
        ];
        const journals = ['IEEE Access', 'Nature Machine Intelligence', 'ACM Transactions'];

        const batch = Array.from({ length: 3 }).map((_, index) => ({
            id: crypto.randomUUID(),
            faculty_id: user.id,
            faculty_name: user.name,
            title: `${topics[index % topics.length]}: A Practical Study`,
            abstract:
                'This paper explores recent developments and proposes an implementation-focused framework.',
            publication_date: new Date().toISOString().split('T')[0],
            journal_conference: journals[index % journals.length],
            url: 'https://doi.org/10.1109/ACCESS.2025.1234567',
            created_at: new Date().toISOString(),
        }));

        if (isMockMode) {
            const nextPapers = [...batch, ...researchPapers];
            writeStorage(STORAGE_KEYS.researchPapers, nextPapers);
            setResearchPapers(nextPapers);
            return;
        }

        const { data, error } = await supabase.from('research_papers').insert(batch).select();

        if (error) {
            alert(`Failed to insert demo papers: ${error.message}`);
            return;
        }

        setResearchPapers((current) => [...data, ...current]);
    }, [isMockMode, researchPapers, user]);

    const fillRandomCourses = useCallback(async () => {
        if (!user) {
            alert('Please login first');
            return;
        }

        const courseNames = [
            'Data Structures',
            'Database Management Systems',
            'Operating Systems',
            'Machine Learning',
            'Cloud Computing',
            'Software Engineering',
        ];

        const batch = courseNames.map((courseName, index) => ({
            id: crypto.randomUUID(),
            student_id: user.id,
            course_name: courseName,
            course_code: `CS${201 + index}`,
            credits: [4, 4, 3, 4, 3, 3][index],
            semester: String(index + 1),
            status: index < 4 ? 'completed' : 'enrolled',
            grade: index < 4 ? ['A', 'A+', 'B+', 'A'][index] : null,
            created_at: new Date().toISOString(),
        }));

        if (isMockMode) {
            const nextCourses = [...batch, ...courses];
            writeStorage(STORAGE_KEYS.courses, nextCourses);
            setCourses(nextCourses);
            return;
        }

        const { data, error } = await supabase.from('courses').insert(batch).select();

        if (error) {
            alert(`Failed to insert demo courses: ${error.message}`);
            return;
        }

        setCourses((current) => [...data, ...current]);
    }, [courses, isMockMode, user]);

    const fillRandomResults = useCallback(async () => {
        if (!user) {
            alert('Please login first');
            return;
        }

        const subjects = [
            { name: 'Data Structures', code: 'CS201', credits: 4 },
            { name: 'DBMS', code: 'CS202', credits: 4 },
            { name: 'Operating Systems', code: 'CS301', credits: 3 },
            { name: 'Computer Networks', code: 'CS302', credits: 3 },
            { name: 'Mathematics III', code: 'MA201', credits: 3 },
            { name: 'Machine Learning', code: 'CS401', credits: 4 },
        ];
        const gradeMap = { 'A+': 10, A: 9, 'B+': 8, B: 7 };
        const grades = Object.keys(gradeMap);

        const batch = [];
        for (let semester = 1; semester <= 4; semester += 1) {
            subjects.slice(0, 3).forEach((subject) => {
                const grade = grades[Math.floor(Math.random() * grades.length)];
                batch.push({
                    id: crypto.randomUUID(),
                    ...createResultRecord(user, {
                        semester: String(semester),
                        subject: subject.name,
                        subject_code: subject.code,
                        credits: subject.credits,
                        marks: Math.floor(Math.random() * 25) + 70,
                        max_marks: 100,
                        grade,
                        grade_points: gradeMap[grade],
                    }),
                });
            });
        }

        if (isMockMode) {
            const nextResults = [...batch, ...semesterResults];
            writeStorage(STORAGE_KEYS.semesterResults, nextResults);
            setSemesterResults(nextResults);
            return;
        }

        const { data, error } = await supabase.from('semester_results').insert(batch).select();

        if (error) {
            alert(`Failed to insert demo results: ${error.message}`);
            return;
        }

        setSemesterResults((current) => [...data, ...current]);
    }, [isMockMode, semesterResults, user]);

    const fillRandomDrives = useCallback(async () => {
        if (!user) {
            alert('Please login first');
            return;
        }

        const companies = [
            { name: 'TCS', role: 'Systems Engineer', pkg: 3.6, skills: ['Communication', 'Problem Solving', 'SQL'] },
            { name: 'Infosys', role: 'Digital Specialist', pkg: 6.2, skills: ['Java', 'SQL', 'Cloud'] },
            { name: 'Wipro', role: 'Project Engineer', pkg: 4.5, skills: ['Python', 'Communication', 'Aptitude'] },
            { name: 'Microsoft', role: 'SDE Intern', pkg: 18, skills: ['DSA', 'JavaScript', 'React'] },
            { name: 'Amazon', role: 'SDE-1', pkg: 20, skills: ['DSA', 'System Design', 'Leadership'] },
        ];

        const departments = [
            'Computer Science',
            'Electronics',
            'Information Technology',
            'Mechanical',
        ];

        const createdAt = new Date().toISOString();
        const driveBatch = companies.map((company, index) => ({
            id: crypto.randomUUID(),
            company_name: company.name,
            role_offered: company.role,
            package_lpa: company.pkg,
            drive_date: new Date(Date.now() + (index + 2) * 86400000 * 4).toISOString().split('T')[0],
            application_deadline: new Date(Date.now() + (index + 1) * 86400000 * 3).toISOString().split('T')[0],
            eligibility_cgpa: Number((6 + Math.random() * 2).toFixed(1)),
            eligible_departments: departments.slice(0, 2 + (index % 2)),
            required_skills: company.skills,
            openings: 5 + index,
            status: index < 3 ? 'open' : 'upcoming',
            description: `${company.name} is hiring for ${company.role}. Students with strong fundamentals and placement readiness are encouraged to apply.`,
            created_by: user.id,
            created_at: createdAt,
        }));

        const testBatch = driveBatch.map((drive) => ({
            id: crypto.randomUUID(),
            drive_id: drive.id,
            title: `${drive.company_name} Aptitude Round`,
            company_name: drive.company_name,
            description: `Timed aptitude practice for ${drive.role_offered}`,
            duration_minutes: 30,
            passing_score: 60,
            questions: buildDefaultAptitudeQuestions(drive.required_skills, drive.company_name),
            created_by: user.id,
            created_at: createdAt,
        }));

        if (isMockMode) {
            const nextDrives = [...driveBatch, ...placementDrives];
            const nextTests = [...testBatch, ...aptitudeTests];
            const studentUsers = readStorage(STORAGE_KEYS.users).filter(
                (profile) => profile.role === 'student'
            );
            const generatedNotifications = driveBatch.flatMap((drive) =>
                studentUsers.map((studentProfile) =>
                    createNotification({
                        profileId: studentProfile.id,
                        driveId: drive.id,
                        title: `${drive.company_name} drive is live`,
                        message: `${drive.role_offered} applications open until ${drive.application_deadline}.`,
                    })
                )
            );

            writeStorage(STORAGE_KEYS.placementDrives, nextDrives);
            writeStorage(STORAGE_KEYS.aptitudeTests, nextTests);
            writeStorage(STORAGE_KEYS.placementNotifications, [
                ...generatedNotifications,
                ...readStorage(STORAGE_KEYS.placementNotifications),
            ]);
            setPlacementDrives(nextDrives);
            setAptitudeTests(nextTests);
            setNotifications(readStorage(STORAGE_KEYS.placementNotifications));
            return;
        }

        const { error: drivesError } = await supabase.from('placement_drives').insert(driveBatch);

        if (drivesError) {
            alert(`Failed to insert demo drives: ${drivesError.message}`);
            return;
        }

        await supabase.from('aptitude_tests').insert(testBatch);
        await fetchData();
    }, [aptitudeTests, fetchData, isMockMode, placementDrives, user]);

    const value = useMemo(
        () => ({
            activities,
            researchPapers,
            categories,
            auditLog,
            courses,
            semesterResults,
            placementDrives,
            placementApplications,
            notifications,
            aptitudeTests,
            aptitudeAttempts,
            users,
            addActivity,
            deleteRejectedActivity,
            addResearchPaper,
            updateStatus,
            addCategory,
            addCourse,
            addSemesterResult,
            updateResultStatus,
            addPlacementDrive,
            updatePlacementDrive,
            applyToDrive,
            markNotificationRead,
            submitAptitudeAttempt,
            fillRandomData,
            fillRandomResearchPapers,
            fillRandomCourses,
            fillRandomResults,
            fillRandomDrives,
            getAllUsers,
            refreshData: fetchData,
            loading,
        }),
        [
            activities,
            addActivity,
            addCategory,
            addCourse,
            addPlacementDrive,
            addResearchPaper,
            addSemesterResult,
            applyToDrive,
            aptitudeAttempts,
            aptitudeTests,
            auditLog,
            categories,
            courses,
            deleteRejectedActivity,
            fetchData,
            fillRandomCourses,
            fillRandomData,
            fillRandomDrives,
            fillRandomResearchPapers,
            fillRandomResults,
            getAllUsers,
            loading,
            markNotificationRead,
            notifications,
            placementApplications,
            placementDrives,
            researchPapers,
            semesterResults,
            submitAptitudeAttempt,
            updatePlacementDrive,
            updateResultStatus,
            updateStatus,
            users,
        ]
    );

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);
