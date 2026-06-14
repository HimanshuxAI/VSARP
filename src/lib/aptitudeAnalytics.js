function numericScore(attempt) {
    return Number(attempt?.score || 0);
}

function byNewestAttempt(left, right) {
    return new Date(right.submitted_at || 0) - new Date(left.submitted_at || 0);
}

/**
 * Computes student performance metrics across mock/real aptitude assessments.
 * Calculates best score, average score, pass rate, and percentile rank.
 */
export function computeStudentAptitudeAnalytics({
    allAttempts = [],
    studentId,
} = {}) {
    const studentAttempts = allAttempts
        .filter((attempt) => attempt.student_id === studentId)
        .sort(byNewestAttempt);
    const totalAttempts = studentAttempts.length;
    const passedAttempts = studentAttempts.filter((attempt) => attempt.passed);
    const scores = studentAttempts.map(numericScore);

    const bestScore = scores.length ? Math.max(...scores) : null;
    const averageScore = scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;
    const passRate = totalAttempts
        ? Math.round((passedAttempts.length / totalAttempts) * 100)
        : 0;

    const allPassedScores = allAttempts
        .filter((attempt) => attempt.passed)
        .map(numericScore)
        .sort((left, right) => left - right);
    const bestPassedScore = passedAttempts.length
        ? Math.max(...passedAttempts.map(numericScore))
        : null;
    const percentile =
        bestPassedScore !== null && allPassedScores.length
            ? Math.round(
                  (allPassedScores.filter((score) => score <= bestPassedScore).length /
                      allPassedScores.length) *
                      100
              )
            : null;

    return {
        totalAttempts,
        passedAttempts: passedAttempts.length,
        failedAttempts: totalAttempts - passedAttempts.length,
        bestScore,
        averageScore,
        passRate,
        percentile,
        latestAttempt: studentAttempts[0] || null,
    };
}
