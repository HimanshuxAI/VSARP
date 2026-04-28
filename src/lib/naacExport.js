/**
 * NAAC Self Study Report (SSR) Export Engine
 *
 * Generates structured, NAAC-criterion-aligned data from VSARP platform metrics.
 * Supports CSV and JSON export formats.
 *
 * NAAC Criteria Covered:
 *   1 – Curricular Aspects
 *   2 – Teaching-Learning & Evaluation
 *   3 – Research, Innovations & Extension
 *   5 – Student Support & Progression
 *   6 – Governance, Leadership & Management
 */

// ─── NAAC SSR Schema ────────────────────────────────────────────────

const NAAC_CRITERIA = [
    {
        criterion: '1',
        title: 'Curricular Aspects',
        indicators: [
            { id: '1.1.1', metric: 'Courses with syllabi revision in last 5 years', unit: '%', benchmark: 33 },
            { id: '1.2.1', metric: 'Programs with CBCS / Elective course system', unit: 'count', benchmark: null },
            { id: '1.3.1', metric: 'Value-added courses offered', unit: 'count', benchmark: 5 },
            { id: '1.4.1', metric: 'Structured feedback collected from stakeholders', unit: 'Yes/No', benchmark: null },
        ],
    },
    {
        criterion: '2',
        title: 'Teaching-Learning & Evaluation',
        indicators: [
            { id: '2.1.1', metric: 'Average enrollment percentage', unit: '%', benchmark: 80 },
            { id: '2.3.1', metric: 'Student-centric methods used (experiential, participative)', unit: 'count', benchmark: 3 },
            { id: '2.5.1', metric: 'Average pass percentage of students', unit: '%', benchmark: 75 },
            { id: '2.6.1', metric: 'Attainment of Program Outcomes (POs)', unit: '%', benchmark: 60 },
        ],
    },
    {
        criterion: '3',
        title: 'Research, Innovations & Extension',
        indicators: [
            { id: '3.1.1', metric: 'Grants received for research projects (INR Lakhs)', unit: 'INR', benchmark: null },
            { id: '3.3.1', metric: 'Number of research papers published per teacher', unit: 'ratio', benchmark: 0.5 },
            { id: '3.4.1', metric: 'Extension activities conducted', unit: 'count', benchmark: 5 },
            { id: '3.5.1', metric: 'Number of MoUs / collaborations', unit: 'count', benchmark: 3 },
        ],
    },
    {
        criterion: '5',
        title: 'Student Support & Progression',
        indicators: [
            { id: '5.1.1', metric: 'Students benefited by scholarships / freeships', unit: '%', benchmark: 25 },
            { id: '5.1.3', metric: 'Capacity building & skills enhancement initiatives', unit: 'count', benchmark: 5 },
            { id: '5.2.1', metric: 'Placement percentage of outgoing students', unit: '%', benchmark: 50 },
            { id: '5.2.2', metric: 'Students qualifying higher education entrance exams', unit: '%', benchmark: 10 },
            { id: '5.3.1', metric: 'Students participating in co-curricular activities', unit: '%', benchmark: 50 },
        ],
    },
    {
        criterion: '6',
        title: 'Governance, Leadership & Management',
        indicators: [
            { id: '6.2.1', metric: 'e-Governance areas implemented', unit: 'count', benchmark: 4 },
            { id: '6.3.1', metric: 'Faculty development programs conducted', unit: 'count', benchmark: 5 },
            { id: '6.5.1', metric: 'Internal Quality Assurance Cell (IQAC) meetings', unit: 'count', benchmark: 2 },
        ],
    },
];

// ─── Auto-Computation Layer ─────────────────────────────────────────

function computeStatus(value, benchmark) {
    if (value === null || value === undefined || value === '') return 'Missing';
    if (benchmark === null) return 'Complete';
    const numVal = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numVal)) return 'Partial';
    return numVal >= benchmark ? 'Complete' : 'Partial';
}

function computeGap(value, benchmark) {
    if (benchmark === null || value === null || value === undefined) return '—';
    const numVal = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numVal)) return '—';
    const gap = numVal - benchmark;
    if (gap >= 0) return `+${gap.toFixed(1)} (Above)`;
    return `${gap.toFixed(1)} (Below)`;
}

// ─── Auto Summary Generator ─────────────────────────────────────────

function generateSummary(indicator, value, status) {
    const templates = {
        Complete: `${indicator.metric}: Achieved ${value}${indicator.unit === '%' ? '%' : ''}, meeting the benchmark of ${indicator.benchmark || 'N/A'}.`,
        Partial: `${indicator.metric}: Currently at ${value}${indicator.unit === '%' ? '%' : ''}, below the benchmark of ${indicator.benchmark}. Action needed.`,
        Missing: `${indicator.metric}: Data not yet available. Requires immediate data collection.`,
    };
    return templates[status] || templates.Missing;
}

