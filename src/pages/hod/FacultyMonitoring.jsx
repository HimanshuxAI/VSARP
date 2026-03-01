import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { UserCog, BookOpen, Users, Award, GraduationCap } from 'lucide-react';

export default function FacultyMonitoring() {
    const { user } = useAuth();
    const { activities, researchPapers, getAllUsers, loading } = useData();
    const dept = user.department || 'Computer Science';

    const allUsers = useMemo(() => getAllUsers(), [getAllUsers]);
    const deptFaculty = useMemo(() => allUsers.filter(u => u.role === 'faculty' && (u.department || 'General') === dept), [allUsers, dept]);

    // Faculty stats
    const facultyStats = useMemo(() => {
        return deptFaculty.map(f => {
            const papers = researchPapers.filter(p => p.faculty_id === f.id);
            const reviewedActs = activities.filter(a => a.approved_by === f.full_name || a.approved_by === f.name);
            // Mock FDP count (based on papers for demo)
            const fdpCount = Math.min(papers.length * 2, 5);
            return {
                ...f,
                papers,
                paperCount: papers.length,
                reviewedCount: reviewedActs.length,
                fdpParticipation: fdpCount,
                mentorshipCount: Math.floor(Math.random() * 10) + 1 // Mock mentorship
            };
        });
    }, [deptFaculty, researchPapers, activities]);

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900" />
        </div>
    );

    return (
        <div className="space-y-6 animate-enter pb-10">
            <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Faculty Monitoring</h2>
                <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">Track mentorship, research & FDP for {dept}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Faculty', value: deptFaculty.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Papers', value: researchPapers.filter(p => deptFaculty.some(f => f.id === p.faculty_id)).length, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Avg Mentees', value: facultyStats.length ? Math.round(facultyStats.reduce((s, f) => s + f.mentorshipCount, 0) / facultyStats.length) : 0, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'FDP Participation', value: facultyStats.reduce((s, f) => s + f.fdpParticipation, 0), icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
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

            {/* Faculty Cards */}
            {facultyStats.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16 text-slate-400">
                    <UserCog className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No faculty registered in {dept}.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {facultyStats.map(f => (
                        <div key={f.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-bold text-slate-700">{(f.full_name || f.name || 'F').charAt(0)}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{f.full_name || f.name}</h4>
                                    <p className="text-xs text-slate-500">{f.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-blue-700">{f.paperCount}</p>
                                    <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">Publications</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-green-700">{f.reviewedCount}</p>
                                    <p className="text-[10px] text-green-500 font-semibold uppercase tracking-wider">Reviews</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-purple-700">{f.mentorshipCount}</p>
                                    <p className="text-[10px] text-purple-500 font-semibold uppercase tracking-wider">Mentees</p>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-amber-700">{f.fdpParticipation}</p>
                                    <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">FDP</p>
                                </div>
                            </div>

                            {/* Recent Papers */}
                            {f.papers.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Recent Publications</p>
                                    <div className="space-y-2">
                                        {f.papers.slice(0, 3).map(p => (
                                            <div key={p.id} className="flex items-start gap-2">
                                                <BookOpen className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm text-slate-800 font-medium truncate">{p.title}</p>
                                                    <p className="text-[10px] text-slate-400">{p.journal_conference} · {p.publication_date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
