import React from 'react';
import { useParams } from 'react-router-dom';
import { computeEmployabilityScore } from '../../lib/employabilityScore';
import { Award, Star, CheckCircle2, BookOpen, Briefcase, Code2, Users, Globe } from 'lucide-react';

const OUTCOME_ICONS = {
    Technical: Code2,
    Research: BookOpen,
    Leadership: Users,
    Sports: Star,
};

const CATEGORY_COLORS = {
    Internship: 'bg-blue-50 text-blue-700 border-blue-200',
    Certification: 'bg-purple-50 text-purple-700 border-purple-200',
    Hackathon: 'bg-orange-50 text-orange-700 border-orange-200',
    'Research Paper': 'bg-green-50 text-green-700 border-green-200',
    'Soft Skills Test': 'bg-pink-50 text-pink-700 border-pink-200',
    Sports: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Leadership: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function Portfolio() {
    const { studentId } = useParams();

    // Read all data from localStorage (public access, no auth required)
    const allActivities = JSON.parse(localStorage.getItem('vsarp_activities') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('vsarp_users') || '[]');

    const student = allUsers.find(u => u.id === studentId);
    const myActivities = allActivities.filter(a => a.student_id === studentId);
    const approved = myActivities.filter(a => a.status === 'approved');
    const { score, breakdown, level, levelColor } = computeEmployabilityScore(myActivities);

    const scorePercent = Math.min(score, 100);

    // Score arc color
    const arcColor = score >= 80 ? '#7c3aed' : score >= 60 ? '#16a34a' : score >= 40 ? '#ca8a04' : '#ea580c';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans">
            {/* Top banner */}
            <div className="bg-slate-900 text-white py-3 px-4 sm:px-6 flex items-center justify-center gap-2 text-xs sm:text-sm">
                <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-slate-400">Public Portfolio —</span>
                <span className="font-semibold truncate">VSARP Verified Activity Record Platform</span>
            </div>

            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-12 space-y-6 sm:space-y-8">

                {/* Student Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0 h-24 w-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white">
                            {student ? student.full_name?.charAt(0)?.toUpperCase() ?? '?' : '?'}
                        </span>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {student?.full_name || 'Student'}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            {student?.department || 'Department'} &middot; {student?.university || ''}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-mono">ID: {studentId?.substring(0, 8)}...</p>

                        <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {approved.length} Verified Activities
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${score >= 60 ? 'bg-green-50 text-green-700 border-green-200' : score >= 40 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                <Award className="w-3.5 h-3.5" />
                                {level} Level
                            </span>
                        </div>
                    </div>

                    {/* Score Circle */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="relative w-28 h-28">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                <circle
                                    cx="50" cy="50" r="40" fill="none"
                                    stroke={arcColor} strokeWidth="10"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - scorePercent / 100)}`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-slate-900">{score}</span>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Score</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Employability</p>
                    </div>
                </div>

                {/* Score Breakdown */}
                {breakdown.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            Score Breakdown
                        </h2>
                        <div className="space-y-3">
                            {breakdown.map(item => (
                                <div key={item.category} className="flex items-center gap-2 sm:gap-3">
                                    <span className="w-24 sm:w-36 text-xs sm:text-sm text-slate-600 font-medium truncate">{item.category}</span>
                                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                            style={{ width: `${Math.min((item.points / 100) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-700 w-16 text-right">
                                        +{item.points} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Verified Activities */}
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-slate-600" />
                        Verified Activities ({approved.length})
                    </h2>
                    {approved.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                            <p className="text-slate-400">No verified activities yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {approved.map(act => {
                                const colorClass = CATEGORY_COLORS[act.category] || CATEGORY_COLORS.default;
                                const OutcomeIcon = OUTCOME_ICONS[act.outcome_type] || Code2;
                                return (
                                    <div key={act.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="p-2 bg-green-50 rounded-lg mt-0.5">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{act.title}</h3>
                                                    <p className="text-sm text-slate-500 mt-1">{act.description}</p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${colorClass}`}>
                                                            {act.category}
                                                        </span>
                                                        {act.outcome_type && (
                                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                                                                <OutcomeIcon className="w-3 h-3" />
                                                                {act.outcome_type}
                                                            </span>
                                                        )}
                                                        {act.skill_tag && (
                                                            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                                {act.skill_tag}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 sm:text-right flex-shrink-0">
                                                <p className="text-xs text-slate-400">{new Date(act.date).toLocaleDateString()}</p>
                                                {act.academic_year && <p className="text-xs text-slate-400 mt-1">{act.academic_year}</p>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center pt-4 pb-8">
                    <p className="text-xs text-slate-400">
                        Generated by <span className="font-bold text-slate-600">VSARP</span> · Verified Student Activity Record Platform
                    </p>
                </div>
            </div>
        </div>
    );
}
