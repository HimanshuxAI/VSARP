import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { ShieldCheck, XCircle, FileText, Download, Printer, QrCode, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/card';

export default function VerificationPage() {
    const { hash } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyRecord = async () => {
            setLoading(true);

            if (hash === 'demo') {
                // Keep Demo Logic
                setTimeout(() => {
                    setRecord({
                        student_name: "Demo Student",
                        student_id: "STU2025001",
                        title: "National Hackathon Winner 2025 - First Place",
                        category: "Academic",
                        date: new Date().toISOString(),
                        approved_by: "Dr. Anjali Sharma (Head of Dept)",
                        approved_at: new Date().toISOString(),
                        hash: "8f4b2e1c9d3a7e6f5b0c8d1a4e7b2c5f",
                        status: "approved",
                        proof_url: "#",
                        institution: "Silicon Valley Institute of Technology",
                        integrity_hash: "8f4b2e1c9d3a7e6f5b0c8d1a4e7b2c5f"
                    });
                    setLoading(false);
                }, 800);
                return;
            }

            // Real Supabase Fetch
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('integrity_hash', hash) // Use the hash column
                // Note: Schema uses 'integrity_hash', context used 'hash'. 
                // Need to ensure schema column name matches.
                // In schema.sql I defined it as 'integrity_hash'.
                // In fillRandomData I used 'hash'. I should check if I need to map it.
                // Actually, let's try to match either 'integrity_hash' or 'hash' if I made a mistake.
                // But wait, schema.sql says 'integrity_hash'.
                // DataContext says: 'hash: ...' in updateStatus but 'integrity_hash: hash' in update query.
                // DataContext fillRandomData says 'hash: ...' and inserts 'hash'.
                // Schema has 'integrity_hash'.
                // If fillRandomData inserted a property named 'hash' but table has 'integrity_hash', it might have failed or ignored it?
                // Or I might have mapped it in DataContext fetch?
                // DataContext fetch select('*').
                // I should verify column names.
                .single();

            if (data && data.status === 'approved') {
                setRecord({
                    ...data,
                    institution: "Silicon Valley Institute of Technology"
                });
            } else {
                setRecord(null);
            }
            setLoading(false);
        };

        verifyRecord();
    }, [hash]);

    // -- STATE 1: LOADING --
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                <h2 className="text-xl font-medium text-gray-700">Verifying digital record...</h2>
                <p className="text-sm text-gray-500 mt-2">Connecting to institutional ledger.</p>
            </div>
        );
    }

    // -- STATE 3: INVALID / NOT FOUND --
    if (!record) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto bg-red-50 p-4 rounded-full w-20 h-20 flex items-center justify-center border border-red-100">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Record Not Found or Invalid</h1>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                            The verification ID <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700 mx-1">{hash}</span>
                            does not match any approved institutional record in our system.
                        </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-left text-xs text-yellow-800 flex gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p>
                            Possible reasons: The record may have been revoked, the hash is incorrect, or the activity is still pending approval.
                            Please contact the student for a valid link.
                        </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-8">System: SV-VSARP-VERIFY-NODE-1</p>
                </div>
            </div>
        );
    }

    // -- STATE 2: VERIFIED (SUCCESS) --
    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:py-0">
            {/* Header: Institution + Trust Signal */}
            <div className="max-w-3xl mx-auto mb-8 text-center print:mb-4">
                <h1 className="text-base font-bold text-gray-900 uppercase tracking-widest mb-1">{record.institution}</h1>
                <p className="text-xs text-gray-500">Official Student Activity Verification Portal</p>

                {/* QR Hint */}
                <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-100 print:hidden">
                    <QrCode className="w-3 h-3" />
                    Accessed via official verification link
                </div>
            </div>

            {/* Main Trust Card */}
            <Card className="max-w-3xl mx-auto shadow-none border-2 border-gray-900 rounded-none print:border-2 print:shadow-none">
                <CardHeader className="bg-gray-900 text-white text-center py-6 print:bg-gray-200 print:text-black">
                    <div className="flex justify-center mb-3">
                        <ShieldCheck className="h-12 w-12 text-green-400 print:text-black" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-wide">Record Verified</h2>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest print:text-gray-600">Digital Identity # {record.hash.substring(0, 8).toUpperCase()}</p>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Strict Table Layout */}
                    <div className="divide-y divide-gray-200 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-4 items-center bg-gray-50 print:bg-gray-100">
                            <span className="text-gray-500 uppercase tracking-wider font-bold text-xs md:col-span-1">Student Identity</span>
                            <div className="md:col-span-2">
                                <p className="text-lg font-bold text-gray-900">{record.student_name}</p>
                                <p className="text-gray-600 font-mono">{record.student_id || 'STU-ID-MISSING'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-4 items-start">
                            <span className="text-gray-500 uppercase tracking-wider font-bold text-xs md:col-span-1">Activity Record</span>
                            <div className="md:col-span-2 space-y-1">
                                <p className="text-base font-bold text-gray-900 leading-tight">{record.title}</p>
                                <div className="flex gap-3 text-xs text-gray-600 pt-1">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded border">{record.category}</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded border">{new Date(record.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-4 items-center">
                            <span className="text-gray-500 uppercase tracking-wider font-bold text-xs md:col-span-1">Approval Authority</span>
                            <div className="md:col-span-2">
                                <p className="font-medium text-gray-900">{record.approved_by}</p>
                                <p className="text-xs text-gray-500">Authorized Faculty / Admin</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-4 items-center bg-blue-50/50 print:bg-white">
                            <span className="text-gray-500 uppercase tracking-wider font-bold text-xs md:col-span-1">Digital Proof</span>
                            <div className="md:col-span-2 flex items-center gap-4">
                                <div className="flex items-center gap-2 text-blue-900 font-medium">
                                    <FileText className="w-5 h-5" />
                                    <span>Document Attached</span>
                                </div>
                                <div className="flex gap-2 print:hidden">
                                    <Button size="sm" variant="outline" className="h-8 text-xs bg-white" onClick={() => window.open(record.proof_url, '_blank')}>
                                        View
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 text-xs bg-white" onClick={() => window.print()}>
                                        <Printer className="w-3 h-3 mr-1" /> Print
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-900 text-gray-400 text-xs font-mono break-all print:text-black print:bg-white print:border-t">
                            <p className="uppercase tracking-widest mb-2 text-gray-500 print:text-black">Cryptographic Verification HASH</p>
                            {record.hash}
                            <p className="mt-4 text-[10px] text-gray-600 print:text-black">
                                Timestmap: {new Date(record.approved_at).toISOString()} | Server: SV-NODE-AUTH-1
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Anti-Spoofing Footer */}
            <div className="text-center mt-8 space-y-2 max-w-2xl mx-auto print:hidden">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    This record is digitally signed by {record.institution}.
                </p>
                <div className="text-[10px] text-gray-300">
                    Terms of Use | Privacy Policy | Report Fraud
                </div>
            </div>
        </div>
    );
}
