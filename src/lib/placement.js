const RESULT_VERIFIER = 'Controller of Examinations';

export function normalizeSkill(value = '') {
    return value.trim().toLowerCase();
}

export function uniqueValues(values = []) {
    return [...new Set(values.filter(Boolean))];
}

export function parseSkillInput(input) {
    if (Array.isArray(input)) {
        return uniqueValues(input.map((item) => item?.trim()).filter(Boolean));
    }

    if (typeof input !== 'string') {
        return [];
    }

    return uniqueValues(
        input
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter(Boolean)
    );
}

export function generateVerificationHash(prefix = 'vsarp') {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}

export function computeCgpa(results, studentId) {
    const scopedResults = studentId
        ? results.filter((result) => result.student_id === studentId)
        : results;

    const totalCredits = scopedResults.reduce(
        (sum, result) => sum + Number(result.credits || 0),
        0
    );
    const weightedPoints = scopedResults.reduce(
        (sum, result) =>
            sum + Number(result.grade_points || 0) * Number(result.credits || 0),
        0
    );

    if (!totalCredits) {
        return 0;
    }

    return Number((weightedPoints / totalCredits).toFixed(2));
}

export function getStudentSkills({
    activities = [],
    courses = [],
    semesterResults = [],
    studentId,
    profileSkills = [],
}) {
    const approvedActivities = activities.filter(
        (activity) =>
            activity.student_id === studentId && activity.status === 'approved'
    );
    const completedCourses = courses.filter(
        (course) =>
            course.student_id === studentId &&
            ['completed', 'verified'].includes(course.status)
    );
    const verifiedResults = semesterResults.filter(
        (result) =>
            result.student_id === studentId &&
            result.verification_status === 'verified'
    );

    return uniqueValues([
        ...parseSkillInput(profileSkills),
        ...approvedActivities.flatMap((activity) =>
            parseSkillInput(activity.skill_tag)
        ),
        ...completedCourses.map((course) => course.course_name),
        ...verifiedResults.map((result) => result.subject),
    ]);
}

export function matchDriveToStudent({
    drive,
    department,
    cgpa,
    skills = [],
}) {
    const requiredSkills = parseSkillInput(drive.required_skills);
    const normalizedStudentSkills = new Set(skills.map(normalizeSkill));
    const matchedSkills = requiredSkills.filter((skill) =>
        normalizedStudentSkills.has(normalizeSkill(skill))
    );

    const skillMatchPercent = requiredSkills.length
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 100;

    const eligibleDepartments = Array.isArray(drive.eligible_departments)
        ? drive.eligible_departments
        : [];

    const departmentEligible =
        eligibleDepartments.length === 0 ||
        eligibleDepartments.includes(department);

    const cgpaEligible =
        Number(cgpa || 0) >= Number(drive.eligibility_cgpa || 0);

    const applicationDeadline = drive.application_deadline || drive.drive_date;
    const deadlineOpen = applicationDeadline
        ? new Date(applicationDeadline) >= new Date(new Date().toDateString())
        : true;

    return {
        requiredSkills,
        matchedSkills,
        skillMatchPercent,
        departmentEligible,
        cgpaEligible,
        deadlineOpen,
        eligible: departmentEligible && cgpaEligible && deadlineOpen,
    };
}

export function createResultRecord(user, result) {
    return {
        student_id: user.id,
        semester: result.semester,
        subject: result.subject,
        subject_code: result.subject_code,
        credits: Number(result.credits),
        marks: Number(result.marks),
        max_marks: Number(result.max_marks) || 100,
        grade: result.grade,
        grade_points: Number(result.grade_points),
        verification_status: 'pending',
        verification_hash: null,
        verified_by: null,
        verified_at: null,
        created_at: new Date().toISOString(),
    };
}

export function buildDefaultAptitudeQuestions(skills = [], companyName = 'Campus Drive') {
    const focusSkills = parseSkillInput(skills);
    const headlineSkill = focusSkills[0] || 'problem solving';

    return [
        {
            id: crypto.randomUUID(),
            question: `Which option best improves ${headlineSkill} performance in timed assessments?`,
            options: [
                'Practice with timed mock sets and review weak areas',
                'Skip analytics and attempt random questions',
                'Memorize only final answers',
                'Avoid revisiting incorrect responses',
            ],
            answer: 0,
        },
        {
            id: crypto.randomUUID(),
            question: `${companyName} asks 40 questions in 40 minutes. What is the best pacing strategy?`,
            options: [
                'Spend the first 20 minutes on one hard question',
                'Aim for roughly one question per minute and flag blockers',
                'Answer only reasoning questions',
                'Leave the final 10 questions unanswered by design',
            ],
            answer: 1,
        },
        {
            id: crypto.randomUUID(),
            question: 'If a sequence doubles every step starting from 3, what is the 4th term?',
            options: ['12', '18', '24', '48'],
            answer: 2,
        },
        {
            id: crypto.randomUUID(),
            question: 'What is the best way to handle a difficult verbal-ability question?',
            options: [
                'Mark it for review and continue',
                'Panic and refresh the page',
                'Spend all remaining time on it',
                'Guess every option without reading',
            ],
            answer: 0,
        },
        {
            id: crypto.randomUUID(),
            question: 'Aptitude tests primarily help companies evaluate:',
            options: [
                'Only handwriting style',
                'Reasoning, numeracy, and decision speed',
                'Only college attendance',
                'Only social media presence',
            ],
            answer: 1,
        },
    ];
}
