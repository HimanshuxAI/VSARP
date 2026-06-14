import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Download, RefreshCw, Layers, ShieldCheck,
    AlertTriangle, FileText, CheckCircle, XCircle, Search, Filter, Activity, Zap, Radio, Globe, Server
} from 'lucide-react';

const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const trendingColor = (t) => t > 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200';

const MetricCard = ({ label, value, trend, color, icon: Icon }) => (
    <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm p-5 rounded-2xl group hover:shadow-lg transition-all">
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon className="w-16 h-16" />
        </div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tighter">{value}</h3>
            </div>
            <Badge variant="outline" className={`bg-white/50 backdrop-blur ${trendingColor(trend)}`}>
                {trend > 0 ? '+' : ''}{trend}%
            </Badge>
        </div>
        <div className="mt-4 h-1 w-full bg-gray-100/50 rounded-full overflow-hidden">
            <div className={`h-full ${color.replace('text', 'bg')} opacity-50`} style={{ width: `${(hashCode(label) % 61) + 40}%` }}></div>
        </div>
    </div>
);

export default function AdminOverview() {
    const { activities, loading } = useData();
    useAuth();

    // -- STATE (must be before any conditional return) --
    const [filters, setFilters] = useState({
        year: '2025-2026',
        category: 'All Categories',
        status: 'All Status'
    });
    const [auditMode, setAuditMode] = useState(false);
    const [serverLoad, setServerLoad] = useState(42);
    const [blockNumber, setBlockNumber] = useState(17532000);

    // -- LIVE SIMULATION --
    // Simulate "Server Heartbeat"
    useEffect(() => {
        const interval = setInterval(() => {
            setServerLoad(prev => Math.max(10, Math.min(90, prev + (Math.random() * 10 - 5))));
            setBlockNumber(Math.floor(Date.now() / 10000));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            </div>
        );
    }

    const filteredActivities = activities.filter(a => {
        if (filters.category !== 'All Categories' && a.category !== filters.category) return false;
        if (filters.status !== 'All Status' && a.status.toLowerCase() !== filters.status.toLowerCase()) return false;
        return true;
    });

    const metrics = {
        total: filteredActivities.length,
        approved: filteredActivities.filter(a => a.status === 'approved').length,
        pending: filteredActivities.filter(a => a.status === 'pending').length,
        rejected: filteredActivities.filter(a => a.status === 'rejected').length,
    };



    return (
        <div className="space-y-6 animate-enter pb-10">

            {/* -- MISSION CONTROL HEADER -- */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        Mission Control
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
                        <Server className="w-4 h-4" /> System Core Online • Latency: 24ms • Validating Block #{blockNumber}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant={auditMode ? "destructive" : "outline"} onClick={() => setAuditMode(!auditMode)} className="bg-white/80 backdrop-blur shadow-sm">
                        {auditMode ? <Zap className="w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                        {auditMode ? "AUDIT LOCKDOWN" : "Audit Mode"}
                    </Button>
                </div>
            </div>

            {/* -- LIVE METRICS GRID -- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Submissions" value={metrics.total} trend={12} color="text-blue-600" icon={Layers} />
                <MetricCard label="Approvals" value={metrics.approved} trend={8} color="text-green-600" icon={CheckCircle} />
                <MetricCard label="Pending Review" value={metrics.pending} trend={-2} color="text-yellow-600" icon={Activity} />
                <div className="bg-gray-900 text-white p-5 rounded-2xl relative overflow-hidden shadow-2xl flex flex-col justify-between border border-gray-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network Load</p>
                            <div className="text-3xl font-mono font-bold text-green-400 mt-1">{Math.floor(serverLoad)}%</div>
                        </div>
                        <Radio className="w-6 h-6 text-green-500 animate-pulse" />
                    </div>
                    {/* Fake Chart */}
                    <div className="relative z-10 flex items-end gap-1 h-12 mt-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex-1 bg-green-500/20 rounded-t-sm" style={{ height: `${((i * 17 + Math.floor(serverLoad)) % 70) + 30}%` }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* -- MAIN CONSOLE -- */}
            <div className={`bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col ${auditMode ? 'ring-4 ring-yellow-400 grayscale' : ''}`}>

                {/* Console Toolbar */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
                    <div className="flex items-center gap-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" /> Live Evidence Feed
                        </h3>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div className="flex gap-2">
                            {['All Status', 'Approved', 'Pending'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilters(prev => ({ ...prev, status: s }))}
                                    className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full transition-colors ${filters.status === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-mono text-gray-500">LIVE</span>
                    </div>
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase font-mono">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Time</th>
                                <th className="px-6 py-3 font-semibold">Student ID</th>
                                <th className="px-6 py-3 font-semibold">Activity</th>
                                <th className="px-6 py-3 font-semibold">Category</th>
                                <th className="px-6 py-3 font-semibold">Integrity Hash</th>
                                <th className="px-6 py-3 font-semibold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredActivities.map((activity) => (
                                <tr key={activity.id} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                                    <td className="px-6 py-3 font-mono text-xs text-gray-400">
                                        {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-gray-900">{activity.student_id ? activity.student_id.substring(0, 8) : 'GUEST'}</td>
                                    <td className="px-6 py-3 text-gray-700">{activity.title}</td>
                                    <td className="px-6 py-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {activity.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 font-mono text-[10px] text-gray-400">
                                        {activity.integrity_hash ? (
                                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{activity.integrity_hash.substring(0, 16)}...</span>
                                        ) : (
                                            <span className="opacity-20">PENDING_GENERATION...</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <Badge variant={activity.status === 'approved' ? 'outline' : 'secondary'} className={
                                            activity.status === 'approved' ? 'border-green-200 text-green-700 bg-green-50' :
                                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }>
                                            {activity.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
