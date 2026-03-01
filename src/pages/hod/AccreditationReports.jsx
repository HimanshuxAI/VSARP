import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Download, FileBarChart, Users, BookOpen, Award, Activity } from 'lucide-react';
import { Button } from '../../components/ui/button';

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

export default function AccreditationReports() {
    const { user } = useAuth();
    const { activities, researchPapers, getAllUsers, loading } = useData();
    const dept = user.department || 'Computer Science';

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

    // Category breakdown
    const categoryBreakdown = useMemo(() => {
        const map = {};
        approvedActs.forEach(a => { map[a.category || 'Other'] = (map[a.category || 'Other'] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [approvedActs]);

    // Outcome type breakdown
    const outcomeBreakdown = useMemo(() => {
        const map = {};
        approvedActs.forEach(a => { map[a.outcome_type || 'Other'] = (map[a.outcome_type || 'Other'] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [approvedActs]);

    const reportData = useMemo(() => ({
        'Department': dept,
        'Total Students': deptStudents.length,
        'Total Faculty': deptFaculty.length,
        'Total Activities Submitted': deptActivities.length,
        'Approved Activities': approvedActs.length,
        'Participation Rate': `${participationRate}%`,
        'Research Publications': deptPapers.length,
        'Activity Categories': categoryBreakdown.map(([n, v]) => `${n}: ${v}`).join(', '),
    }), [dept, deptStudents, deptFaculty, deptActivities, approvedActs, participationRate, deptPapers, categoryBreakdown]);

    const exportReport = () => {
        const rows = Object.entries(reportData).map(([metric, value]) => ({ Metric: metric, Value: value }));
        downloadCSV(rows, `${dept}_accreditation_report.csv`);
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
                <Button onClick={exportReport} className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg flex items-center gap-2 self-start text-xs sm:text-sm">
                    <Download className="w-4 h-4" /> Export Report (CSV)
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { label: 'Students', value: deptStudents.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Faculty', value: deptFaculty.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Participation', value: `${participationRate}%`, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Approved Activities', value: approvedActs.length, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Research Papers', value: deptPapers.length, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Activity Types', value: categoryBreakdown.length, icon: FileBarChart, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <Icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">{card.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Categories */}
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

                {/* Outcome Types */}
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

            {/* Research Papers Table */}
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
