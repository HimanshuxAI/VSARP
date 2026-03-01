import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { ClipboardList, TrendingUp, Award, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function SemesterResults() {
    const { user } = useAuth();
    const { semesterResults, fillRandomResults, loading } = useData();
    const [activeSem, setActiveSem] = useState('1');

    const myResults = useMemo(() => semesterResults.filter(r => r.student_id === user.id), [semesterResults, user.id]);

    const availableSemesters = useMemo(() => {
        const sems = [...new Set(myResults.map(r => r.semester))].sort();
        return sems.length > 0 ? sems : ['1'];
    }, [myResults]);

    const semResults = useMemo(() => myResults.filter(r => r.semester === activeSem), [myResults, activeSem]);

    // SGPA calculation
    const sgpa = useMemo(() => {
        if (semResults.length === 0) return 0;
        const totalCredits = semResults.reduce((s, r) => s + r.credits, 0);
        const weightedSum = semResults.reduce((s, r) => s + r.grade_points * r.credits, 0);
        return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 0;
    }, [semResults]);

    // CGPA calculation (across all semesters)
    const cgpa = useMemo(() => {
        if (myResults.length === 0) return 0;
        const totalCredits = myResults.reduce((s, r) => s + r.credits, 0);
        const weightedSum = myResults.reduce((s, r) => s + r.grade_points * r.credits, 0);
        return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 0;
    }, [myResults]);

    // Chart data: SGPA per semester
    const chartData = useMemo(() => {
        return availableSemesters.map(sem => {
            const semR = myResults.filter(r => r.semester === sem);
            const tc = semR.reduce((s, r) => s + r.credits, 0);
            const ws = semR.reduce((s, r) => s + r.grade_points * r.credits, 0);
            return { semester: `Sem ${sem}`, sgpa: tc > 0 ? +(ws / tc).toFixed(2) : 0 };
        });
    }, [myResults, availableSemesters]);

    const gradeColor = (g) => {
        if (['A+', 'A'].includes(g)) return 'text-green-600 bg-green-50';
        if (['B+', 'B'].includes(g)) return 'text-blue-600 bg-blue-50';
        if (['C+', 'C'].includes(g)) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900" />
        </div>
    );

    return (
        <div className="space-y-6 animate-enter pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Semester Results</h2>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">View your academic performance across semesters</p>
                </div>
                <Button onClick={fillRandomResults} variant="outline" className="text-xs sm:text-sm self-start">
                    Fill Demo Results
                </Button>
            </div>

            {/* SGPA / CGPA Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: `Sem ${activeSem} SGPA`, value: sgpa, icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Overall CGPA', value: cgpa, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Total Subjects', value: myResults.length, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
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

            {/* Performance Trend Chart */}
            {chartData.length > 1 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-slate-600" />
                        SGPA Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="semester" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                            <Bar dataKey="sgpa" fill="#0f172a" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Semester Tabs */}
            <div className="flex gap-2 flex-wrap">
                {availableSemesters.map(sem => (
                    <button
                        key={sem}
                        onClick={() => setActiveSem(sem)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSem === sem
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                    >
                        Semester {sem}
                    </button>
                ))}
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Semester {activeSem} — {semResults.length} subjects</h3>
                    {semResults.length > 0 && <span className="text-sm font-bold text-slate-900">SGPA: {sgpa}</span>}
                </div>
                {semResults.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No results for this semester. Fill demo data to see results.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Subject</th>
                                    <th className="px-4 py-3 text-left">Code</th>
                                    <th className="px-4 py-3 text-center">Credits</th>
                                    <th className="px-4 py-3 text-center">Marks</th>
                                    <th className="px-4 py-3 text-center">Grade</th>
                                    <th className="px-4 py-3 text-center">Grade Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {semResults.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-semibold text-slate-900">{r.subject}</td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{r.subject_code}</td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-700">{r.credits}</td>
                                        <td className="px-4 py-3 text-center text-slate-600">{r.marks}/{r.max_marks}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gradeColor(r.grade)}`}>{r.grade}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-900">{r.grade_points}</td>
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
