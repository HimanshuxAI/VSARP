import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ShieldCheck, User, Lock, Sparkles } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { DEMO_LOGINS, resetDemoData } from '../../lib/seedData';

export default function LoginPage() {
    const { login, user, loading: authLoading, isSupabaseConfigured } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('student');

    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === 'student') navigate('/student/dashboard');
            else if (user.role === 'faculty') navigate('/faculty/review');
            else if (user.role === 'admin') navigate('/admin/overview');
            else if (user.role === 'hod') navigate('/hod/dashboard');
            else if (user.role === 'placement_cell') navigate('/placement/drives');
        }
    }, [authLoading, navigate, user]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to sign in');
            setLoading(false);
        }
    };

    const fillDemo = (role) => {
        if (isSupabaseConfigured) {
            return;
        }

        setActiveTab(role);
        if (role === 'student') { setEmail('student@test.com'); setPassword('password123'); }
        if (role === 'faculty') { setEmail('faculty@test.com'); setPassword('password123'); }
        if (role === 'admin') { setEmail('admin@test.com'); setPassword('password123'); }
        if (role === 'hod') { setEmail('hod@test.com'); setPassword('password123'); }
        if (role === 'placement') { setEmail('placement@test.com'); setPassword('password123'); }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-void">
            {/* Dynamic Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-nebula-500/20 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cosmic-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-4s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-full max-w-lg z-10 p-4 perspective-1000"
            >
                {/* Glass Holo-Card */}
                <div className="glass-elite p-8 md:p-12 rounded-3xl relative border border-white/40 shadow-xl backdrop-blur-3xl bg-white/60">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-slate-900 p-1.5 shadow-xl animate-float">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 drop-shadow-sm">
                            VSARP <span className="text-xs align-top opacity-50 font-mono text-slate-500">v2.0</span>
                        </h1>

                        <p className="text-slate-500 font-medium tracking-wide text-sm">SECURE ACADEMIC LEDGER</p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-10 space-y-5">
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    className="pl-12 h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900/10 rounded-xl transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading || authLoading}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="passcode"
                                    className="pl-12 h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900/10 rounded-xl transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading || authLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-red-400" />
                                {error}
                            </motion.div>
                        )}

                        <Button type="submit" variant="default" className="w-full h-12 text-lg font-bold tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all" disabled={loading || authLoading}>
                            {authLoading
                                ? 'Checking session...'
                                : loading
                                  ? 'Authenticating...'
                                  : 'Access Portal'}
                        </Button>
                        <div className="text-center mt-4">
                            <span className="text-sm text-slate-500">New here? </span>
                            <span
                                onClick={() => navigate('/register')}
                                className="text-sm font-medium text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                            >
                                Create an Account
                            </span>
                        </div>
    
                    </form>

                </div>

                <p className="text-center mt-8 text-xs text-gray-600/50 hover:text-gray-500 transition-colors cursor-pointer" onClick={() => navigate('/verify/demo')}>
                    Public Verification Access &rarr;
                </p>
            </motion.div>
        </div>
    );
}
