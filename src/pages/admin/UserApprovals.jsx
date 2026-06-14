import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { Check, X, User, Shield } from 'lucide-react';

export default function UserApprovals() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingUsers = async () => {
        setLoading(true);
        if (!isSupabaseConfigured) {
            // Mock Fetch
            const allUsers = JSON.parse(localStorage.getItem('vsarp_users') || '[]');
            const pending = allUsers.filter(u => u.status === 'pending');
            setPendingUsers(pending);
        } else {
            // Real Fetch
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setPendingUsers(data);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPendingUsers();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleApproval = async (userId, approved) => {
        if (!isSupabaseConfigured) {
            const allUsers = JSON.parse(localStorage.getItem('vsarp_users') || '[]');
            const updatedUsers = allUsers.map(u => {
                if (u.id === userId) {
                    return { ...u, status: approved ? 'active' : 'rejected' };
                }
                return u;
            });
            localStorage.setItem('vsarp_users', JSON.stringify(updatedUsers));
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            return;
        }

        // Real Update
        const status = approved ? 'active' : 'rejected';
        const { error } = await supabase
            .from('profiles')
            .update({ status })
            .eq('id', userId);

        if (!error) {
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } else {
            alert("Failed to update user status");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Approvals</h1>
                <p className="text-slate-500 mt-1">Review account creation requests</p>
            </div>

            {pendingUsers.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                    <Shield className="w-12 h-12 mb-4 opacity-20" />
                    <p>No pending approvals found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingUsers.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{req.full_name || req.name}</h3>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold uppercase">{req.role}</span>
                                        <span>&bull;</span>
                                        <span>{req.email}</span>
                                        {req.department && (
                                            <>
                                                <span>&bull;</span>
                                                <span>{req.department}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        Requested: {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleApproval(req.id, false)}
                                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                                    title="Reject"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleApproval(req.id, true)}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                                >
                                    <Check className="w-4 h-4" />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
