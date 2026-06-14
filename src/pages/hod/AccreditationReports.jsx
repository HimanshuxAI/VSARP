import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Download, FileBarChart, Users, BookOpen, Award, Activity, CheckCircle2, AlertTriangle, XCircle, FileJson } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { generateNAACReport, exportNAACToCSV, exportNAACToJSON } from '../../lib/naacExport';

function downloadCSV(rows, filename) {
    const headers = Object.keys(rows[0] || {});
    const csvContent = [
        headers.join(','),
        ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

/**
 * AccreditationReports aggregates co-curricular activities and research metrics
 * into formal NAAC SSR indicator lists (Criteria 1, 2, 3, 5, 6).
 */
export default function AccreditationReports() {
    const { user } = useAuth();
    const { activities, researchPapers, semesterResults, courses, placementDrives, placementApplications, getAllUsers, loading } = useData();
    const dept = user.department || 'Computer Science';
    const [showNAAC, setShowNAAC] = useState(false);

    const allUsers = useMemo(() => getAllUsers(), [getAllUsers]);
    const deptStudents = useMemo(() => allUsers.filter(u => u.role === 'student' && (u.department || 'General') === dept), [allUsers, dept]);
    const deptFaculty = useMemo(() => allUsers.filter(u => u.role === 'faculty' && (u.department || 'General') === dept), [allUsers, dept]);
    const deptActivities = useMemo(() => activities.filter(a => (a.department || 'General') === dept), [activities, dept]);
    const approvedActs = useMemo(() => deptActivities.filter(a => a.status === 'approved'), [deptActivities]);
    const deptPapers = useMemo(() => researchPapers.filter(p => {
        const faculty = allUsers.find(u => u.id === p.faculty_id);
        return faculty && (faculty.department || 'General') === dept;
    }), [researchPapers, allUsers, dept]);

    const participationRate = deptStudents.length ? Math.round(new Set(approvedActs.map(a => a.student_id)).size / deptStudents.length * 100) : 0;

    const categoryBreakdown = useMemo(() => {
        const map = {};
        approvedActs.forEach(a => { map[a.category || 'Other'] = (map[a.category || 'Other'] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [approvedActs]);

    const outcomeBreakdown = useMemo(() => {
        const map = {};
        approvedActs.forEach(a => { map[a.outcome_type || 'Other'] = (map[a.outcome_type || 'Other'] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [approvedActs]);

    // NAAC SSR Report
    const naacReport = useMemo(() => generateNAACReport({
        students: deptStudents, faculty: deptFaculty, activities: deptActivities,
        researchPapers: deptPapers, semesterResults, placementDrives, placementApplications, courses, department: dept,
    }), [deptStudents, deptFaculty, deptActivities, deptPapers, semesterResults, placementDrives, placementApplications, courses, dept]);

    const naacSummary = useMemo(() => {
        const complete = naacReport.rows.filter(r => r.status === 'Complete').length;
        const partial = naacReport.rows.filter(r => r.status === 'Partial').length;
        const missing = naacReport.rows.filter(r => r.status === 'Missing').length;
        return { complete, partial, missing, total: naacReport.rows.length };
    }, [naacReport]);

    const reportData = useMemo(() => ({
        'Department': dept, 'Total Students': deptStudents.length, 'Total Faculty': deptFaculty.length,
        'Total Activities Submitted': deptActivities.length, 'Approved Activities': approvedActs.length,
        'Participation Rate': `${participationRate}%`, 'Research Publications': deptPapers.length,
        'Activity Categories': categoryBreakdown.map(([n, v]) => `${n}: ${v}`).join(', '),
    }), [dept, deptStudents, deptFaculty, deptActivities, approvedActs, participationRate, deptPapers, categoryBreakdown]);

    const exportReport = () => {
        const rows = Object.entries(reportData).map(([metric, value]) => ({ Metric: metric, Value: value }));
        downloadCSV(rows, `${dept}_accreditation_report.csv`);
    };

    const statusIcon = (status) => {
        if (status === 'Complete') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
        if (status === 'Partial') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        return <XCircle className="w-4 h-4 text-red-400" />;
    };

    const statusBg = (status) => {
        if (status === 'Complete') return 'bg-emerald-50 text-emerald-700';
        if (status === 'Partial') return 'bg-amber-50 text-amber-700';
        return 'bg-red-50 text-red-600';
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900" />
        </div>
    );

    return (
        <div className="space-y-6 animate-enter pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Accreditation Reports</h2>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">NAAC / NBA style metrics for {dept}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={exportReport} variant="outline" className="text-xs sm:text-sm">
                        <Download className="w-4 h-4 mr-2" /> Dept Report
                    </Button>
                    <Button onClick={() => setShowNAAC(!showNAAC)} className="bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm">
                        <FileBarChart className="w-4 h-4 mr-2" /> {showNAAC ? 'Hide' : 'Show'} NAAC SSR
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { label: 'Students', value: deptStudents.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Faculty', value: deptFaculty.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Participation', value: `${participationRate}%`, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Approved', value: approvedActs.length, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Research Papers', value: deptPapers.length, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Activity Types', value: categoryBreakdown.length, icon: FileBarChart, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}><Icon className={`w-6 h-6 ${card.color}`} /></div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">{card.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ═══════ NAAC SSR Section ═══════ */}
            {showNAAC && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">NAAC SSR Readiness</h3>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => exportNAACToCSV(naacReport.rows, `${dept}_naac_ssr.csv`)} className="text-xs">
                                    <Download className="w-3 h-3 mr-1" /> CSV
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => exportNAACToJSON(naacReport.rows, naacReport.meta, `${dept}_naac_ssr.json`)} className="text-xs">
                                    <FileJson className="w-3 h-3 mr-1" /> JSON
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="rounded-xl bg-emerald-50 p-4 text-center">
                                <p className="text-2xl font-bold text-emerald-700">{naacSummary.complete}</p>
                                <p className="text-xs font-semibold text-emerald-600 uppercase">Complete</p>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-4 text-center">
                                <p className="text-2xl font-bold text-amber-700">{naacSummary.partial}</p>
                                <p className="text-xs font-semibold text-amber-600 uppercase">Partial</p>
                            </div>
                            <div className="rounded-xl bg-red-50 p-4 text-center">
                                <p className="text-2xl font-bold text-red-600">{naacSummary.missing}</p>
                                <p className="text-xs font-semibold text-red-500 uppercase">Missing</p>
                            </div>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full" style={{ width: `${(naacSummary.complete / naacSummary.total) * 100}%` }} />
                            <div className="bg-amber-400 h-full" style={{ width: `${(naacSummary.partial / naacSummary.total) * 100}%` }} />
                            <div className="bg-red-300 h-full" style={{ width: `${(naacSummary.missing / naacSummary.total) * 100}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{Math.round(((naacSummary.complete + naacSummary.partial * 0.5) / naacSummary.total) * 100)}% overall readiness</p>
                    </div>

                    {naacReport.criteria.map(criterion => {
                        const criterionRows = naacReport.rows.filter(r => r.criterion === criterion.criterion);
                        return (
                            <div key={criterion.criterion} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-900">Criterion {criterion.criterion}: {criterion.title}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-slate-50/50 text-xs text-slate-500 uppercase font-semibold">
                                            <tr>
                                                <th className="px-4 py-3 text-left">ID</th>
                                                <th className="px-4 py-3 text-left">Metric</th>
                                                <th className="px-4 py-3 text-center">Value</th>
                                                <th className="px-4 py-3 text-center">Benchmark</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                                <th className="px-4 py-3 text-center">Gap</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {criterionRows.map(row => (
                                                <tr key={row.indicator_id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.indicator_id}</td>
                                                    <td className="px-4 py-3 text-slate-800 font-medium max-w-[300px]">{row.metric}</td>
                                                    <td className="px-4 py-3 text-center font-bold text-slate-900">{row.value}</td>
                                                    <td className="px-4 py-3 text-center text-slate-500">{row.benchmark}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBg(row.status)}`}>
                                                            {statusIcon(row.status)} {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-xs text-slate-600">{row.gap_analysis}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Activity Category Breakdown</h3>
                    {categoryBreakdown.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-6">No data</p>
                    ) : (
                        <div className="space-y-3">
                            {categoryBreakdown.map(([cat, count]) => (
                                <div key={cat}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-800">{cat}</span>
                                        <span className="font-bold text-slate-900">{count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${(count / approvedActs.length) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Outcome Type Distribution</h3>
                    {outcomeBreakdown.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-6">No data</p>
                    ) : (
                        <div className="space-y-3">
                            {outcomeBreakdown.map(([ot, count]) => (
                                <div key={ot}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-800">{ot}</span>
                                        <span className="font-bold text-slate-900">{count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / approvedActs.length) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Research Papers */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Faculty Research Publications ({deptPapers.length})</h3>
                {deptPapers.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">No publications recorded.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Title</th>
                                    <th className="px-4 py-3 text-left">Faculty</th>
                                    <th className="px-4 py-3 text-left">Journal</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {deptPapers.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-semibold text-slate-900 max-w-[200px] truncate">{p.title}</td>
                                        <td className="px-4 py-3 text-slate-600">{p.faculty_name}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{p.journal_conference}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{p.publication_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
