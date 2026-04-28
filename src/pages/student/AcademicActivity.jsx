import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    GraduationCap, Plus, BookOpen, Award, X, Upload,
    CheckCircle2, ExternalLink, Copy, TrendingUp, ClipboardList,
    BarChart2,
} from 'lucide-react';
import {
    Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const TABS = ['courses', 'results', 'upload'];

const GRADE_POINT_MAP = { 'A+': 10, A: 9, 'B+': 8, B: 7, C: 6 };

export default function AcademicActivity() {
    const { user } = useAuth();
    const { courses, addCourse, fillRandomCourses, semesterResults, addSemesterResult, fillRandomResults, loading } = useData();
    const [activeTab, setActiveTab] = useState('courses');
    const [showForm, setShowForm] = useState(false);
    const [courseForm, setCourseForm] = useState({ course_name: '', course_code: '', credits: '', semester: '1', status: 'enrolled' });
    const [resultForm, setResultForm] = useState({ semester: '', subject: '', subject_code: '', credits: '', marks: '', max_marks: '100', grade: 'A' });
    const [activeSemester, setActiveSemester] = useState('1');
    const [submitting, setSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const fileRef = useRef(null);

    const myCourses = useMemo(() => courses.filter(c => c.student_id === user.id), [courses, user.id]);
    const myResults = useMemo(() => semesterResults.filter(r => r.student_id === user.id), [semesterResults, user.id]);

    const totalCredits = useMemo(() => myCourses.reduce((s, c) => s + (c.credits || 0), 0), [myCourses]);
    const earnedCredits = useMemo(() => myCourses.filter(c => c.status === 'completed').reduce((s, c) => s + (c.credits || 0), 0), [myCourses]);

    const availableSemesters = useMemo(() => {
        const sems = [...new Set(myResults.map(r => r.semester))].sort();
        return sems.length ? sems : ['1'];
    }, [myResults]);

    const semesterRows = useMemo(() => myResults.filter(r => r.semester === activeSemester), [activeSemester, myResults]);

    const sgpa = useMemo(() => {
        if (!semesterRows.length) return 0;
        const tc = semesterRows.reduce((s, r) => s + Number(r.credits || 0), 0);
        const wp = semesterRows.reduce((s, r) => s + Number(r.grade_points || 0) * Number(r.credits || 0), 0);
        return tc ? (wp / tc).toFixed(2) : 0;
    }, [semesterRows]);

    const cgpa = useMemo(() => {
        if (!myResults.length) return 0;
        const tc = myResults.reduce((s, r) => s + Number(r.credits || 0), 0);
        const wp = myResults.reduce((s, r) => s + Number(r.grade_points || 0) * Number(r.credits || 0), 0);
        return tc ? (wp / tc).toFixed(2) : 0;
    }, [myResults]);

    const verifiedCount = myResults.filter(r => r.verification_status === 'verified').length;

    const chartData = useMemo(() => {
        return availableSemesters.map(sem => {
            const rows = myResults.filter(r => r.semester === sem);
            const tc = rows.reduce((s, r) => s + Number(r.credits || 0), 0);
            const wp = rows.reduce((s, r) => s + Number(r.grade_points || 0) * Number(r.credits || 0), 0);
            return { semester: `Sem ${sem}`, sgpa: tc ? Number((wp / tc).toFixed(2)) : 0 };
        });
    }, [availableSemesters, myResults]);

    const gradeColor = (g) => {
        if (!g) return 'text-slate-400';
        if (['A+', 'A'].includes(g)) return 'text-green-600 bg-green-50';
        if (['B+', 'B'].includes(g)) return 'text-blue-600 bg-blue-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    const handleAddCourse = (e) => {
        e.preventDefault();
        addCourse(courseForm);
        setCourseForm({ course_name: '', course_code: '', credits: '', semester: '1', status: 'enrolled' });
        setShowForm(false);
    };

    const handleAddResult = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const created = await addSemesterResult({
            ...resultForm,
            credits: Number(resultForm.credits),
            marks: Number(resultForm.marks),
            max_marks: Number(resultForm.max_marks || 100),
            grade_points: GRADE_POINT_MAP[resultForm.grade] || 0,
        });
        if (created) {
            setActiveSemester(resultForm.semester);
            setResultForm({ semester: '', subject: '', subject_code: '', credits: '', marks: '', max_marks: '100', grade: 'A' });
            setShowForm(false);
        }
        setSubmitting(false);
    };

    const handleCSVUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadStatus('processing');

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length < 2) { setUploadStatus('error'); return; }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            let count = 0;

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                const row = {};
                headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });

                const grade = row.grade || 'B';
                await addSemesterResult({
                    semester: row.semester || '1',
                    subject: row.subject || row.subject_name || '',
                    subject_code: row.subject_code || row.code || '',
                    credits: Number(row.credits || 3),
                    marks: Number(row.marks || 0),
                    max_marks: Number(row.max_marks || 100),
                    grade,
                    grade_points: GRADE_POINT_MAP[grade] || 7,
                });
                count++;
            }
            setUploadStatus(`success:${count}`);
        } catch {
            setUploadStatus('error');
        }
        if (fileRef.current) fileRef.current.value = '';
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
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Academics & Results</h2>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">Courses, semester results, and bulk upload in one place.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm">
                        <Plus className="w-4 h-4 mr-2" /> {activeTab === 'courses' ? 'Add Course' : 'Add Result'}
                    </Button>
                    <Button onClick={activeTab === 'courses' ? fillRandomCourses : fillRandomResults} variant="outline" className="text-xs sm:text-sm">
                        Fill Demo Data
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Credits', value: totalCredits, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Earned Credits', value: earnedCredits, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Overall CGPA', value: cgpa, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Verified Results', value: verifiedCount, icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}><Icon className={`w-5 h-5 ${card.color}`} /></div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">{card.label}</p>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2">
                {[
                    { key: 'courses', label: 'Courses', icon: GraduationCap },
                    { key: 'results', label: 'Semester Results', icon: ClipboardList },
                    { key: 'upload', label: 'Upload Results', icon: Upload },
                ].map(tab => (
                    <button key={tab.key} onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══════ COURSES TAB ═══════ */}
            {activeTab === 'courses' && (
                <>
                    {showForm && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-800">Add Course</h3>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleAddCourse} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                <Input placeholder="Course Name" required value={courseForm.course_name} onChange={e => setCourseForm({ ...courseForm, course_name: e.target.value })} className="h-10" />
                                <Input placeholder="Course Code" required value={courseForm.course_code} onChange={e => setCourseForm({ ...courseForm, course_code: e.target.value })} className="h-10" />
                                <Input type="number" placeholder="Credits" required min={1} max={10} value={courseForm.credits} onChange={e => setCourseForm({ ...courseForm, credits: e.target.value })} className="h-10" />
                                <select value={courseForm.semester} onChange={e => setCourseForm({ ...courseForm, semester: e.target.value })} className="h-10 border border-gray-300 rounded-md px-3 text-sm bg-white">
                                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                                <Button type="submit" className="bg-slate-900 text-white h-10">Enroll</Button>
                            </form>
                        </div>
                    )}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Enrolled Courses ({myCourses.length})</h3></div>
                        {myCourses.length === 0 ? (
                            <div className="text-center py-16 text-slate-400"><GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No courses enrolled yet.</p></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                        <tr><th className="px-6 py-3 text-left">Course</th><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-center">Credits</th><th className="px-4 py-3 text-center">Semester</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Grade</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {myCourses.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-3 font-semibold text-slate-900">{c.course_name}</td>
                                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.course_code}</td>
                                                <td className="px-4 py-3 text-center font-bold text-slate-700">{c.credits}</td>
                                                <td className="px-4 py-3 text-center text-slate-600">Sem {c.semester}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{c.status === 'completed' ? 'Completed' : 'Enrolled'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center"><span className={`text-xs font-bold px-2 py-1 rounded-full ${gradeColor(c.grade)}`}>{c.grade || '—'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ═══════ RESULTS TAB ═══════ */}
            {activeTab === 'results' && (
                <>
                    {showForm && (
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="mb-5"><h3 className="text-lg font-bold text-slate-900">Submit Semester Result</h3><p className="mt-1 text-sm text-slate-500">Results get a verification record and shareable link.</p></div>
                            <form onSubmit={handleAddResult} className="space-y-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    <Input required placeholder="Semester" value={resultForm.semester} onChange={e => setResultForm({ ...resultForm, semester: e.target.value })} />
                                    <Input required placeholder="Subject" value={resultForm.subject} onChange={e => setResultForm({ ...resultForm, subject: e.target.value })} />
                                    <Input required placeholder="Subject Code" value={resultForm.subject_code} onChange={e => setResultForm({ ...resultForm, subject_code: e.target.value })} />
                                    <Input required type="number" min={1} placeholder="Credits" value={resultForm.credits} onChange={e => setResultForm({ ...resultForm, credits: e.target.value })} />
                                    <Input required type="number" min={0} placeholder="Marks" value={resultForm.marks} onChange={e => setResultForm({ ...resultForm, marks: e.target.value })} />
                                    <Input required type="number" min={1} placeholder="Max Marks" value={resultForm.max_marks} onChange={e => setResultForm({ ...resultForm, max_marks: e.target.value })} />
                                    <select value={resultForm.grade} onChange={e => setResultForm({ ...resultForm, grade: e.target.value })} className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900">
                                        {Object.keys(GRADE_POINT_MAP).map(g => <option key={g} value={g}>Grade {g}</option>)}
                                    </select>
                                    <div className="flex h-12 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">Grade Points: {GRADE_POINT_MAP[resultForm.grade] || 0}</div>
                                </div>
                                <Button type="submit" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">{submitting ? 'Saving...' : 'Save Result'}</Button>
                            </form>
                        </div>
                    )}

                    {chartData.length > 1 && (
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900"><BarChart2 className="h-4 w-4 text-slate-500" /> SGPA Trend</h3>
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

                    <div className="flex flex-wrap gap-2">
                        {availableSemesters.map(sem => (
                            <button key={sem} onClick={() => setActiveSemester(sem)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeSemester === sem ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                                Semester {sem}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="font-semibold text-slate-800">Semester {activeSemester} • {semesterRows.length} subjects</h3>
                            {semesterRows.length > 0 && <span className="text-sm font-bold text-slate-900">SGPA: {sgpa}</span>}
                        </div>
                        {semesterRows.length === 0 ? (
                            <div className="py-16 text-center text-slate-400"><ClipboardList className="mx-auto mb-3 h-12 w-12 opacity-30" /><p>No results for this semester yet.</p></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                                        <tr><th className="px-6 py-3 text-left">Subject</th><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-center">Marks</th><th className="px-4 py-3 text-center">Grade</th><th className="px-4 py-3 text-center">Verification</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {semesterRows.map(row => (
                                            <tr key={row.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4"><p className="font-semibold text-slate-900">{row.subject}</p><p className="mt-1 text-xs text-slate-500">Credits: {row.credits} • GP: {row.grade_points}</p></td>
                                                <td className="px-4 py-4 font-mono text-xs text-slate-500">{row.subject_code}</td>
                                                <td className="px-4 py-4 text-center text-slate-600">{row.marks}/{row.max_marks}</td>
                                                <td className="px-4 py-4 text-center"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{row.grade}</span></td>
                                                <td className="px-4 py-4 text-center">
                                                    {row.verification_status === 'verified' ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
                                                            <Button variant="ghost" size="sm" onClick={() => window.open(`${window.location.origin}/verify/${row.verification_hash}`, '_blank')} className="h-6 text-xs text-slate-500 hover:text-slate-900"><ExternalLink className="mr-1 h-3 w-3" /> Open</Button>
                                                        </div>
                                                    ) : row.verification_status === 'pending' ? (
                                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pending Approval</span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Awaiting verification</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ═══════ UPLOAD TAB ═══════ */}
            {activeTab === 'upload' && (
                <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Upload className="w-5 h-5 text-slate-500" /> Bulk Upload Results</h3>
                        <p className="mt-2 text-sm text-slate-500">Upload a CSV file to add multiple semester results at once. Results will be sent for faculty verification.</p>
                    </div>
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                        <Upload className="mx-auto h-10 w-10 text-slate-300 mb-4" />
                        <p className="text-sm font-semibold text-slate-700 mb-2">Drop your CSV file here or click to browse</p>
                        <p className="text-xs text-slate-400 mb-4">Format: semester, subject, subject_code, credits, marks, max_marks, grade</p>
                        <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" id="csv-upload" />
                        <Button onClick={() => fileRef.current?.click()} variant="outline"><Upload className="mr-2 h-4 w-4" /> Choose CSV File</Button>
                    </div>
                    {uploadStatus === 'processing' && <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700 font-medium">Processing your CSV file...</div>}
                    {uploadStatus === 'error' && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 font-medium">Failed to parse CSV. Please check the format.</div>}
                    {uploadStatus?.startsWith('success:') && <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 font-medium">✓ Successfully uploaded {uploadStatus.split(':')[1]} results. They will appear after faculty verification.</div>}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sample CSV Format</h4>
                        <pre className="text-xs text-slate-600 font-mono overflow-x-auto">{`semester,subject,subject_code,credits,marks,max_marks,grade
3,Data Structures,CS201,4,85,100,A
3,DBMS,CS202,4,72,100,B+
3,Operating Systems,CS301,3,90,100,A+`}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
