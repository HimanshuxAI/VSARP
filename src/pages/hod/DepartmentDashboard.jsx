import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { computeAllStudentScores } from '../../lib/employabilityScore';
import { Users, TrendingUp, Trophy, Activity, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DepartmentDashboard() {
    const { user } = useAuth();
    const { activities, aptitudeAttempts, getAllUsers, loading } = useData();
    const dept = user.department || 'Computer Science';

    const allStudents = useMemo(() => getAllUsers().filter(u => u.role === 'student' && (u.department || 'General') === dept), [getAllUsers, dept]);
    const deptActivities = useMemo(() => activities.filter(a => (a.department || 'General') === dept), [activities, dept]);
    const scoredStudents = useMemo(() => computeAllStudentScores(allStudents, activities, aptitudeAttempts), [allStudents, activities, aptitudeAttempts]);

    const avgScore = useMemo(() => scoredStudents.length ? Math.round(scoredStudents.reduce((s, u) => s + u.score, 0) / scoredStudents.length) : 0, [scoredStudents]);
    const approvedCount = useMemo(() => deptActivities.filter(a => a.status === 'approved').length, [deptActivities]);
    const pendingCount = useMemo(() => deptActivities.filter(a => a.status === 'pending').length, [deptActivities]);
    const rejectedCount = useMemo(() => deptActivities.filter(a => a.status === 'rejected').length, [deptActivities]);
    const placementReadiness = useMemo(() => {
        if (!scoredStudents.length) return 0;
        const readyCount = scoredStudents.filter(s => s.score >= 60).length;
        return Math.round((readyCount / scoredStudents.length) * 100);
    }, [scoredStudents]);
    const participationRate = useMemo(() => {
        if (!allStudents.length) return 0;
        const activeIds = new Set(deptActivities.filter(a => a.status === 'approved').map(a => a.student_id));
        return Math.round((activeIds.size / allStudents.length) * 100);
    }, [allStudents, deptActivities]);

    // Category distribution
    const categoryData = useMemo(() => {
        const map = {};
        deptActivities.filter(a => a.status === 'approved').forEach(a => {
            const cat = a.category || 'Other';
            map[cat] = (map[cat] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [deptActivities]);

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900" />
        </div>
    );

    return (
        <div className="space-y-6 animate-enter pb-10">
            <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Department Dashboard</h2>
                <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">{dept} — Performance & achievements overview</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {[
                    { label: 'Students', value: allStudents.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg. Score', value: avgScore, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Approved', value: approvedCount, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Pending', value: pendingCount, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Rejected', value: rejectedCount, icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Participation', value: `${participationRate}%`, icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    { label: 'Placement Ready', value: `${placementReadiness}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <Icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">{card.label}</p>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Distribution */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-slate-600" />
                        Activity Category Distribution
                    </h3>
                    {categoryData.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-10">No approved activities yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top Students */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Top Students in {dept}
                    </h3>
                    {scoredStudents.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-10">No student data.</p>
                    ) : (
                        <ol className="space-y-3">
                            {scoredStudents.slice(0, 8).map((s, i) => (
                                <li key={s.id} className="flex items-center gap-3">
                                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{s.full_name || s.name || 'Student'}</p>
                                    </div>
                                    <div className={`text-sm font-bold ${s.levelColor}`}>{s.score}</div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            {/* All Students Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">All Students — {dept}</h3>
                </div>
                {scoredStudents.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No students registered in {dept}.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-center">Score</th>
                                    <th className="px-4 py-3 text-left">Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {scoredStudents.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-semibold text-slate-900">{s.full_name || s.name || 'Student'}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{s.email || '—'}</td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-900">{s.score}</td>
                                        <td className={`px-4 py-3 text-sm font-bold ${s.levelColor}`}>{s.level}</td>
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
