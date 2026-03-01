import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Eye, CheckCircle, XCircle, MessageSquare, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function ActivityVerification() {
    const { user } = useAuth();
    const { activities, hodVerifyActivity, loading } = useData();
    const dept = user.department || 'Computer Science';
    const [expandedId, setExpandedId] = useState(null);
    const [comment, setComment] = useState('');
    const [filter, setFilter] = useState('pending_hod');

    // Activities in HOD's department that are faculty-approved, awaiting HOD Level-2
    const deptActivities = useMemo(() => {
        return activities.filter(a => {
            const matchesDept = (a.department || 'General') === dept;
            if (filter === 'pending_hod') return matchesDept && a.status === 'approved' && !a.hod_status;
            if (filter === 'hod_approved') return matchesDept && a.hod_status === 'approved';
            if (filter === 'hod_rejected') return matchesDept && a.hod_status === 'rejected';
            return matchesDept;
        });
    }, [activities, dept, filter]);

    const handleVerify = (id, status) => {
        hodVerifyActivity(id, status, comment || `${status} by HOD`, user.name, user.id);
        setComment('');
        setExpandedId(null);
    };

    const statusBadge = (a) => {
        if (a.hod_status === 'approved') return <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">HOD Approved</span>;
        if (a.hod_status === 'rejected') return <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-700">HOD Rejected</span>;
        if (a.status === 'approved') return <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700">Awaiting HOD</span>;
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">{a.status}</span>;
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900" />
        </div>
    );

    return (
        <div className="space-y-6 animate-enter pb-10">
            <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Activity Verification</h2>
                <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">Level-2 HOD verification for {dept} activities</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: 'pending_hod', label: 'Pending HOD Review' },
                    { key: 'hod_approved', label: 'HOD Approved' },
                    { key: 'hod_rejected', label: 'HOD Rejected' },
                    { key: 'all', label: 'All' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f.key
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Activity List */}
            <div className="space-y-3">
                {deptActivities.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16 text-slate-400">
                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No activities to review.</p>
                    </div>
                ) : (
                    deptActivities.map(a => (
                        <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h4 className="font-semibold text-slate-900">{a.title}</h4>
                                        {statusBadge(a)}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{a.student_name} · {a.category} · {new Date(a.date || a.submitted_at).toLocaleDateString()}</p>
                                </div>
                                {expandedId === a.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </div>

                            {expandedId === a.id && (
                                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-slate-500">Student:</span> <span className="font-medium text-slate-900">{a.student_name}</span></div>
                                        <div><span className="text-slate-500">Reg No:</span> <span className="font-medium text-slate-900">{a.student_reg_no || '—'}</span></div>
                                        <div><span className="text-slate-500">Category:</span> <span className="font-medium text-slate-900">{a.category}</span></div>
                                        <div><span className="text-slate-500">Faculty Status:</span> <span className="font-medium text-green-600">Approved by {a.approved_by || 'Faculty'}</span></div>
                                    </div>
                                    <p className="text-sm text-slate-600">{a.description}</p>
                                    {a.reviewer_comment && (
                                        <div className="text-sm bg-slate-50 rounded-lg p-3">
                                            <span className="text-slate-500">Faculty Comment:</span> <span className="text-slate-700">{a.reviewer_comment}</span>
                                        </div>
                                    )}

                                    {!a.hod_status && (
                                        <div className="space-y-3 pt-2">
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <textarea
                                                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                                                    rows={2}
                                                    placeholder="HOD comment (optional)..."
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleVerify(a.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm">
                                                    <CheckCircle className="w-4 h-4" /> Approve (L2)
                                                </Button>
                                                <Button onClick={() => handleVerify(a.id, 'rejected')} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2 text-sm">
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {a.hod_status && (
                                        <div className={`text-sm rounded-lg p-3 ${a.hod_status === 'approved' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                            <span className="font-semibold">HOD {a.hod_status}</span> by {a.hod_verified_by} · {a.hod_comment}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
