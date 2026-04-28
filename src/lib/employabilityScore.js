/**
 * Employability Score Engine v2
 * Computes a weighted score (0–100) from a student's approved activities.
 *
 * v2 enhancements:
 *   - Category caps to encourage diversity
 *   - Quality normalization (Tier system)
 *   - Recency / time decay
 *   - Internship type differentiation
 *   - Percentile-based aptitude scoring
 */

// ─── Category Caps ──────────────────────────────────────────────────
// Each category has a per-item weight and a max number of counted items
const CATEGORY_CONFIG = {
    'Internship':       { weight: 15, maxItems: 2, maxPoints: 30 },
    'Research Paper':   { weight: 12, maxItems: 3, maxPoints: 36 },
    'Certification':    { weight: 10, maxItems: 3, maxPoints: 30 },
    'Soft Skills Test': { weight: 10, maxItems: 2, maxPoints: 20 },
    'Hackathon':        { weight: 8,  maxItems: 3, maxPoints: 24 },
};

const DEFAULT_CONFIG = { weight: 5, maxItems: 3, maxPoints: 15 };
const MAX_SCORE = 100;

// ─── Internship Type Weights ────────────────────────────────────────
const INTERNSHIP_TYPE_WEIGHTS = {
    'paid_onsite_long':  18,  // Paid On-site / Long-term (6-12m)
    'paid_remote':       15,  // Paid Remote / Hybrid
    'unpaid_onsite':     12,  // Unpaid On-site
    'short_term':        10,  // Short-term (1-3m) / Part-time
    'unpaid_remote':      8,  // Unpaid Remote
};
const DEFAULT_INTERNSHIP_WEIGHT = 15;

// ─── Certification Tier Weights ─────────────────────────────────────
const CERT_TIER_WEIGHTS = {
    'tier1': 10,  // National/Global (AWS, Google, Microsoft, etc.)
    'tier2':  5,  // College/Local
};
const DEFAULT_CERT_WEIGHT = 10;

// ─── Recency Decay ──────────────────────────────────────────────────
function getRecencyMultiplier(activityDate) {
    if (!activityDate) return 0.75;

    const now = new Date();
    const currentAcademicYearStart = new Date(
        now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1,
        5, 1  // June 1 as academic year start
    );

    const date = new Date(activityDate);
    return date >= currentAcademicYearStart ? 1.0 : 0.75;
}

// ─── Per-Activity Weight ────────────────────────────────────────────
function getActivityWeight(activity) {
    const cat = activity.category || 'Other';

    // Internship type differentiation
    if (cat === 'Internship') {
        const internshipType = activity.internship_type || '';
        return INTERNSHIP_TYPE_WEIGHTS[internshipType] || DEFAULT_INTERNSHIP_WEIGHT;
    }

    // Certification tier system
    if (cat === 'Certification') {
        const tier = activity.certification_tier || 'tier2';
        return CERT_TIER_WEIGHTS[tier] || DEFAULT_CERT_WEIGHT;
    }

    const config = CATEGORY_CONFIG[cat] || DEFAULT_CONFIG;
    return config.weight;
}

/**
 * @param {Array} activities - All activities for a student
 * @param {Object} [options] - Optional scoring context
 * @param {Array}  [options.allAttempts] - All aptitude attempts across all students (for percentile)
 * @param {Array}  [options.studentAttempts] - This student's aptitude attempts
 * @returns {{ score: number, breakdown: Array, level: string, levelColor: string, approvedCount: number }}
 */
export function computeEmployabilityScore(activities, options = {}) {
    const approved = activities.filter(a => a.status === 'approved');

    const breakdown = [];
    let rawScore = 0;

    // Group by category
    const categoryBuckets = {};
    for (const activity of approved) {
        const cat = activity.category || 'Other';
        if (!categoryBuckets[cat]) categoryBuckets[cat] = [];
        categoryBuckets[cat].push(activity);
    }

    // Score each category with caps and decay
    for (const [cat, catActivities] of Object.entries(categoryBuckets)) {
        const config = CATEGORY_CONFIG[cat] || DEFAULT_CONFIG;

        // Sort by date descending (most recent first — they get counted first under cap)
        const sorted = [...catActivities].sort(
            (a, b) => new Date(b.date || b.submitted_at || 0) - new Date(a.date || a.submitted_at || 0)
        );

        // Apply cap
        const counted = sorted.slice(0, config.maxItems);
        let categoryPoints = 0;

        for (const activity of counted) {
            const baseWeight = getActivityWeight(activity);
            const recency = getRecencyMultiplier(activity.date);
            categoryPoints += Math.round(baseWeight * recency);
        }

        // Enforce max points cap
        categoryPoints = Math.min(categoryPoints, config.maxPoints);

        rawScore += categoryPoints;
        breakdown.push({
            category: cat,
            count: catActivities.length,
            counted: counted.length,
            maxItems: config.maxItems,
            points: categoryPoints,
            maxPoints: config.maxPoints,
        });
    }

    // ─── Aptitude Percentile Bonus ──────────────────────────────────
    const { allAttempts = [], studentAttempts = [] } = options;
    const passedAttempts = studentAttempts.filter(a => a.passed);

    if (passedAttempts.length > 0 && allAttempts.length > 0) {
        // Calculate student's best score
        const bestScore = Math.max(...passedAttempts.map(a => a.score));

        // Calculate all passed scores for percentile
        const allPassedScores = allAttempts.filter(a => a.passed).map(a => a.score);
        allPassedScores.sort((a, b) => a - b);

        const rank = allPassedScores.filter(s => s <= bestScore).length;
        const percentile = allPassedScores.length > 0
            ? (rank / allPassedScores.length) * 100
            : 0;

        let aptitudeBonus;
        if (percentile >= 90) {
            aptitudeBonus = 17;  // Top 10%
        } else if (percentile >= 75) {
            aptitudeBonus = 12;  // Top 25%
        } else {
            aptitudeBonus = 10;  // Everyone else who passed
        }

        rawScore += aptitudeBonus;
        breakdown.push({
            category: 'Aptitude Tests',
            count: passedAttempts.length,
            counted: 1,
            maxItems: 1,
            points: aptitudeBonus,
            maxPoints: 17,
            percentile: Math.round(percentile),
        });
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
 * @param {Array} [allAttempts] - All aptitude attempts (optional, for percentile calc)
 * @returns {Array} sorted by score descending
 */
export function computeAllStudentScores(users, activities, allAttempts = []) {
    return users
        .map(u => {
            const studentActivities = activities.filter(a => a.student_id === u.id);
            const studentAttempts = allAttempts.filter(a => a.student_id === u.id);
            const { score, breakdown, level, levelColor, approvedCount } = computeEmployabilityScore(
                studentActivities,
                { allAttempts, studentAttempts }
            );
            return { ...u, score, breakdown, level, levelColor, approvedCount };
        })
        .sort((a, b) => b.score - a.score);
}
