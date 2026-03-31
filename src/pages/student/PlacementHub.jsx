import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
    Bell,
    Briefcase,
    CheckCircle2,
    ClipboardCheck,
    GraduationCap,
    Sparkles,
    Target,
} from 'lucide-react';
import {
    computeCgpa,
    getStudentSkills,
    matchDriveToStudent,
} from '../../lib/placement';

function DriveBadge({ label, active = false }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
            }`}
        >
            {label}
        </span>
    );
}

export default function PlacementHub() {
    const { user } = useAuth();
    const {
        activities,
        semesterResults,
        placementDrives,
        placementApplications,
        notifications,
        aptitudeTests,
        aptitudeAttempts,
        applyToDrive,
        fillRandomDrives,
        markNotificationRead,
        submitAptitudeAttempt,
        loading,
    } = useData();

    const [activeTestId, setActiveTestId] = useState(null);
    const [answers, setAnswers] = useState({});
    const [attemptSummary, setAttemptSummary] = useState(null);

    const myResults = useMemo(
        () => semesterResults.filter((result) => result.student_id === user.id),
        [semesterResults, user.id]
    );
    const cgpa = useMemo(() => computeCgpa(myResults), [myResults]);
    const skills = useMemo(
        () =>
            getStudentSkills({
                activities,
                semesterResults,
                studentId: user.id,
                profileSkills: user.skills,
            }),
        [activities, semesterResults, user.id, user.skills]
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
    const myApplications = useMemo(
        () =>
            placementApplications.filter(
                (application) => application.student_id === user.id
            ),
        [placementApplications, user.id]
    );
    const myAttempts = useMemo(
        () =>
            aptitudeAttempts.filter((attempt) => attempt.student_id === user.id),
        [aptitudeAttempts, user.id]
    );

    const driveCards = useMemo(() => {
        return placementDrives
            .map((drive) => {
                const application = myApplications.find(
                    (item) => item.drive_id === drive.id
                );
                const match = matchDriveToStudent({
                    drive,
                    department: user.department,
                    cgpa,
                    skills,
                });

                return {
                    ...drive,
                    application,
                    ...match,
                };
            })
            .sort((left, right) => {
                if (left.eligible !== right.eligible) {
                    return Number(right.eligible) - Number(left.eligible);
                }

                return right.skillMatchPercent - left.skillMatchPercent;
            });
    }, [cgpa, myApplications, placementDrives, skills, user.department]);

    const matchedOpenings = driveCards.filter(
        (drive) => drive.eligible && ['upcoming', 'open'].includes(drive.status)
    );
    const unreadNotifications = myNotifications.filter(
        (notification) => !notification.is_read
    );
    const passedTests = myAttempts.filter((attempt) => attempt.passed);

    const testCards = useMemo(() => {
        return aptitudeTests.map((test) => {
            const relatedDrive = placementDrives.find(
                (drive) => drive.id === test.drive_id
            );
            const attemptsForTest = myAttempts.filter(
                (attempt) => attempt.test_id === test.id
            );
            const bestScore = attemptsForTest.length
                ? Math.max(...attemptsForTest.map((attempt) => attempt.score))
                : null;

            return {
                ...test,
                relatedDrive,
                attemptsForTest,
                bestScore,
            };
        });
    }, [aptitudeTests, myAttempts, placementDrives]);

    const activeTest = testCards.find((test) => test.id === activeTestId);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            </div>
        );
    }

    const handleApply = async (driveId) => {
        const applied = await applyToDrive(driveId);
        if (!applied) {
            alert('You already applied to this drive.');
        }
    };

    const startTest = (testId) => {
        setActiveTestId(testId);
        setAnswers({});
        setAttemptSummary(null);
    };

    const submitTest = async () => {
        if (!activeTest) {
            return;
        }

        const totalQuestions = activeTest.questions?.length || 0;
        const correctAnswers = activeTest.questions.reduce((count, question) => {
            return Number(answers[question.id]) === question.answer
                ? count + 1
                : count;
        }, 0);
        const score = totalQuestions
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0;
        const passed = score >= Number(activeTest.passing_score || 60);

        await submitAptitudeAttempt({
            testId: activeTest.id,
            answers,
            score,
            totalQuestions,
            passed,
        });

        setAttemptSummary({ score, passed });
    };

    return (
        <div className="space-y-8 animate-enter pb-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                        Placement Hub
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
                        Apply to drives, track alerts, and practice aptitude rounds
                        matched to your verified skills.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={fillRandomDrives}
                        className="text-xs sm:text-sm"
                    >
                        Fill Demo Drives
                    </Button>
                    <DriveBadge label={`CGPA ${cgpa || '0.00'}`} active />
                    <DriveBadge label={`${skills.length} verified skills`} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: 'Matched Openings',
                        value: matchedOpenings.length,
                        icon: Target,
                        color: 'bg-blue-50 text-blue-700',
                    },
                    {
                        label: 'Applications',
                        value: myApplications.length,
                        icon: Briefcase,
                        color: 'bg-emerald-50 text-emerald-700',
                    },
                    {
                        label: 'Unread Alerts',
                        value: unreadNotifications.length,
                        icon: Bell,
                        color: 'bg-amber-50 text-amber-700',
                    },
                    {
                        label: 'Tests Cleared',
                        value: passedTests.length,
                        icon: ClipboardCheck,
                        color: 'bg-violet-50 text-violet-700',
                    },
                ].map((card) => {
                    const Icon = card.icon;

                    return (
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
                                </div>
                                <div className={`rounded-2xl p-3 ${card.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Skill-Matched Openings
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Companies are ranked by skill overlap, CGPA fit, and
                                application readiness.
                            </p>
                        </div>
                    </div>

                    {driveCards.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
                            No placement drives yet. Add demo drives or publish a new
                            drive from the placement portal.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {driveCards.map((drive) => (
                                <div
                                    key={drive.id}
                                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">
                                                    {drive.company_name}
                                                </h4>
                                                <p className="text-sm text-slate-500">
                                                    {drive.role_offered} • {drive.package_lpa} LPA
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <DriveBadge
                                                    label={`${drive.skillMatchPercent}% skill match`}
                                                    active={drive.skillMatchPercent >= 60}
                                                />
                                                <DriveBadge
                                                    label={`Min CGPA ${drive.eligibility_cgpa}`}
                                                />
                                                <DriveBadge
                                                    label={`Deadline ${new Date(
                                                        drive.application_deadline || drive.drive_date
                                                    ).toLocaleDateString()}`}
                                                />
                                            </div>

                                            <p className="text-sm leading-6 text-slate-600">
                                                {drive.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {drive.requiredSkills.length ? (
                                                    drive.requiredSkills.map((skill) => (
                                                        <Badge
                                                            key={skill}
                                                            variant="outline"
                                                            className={`border ${
                                                                drive.matchedSkills.includes(skill)
                                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                    : 'border-slate-200 bg-white text-slate-600'
                                                            }`}
                                                        >
                                                            {skill}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <Badge variant="outline">
                                                        General eligibility
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex min-w-[210px] flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                    Eligibility
                                                </p>
                                                <p
                                                    className={`text-sm font-semibold ${
                                                        drive.eligible
                                                            ? 'text-emerald-700'
                                                            : 'text-amber-700'
                                                    }`}
                                                >
                                                    {drive.eligible
                                                        ? 'Ready to apply'
                                                        : 'Needs attention'}
                                                </p>
                                            </div>

                                            <div className="space-y-1 text-sm text-slate-500">
                                                <p>
                                                    Department:{' '}
                                                    <span className="font-semibold text-slate-900">
                                                        {drive.departmentEligible
                                                            ? 'Eligible'
                                                            : 'Not eligible'}
                                                    </span>
                                                </p>
                                                <p>
                                                    CGPA:{' '}
                                                    <span className="font-semibold text-slate-900">
                                                        {drive.cgpaEligible
                                                            ? 'Eligible'
                                                            : 'Below cutoff'}
                                                    </span>
                                                </p>
                                                <p>
                                                    Applications:{' '}
                                                    <span className="font-semibold text-slate-900">
                                                        {drive.application?.status || 'Not applied'}
                                                    </span>
                                                </p>
                                            </div>

                                            <Button
                                                onClick={() => handleApply(drive.id)}
                                                disabled={
                                                    !drive.eligible || Boolean(drive.application)
                                                }
                                                className="bg-slate-900 text-white hover:bg-slate-800"
                                            >
                                                {drive.application
                                                    ? `Applied (${drive.application.status})`
                                                    : 'Apply now'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Drive Notifications
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    New drives and application updates arrive here.
                                </p>
                            </div>
                            <Bell className="h-5 w-5 text-slate-400" />
                        </div>

                        {myNotifications.length === 0 ? (
                            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-400">
                                No notifications yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {myNotifications.slice(0, 5).map((notification) => (
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

                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900">
                            Verified Skill Stack
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Built from approved activities and verified semester
                            results.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {skills.length ? (
                                skills.map((skill) => (
                                    <Badge key={skill} variant="outline">
                                        {skill}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400">
                                    Add skill tags to activities to improve drive matching.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">
                            Aptitude Practice Center
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Each test is aligned to a live or upcoming company drive.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <GraduationCap className="h-4 w-4" />
                        Best prep works when you practice the company-linked round
                        before applying.
                    </div>
                </div>

                {testCards.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
                        No aptitude tests yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                        <div className="space-y-3">
                            {testCards.map((test) => (
                                <button
                                    key={test.id}
                                    onClick={() => startTest(test.id)}
                                    className={`w-full rounded-2xl border p-4 text-left transition ${
                                        activeTestId === test.id
                                            ? 'border-slate-900 bg-slate-900 text-white'
                                            : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">
                                                {test.title}
                                            </p>
                                            <p
                                                className={`mt-1 text-sm ${
                                                    activeTestId === test.id
                                                        ? 'text-slate-300'
                                                        : 'text-slate-500'
                                                }`}
                                            >
                                                {test.relatedDrive?.role_offered ||
                                                    'General aptitude'}
                                            </p>
                                        </div>
                                        {test.bestScore !== null && (
                                            <Badge
                                                variant="outline"
                                                className={
                                                    activeTestId === test.id
                                                        ? 'border-white/30 bg-white/10 text-white'
                                                        : ''
                                                }
                                            >
                                                Best {test.bestScore}%
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                            {!activeTest ? (
                                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-slate-400">
                                    <Sparkles className="mb-3 h-10 w-10" />
                                    Choose a test to begin.
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900">
                                            {activeTest.title}
                                        </h4>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {activeTest.description}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {activeTest.questions.map(
                                            (question, questionIndex) => (
                                                <div
                                                    key={question.id}
                                                    className="rounded-2xl border border-slate-200 bg-white p-4"
                                                >
                                                    <p className="font-semibold text-slate-900">
                                                        {questionIndex + 1}. {question.question}
                                                    </p>
                                                    <div className="mt-3 space-y-2">
                                                        {question.options.map(
                                                            (option, optionIndex) => (
                                                                <label
                                                                    key={option}
                                                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={question.id}
                                                                        checked={
                                                                            Number(
                                                                                answers[question.id]
                                                                            ) === optionIndex
                                                                        }
                                                                        onChange={() =>
                                                                            setAnswers((current) => ({
                                                                                ...current,
                                                                                [question.id]:
                                                                                    optionIndex,
                                                                            }))
                                                                        }
                                                                    />
                                                                    <span>{option}</span>
                                                                </label>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            onClick={submitTest}
                                            className="bg-slate-900 text-white hover:bg-slate-800"
                                        >
                                            Submit Test
                                        </Button>
                                        {attemptSummary && (
                                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                                                <CheckCircle2 className="h-4 w-4" />
                                                {attemptSummary.passed
                                                    ? `Passed with ${attemptSummary.score}%`
                                                    : `Scored ${attemptSummary.score}%`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
