import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Award,
    BookOpen,
    Briefcase,
    CheckCircle2,
    Code2,
    Globe,
    Sparkles,
    Users,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { parseSkillInput } from '../../lib/placement';

const OUTCOME_ICONS = {
    Technical: Code2,
    Research: BookOpen,
    Leadership: Users,
};

const CATEGORY_COLORS = {
    Internship: 'bg-blue-50 text-blue-700 border-blue-200',
    Certification: 'bg-purple-50 text-purple-700 border-purple-200',
    Hackathon: 'bg-orange-50 text-orange-700 border-orange-200',
    'Research Paper': 'bg-green-50 text-green-700 border-green-200',
    'Soft Skills Test': 'bg-pink-50 text-pink-700 border-pink-200',
    Sports: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Leadership: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    default: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function Portfolio() {
    const { studentId } = useParams();
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);
    const [approvedActivities, setApprovedActivities] = useState([]);
    const [verifiedResults, setVerifiedResults] = useState([]);

    useEffect(() => {
        const loadPortfolio = async () => {
            setLoading(true);

            if (!isSupabaseConfigured) {
                const users = JSON.parse(localStorage.getItem('vsarp_users') || '[]');
                const activities = JSON.parse(localStorage.getItem('vsarp_activities') || '[]');
                const results = JSON.parse(localStorage.getItem('vsarp_semester_results') || '[]');

                setStudent(users.find((profile) => profile.id === studentId) || null);
                setApprovedActivities(
                    activities.filter(
                        (activity) =>
                            activity.student_id === studentId &&
                            activity.status === 'approved'
                    )
                );
                setVerifiedResults(
                    results.filter(
                        (result) =>
                            result.student_id === studentId &&
                            result.verification_status === 'verified'
                    )
                );
                setLoading(false);
                return;
            }

            const [profileResult, activitiesResult, resultsResult] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', studentId).maybeSingle(),
                supabase
                    .from('activities')
                    .select('*')
                    .eq('student_id', studentId)
                    .eq('status', 'approved')
                    .order('date', { ascending: false }),
                supabase
                    .from('semester_results')
                    .select('*')
                    .eq('student_id', studentId)
                    .eq('verification_status', 'verified')
                    .order('created_at', { ascending: false }),
            ]);

            setStudent(profileResult.data || null);
            setApprovedActivities(activitiesResult.data || []);
            setVerifiedResults(resultsResult.data || []);
            setLoading(false);
        };

        loadPortfolio();
    }, [studentId]);

    const verifiedSkills = useMemo(() => {
        return [
            ...new Set(
                approvedActivities.flatMap((activity) =>
                    parseSkillInput(activity.skill_tag)
                )
            ),
        ];
    }, [approvedActivities]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="flex items-center justify-center gap-2 bg-slate-900 px-4 py-3 text-xs text-white sm:text-sm">
                <Globe className="h-4 w-4 text-blue-400" />
                <span className="text-slate-400">Public Portfolio</span>
                <span className="font-semibold">VSARP Verified Student Records</span>
            </div>

            <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
                <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-xl">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-3xl font-bold text-white">
                            {student?.full_name?.charAt(0)?.toUpperCase() ||
                                student?.name?.charAt(0)?.toUpperCase() ||
                                '?'}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-900">
                                {student?.full_name || student?.name || 'Student'}
                            </h1>
                            <p className="mt-2 text-slate-500">
                                {student?.department || 'Department'} • Verified student
                                portfolio
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {approvedActivities.length} verified activities
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    <Award className="h-3.5 w-3.5" />
                                    {verifiedResults.length} verified results
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {verifiedSkills.length} verified skills
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">
                        Verified Skill Stack
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {verifiedSkills.length ? (
                            verifiedSkills.map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                                >
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400">
                                No verified skill tags published yet.
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <BookOpen className="h-5 w-5 text-slate-500" />
                        Verified Results ({verifiedResults.length})
                    </h2>

                    {verifiedResults.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                            No verified results available.
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {verifiedResults.slice(0, 6).map((result) => (
                                <div
                                    key={result.id}
                                    className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {result.subject}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Semester {result.semester} • {result.subject_code}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                            {result.marks}/{result.max_marks}
                                        </span>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            Grade {result.grade}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                        <Briefcase className="h-5 w-5 text-slate-500" />
                        Verified Activities ({approvedActivities.length})
                    </h2>

                    {approvedActivities.length === 0 ? (
                        <div className="rounded-[28px] border border-slate-100 bg-white p-10 text-center text-slate-400 shadow-sm">
                            No verified activities yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {approvedActivities.map((activity) => {
                                const OutcomeIcon =
                                    OUTCOME_ICONS[activity.outcome_type] || Code2;
                                const colorClass =
                                    CATEGORY_COLORS[activity.category] ||
                                    CATEGORY_COLORS.default;

                                return (
                                    <div
                                        key={activity.id}
                                        className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex gap-3">
                                                <div className="rounded-xl bg-emerald-50 p-2.5">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">
                                                        {activity.title}
                                                    </h3>
                                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                                        {activity.description}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${colorClass}`}
                                                        >
                                                            {activity.category}
                                                        </span>
                                                        {activity.outcome_type && (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                                <OutcomeIcon className="h-3 w-3" />
                                                                {activity.outcome_type}
                                                            </span>
                                                        )}
                                                        {activity.skill_tag && (
                                                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                                                {activity.skill_tag}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-xs text-slate-400">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
