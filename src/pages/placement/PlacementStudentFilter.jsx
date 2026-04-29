import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { computeAllStudentScores } from '../../lib/employabilityScore';
import { Download, Search, Filter, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'General'];
const OUTCOME_TYPES = ['All', 'Technical', 'Research', 'Leadership', 'Sports'];
const YEARS = ['All', '2023-24', '2024-25', '2025-26'];

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
            r.approvedCount ?? 0
        ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

export default function PlacementStudentFilter() {
    const { activities, aptitudeAttempts, getAllUsers, loading } = useData();
    const [search, setSearch] = useState('');
    const [dept, setDept] = useState('All');
    const [minScore, setMinScore] = useState(0);
    const [outcomeType, setOutcomeType] = useState('All');
    const [year, setYear] = useState('All');
    const [selected, setSelected] = useState(new Set());

    const allUsers = useMemo(() => getAllUsers().filter(u => u.role === 'student' || !u.role), [getAllUsers]);
    const scoredStudents = useMemo(() => computeAllStudentScores(allUsers, activities, aptitudeAttempts), [allUsers, activities, aptitudeAttempts]);

    const enriched = useMemo(() => scoredStudents.map(s => {
        const myActs = activities.filter(a => a.student_id === s.id && a.status === 'approved');
        const outcomeTypes = [...new Set(myActs.map(a => a.outcome_type).filter(Boolean))];
        const years = [...new Set(myActs.map(a => a.academic_year).filter(Boolean))];
        return { ...s, outcomeTypes, years, approvedCount: myActs.length };
    }), [scoredStudents, activities]);

    const filtered = useMemo(() => enriched.filter(s => {
        if (search && !((s.full_name || s.name || '').toLowerCase().includes(search.toLowerCase()))) return false;
        if (dept !== 'All' && (s.department || 'General') !== dept) return false;
        if (s.score < minScore) return false;
        if (outcomeType !== 'All' && !s.outcomeTypes.includes(outcomeType)) return false;
        if (year !== 'All' && !s.years.includes(year)) return false;
        return true;
    }), [enriched, search, dept, minScore, outcomeType, year]);

    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(s => s.id)));
    };

    const selectedStudents = filtered.filter(s => selected.has(s.id));

    const SCORE_COLOR = (score) =>
        score >= 80 ? 'text-purple-600 bg-purple-50' :
            score >= 60 ? 'text-green-600 bg-green-50' :
                score >= 40 ? 'text-yellow-600 bg-yellow-50' :
                    score > 0 ? 'text-orange-600 bg-orange-50' :
                        'text-gray-400 bg-gray-50';

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900" />
        </div>
    );

    return (
        <div className="space-y-6 animate-enter pb-10">
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Student Filter</h2>
                    <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base font-medium">Filter and shortlist students for placement offers.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {selected.size > 0 && (
                        <Button onClick={() => downloadCSV(selectedStudents, 'placement_shortlist.csv')} className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg flex items-center gap-2 text-xs sm:text-sm">
                            <Download className="w-4 h-4" /> Export Shortlist ({selected.size})
                        </Button>
                    )}
                    <Button onClick={() => downloadCSV(filtered, 'placement_filtered_students.csv')} variant="outline" className="flex items-center gap-2 text-xs sm:text-sm">
                        <Download className="w-4 h-4" /> Export All ({filtered.length})
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <h3 className="font-semibold text-slate-800 text-sm">Filters</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="relative sm:col-span-2 lg:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name..." className="pl-9 h-10" />
                    </div>
                    <select value={dept} onChange={e => setDept(e.target.value)} className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black appearance-none">
                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <select value={outcomeType} onChange={e => setOutcomeType(e.target.value)} className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black appearance-none">
                        {OUTCOME_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)} className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black appearance-none">
                        {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">Min Score:</label>
                        <div className="flex items-center gap-2 flex-1">
                            <input type="range" min={0} max={100} value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="flex-1 accent-slate-900" />
                            <span className="text-sm font-bold text-slate-700 w-7 text-right">{minScore}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-500 font-medium">{filtered.length} student{filtered.length !== 1 ? 's' : ''} found</span>
                    {filtered.length > 0 && (
                        <button onClick={toggleAll} className="text-xs text-blue-600 hover:underline font-semibold">
                            {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                </div>
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No students match the current filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm hidden sm:table">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                <tr>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left">Student</th>
                                    <th className="px-4 py-3 text-left">Department</th>
                                    <th className="px-4 py-3 text-left">Outcome Types</th>
                                    <th className="px-4 py-3 text-center">Approved</th>
                                    <th className="px-4 py-3 text-center">Score</th>
                                    <th className="px-4 py-3 text-left">Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(s => (
                                    <tr key={s.id} onClick={() => toggleSelect(s.id)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected.has(s.id) ? 'bg-blue-50/60' : ''}`}>
                                        <td className="px-4 py-3 text-center">
                                            <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} onClick={e => e.stopPropagation()} className="accent-slate-900 w-4 h-4" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-900">{s.full_name || s.name || 'Student'}</p>
                                            <p className="text-xs text-slate-400 truncate max-w-[160px]">{s.email || ''}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{s.department || '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {s.outcomeTypes.length > 0 ? s.outcomeTypes.map(t => (
                                                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{t}</span>
                                                )) : <span className="text-slate-300">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold text-slate-900">{s.approvedCount}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center w-12 h-7 rounded-full text-xs font-bold ${SCORE_COLOR(s.score)}`}>{s.score}</span>
                                        </td>
                                        <td className={`px-4 py-3 text-sm font-bold ${s.levelColor}`}>{s.level}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Mobile */}
                        <div className="sm:hidden divide-y divide-slate-100">
                            {filtered.map(s => (
                                <div key={s.id} onClick={() => toggleSelect(s.id)} className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${selected.has(s.id) ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}>
                                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} onClick={e => e.stopPropagation()} className="accent-slate-900 w-4 h-4 mt-1 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-slate-900 text-sm truncate">{s.full_name || s.name || 'Student'}</p>
                                            <span className={`inline-flex items-center justify-center w-10 h-6 rounded-full text-xs font-bold flex-shrink-0 ${SCORE_COLOR(s.score)}`}>{s.score}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{s.department || '—'} · {s.approvedCount} approved · <span className={`font-bold ${s.levelColor}`}>{s.level}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
