import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const usersToCreate = [
    { email: 'admin@vsarp.com', password: 'password123', role: 'student', name: 'Super Admin', dept: 'Administration' }, // Will override role via SQL
    ...Array.from({ length: 5 }).map((_, i) => ({
        email: `student${i + 1}@vsarp.com`,
        password: 'password123',
        role: 'student',
        name: `Student ${i + 1}`,
        student_id: `STU-2024-00${i + 1}`,
        dept: 'Computer Science'
    })),
    ...Array.from({ length: 5 }).map((_, i) => ({
        email: `faculty${i + 1}@vsarp.com`,
        password: 'password123',
        role: 'faculty',
        name: `Faculty ${i + 1}`,
        dept: 'Computer Science'
    }))
];

export default function SeedPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);
    };

    const runSeed = async () => {
        setLoading(true);
        setLogs([]);
        addLog("Starting Seed Process...", 'info');
        addLog("⚠️ NOTE: Ensure 'Confirm Email' is DISABLED in Supabase Auth Settings, or these users won't be able to login immediately.", 'warning');

        for (const user of usersToCreate) {
            addLog(`Creating ${user.email}...`, 'info');

            // 1. Sign Up
            const { data, error } = await supabase.auth.signUp({
                email: user.email,
                password: user.password,
                options: {
                    data: {
                        full_name: user.name,
                        role: user.role, // Admin role must be set via SQL later
                        department: user.dept,
                        student_id: user.student_id
                    }
                }
            });

            if (error) {
                addLog(`Failed to create ${user.email}: ${error.message}`, 'error');
            } else if (data.user) {
                if (data.user.identities?.length === 0) {
                    addLog(`User ${user.email} already exists.`, 'warning');
                } else {
                    addLog(`Created ${user.email} (ID: ${data.user.id.slice(0, 8)}...)`, 'success');
                }
            }

            // 2. Sign Out immediately so we can create the next one
            await supabase.auth.signOut();

            // Small delay to prevent rate limiting
            await new Promise(r => setTimeout(r, 500));
        }

        addLog("Seed Process Complete!", 'success');
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-mono">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
                    <p className="text-slate-600 mb-6">
                        This tool will create 11 users:
                        <br />- 1 Admin (admin@vsarp.com)
                        <br />- 5 Students (student1-5@vsarp.com)
                        <br />- 5 Faculty (faculty1-5@vsarp.com)
                        <br />
                        <strong>Password for all:</strong> password123
                    </p>

                    <Button
                        onClick={runSeed}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white hover:bg-slate-800"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Seeding...' : 'Start Seeding'}
                    </Button>
                </div>

                <div className="bg-slate-900 text-slate-200 p-6 rounded-xl h-[400px] overflow-y-auto text-sm space-y-2">
                    {logs.map((log) => (
                        <div key={log.id} className={`flex items-start gap-2 ${log.type === 'error' ? 'text-red-400' :
                                log.type === 'success' ? 'text-green-400' :
                                    log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'
                            }`}>
                            {log.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                            {log.type === 'error' && <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                            <span>{log.msg}</span>
                        </div>
                    ))}
                    {logs.length === 0 && <span className="text-slate-600 italic">Logs will appear here...</span>}
                </div>
            </div>
        </div>
    );
}
