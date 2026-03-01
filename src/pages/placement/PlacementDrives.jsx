import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { CalendarPlus, Building, DollarSign, Calendar, Plus, X, Briefcase, Users, CheckCircle, Clock, Archive } from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology'];

export default function PlacementDrives() {
    const { placementDrives, addPlacementDrive, fillRandomDrives, updatePlacementDrive, loading } = useData();
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({
        company_name: '', role_offered: '', package_lpa: '', drive_date: '',
        eligibility_cgpa: '', eligible_departments: [], status: 'upcoming', description: ''
    });

    const toggleDept = (d) => {
        setForm(prev => ({
            ...prev,
            eligible_departments: prev.eligible_departments.includes(d)
                ? prev.eligible_departments.filter(x => x !== d)
                : [...prev.eligible_departments, d]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addPlacementDrive(form);
        setForm({ company_name: '', role_offered: '', package_lpa: '', drive_date: '', eligibility_cgpa: '', eligible_departments: [], status: 'upcoming', description: '' });
        setShowForm(false);
    };

    const filtered = useMemo(() => {
        if (filter === 'all') return placementDrives;
        return placementDrives.filter(d => d.status === filter);
    }, [placementDrives, filter]);

    const statusIcon = (s) => {
        if (s === 'upcoming') return <Clock className="w-3.5 h-3.5 text-blue-500" />;
        if (s === 'ongoing') return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
        return <Archive className="w-3.5 h-3.5 text-slate-400" />;
    };

    const statusColor = (s) => {
        if (s === 'upcoming') return 'bg-blue-50 text-blue-700';
        if (s === 'ongoing') return 'bg-green-50 text-green-700';
        return 'bg-slate-100 text-slate-600';
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900" />
        </div>
    );

    return (
        <div className="space-y-6 animate-enter pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Placement Drives</h2>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">Manage campus recruitment drives</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg flex items-center gap-2 text-xs sm:text-sm">
                        <Plus className="w-4 h-4" /> Add Drive
                    </Button>
                    <Button onClick={fillRandomDrives} variant="outline" className="text-xs sm:text-sm">
                        Fill Demo Data
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Drives', value: placementDrives.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Upcoming', value: placementDrives.filter(d => d.status === 'upcoming').length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Completed', value: placementDrives.filter(d => d.status === 'completed').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <Icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{card.label}</p>
                                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Drive Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">New Placement Drive</h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="relative">
                                <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <Input placeholder="Company Name" required value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="pl-10 h-10" />
                            </div>
                            <Input placeholder="Role Offered" required value={form.role_offered} onChange={e => setForm({ ...form, role_offered: e.target.value })} className="h-10" />
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <Input placeholder="Package (LPA)" required type="number" step="0.1" value={form.package_lpa} onChange={e => setForm({ ...form, package_lpa: e.target.value })} className="pl-10 h-10" />
                            </div>
                            <Input type="date" required value={form.drive_date} onChange={e => setForm({ ...form, drive_date: e.target.value })} className="h-10" />
                            <Input placeholder="Min CGPA" type="number" step="0.1" min={0} max={10} value={form.eligibility_cgpa} onChange={e => setForm({ ...form, eligibility_cgpa: e.target.value })} className="h-10" />
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="h-10 border border-gray-300 rounded-md px-3 text-sm bg-white">
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="Description..."
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            rows={2}
                        />
                        <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2">Eligible Departments</p>
                            <div className="flex gap-2 flex-wrap">
                                {DEPARTMENTS.map(d => (
                                    <button key={d} type="button" onClick={() => toggleDept(d)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.eligible_departments.includes(d) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >{d}</button>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" className="bg-slate-900 text-white h-10">Create Drive</Button>
                    </form>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'upcoming', 'ongoing', 'completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >{f === 'all' ? 'All Drives' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
            </div>

            {/* Drive List */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16 text-slate-400">
                    <CalendarPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No drives found. Add a drive or fill demo data.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map(d => (
                        <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{d.company_name}</h4>
                                    <p className="text-sm text-slate-500">{d.role_offered}</p>
                                </div>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColor(d.status)}`}>
                                    {statusIcon(d.status)}
                                    {d.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                    <span className="font-bold text-slate-900">{d.package_lpa} LPA</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span className="text-slate-600">{d.drive_date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    <span className="text-slate-600">Min CGPA: {d.eligibility_cgpa}</span>
                                </div>
                            </div>
                            {d.eligible_departments?.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap mt-2">
                                    {d.eligible_departments.map(dep => (
                                        <span key={dep} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{dep}</span>
                                    ))}
                                </div>
                            )}
                            {d.description && <p className="text-sm text-slate-500 mt-3">{d.description}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
