import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Download, Bell, Award, Briefcase, ChevronRight, CheckCircle, XCircle, Clock, Database, Sparkles, FileText, AlertCircle, CheckCircle2, Share2, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { computeEmployabilityScore } from '../../lib/employabilityScore';

export default function StudentDashboard() {
    const { activities, loading, fillRandomData } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900"></div>
            </div>
        );
    }

    // Filter Data
    const myActivities = activities.filter(a => a.student_id === user.id);
    const approved = myActivities.filter(a => a.status === 'approved').length;

    // Employability Score
    const { score, breakdown, level, levelColor } = computeEmployabilityScore(myActivities);
    const scorePercent = Math.min(score, 100);
    const arcColor = score >= 80 ? '#7c3aed' : score >= 60 ? '#16a34a' : score >= 40 ? '#ca8a04' : score > 0 ? '#ea580c' : '#9ca3af';

    const handleSharePortfolio = () => {
        const url = `${window.location.origin}/portfolio/${user.id}`;
        navigator.clipboard.writeText(url).then(() => {
            alert(`Portfolio link copied!\n\n${url}`);
        }).catch(() => {
            prompt('Copy this link:', url);
        });
    };

    // "Career Impact" Mock Logic
    const skillsEarned = [
        { name: "Leadership", count: myActivities.filter(a => a.category === 'Leadership' && a.status === 'approved').length },
        { name: "Teamwork", count: myActivities.filter(a => (a.category === 'Sports' || a.category === 'Cultural') && a.status === 'approved').length },
        { name: "Social Resp.", count: myActivities.filter(a => a.category === 'Social Service' && a.status === 'approved').length },
    ].filter(s => s.count > 0);

    const filteredList = statusFilter === 'all'
        ? myActivities
        : myActivities.filter(a => a.status === statusFilter);

    // Mock PDF Export
    const handleExportTranscript = () => {
        setIsExporting(true);
        setTimeout(() => {
            alert(`Official Verified Activity Transcript generated for ${user.name}.\n\nContains ${approved} verified records.\n(Mock Download Initiated)`);
            setIsExporting(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-enter pb-10">
            {/* Header Area */}
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 drop-shadow-sm">Student Portfolio</h2>
                    <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base font-medium">Manage your co-curricular record and career milestones.</p>
                </div>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                    <Button variant="ghost" className="h-9 sm:h-10 text-gray-400 hover:text-white text-xs sm:text-sm" onClick={() => alert('No new notifications')}>
                        <Bell className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Alerts</span>
                    </Button>
                    <Button variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm" onClick={fillRandomData}>
                        <Database className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Fill Random Data</span>
                    </Button>
                    <Button
                        onClick={handleSharePortfolio}
                        variant="outline"
                        className="h-9 sm:h-10 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                    >
                        <Share2 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Share Portfolio</span>
                    </Button>
                    <Button
                        onClick={handleExportTranscript}
                        disabled={isExporting || approved === 0}
                        variant="default"
                        className="h-9 sm:h-10 shadow-lg transition-transform hover:scale-105 bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm"
                    >
                        {isExporting ? 'Generating...' : (
                            <>
                                <Download className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Export Official Transcript</span>
                                <span className="sm:hidden">Export</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Employability Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Gauge */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">Employability Score</p>
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                            <circle
                                cx="50" cy="50" r="40" fill="none"
                                stroke={arcColor} strokeWidth="10"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - scorePercent / 100)}`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-slate-900">{score}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">/ 100</span>
                        </div>
                    </div>
                    <p className={`mt-2 text-sm font-bold ${levelColor}`}>{level} Level</p>
                </div>

                {/* Score Breakdown */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        Score Breakdown (Approved Only)
                    </h3>
                    {breakdown.length === 0 ? (
                        <p className="text-slate-400 text-sm">No approved activities yet. Submit and get approvals to earn points!</p>
                    ) : (
                        <div className="space-y-3">
                            {breakdown.map(item => (
                                <div key={item.category} className="flex items-center gap-3">
                                    <span className="w-20 sm:w-36 text-xs sm:text-sm text-slate-600 font-medium truncate">{item.category}</span>
                                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                            style={{ width: `${Math.min((item.points / 100) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-700 w-14 sm:w-16 text-right">×{item.count} = +{item.points}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Career Impact Cards */}
            {approved > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-2 rounded-2xl p-6 relative overflow-hidden border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl text-white">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-blue-400" />
                                Career Impact Profile
                            </h3>
                            <p className="text-sm text-slate-300 mt-1 mb-4 max-w-md">
                                Your verified activities demonstrate these core competencies valued by recruiters.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {skillsEarned.length > 0 ? skillsEarned.map(skill => (
                                    <div key={skill.name} className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold text-white flex items-center gap-2 hover:bg-white/20 transition-colors">
                                        <Sparkles className="w-3 h-3 text-yellow-300" />
                                        {skill.name} <span className="bg-white/20 px-1.5 rounded-full text-[10px]">{skill.count}</span>
                                    </div>
                                )) : (
                                    <span className="text-sm text-slate-400 italic">Complete more activities to unlock skill badges.</span>
                                )}
                            </div>
                        </div>
                        <Briefcase className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/5 rotate-12" />
                    </div>

                    <div className="glass-card p-6 flex flex-col justify-center items-center shadow-lg">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600">{approved}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Verified Credits</div>
                        </div>
                        <div className="mt-4 w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min((approved / 10) * 100, 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">Gap to Gold Level: <span className="text-white">{Math.max(0, 10 - approved)}</span> more</p>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'approved', 'pending', 'rejected'].map(filter => (
                    <Button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        variant="outline"
                        className={`h-10 px-4 py-2 rounded-full text-sm font-medium transition-all ${statusFilter === filter
                            ? 'bg-slate-900 text-white shadow-md border-slate-900'
                            : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        <span className="ml-2 opacity-60 text-xs">
                            {filter === 'all' ? myActivities.length : myActivities.filter(a => a.status === filter).length}
                        </span>
                    </Button>
                ))}
            </div>

            {/* List View */}
            <div className="glass-panel border-white/5 overflow-hidden min-h-[400px]">
                {filteredList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-64">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                            <Clock className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white">No records found</h3>
                        <p className="text-slate-500 text-lg font-medium">
                            {statusFilter === 'all' ? "You haven't submitted any activities yet. Start building your portfolio!" : `You have no ${statusFilter} activities.`}
                        </p>
                        {statusFilter === 'all' && (
                            <Button onClick={() => navigate('/student/submit')} variant="default" className="mt-4">
                                Submit New Activity
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredList.map((activity) => (
                            <div key={activity.id} className="group p-5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <FileText className="w-24 h-24 text-slate-900 rotate-12" />
                                </div>
                                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                                        <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            activity.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {activity.status === 'approved' ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> :
                                                activity.status === 'rejected' ? <XCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">{activity.title}</h3>
                                            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                <span>{new Date(activity.date).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 ml-10 sm:ml-0 flex-shrink-0">
                                        <Badge variant="outline" className={`sm:mb-2 text-[10px] sm:text-xs ${activity.status === 'approved' ? 'border-green-200 text-green-700 bg-green-50' :
                                            activity.status === 'rejected' ? 'border-red-200 text-red-700 bg-red-50' : 'border-yellow-200 text-yellow-700 bg-yellow-50'
                                            }`}>
                                            {activity.status.toUpperCase()}
                                        </Badge>
                                        <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center">
                                            View Details <ChevronRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                                {activity.feedback && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <p><span className="font-bold">Feedback:</span> {activity.feedback}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
