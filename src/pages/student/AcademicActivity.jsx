import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { GraduationCap, Plus, BookOpen, Award, X } from 'lucide-react';

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function AcademicActivity() {
    const { user } = useAuth();
    const { courses, addCourse, fillRandomCourses, loading } = useData();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ course_name: '', course_code: '', credits: '', semester: '1', status: 'enrolled' });

    const myCourses = useMemo(() => courses.filter(c => c.student_id === user.id), [courses, user.id]);

    const totalCredits = useMemo(() => myCourses.reduce((s, c) => s + (c.credits || 0), 0), [myCourses]);
    const earnedCredits = useMemo(() => myCourses.filter(c => c.status === 'completed').reduce((s, c) => s + (c.credits || 0), 0), [myCourses]);
    const enrolledCredits = useMemo(() => myCourses.filter(c => c.status === 'enrolled').reduce((s, c) => s + (c.credits || 0), 0), [myCourses]);

    const handleSubmit = (e) => {
        e.preventDefault();
        addCourse(form);
        setForm({ course_name: '', course_code: '', credits: '', semester: '1', status: 'enrolled' });
        setShowForm(false);
    };

    const gradeColor = (g) => {
        if (!g) return 'text-slate-400';
        if (['A+', 'A'].includes(g)) return 'text-green-600 bg-green-50';
        if (['B+', 'B'].includes(g)) return 'text-blue-600 bg-blue-50';
        return 'text-yellow-600 bg-yellow-50';
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
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Academics</h2>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">Course enrollment & credit tracking</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg flex items-center gap-2 text-xs sm:text-sm">
                        <Plus className="w-4 h-4" /> Add Course
                    </Button>
                    <Button onClick={fillRandomCourses} variant="outline" className="text-xs sm:text-sm">
                        Fill Demo Data
                    </Button>
                </div>
            </div>

            {/* Credit Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Credits', value: totalCredits, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Earned Credits', value: earnedCredits, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'In Progress', value: enrolledCredits, icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
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

            {/* Credit Progress */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">Credit Progress</span>
                    <span className="text-sm font-bold text-slate-900">{totalCredits > 0 ? Math.round((earnedCredits / totalCredits) * 100) : 0}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all" style={{ width: `${totalCredits > 0 ? (earnedCredits / totalCredits) * 100 : 0}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{earnedCredits} of {totalCredits} credits earned</p>
            </div>

            {/* Add Course Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">Add Course</h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <Input placeholder="Course Name" required value={form.course_name} onChange={e => setForm({ ...form, course_name: e.target.value })} className="h-10" />
                        <Input placeholder="Course Code" required value={form.course_code} onChange={e => setForm({ ...form, course_code: e.target.value })} className="h-10" />
                        <Input type="number" placeholder="Credits" required min={1} max={10} value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} className="h-10" />
                        <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} className="h-10 border border-gray-300 rounded-md px-3 text-sm bg-white">
                            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                        <Button type="submit" className="bg-slate-900 text-white h-10">Enroll</Button>
                    </form>
                </div>
            )}

            {/* Course List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">Enrolled Courses ({myCourses.length})</h3>
                </div>
                {myCourses.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No courses enrolled yet. Add courses or fill demo data.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Course</th>
                                    <th className="px-4 py-3 text-left">Code</th>
                                    <th className="px-4 py-3 text-center">Credits</th>
                                    <th className="px-4 py-3 text-center">Semester</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {myCourses.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-semibold text-slate-900">{c.course_name}</td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.course_code}</td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-700">{c.credits}</td>
                                        <td className="px-4 py-3 text-center text-slate-600">Sem {c.semester}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                {c.status === 'completed' ? 'Completed' : 'Enrolled'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${gradeColor(c.grade)}`}>
                                                {c.grade || '—'}
                                            </span>
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
