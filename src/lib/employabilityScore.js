/**
 * Employability Score Engine
 * Computes a weighted score (0–100) from a student's approved activities.
 *
 * Score weights:
 *   Internship       → +15
 *   Research Paper   → +12
 *   Certification    → +10
 *   Soft Skills Test → +10
 *   Hackathon        → +8
 *   (Any other)      → +5
 */

const SCORE_WEIGHTS = {
    'Internship': 15,
    'Research Paper': 12,
    'Certification': 10,
    'Soft Skills Test': 10,
    'Hackathon': 8,
};

const DEFAULT_WEIGHT = 5;
const MAX_SCORE = 100;

/**
 * @param {Array} activities - All activities for a student
 * @returns {{ score: number, breakdown: Array, level: string, levelColor: string }}
 */
export function computeEmployabilityScore(activities) {
    const approved = activities.filter(a => a.status === 'approved');

    const breakdown = [];
    let rawScore = 0;

    // Aggregate by category
    const categoryMap = {};
    for (const activity of approved) {
        const cat = activity.category || 'Other';
        if (!categoryMap[cat]) categoryMap[cat] = 0;
        categoryMap[cat]++;
    }

    for (const [cat, count] of Object.entries(categoryMap)) {
        const weight = SCORE_WEIGHTS[cat] ?? DEFAULT_WEIGHT;
        const points = weight * count;
        rawScore += points;
        breakdown.push({ category: cat, count, weight, points });
    }

    const score = Math.min(rawScore, MAX_SCORE);

    // Level classification
    let level, levelColor;
    if (score >= 80) { level = 'Elite'; levelColor = 'text-purple-600'; }
    else if (score >= 60) { level = 'High'; levelColor = 'text-green-600'; }
    else if (score >= 40) { level = 'Medium'; levelColor = 'text-yellow-600'; }
    else if (score > 0) { level = 'Low'; levelColor = 'text-orange-500'; }
    else { level = 'None'; levelColor = 'text-gray-400'; }

    return { score, breakdown, level, levelColor, approvedCount: approved.length };
}

/**
 * Compute scores for a list of students given all activities.
 * @param {Array} users  - Array of user objects with at least { id, name, department }
 * @param {Array} activities - All activities across all students
 * @returns {Array} sorted by score descending
 */
export function computeAllStudentScores(users, activities) {
    return users
        .map(u => {
            const studentActivities = activities.filter(a => a.student_id === u.id);
            const { score, breakdown, level, levelColor, approvedCount } = computeEmployabilityScore(studentActivities);
            return { ...u, score, breakdown, level, levelColor, approvedCount };
        })
        .sort((a, b) => b.score - a.score);
}
