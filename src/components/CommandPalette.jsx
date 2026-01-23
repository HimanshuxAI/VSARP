import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Search, LayoutDashboard, FileText, Settings, User, LogOut, CheckSquare, ShieldCheck } from 'lucide-react';

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { activities, fillRandomData } = useData();

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    // Filtered data for fast jump
    const pendingCount = activities.filter(a => a.status === 'pending').length;

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] w-full bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-xl z-50 overflow-hidden animate-enter"
        >
            <div className="flex items-center border-b border-gray-100 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Command.Input
                    placeholder="Type a command or search..."
                    className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-py-2">
                <Command.Empty className="py-6 text-center text-sm text-gray-500">No results found.</Command.Empty>

                <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-gray-500">
                    {user?.role === 'student' && (
                        <>
                            <Command.Item onSelect={() => runCommand(() => navigate('/student/dashboard'))} className="flex items-center px-2 py-2 rounded-lg text-sm text-gray-900 aria-selected:bg-blue-50 aria-selected:text-blue-700 cursor-pointer transition-colors">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => navigate('/student/submit'))} className="flex items-center px-2 py-2 rounded-lg text-sm text-gray-900 aria-selected:bg-blue-50 aria-selected:text-blue-700 cursor-pointer transition-colors">
                                <FileText className="mr-2 h-4 w-4" />
                                Submit Activity
                            </Command.Item>
                        </>
                    )}
                    {user?.role === 'faculty' && (
                        <Command.Item onSelect={() => runCommand(() => navigate('/faculty/review'))} className="flex items-center px-2 py-2 rounded-lg text-sm text-gray-900 aria-selected:bg-blue-50 aria-selected:text-blue-700 cursor-pointer transition-colors">
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Review Pending ({pendingCount})
                        </Command.Item>
                    )}
                    {user?.role === 'admin' && (
                        <>
                            <Command.Item onSelect={() => runCommand(() => navigate('/admin/overview'))} className="flex items-center px-2 py-2 rounded-lg text-sm text-gray-900 aria-selected:bg-blue-50 aria-selected:text-blue-700 cursor-pointer transition-colors">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Mission Control
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => navigate('/admin/audit'))} className="flex items-center px-2 py-2 rounded-lg text-sm text-gray-900 aria-selected:bg-blue-50 aria-selected:text-blue-700 cursor-pointer transition-colors">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Audit Logs
                            </Command.Item>
                        </>
                    )}
                    <Command.Item onSelect={() => runCommand(() => navigate('/profile'))} className="flex items-center px-2 py-2 rounded-lg text-sm text-gray-900 aria-selected:bg-blue-50 aria-selected:text-blue-700 cursor-pointer transition-colors">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Utility" className="px-2 py-1.5 text-xs font-medium text-gray-500 border-t border-gray-100 mt-2">
                    <Command.Item onSelect={() => runCommand(() => { fillRandomData(); })} className="flex items-center px-2 py-2 rounded-lg text-sm text-blue-600 aria-selected:bg-blue-50 aria-selected:text-blue-700 cursor-pointer transition-colors">
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Demo: Fill Random Data
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => { logout(); navigate('/login'); })} className="flex items-center px-2 py-2 rounded-lg text-sm text-red-600 aria-selected:bg-red-50 aria-selected:text-red-700 cursor-pointer transition-colors">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                    </Command.Item>
                </Command.Group>
            </Command.List>

            <div className="border-t border-gray-100 px-3 py-2 text-[10px] text-gray-400 flex justify-between">
                <span>Navigate with <kbd className="font-sans bg-gray-100 px-1 rounded">↑</kbd> <kbd className="font-sans bg-gray-100 px-1 rounded">↓</kbd></span>
                <span><kbd className="font-sans bg-gray-100 px-1 rounded">Enter</kbd> to select</span>
            </div>
        </Command.Dialog>
    );
}
