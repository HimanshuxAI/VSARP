
// Mock Data for Initial Seeding
const MOCK_CAREERS = [
    {
        id: 'c1',
        title: 'Software Developer',
        industry: 'Technology',
        description: 'Design, build, and maintain software applications.',
        average_salary: 800000,
        growth_outlook: 'High',
        required_skills: [
            { id: 's1', name: 'Python', level: 'Intermediate' },
            { id: 's2', name: 'JavaScript', level: 'Advanced' },
            { id: 's3', name: 'SQL', level: 'Intermediate' },
            { id: 's4', name: 'Problem Solving', level: 'Advanced' }
        ]
    },
    {
        id: 'c2',
        title: 'Data Analyst',
        industry: 'Data Science',
        description: 'Interpret complex data to help companies make decisions.',
        average_salary: 700000,
        growth_outlook: 'Very High',
        required_skills: [
            { id: 's1', name: 'Python', level: 'Advanced' },
            { id: 's3', name: 'SQL', level: 'Advanced' },
            { id: 's5', name: 'Excel', level: 'Advanced' },
            { id: 's6', name: 'Data Visualization', level: 'Intermediate' }
        ]
    },
    {
        id: 'c3',
        title: 'Product Manager',
        industry: 'Technology',
        description: 'Guide the success of a product and lead the cross-functional team.',
        average_salary: 1200000,
        growth_outlook: 'High',
        required_skills: [
            { id: 's7', name: 'Communication', level: 'Expert' },
            { id: 's8', name: 'Agile Methodologies', level: 'Advanced' },
            { id: 's9', name: 'User Research', level: 'Intermediate' }
        ]
    },
    {
        id: 'c4',
        title: 'Digital Marketing Specialist',
        industry: 'Marketing',
        description: 'Develop, implement, and manage marketing campaigns.',
        average_salary: 500000,
        growth_outlook: 'Modify',
        required_skills: [
            { id: 's10', name: 'SEO', level: 'Advanced' },
            { id: 's11', name: 'Content Creation', level: 'Intermediate' },
            { id: 's12', name: 'Social Media', level: 'Expert' }
        ]
    }
];

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API services for querying available career paths, set student goals,
 * submit assessment responses, and compute skill gap analyses.
 */
export const careerApi = {
    // Fetch all available career paths
    getCareers: async () => {
        await delay(500);
        return MOCK_CAREERS;
    },

    // Get student's current goal
    getStudentGoal: async (studentId) => {
        await delay(300);
        const goals = JSON.parse(localStorage.getItem('vsarp_student_goals') || '[]');
        return goals.find(g => g.student_id === studentId);
    },

    // Set or Update student's career goal
    setStudentGoal: async (studentId, careerId) => {
        await delay(500);
        const goals = JSON.parse(localStorage.getItem('vsarp_student_goals') || '[]');
        const career = MOCK_CAREERS.find(c => c.id === careerId);
        
        const newGoal = {
            id: crypto.randomUUID(),
            student_id: studentId,
            career_id: careerId,
            career_title: career ? career.title : 'Unknown', // Denormalized for ease
            status: 'in_progress',
            target_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            created_at: new Date().toISOString()
        };

        // Remove old goal if exists (assuming 1 active goal for simplicity)
        const filteredGoals = goals.filter(g => g.student_id !== studentId);
        filteredGoals.push(newGoal);
        
        localStorage.setItem('vsarp_student_goals', JSON.stringify(filteredGoals));
        return newGoal;
    },

    // Save interest assessment results acting as a rudimentary "AI" recommendation
    submitAssessment: async (studentId, answers) => {
        await delay(1500); // Simulate AI processing
        
        // Simple heuristic: map answers to careers
        console.log("Processing answers for:", studentId, answers);
        
        // Mock "AI" Response - returns suggested careers based on simple keyword matching or random
        // In a real app, this would call an LLM.
        let suggestedIds = [];
        if (answers.interests.includes('coding') || answers.interests.includes('building')) {
            suggestedIds.push('c1');
        }
        if (answers.interests.includes('data') || answers.interests.includes('analysis')) {
            suggestedIds.push('c2');
        }
        if (answers.interests.includes('leading') || answers.interests.includes('strategy')) {
            suggestedIds.push('c3');
        }
        if (answers.interests.includes('creative') || answers.interests.includes('social')) {
            suggestedIds.push('c4');
        }

        // Default fallback
        if (suggestedIds.length === 0) suggestedIds = ['c1', 'c2'];

        const suggestions = MOCK_CAREERS.filter(c => suggestedIds.includes(c.id));
        return suggestions;
    },

    // Get Skill Gap (Mock Analysis)
    getSkillGap: async (studentId, careerId) => {
        await delay(800);
        const career = MOCK_CAREERS.find(c => c.id === careerId);
        if (!career) throw new Error("Career not found");

        // Mock student skills - in real app, fetch from DB
        const studentSkills = JSON.parse(localStorage.getItem('vsarp_student_skills') || '[]');
        const mySkills = studentSkills.filter(s => s.student_id === studentId);

        const gaps = career.required_skills.map(reqStatus => {
            const mySkill = mySkills.find(s => s.skill_id === reqStatus.id);
            // Simple gap logic: if no skill, high gap.
            let gapLevel = 'High';
            let currentLevel = 'None';

            if (mySkill) {
                currentLevel = mySkill.current_level;
                if (currentLevel === reqStatus.level) gapLevel = 'None';
                else if (currentLevel === 'Advanced' && reqStatus.level === 'Intermediate') gapLevel = 'None';
                else gapLevel = 'Moderate';
            }

            return {
                ...reqStatus,
                current_level: currentLevel,
                gap_level: gapLevel
            };
        });

        // Calculate readiness score
        const totalSkills = gaps.length;
        const mastered = gaps.filter(g => g.gap_level === 'None').length;
        const moderate = gaps.filter(g => g.gap_level === 'Moderate').length;
        const score = Math.round(((mastered + (moderate * 0.5)) / totalSkills) * 100);

        return {
            career_title: career.title,
            readiness_score: score,
            skill_gaps: gaps
        };
    }
};
