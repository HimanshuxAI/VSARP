import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { computeAllStudentScores } from '../../lib/employabilityScore';
import { Download, Trophy, AlertTriangle, BarChart2, Users, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';

const THRESHOLD = 40; // Below this = at-risk

function downloadCSV(rows, filename) {
    const headers = ['Name', 'Department', 'Email', 'Score', 'Level', 'Approved Activities'];
    const csvContent = [
        headers.join(','),
        ...rows.map(r => [
            `"${r.full_name || r.name || ''}"`,
            `"${r.department || ''}"`,
            `"${r.email || ''}"`,
            r.score,
            r.level,
            r.approvedCount ?? ''
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function PlacementDashboard() {
    const { activities, getAllUsers, loading } = useData();
    const [threshold, setThreshold] = useState(THRESHOLD);

    const allUsers = useMemo(() => getAllUsers().filter(u => u.role === 'student' || !u.role), [getAllUsers]);
    const scoredStudents = useMemo(() => computeAllStudentScores(allUsers, activities), [allUsers, activities]);

    // Department readiness
    const deptMap = useMemo(() => {
        const map = {};
        for (const s of scoredStudents) {
            const dept = s.department || 'General';
            if (!map[dept]) map[dept] = { total: 0, sumScore: 0, active: 0 };
            map[dept].total++;
            map[dept].sumScore += s.score;
            if ((s.approvedCount ?? 0) >= 1) map[dept].active++;
        }
        return Object.entries(map).map(([dept, d]) => ({
            dept,
            avg: d.total ? Math.round(d.sumScore / d.total) : 0,
            participationRate: d.total ? Math.round((d.active / d.total) * 100) : 0,
            total: d.total
        })).sort((a, b) => b.avg - a.avg);
    }, [scoredStudents]);

    const top10 = scoredStudents.slice(0, 10);
    const belowThreshold = scoredStudents.filter(s => s.score < threshold);

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900" />
        </div>
    );

    return (
        <div className="space-y-8 animate-enter pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">Placement Dashboard</h2>
                    <p className="text-slate-500 mt-2 font-medium">Institutional readiness overview across all departments.</p>
                </div>
                <Button
                    onClick={() => downloadCSV(scoredStudents, 'vsarp_all_students.csv')}
                    className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download Full Report (CSV)
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: scoredStudents.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg. Score', value: scoredStudents.length ? Math.round(scoredStudents.reduce((s, u) => s + u.score, 0) / scoredStudents.length) : 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Elite (≥80)', value: scoredStudents.filter(s => s.score >= 80).length, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: `At Risk (<${threshold})`, value: belowThreshold.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <Icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{card.label}</p>
                                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Department Readiness */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-slate-600" />
                    Department Readiness %
                </h3>
                {deptMap.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">No student data yet. Ask students to fill random data.</p>
                ) : (
                    <div className="space-y-4">
                        {deptMap.map(d => (
                            <div key={d.dept}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-800">{d.dept}</span>
                                    <span>
                                        <span className="font-bold text-slate-900">{d.avg}/100</span>
                                        <span className="text-slate-400 ml-3 text-xs">{d.participationRate}% participation</span>
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${d.avg >= 60 ? 'bg-green-500' : d.avg >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                        style={{ width: `${d.avg}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{d.total} student{d.total !== 1 ? 's' : ''}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 10 Students */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Top 10 Students
                    </h3>
                    {top10.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-6">No data yet.</p>
                    ) : (
                        <ol className="space-y-3">
                            {top10.map((s, i) => (
                                <li key={s.id} className="flex items-center gap-3">
                                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{s.full_name || s.name || 'Student'}</p>
                                        <p className="text-xs text-slate-400 truncate">{s.department || '—'}</p>
                                    </div>
                                    <div className={`text-sm font-bold ${s.levelColor}`}>{s.score}</div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                {/* Below Threshold */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            At Risk Students
                        </h3>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500">Threshold:</label>
                            <input
                                type="number"
                                value={threshold}
                                onChange={e => setThreshold(Number(e.target.value))}
                                className="w-14 text-xs border border-slate-200 rounded px-2 py-1 text-center font-bold"
                                min={0} max={100}
                            />
                        </div>
                    </div>
                    {belowThreshold.length === 0 ? (
                        <p className="text-green-600 text-sm font-medium text-center py-6">✓ All students are above threshold!</p>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {belowThreshold.map(s => (
                                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{s.full_name || s.name || 'Student'}</p>
                                        <p className="text-xs text-slate-500 truncate">{s.department || '—'}</p>
                                    </div>
                                    <span className="text-sm font-bold text-red-600">{s.score}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {belowThreshold.length > 0 && (
                        <Button
                            onClick={() => downloadCSV(belowThreshold, 'vsarp_at_risk_students.csv')}
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <Download className="w-3 h-3 mr-2" /> Export At-Risk List
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
