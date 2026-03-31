import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import {
    AlertTriangle,
    CheckCircle2,
    FileText,
    Printer,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export default function VerificationPage() {
    const { hash } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecord = async () => {
            setLoading(true);

            if (hash === 'demo') {
                setRecord({
                    kind: 'activity',
                    student_name: 'Demo Student',
                    student_reg_no: 'STU-2025-001',
                    title: 'National Hackathon Winner 2025',
                    category: 'Hackathon',
                    date: new Date().toISOString(),
                    approved_by: 'Dr. Anjali Sharma',
                    approved_at: new Date().toISOString(),
                    integrity_hash: hash,
                    institution: 'VSARP',
                });
                setLoading(false);
                return;
            }

            if (!isSupabaseConfigured) {
                const activities = JSON.parse(localStorage.getItem('vsarp_activities') || '[]');
                const results = JSON.parse(localStorage.getItem('vsarp_semester_results') || '[]');

                const activity = activities.find(
                    (item) =>
                        item.integrity_hash === hash && item.status === 'approved'
                );
                const result = results.find(
                    (item) =>
                        item.verification_hash === hash &&
                        item.verification_status === 'verified'
                );

                if (activity) {
                    setRecord({ ...activity, kind: 'activity', institution: 'VSARP' });
                } else if (result) {
                    setRecord({ ...result, kind: 'result', institution: 'VSARP' });
                } else {
                    setRecord(null);
                }

                setLoading(false);
                return;
            }

            const [activityResult, resultResult] = await Promise.all([
                supabase
                    .from('activities')
                    .select('*')
                    .eq('integrity_hash', hash)
                    .eq('status', 'approved')
                    .maybeSingle(),
                supabase
                    .from('semester_results')
                    .select('*')
                    .eq('verification_hash', hash)
                    .eq('verification_status', 'verified')
                    .maybeSingle(),
            ]);

            if (activityResult.data) {
                setRecord({
                    ...activityResult.data,
                    kind: 'activity',
                    institution: 'VSARP',
                });
            } else if (resultResult.data) {
                setRecord({
                    ...resultResult.data,
                    kind: 'result',
                    institution: 'VSARP',
                });
            } else {
                setRecord(null);
            }

            setLoading(false);
        };

        loadRecord();
    }, [hash]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                <h2 className="text-xl font-medium text-slate-700">
                    Verifying record...
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Checking the institutional verification ledger.
                </p>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-4">
                <div className="max-w-md space-y-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-red-100 bg-red-50">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Record Not Found
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            The verification code{' '}
                            <span className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">
                                {hash}
                            </span>{' '}
                            does not match any verified activity or result record.
                        </p>
                    </div>
                    <div className="flex gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-left text-xs text-yellow-800">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            The record may still be pending verification, the code may
                            be incorrect, or the entry may have been revoked.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const verificationCode = record.integrity_hash || record.verification_hash || hash;

    return (
        <div className="min-h-screen bg-white px-4 py-12 print:bg-white print:py-0">
            <div className="mx-auto mb-8 max-w-3xl text-center">
                <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-900">
                    {record.institution}
                </h1>
                <p className="mt-2 text-xs text-slate-500">
                    Official Verification Portal
                </p>
            </div>

            <Card className="mx-auto max-w-3xl rounded-none border-2 border-slate-900 shadow-none">
                <CardHeader className="bg-slate-900 py-6 text-center text-white print:bg-slate-200 print:text-black">
                    <div className="mb-3 flex justify-center">
                        <ShieldCheck className="h-12 w-12 text-emerald-400 print:text-black" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-wide">
                        Record Verified
                    </h2>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-300 print:text-slate-700">
                        {record.kind === 'activity'
                            ? 'Verified Activity Record'
                            : 'Verified Semester Result'}
                    </p>
                </CardHeader>

                <CardContent className="p-0 text-sm">
                    <div className="divide-y divide-slate-200">
                        <div className="grid grid-cols-1 gap-4 bg-slate-50 p-6 md:grid-cols-3 print:bg-slate-100">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                Student
                            </span>
                            <div className="md:col-span-2">
                                <p className="text-lg font-bold text-slate-900">
                                    {record.student_name || 'Student'}
                                </p>
                                <p className="font-mono text-slate-600">
                                    {record.student_reg_no || record.student_id || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {record.kind === 'activity' ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                        Activity
                                    </span>
                                    <div className="space-y-2 md:col-span-2">
                                        <p className="text-base font-bold text-slate-900">
                                            {record.title}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                                            <span className="rounded border bg-slate-100 px-2 py-0.5">
                                                {record.category}
                                            </span>
                                            <span className="rounded border bg-slate-100 px-2 py-0.5">
                                                {new Date(record.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {record.description && (
                                            <p className="text-sm leading-6 text-slate-600">
                                                {record.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                        Approved By
                                    </span>
                                    <div className="md:col-span-2">
                                        <p className="font-medium text-slate-900">
                                            {record.approved_by}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(record.approved_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                        Result
                                    </span>
                                    <div className="space-y-2 md:col-span-2">
                                        <p className="text-base font-bold text-slate-900">
                                            {record.subject}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                                            <span className="rounded border bg-slate-100 px-2 py-0.5">
                                                Semester {record.semester}
                                            </span>
                                            <span className="rounded border bg-slate-100 px-2 py-0.5">
                                                {record.subject_code}
                                            </span>
                                            <span className="rounded border bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                                Grade {record.grade}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                        Verified Marks
                                    </span>
                                    <div className="md:col-span-2">
                                        <p className="font-medium text-slate-900">
                                            {record.marks}/{record.max_marks} • Credits {record.credits}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Verified by {record.verified_by} on{' '}
                                            {new Date(record.verified_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-1 gap-4 bg-slate-50 p-6 md:grid-cols-3 print:bg-white">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                Verification Code
                            </span>
                            <div className="break-all font-mono text-xs text-slate-700 md:col-span-2">
                                {verificationCode}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 print:hidden">
                            <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Digitally verified by VSARP
                            </div>
                            <div className="flex gap-2">
                                {record.proof_url && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(record.proof_url, '_blank')}
                                    >
                                        <FileText className="mr-2 h-3 w-3" />
                                        View proof
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.print()}
                                >
                                    <Printer className="mr-2 h-3 w-3" />
                                    Print
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
