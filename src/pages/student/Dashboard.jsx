import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
    AlertCircle,
    Bell,
    Briefcase,
    CheckCircle2,
    ChevronRight,
    Clock,
    Database,
    Download,
    FileText,
    Share2,
    Sparkles,
    Trash2,
    XCircle,
} from 'lucide-react';
import {
    computeCgpa,
    getStudentSkills,
    matchDriveToStudent,
} from '../../lib/placement';


export default function StudentDashboard() {
    const { user } = useAuth();
    const {
        activities,
        semesterResults,
        placementDrives,
        notifications,
        fillRandomData,
        deleteRejectedActivity,
        markNotificationRead,
        loading,
    } = useData();
    const navigate = useNavigate();

    const [statusFilter, setStatusFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    const myActivities = useMemo(
        () => activities.filter((activity) => activity.student_id === user.id),
        [activities, user.id]
    );
    const myResults = useMemo(
        () => semesterResults.filter((result) => result.student_id === user.id),
        [semesterResults, user.id]
    );
    const myNotifications = useMemo(
        () =>
            notifications
                .filter((notification) => notification.profile_id === user.id)
                .sort(
                    (left, right) =>
                        new Date(right.created_at) - new Date(left.created_at)
                ),
        [notifications, user.id]
    );
    const cgpa = useMemo(() => computeCgpa(myResults), [myResults]);
    const studentSkills = useMemo(
        () =>
            getStudentSkills({
                activities,
                semesterResults,
                studentId: user.id,
                profileSkills: user.skills,
        }),
        [activities, semesterResults, user.id, user.skills]
    );


    const matchedOpenings = useMemo(() => {
        return placementDrives.filter((drive) => {
            const match = matchDriveToStudent({
                drive,
                department: user.department,
                cgpa,
                skills: studentSkills,
            });

            return match.eligible && ['open', 'upcoming'].includes(drive.status);
        });
    }, [cgpa, placementDrives, studentSkills, user.department]);

    const verifiedActivities = myActivities.filter(
        (activity) => activity.status === 'approved'
    );
    const pendingActivities = myActivities.filter(
        (activity) => activity.status === 'pending'
    );
    const rejectedActivities = myActivities.filter(
        (activity) => activity.status === 'rejected'
    );
    const unreadNotifications = myNotifications.filter(
        (notification) => !notification.is_read
    );

    const filteredActivities =
        statusFilter === 'all'
            ? myActivities
            : myActivities.filter((activity) => activity.status === statusFilter);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            </div>
        );
    }

    const handleSharePortfolio = () => {
        const url = `${window.location.origin}/portfolio/${user.id}`;
        navigator.clipboard
            .writeText(url)
            .then(() => {
                alert(`Portfolio link copied.\n\n${url}`);
            })
            .catch(() => {
                prompt('Copy this link:', url);
            });
    };

    const handleExportTranscript = () => {
        setIsExporting(true);
        setTimeout(() => {
            alert(
                `Verified activity transcript prepared for ${user.name}.\n\nIncludes ${verifiedActivities.length} verified records.`
            );
            setIsExporting(false);
        }, 1200);
    };

    return (
        <div className="space-y-8 animate-enter pb-10">
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                        Student Portfolio
                    </h2>
                    <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
                        Track approvals, verified skills, and placement readiness from
                        one clean workspace.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        className="text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:text-sm"
                        onClick={() => navigate('/student/placements')}
                    >
                        <Bell className="mr-2 h-4 w-4" />
                        Placement Alerts
                    </Button>
                    <Button
                        variant="outline"
                        className="text-xs sm:text-sm"
                        onClick={fillRandomData}
                    >
                        <Database className="mr-2 h-4 w-4" />
                        Fill Random Data
                    </Button>
                    <Button
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                        onClick={handleSharePortfolio}
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Portfolio
                    </Button>
                    <Button
                        disabled={isExporting || verifiedActivities.length === 0}
                        className="bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm"
                        onClick={handleExportTranscript}
                    >
                        {isExporting ? (
                            'Generating...'
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Export Transcript
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: 'Verified Activities',
                        value: verifiedActivities.length,
                        accent: 'bg-emerald-50 text-emerald-700',
                    },
                    {
                        label: 'Pending Review',
                        value: pendingActivities.length,
                        accent: 'bg-amber-50 text-amber-700',
                    },
                    {
                        label: 'Matched Openings',
                        value: matchedOpenings.length,
                        accent: 'bg-blue-50 text-blue-700',
                    },
                    {
                        label: 'Unread Alerts',
                        value: unreadNotifications.length,
                        accent: 'bg-violet-50 text-violet-700',
                    },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    {card.label}
                                </p>
                                <p className="mt-3 text-3xl font-bold text-slate-900">
                                    {card.value}
                                </p>
                                {card.footnote && (
                                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        {card.footnote}
                                    </p>
                                )}
                            </div>
                            <div className={`rounded-2xl px-3 py-2 text-xs font-semibold ${card.accent}`}>
                                Live
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Latest Placement Alerts
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                New drives and activity decisions land here first.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-xs sm:text-sm"
                            onClick={() => navigate('/student/placements')}
                        >
                            Open Placement Hub
                        </Button>
                    </div>

                    {myNotifications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
                            No alerts yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myNotifications.slice(0, 4).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`rounded-2xl border p-4 ${
                                        notification.is_read
                                            ? 'border-slate-100 bg-slate-50'
                                            : 'border-blue-100 bg-blue-50/70'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {notification.title}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() =>
                                                    markNotificationRead(notification.id)
                                                }
                                                className="text-xs font-semibold text-blue-700"
                                            >
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-3 text-xs text-slate-400">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900">
                            Verified Skill Stack
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Skills pulled from approved activities and verified result
                            records.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {studentSkills.length ? (
                                studentSkills.map((skill) => (
                                    <Badge key={skill} variant="outline">
                                        {skill}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400">
                                    Add skill tags to future submissions to improve
                                    placement matching.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900">
                            Placement Snapshot
                        </h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <span>Current CGPA</span>
                                <span className="font-semibold text-slate-900">
                                    {cgpa || '0.00'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <span>Rejected activities</span>
                                <span className="font-semibold text-slate-900">
                                    {rejectedActivities.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <span>Placement-ready openings</span>
                                <span className="font-semibold text-slate-900">
                                    {matchedOpenings.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'approved', 'pending', 'rejected'].map((filter) => (
                    <Button
                        key={filter}
                        variant="outline"
                        onClick={() => setStatusFilter(filter)}
                        className={`rounded-full px-4 ${
                            statusFilter === filter
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        <span className="ml-2 text-xs opacity-70">
                            {filter === 'all'
                                ? myActivities.length
                                : myActivities.filter(
                                      (activity) => activity.status === filter
                                  ).length}
                        </span>
                    </Button>
                ))}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                {filteredActivities.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center p-12 text-center">
                        <div className="mb-4 rounded-full bg-slate-50 p-4">
                            <Clock className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                            No records found
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            {statusFilter === 'all'
                                ? 'Start by submitting an activity to build your portfolio.'
                                : `You have no ${statusFilter} activities right now.`}
                        </p>
                        {statusFilter === 'all' && (
                            <Button
                                onClick={() => navigate('/student/submit')}
                                className="mt-4 bg-slate-900 text-white hover:bg-slate-800"
                            >
                                Submit New Activity
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredActivities.map((activity) => (
                            <div key={activity.id} className="p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex gap-4">
                                        <div
                                            className={`mt-1 rounded-2xl p-3 ${
                                                activity.status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : activity.status === 'rejected'
                                                    ? 'bg-red-50 text-red-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}
                                        >
                                            {activity.status === 'approved' ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : activity.status === 'rejected' ? (
                                                <XCircle className="h-5 w-5" />
                                            ) : (
                                                <Clock className="h-5 w-5" />
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {activity.title}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className={`${
                                                        activity.status === 'approved'
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            : activity.status === 'rejected'
                                                            ? 'border-red-200 bg-red-50 text-red-700'
                                                            : 'border-amber-200 bg-amber-50 text-amber-700'
                                                    }`}
                                                >
                                                    {activity.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {activity.category} •{' '}
                                                {new Date(activity.date).toLocaleDateString()}
                                            </p>
                                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                                                {activity.description}
                                            </p>

                                            {activity.reviewer_comment && (
                                                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                    <p>
                                                        <span className="font-semibold text-slate-900">
                                                            Reviewer note:
                                                        </span>{' '}
                                                        {activity.reviewer_comment}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate('/student/placements')}
                                            className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            Placement Hub
                                            <ChevronRight className="ml-1 h-3 w-3" />
                                        </Button>

                                        {activity.status === 'rejected' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    deleteRejectedActivity(activity.id)
                                                }
                                                className="border-red-200 text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        )}

                                        {activity.integrity_hash && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        `${window.location.origin}/verify/${activity.integrity_hash}`,
                                                        '_blank'
                                                    )
                                                }
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Verify
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
