import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/ui/button';
import {
    Award,
    BarChart2,
    CheckCircle2,
    ClipboardList,
    Copy,
    TrendingUp,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function SemesterResults() {
    const { user } = useAuth();
    const { semesterResults, fillRandomResults, loading } = useData();
    const [activeSemester, setActiveSemester] = useState('1');

    const myResults = useMemo(
        () => semesterResults.filter((result) => result.student_id === user.id),
        [semesterResults, user.id]
    );

    const availableSemesters = useMemo(() => {
        const semesters = [...new Set(myResults.map((result) => result.semester))].sort();
        return semesters.length ? semesters : ['1'];
    }, [myResults]);

    const semesterRows = useMemo(
        () => myResults.filter((result) => result.semester === activeSemester),
        [activeSemester, myResults]
    );

    const sgpa = useMemo(() => {
        if (!semesterRows.length) return 0;
        const totalCredits = semesterRows.reduce(
            (sum, row) => sum + Number(row.credits || 0),
            0
        );
        const weightedPoints = semesterRows.reduce(
            (sum, row) =>
                sum + Number(row.grade_points || 0) * Number(row.credits || 0),
            0
        );

        return totalCredits ? (weightedPoints / totalCredits).toFixed(2) : 0;
    }, [semesterRows]);

    const cgpa = useMemo(() => {
        if (!myResults.length) return 0;
        const totalCredits = myResults.reduce(
            (sum, row) => sum + Number(row.credits || 0),
            0
        );
        const weightedPoints = myResults.reduce(
            (sum, row) =>
                sum + Number(row.grade_points || 0) * Number(row.credits || 0),
            0
        );

        return totalCredits ? (weightedPoints / totalCredits).toFixed(2) : 0;
    }, [myResults]);

    const verifiedCount = myResults.filter(
        (result) => result.verification_status === 'verified'
    ).length;

    const chartData = useMemo(() => {
        return availableSemesters.map((semester) => {
            const rows = myResults.filter((result) => result.semester === semester);
            const totalCredits = rows.reduce(
                (sum, row) => sum + Number(row.credits || 0),
                0
            );
            const weightedPoints = rows.reduce(
                (sum, row) =>
                    sum + Number(row.grade_points || 0) * Number(row.credits || 0),
                0
            );

            return {
                semester: `Sem ${semester}`,
                sgpa: totalCredits
                    ? Number((weightedPoints / totalCredits).toFixed(2))
                    : 0,
            };
        });
    }, [availableSemesters, myResults]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-enter pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                        Semester Results
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
                        Every result record now carries a verification link that can
                        be shared externally.
                    </p>
                </div>
                <Button onClick={fillRandomResults} variant="outline">
                    Fill Demo Results
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    {
                        label: `Sem ${activeSemester} SGPA`,
                        value: sgpa,
                        icon: Award,
                        color: 'bg-blue-50 text-blue-700',
                    },
                    {
                        label: 'Overall CGPA',
                        value: cgpa,
                        icon: TrendingUp,
                        color: 'bg-emerald-50 text-emerald-700',
                    },
                    {
                        label: 'Verified Results',
                        value: verifiedCount,
                        icon: CheckCircle2,
                        color: 'bg-violet-50 text-violet-700',
                    },
                ].map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`rounded-xl p-3 ${card.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        {card.label}
                                    </p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {card.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {chartData.length > 1 && (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
                        <BarChart2 className="h-4 w-4 text-slate-500" />
                        SGPA Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="semester" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '13px',
                                }}
                            />
                            <Bar dataKey="sgpa" fill="#0f172a" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {availableSemesters.map((semester) => (
                    <button
                        key={semester}
                        onClick={() => setActiveSemester(semester)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            activeSemester === semester
                                ? 'bg-slate-900 text-white'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Semester {semester}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h3 className="font-semibold text-slate-800">
                        Semester {activeSemester} • {semesterRows.length} subjects
                    </h3>
                    {semesterRows.length > 0 && (
                        <span className="text-sm font-bold text-slate-900">
                            SGPA: {sgpa}
                        </span>
                    )}
                </div>

                {semesterRows.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <ClipboardList className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p>No results for this semester yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 text-left">Subject</th>
                                    <th className="px-4 py-3 text-left">Code</th>
                                    <th className="px-4 py-3 text-center">Marks</th>
                                    <th className="px-4 py-3 text-center">Grade</th>
                                    <th className="px-4 py-3 text-center">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {semesterRows.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900">
                                                {row.subject}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Credits: {row.credits} • Grade points:{' '}
                                                {row.grade_points}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 font-mono text-xs text-slate-500">
                                            {row.subject_code}
                                        </td>
                                        <td className="px-4 py-4 text-center text-slate-600">
                                            {row.marks}/{row.max_marks}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                {row.grade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {row.verification_hash ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Verified
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            navigator.clipboard.writeText(
                                                                `${window.location.origin}/verify/${row.verification_hash}`
                                                            )
                                                        }
                                                        className="h-7 text-xs text-slate-500 hover:text-slate-900"
                                                    >
                                                        <Copy className="mr-2 h-3 w-3" />
                                                        Copy link
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    Awaiting verification
                                                </span>
                                            )}
                                        </td>
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