// ─── Platform Data → NAAC Values ────────────────────────────────────

export function computeNAACMetrics({
    students = [],
    faculty = [],
    activities = [],
    researchPapers = [],
    semesterResults = [],
    placementDrives = [],
    placementApplications = [],
    courses = [],
    department = 'All',
}) {
    const approvedActivities = activities.filter(a => a.status === 'approved');
    const uniqueActiveStudents = new Set(approvedActivities.map(a => a.student_id));
    const totalStudents = students.length || 1;
    const totalFaculty = faculty.length || 1;

    // Placement rate
    const appliedStudents = new Set(placementApplications.map(a => a.student_id));
    const placedStudents = new Set(
        placementApplications.filter(a => a.status === 'selected' || a.status === 'placed').map(a => a.student_id)
    );
    const placementRate = totalStudents > 0 ? Math.round((placedStudents.size / totalStudents) * 100) : 0;

    // Pass percentage from semester results
    const passedResults = semesterResults.filter(r => {
        const grade = (r.grade || '').toUpperCase();
        return !['F', 'FF', 'FAIL', 'AB'].includes(grade);
    });
    const passPercentage = semesterResults.length > 0
        ? Math.round((passedResults.length / semesterResults.length) * 100)
        : 0;

    // Activity category counts
    const categoryMap = {};
    approvedActivities.forEach(a => {
        const cat = a.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const participationRate = Math.round((uniqueActiveStudents.size / totalStudents) * 100);
    const papersPerTeacher = totalFaculty > 0 ? (researchPapers.length / totalFaculty).toFixed(2) : 0;

    // Skills enhancement (internships, certifications, hackathons)
    const skillsActivities = approvedActivities.filter(a =>
        ['Internship', 'Certification', 'Hackathon', 'Soft Skills Test'].includes(a.category)
    );

    // Build values map for each indicator
    const valueMap = {
        '1.1.1': null,  // syllabi revision — not tracked in VSARP
        '1.2.1': null,  // CBCS — not tracked
        '1.3.1': new Set(skillsActivities.map(a => a.category)).size,
        '1.4.1': 'Yes', // VSARP itself is a feedback system
        '2.1.1': null,   // enrollment — not directly tracked
        '2.3.1': Object.keys(categoryMap).length,
        '2.5.1': passPercentage,
        '2.6.1': null,   // PO attainment — not tracked
        '3.1.1': null,   // grants — not tracked
        '3.3.1': Number(papersPerTeacher),
        '3.4.1': categoryMap['Social Service'] || 0,
        '3.5.1': null,   // MoUs — not tracked
        '5.1.1': null,   // scholarships — not tracked
        '5.1.3': skillsActivities.length,
        '5.2.1': placementRate,
        '5.2.2': null,   // higher ed exams — not tracked
        '5.3.1': participationRate,
        '6.2.1': 1,      // VSARP itself = 1 e-governance area
        '6.3.1': null,   // FDPs — not tracked
        '6.5.1': null,   // IQAC — not tracked
    };

    return { valueMap, meta: { department, totalStudents, totalFaculty, generatedAt: new Date().toISOString() } };
}

// ─── Full SSR Report Generation ─────────────────────────────────────

export function generateNAACReport(platformData) {
    const { valueMap, meta } = computeNAACMetrics(platformData);

    const rows = [];
    for (const criterion of NAAC_CRITERIA) {
        for (const indicator of criterion.indicators) {
            const value = valueMap[indicator.id];
            const status = computeStatus(value, indicator.benchmark);
            const gap = computeGap(value, indicator.benchmark);
            const summary = generateSummary(indicator, value, status);

            rows.push({
                criterion: criterion.criterion,
                criterion_title: criterion.title,
                indicator_id: indicator.id,
                metric: indicator.metric,
                unit: indicator.unit,
                benchmark: indicator.benchmark ?? '—',
                value: value ?? '—',
                status,
                gap_analysis: gap,
                auto_summary: summary,
            });
        }
    }

    return { rows, meta, criteria: NAAC_CRITERIA };
}

// ─── Export Functions ────────────────────────────────────────────────

export function exportNAACToCSV(rows, filename = 'naac_ssr_report.csv') {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(','),
        ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportNAACToJSON(rows, meta, filename = 'naac_ssr_report.json') {
    const data = { meta, report: rows, generated_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export { NAAC_CRITERIA };
