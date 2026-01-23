import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ShieldCheck, User, Lock, Mail, Building, BookOpen, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        student_id: '',
        department: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to create account');
            setLoading(false);
        }
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
                <div className="glass-elite p-8 md:p-10 rounded-3xl relative border border-white/40 shadow-xl backdrop-blur-3xl bg-white/60">
                    <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-slate-900 p-1.5 shadow-xl animate-float">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 drop-shadow-sm">
                            Join VSARP
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide text-sm">REQUEST ACCESS</p>
                    </div>

                    {success ? (
                        <div className="mt-10 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-3">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-green-800 font-bold">Request Submitted</h3>
                            <p className="text-green-700 text-sm">Your account is pending administrator approval. You will be redirected to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                            {/* Role Selection */}
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {['student', 'faculty'].map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role })}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.role === role
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                        <Input
                                            name="name"
                                            required
                                            placeholder="Full Name"
                                            className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900/10 rounded-xl"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                        <Input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="Email Address"
                                            className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900/10 rounded-xl"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="Password"
                                        className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900/10 rounded-xl"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                        <Input
                                            name="department"
                                            required
                                            placeholder="Department"
                                            className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900/10 rounded-xl"
                                            value={formData.department}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {formData.role === 'student' && (
                                        <div className="relative group">
                                            <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                            <Input
                                                name="student_id"
                                                required
                                                placeholder="Student ID"
                                                className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900/10 rounded-xl"
                                                value={formData.student_id}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" variant="default" className="w-full h-11 text-lg font-bold tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all bg-slate-900 text-white" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
