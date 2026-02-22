import React from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, CheckSquare, ShieldCheck, LogOut, BarChart3, Command as CommandIcon, Users, Target, BookOpen, Briefcase, UserCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import CommandPalette from '../components/CommandPalette';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return <Navigate to="/login" replace />;

    const navItems = {
        student: [
            { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
            { name: 'Career Navigator', href: '/student/career-navigator', icon: Target },
            { name: 'Submit Activity', href: '/student/submit', icon: FileText },
            { name: 'Resume Builder', href: '/student/resume', icon: FileText },
        ],
        faculty: [
            { name: 'Review Pending', href: '/faculty/review', icon: CheckSquare },
            { name: 'Research Papers', href: '/faculty/publish-research', icon: BookOpen },
        ],
        admin: [
            { name: 'Overview', href: '/admin/overview', icon: LayoutDashboard },
            { name: 'User Approvals', href: '/admin/approvals', icon: Users },
            { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
            { name: 'Placement Dashboard', href: '/admin/placement', icon: Briefcase },
            { name: 'Student Shortlist', href: '/admin/shortlist', icon: UserCheck },
            { name: 'Audit Logs', href: '/admin/audit', icon: ShieldCheck },
            { name: 'Settings', href: '/admin/settings', icon: FileText },
        ]
    };

    const currentNav = navItems[user.role] || [];

    return (
        <div className="relative min-h-screen bg-background text-foreground font-sans overflow-hidden">
            {/* Unified Ambient Background (Subtle Light) */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100/50 via-white to-white" />

            <CommandPalette />

            <div className="flex h-screen p-4 gap-4 relative z-10">
                {/* Floating Glass Sidebar */}
                <aside id="app-sidebar" className="w-64 glass-panel flex flex-col h-full overflow-hidden transition-all duration-300 border-r border-slate-200">
                    <div className="p-6 border-b border-slate-100 flex flex-col">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-slate-900 text-white shadow-sm">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">VSARP</h1>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1 ml-1">{user.role} Portal</p>
                        </div>
                    </div>

                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                        {currentNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-slate-100 border-l-2 border-slate-900" />
                                    )}
                                    <Icon className={cn("mr-3 h-5 w-5 relative z-10 transition-colors", isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600")} />
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
                        <Link to="/profile" className="flex items-center px-3 py-3 mb-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 group">
                            <div className="h-10 w-10 rounded-full bg-slate-200 p-px">
                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-700">{user.name.charAt(0)}</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-slate-900 group-hover:text-slate-700 transition-colors">{user.name}</p>
                                <p className="text-xs text-slate-500">View Profile &rarr;</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400/80 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                        <div className="pt-4 mt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono text-center">
                            Press <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold">⌘K</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main id="app-main" className="flex-1 overflow-hidden h-full rounded-2xl glass-panel border-white/5 bg-void/50 backdrop-blur-sm relative">
                    <div className="h-full w-full overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-7xl mx-auto h-full">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
