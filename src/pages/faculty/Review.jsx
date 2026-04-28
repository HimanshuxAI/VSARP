import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Check, X, Eye, FileText, AlertTriangle, Download, Keyboard, Maximize, Activity, Zap, ShieldAlert } from 'lucide-react';

export default function FacultyReview() {
    const { activities, semesterResults, updateStatus, updateResultStatus } = useData();
    const { user } = useAuth();

    // Filter only Pending
    const pendingActivities = activities.filter(a => a.status === 'pending');

    // State
    const [selectedId, setSelectedId] = useState(null);
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectionComment, setRejectionComment] = useState('');
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Session Metrics (Local state for "Closure")
    const [sessionStats, setSessionStats] = useState({ approved: 0, rejected: 0 });

    // Derived Selection
    const selectedActivity = pendingActivities.find(a => a.id === selectedId);

    // AI Confidence Logic (Mock)
    const getAiScore = (desc, proof) => {
        if (!desc) return { score: 0, label: 'Unknown' };
        let score = 95;
        if (desc.length < 50) score -= 20;
        if (desc.length < 20) score -= 40;
        // Mock proof check
        if (!proof) score -= 100;

        return {
            score,
            label: score > 80 ? 'Low Risk' : score > 50 ? 'Medium Risk' : 'High Risk',
            color: score > 80 ? 'text-green-600 bg-green-50' : score > 50 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
        };
    };

    const aiSignal = selectedActivity ? getAiScore(selectedActivity.description, selectedActivity.proof_url) : null;


    // Multi-submission Count
    const studentPendingCount = selectedActivity
        ? pendingActivities.filter(a => a.student_id === selectedActivity.student_id).length
        : 0;

    // Auto-select first if none selected
    useEffect(() => {
        if (!selectedId && pendingActivities.length > 0) {
            setSelectedId(pendingActivities[0].id);
        }
    }, [pendingActivities.length, selectedId]);

    // Keyboard Shortcuts
    const handleKeyDown = useCallback((e) => {
        if (processing || !selectedActivity) return;

        // Only if not typing in comment box
        if (e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const idx = pendingActivities.findIndex(a => a.id === selectedId);
                if (idx < pendingActivities.length - 1) setSelectedId(pendingActivities[idx + 1].id);
            }
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const idx = pendingActivities.findIndex(a => a.id === selectedId);
                if (idx > 0) setSelectedId(pendingActivities[idx - 1].id);
            }
            if (e.key === 'a' || e.key === 'A') {
                if (!rejectMode) setShowApproveConfirm(true);
            }
            if (e.key === 'r' || e.key === 'R') {
                setRejectMode(true);
                // setTimeout to focus textarea? (Optional enhancement)
            }
            if (e.key === 'Escape') {
                setRejectMode(false);
                setShowApproveConfirm(false);
            }
        }
    }, [processing, selectedActivity, pendingActivities, selectedId, rejectMode]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);


    const handleApprove = () => {
        setProcessing(true);
        setTimeout(() => {
            updateStatus(selectedId, 'approved', '', user.name);
            setSessionStats(prev => ({ ...prev, approved: prev.approved + 1 }));
            setProcessing(false);
            setShowApproveConfirm(false);
        }, 800);
    };

    const handleReject = () => {
        if (rejectionComment.length < 10) return;
        setProcessing(true);
        setTimeout(() => {
            updateStatus(selectedId, 'rejected', rejectionComment, user.name);
            setSessionStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
            setProcessing(false);
            setRejectMode(false);
            setRejectionComment('');
        }, 800);
    };

    const REJECTION_TEMPLATES = [
        "Insufficient proof provided.",
        "Document is blurry or unreadable.",
        "Date mismatch with academic calendar.",
        "Activity does not meet category criteria.",
        "Not an institution-recognized event."
    ];

    const applyTemplate = (template) => {
        setRejectionComment(prev => (prev ? prev + " " + template : template));
    };

    const [reviewTab, setReviewTab] = useState('activities');
    const pendingResults = semesterResults.filter(r => r.verification_status === 'pending');

    const handleApproveResult = async (resultId) => {
        await updateResultStatus(resultId, 'verified', user.name);
    };

    const handleRejectResult = async (resultId) => {
        await updateResultStatus(resultId, 'rejected', user.name);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-4 shrink-0">
                <button onClick={() => setReviewTab('activities')} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${reviewTab === 'activities' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    <Activity className="w-4 h-4" /> Activities ({pendingActivities.length})
                </button>
                <button onClick={() => setReviewTab('results')} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${reviewTab === 'results' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    <FileText className="w-4 h-4" /> Results ({pendingResults.length})
                </button>
            </div>

            {/* ═══ RESULTS TAB ═══ */}
            {reviewTab === 'results' ? (
                <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                        <h3 className="text-lg font-bold text-gray-900">Pending Result Approvals</h3>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{pendingResults.length} pending</span>
                    </div>
                    {pendingResults.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <Check className="w-10 h-10 mb-3 opacity-30" />
                            <p className="font-medium">All results reviewed. Queue empty.</p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto flex-1 p-4 space-y-3">
                            {pendingResults.map(result => (
                                <div key={result.id} className="border border-gray-100 rounded-xl p-4 bg-white hover:shadow-sm transition">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-bold text-gray-900">{result.subject}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {result.subject_code} • Semester {result.semester} • Credits: {result.credits} • Grade: {result.grade} • Marks: {result.marks}/{result.max_marks}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">Student ID: {result.student_id?.substring(0, 8)}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button size="sm" variant="outline" onClick={() => handleRejectResult(result.id)} className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-3">
                                                <X className="w-3 h-3 mr-1" /> Reject
                                            </Button>
                                            <Button size="sm" onClick={() => handleApproveResult(result.id)} className="bg-green-600 hover:bg-green-700 text-white h-8 px-3">
                                                <Check className="w-3 h-3 mr-1" /> Verify
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
            <>
            <header className="mb-4 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        Review Queue <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Live"></div>
                    </h2>
                    <div className="flex gap-4 text-sm mt-1">
                        <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Pending: {pendingActivities.length}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-green-700 font-medium">Session Approved: {sessionStats.approved}</span>
                        <span className="text-red-700 font-medium">Session Rejected: {sessionStats.rejected}</span>
                    </div>
                </div>
                <div className="text-xs text-gray-400 hidden xl:flex items-center gap-2 border border-gray-200 px-3 py-1 rounded bg-white shadow-sm">
                    <Keyboard className="w-3 h-3" />
                    <span>Shortcuts: A (Approve) • R (Reject) • Arrows (Nav)</span>
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* LEFT PANE: Submission List (1/3) */}
                <div className="w-1/3 bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden rounded-xl">
                    <div className="bg-gray-50/50 backdrop-blur px-4 py-3 border-b border-gray-200 shrink-0 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Submission Stream</h3>
                        <Activity className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2 scroller">
                        {pendingActivities.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
                                <span className="bg-gray-100 p-3 rounded-full"><Check className="w-5 h-5" /></span>
                                All caught up! Queue empty.
                            </div>
                        ) : (
                            pendingActivities.map(activity => (
                                <div
                                    key={activity.id}
                                    onClick={() => {
                                        setSelectedId(activity.id);
                                        setRejectMode(false);
                                        setShowApproveConfirm(false);
                                    }}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 group ${selectedId === activity.id
                                        ? 'bg-blue-50/80 border-blue-500 shadow-md translate-x-1'
                                        : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm hover:translate-x-0.5'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-900 text-sm line-clamp-1">{activity.student_name}</span>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap font-mono">{new Date(activity.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium line-clamp-1 mb-2">{activity.title}</p>
                                    <div className="flex justify-between items-center">
                                        <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-gray-100 text-gray-500 border-gray-200">{activity.category}</Badge>
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT PANE: Details & Actions (2/3) */}
                <div className="flex-1 bg-white border border-gray-200 shadow-xl flex flex-col overflow-hidden rounded-xl relative ring-1 ring-black/5">
                    {selectedActivity ? (
                        <>
                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 scroller">
                                {/* Header Info */}
                                <div className="pb-2">
                                    <div className="flex justify-between items-start mb-4">
                                        <h1 className="text-3xl font-bold text-gray-900 leading-tight flex-1">{selectedActivity.title}</h1>
                                        {/* AI SIGNAL CARD */}
                                        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${aiSignal.color} text-xs font-bold uppercase tracking-wide animate-enter`}>
                                            <Zap className="w-3 h-3 fill-current" />
                                            AI Score: {aiSignal.score}/100
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-600 border-b border-gray-100 pb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Student</span>
                                            <span className="font-semibold text-gray-900">{selectedActivity.student_name}</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200 mx-2"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">ID</span>
                                            <span className="font-mono text-gray-700">{selectedActivity.student_id || 'STU-ID'}</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200 mx-2"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Category</span>
                                            <span className="font-medium text-gray-900">{selectedActivity.category}</span>
                                        </div>

                                        {studentPendingCount > 1 && (
                                            <span className="ml-auto bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded border border-yellow-200 font-medium flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                {studentPendingCount} pending from this student
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        Activity Description
                                        {/* <span className="text-[10px] text-gray-400 font-normal normal-case ml-auto">Verified unique content</span> */}
                                    </h4>
                                    <p className="text-base text-gray-800 leading-relaxed max-w-none font-medium">
                                        {selectedActivity.description}
                                    </p>
                                </div>

                                {/* Proof Visualization */}
                                <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <Eye className="w-3 h-3" /> Proof Document
                                        </h4>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => window.open(selectedActivity.proof_url, '_blank')}>
                                                <Maximize className="w-3 h-3 mr-1" /> Full
                                            </Button>
                                            <a href={selectedActivity.proof_url} download className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center px-2 py-1 hover:bg-blue-50 rounded uppercase">
                                                <Download className="w-3 h-3 mr-1" /> Download
                                            </a>
                                        </div>
                                    </div>

                                    <div className="aspect-video w-full bg-slate-50 flex items-center justify-center relative overflow-hidden group">
                                        {/* Mock Document */}
                                        <div className="w-3/4 h-[90%] bg-white shadow-xl border border-gray-200 flex flex-col p-8 items-center justify-center transition-transform group-hover:scale-105 duration-500">
                                            <FileText className="w-16 h-16 text-gray-300 mb-4" />
                                            <div className="space-y-2 w-full">
                                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                                <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                                                <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-8 font-mono">PREVIEW MODE</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Accountability Footer */}
                            <div className="bg-white border-t border-gray-100 px-6 py-2 text-[10px] text-gray-400 flex justify-between items-center">
                                <span>SESSION ID: <span className="font-mono text-gray-600">{user.id.substring(0, 8)}</span></span>
                                <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Audit logging active</span>
                            </div>

                            {/* Sticky Action Footer */}
                            <div className="border-t border-gray-200 bg-gray-50/50 backdrop-blur p-4 flex justify-between items-center shrink-0">
                                <div className="flex-1 pr-4">
                                    {rejectMode && (
                                        <div className="animate-in slide-in-from-bottom-2 fade-in space-y-2">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {REJECTION_TEMPLATES.map((tmpl, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => applyTemplate(tmpl)}
                                                        className="text-[10px] bg-white text-red-700 border border-red-200 hover:bg-red-50 hover:border-red-300 px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm"
                                                    >
                                                        {tmpl}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <textarea
                                                    value={rejectionComment}
                                                    onChange={(e) => setRejectionComment(e.target.value)}
                                                    autoFocus
                                                    placeholder="Mandatory: Reason for rejection (Min 10 chars)..."
                                                    className="w-full text-sm p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-20 resize-none shadow-inner"
                                                />
                                                <span className={`absolute bottom-2 right-2 text-[10px] font-bold ${rejectionComment.length < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {rejectionComment.length}/10
                                                </span>
                                            </div>

                                            <div className="flex justify-end mt-2">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    disabled={rejectionComment.length < 10 || processing}
                                                    onClick={handleReject}
                                                    className="shadow-md hover:shadow-lg transition-all"
                                                >
                                                    {processing ? 'Rejecting...' : 'Confirm Rejection'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {showApproveConfirm && !rejectMode && (
                                        <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2 fade-in shadow-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-green-100 p-2 rounded-full shadow-inner">
                                                    <AlertTriangle className="w-5 h-5 text-green-700" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-green-900">Final Authorization</h4>
                                                    <p className="text-[11px] text-green-800 mt-0.5 leading-tight">
                                                        Permanent hash generation triggered. Action is irreversible.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setShowApproveConfirm(false)} className="text-green-800 hover:bg-green-100 hover:text-green-900 h-9">
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white border-0 h-9 px-6 shadow-green-200 shadow-lg font-bold"
                                                    disabled={processing}
                                                    onClick={handleApprove}
                                                >
                                                    {processing ? 'Signing...' : 'Yes, Sign & Approve'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Primary Buttons (Hidden if modes active) */}
                                {!rejectMode && !showApproveConfirm && (
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-red-600 hover:border-red-200 transition-all font-medium" onClick={() => setRejectMode(true)}>
                                            <X className="w-4 h-4 mr-2" />
                                            Reject (R)
                                        </Button>
                                        <Button className="h-11 w-48 bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-bold text-base" onClick={() => setShowApproveConfirm(true)}>
                                            <Check className="w-5 h-5 mr-2" />
                                            Approve (A)
                                        </Button>
                                    </div>
                                )}

                                {rejectMode && !processing && (
                                    <Button variant="ghost" size="sm" onClick={() => setRejectMode(false)} className="ml-2 text-gray-400 hover:text-gray-600 absolute top-4 right-4">
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Check className="w-10 h-10 text-gray-200" />
                            </div>
                            <p className="font-medium">Selected activity details will appear here</p>
                        </div>
                    )}
                </div>
            </div>
            </>
            )}
        </div>
    );
}
