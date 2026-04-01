import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Archive,
    Briefcase,
    Building,
    Calendar,
    CalendarPlus,
    CheckCircle,
    Clock3,
    DollarSign,
    Plus,
    Users,
    X,
} from 'lucide-react';

const DEPARTMENTS = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Information Technology',
];

const EMPTY_FORM = {
    company_name: '',
    role_offered: '',
    package_lpa: '',
    drive_date: '',
    application_deadline: '',
    eligibility_cgpa: '',
    eligible_departments: [],
    required_skills: '',
    openings: '',
    status: 'open',
    description: '',
};

export default function PlacementDrives() {
    const {
        placementDrives,
        placementApplications,
        addPlacementDrive,
        fillRandomDrives,
        loading,
    } = useData();

    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState(EMPTY_FORM);

    const toggleDept = (department) => {
        setForm((current) => ({
            ...current,
            eligible_departments: current.eligible_departments.includes(department)
                ? current.eligible_departments.filter((item) => item !== department)
                : [...current.eligible_departments, department],
        }));
    };

    const filteredDrives = useMemo(() => {
        if (filter === 'all') {
            return placementDrives;
        }

        return placementDrives.filter((drive) => drive.status === filter);
    }, [filter, placementDrives]);

    const applicationsByDrive = useMemo(() => {
        return placementApplications.reduce((map, application) => {
            map[application.drive_id] = (map[application.drive_id] || 0) + 1;
            return map;
        }, {});
    }, [placementApplications]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const created = await addPlacementDrive(form);

        if (created) {
            setForm(EMPTY_FORM);
            setShowForm(false);
        }
    };

    const statusColor = (status) => {
        if (status === 'open') return 'bg-emerald-50 text-emerald-700';
        if (status === 'upcoming') return 'bg-blue-50 text-blue-700';
        if (status === 'closed') return 'bg-amber-50 text-amber-700';
        return 'bg-slate-100 text-slate-600';
    };

    const statusIcon = (status) => {
        if (status === 'open') return <CheckCircle className="h-3.5 w-3.5" />;
        if (status === 'upcoming') return <Clock3 className="h-3.5 w-3.5" />;
        if (status === 'closed') return <Archive className="h-3.5 w-3.5" />;
        return <Calendar className="h-3.5 w-3.5" />;
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-enter pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                        Placement Drives
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
                        Publish live openings, auto-notify students, and attach
                        aptitude rounds in one flow.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowForm((current) => !current)}
                        className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Drive
                    </Button>
                    <Button onClick={fillRandomDrives} variant="outline">
                        Fill Demo Data
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    {
                        label: 'Total Drives',
                        value: placementDrives.length,
                        icon: Briefcase,
                        color: 'bg-blue-50 text-blue-700',
                    },
                    {
                        label: 'Open Now',
                        value: placementDrives.filter((drive) => drive.status === 'open')
                            .length,
                        icon: CheckCircle,
                        color: 'bg-emerald-50 text-emerald-700',
                    },
                    {
                        label: 'Applications',
                        value: placementApplications.length,
                        icon: Users,
                        color: 'bg-violet-50 text-violet-700',
                    },
                ].map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`rounded-xl p-3 ${card.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        {card.label}
                                    </p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {card.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showForm && (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Create Placement Drive
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Students will receive alerts automatically after you
                                publish the drive.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(false)}
                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                            <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    required
                                    placeholder="Company Name"
                                    value={form.company_name}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            company_name: event.target.value,
                                        }))
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <Input
                                required
                                placeholder="Role Offered"
                                value={form.role_offered}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        role_offered: event.target.value,
                                    }))
                                }
                            />
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    required
                                    min={0}
                                    step="0.1"
                                    type="number"
                                    placeholder="Package (LPA)"
                                    value={form.package_lpa}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            package_lpa: event.target.value,
                                        }))
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <Input
                                required
                                type="date"
                                value={form.drive_date}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        drive_date: event.target.value,
                                    }))
                                }
                            />
                            <Input
                                required
                                type="date"
                                value={form.application_deadline}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        application_deadline: event.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="number"
                                step="0.1"
                                min={0}
                                max={10}
                                placeholder="Minimum CGPA"
                                value={form.eligibility_cgpa}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        eligibility_cgpa: event.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="number"
                                min={1}
                                placeholder="Openings"
                                value={form.openings}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        openings: event.target.value,
                                    }))
                                }
                            />
                            <Input
                                placeholder="Required skills (comma separated)"
                                value={form.required_skills}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        required_skills: event.target.value,
                                    }))
                                }
                            />
                            <select
                                value={form.status}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        status: event.target.value,
                                    }))
                                }
                                className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            >
                                <option value="open">Open</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="closed">Closed</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <textarea
                            rows={3}
                            placeholder="Drive description"
                            value={form.description}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    description: event.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        />

                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Eligible Departments
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {DEPARTMENTS.map((department) => (
                                    <button
                                        key={department}
                                        type="button"
                                        onClick={() => toggleDept(department)}
                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                            form.eligible_departments.includes(department)
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {department}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="bg-slate-900 text-white hover:bg-slate-800"
                        >
                            Publish Drive
                        </Button>
                    </form>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {['all', 'open', 'upcoming', 'closed', 'completed'].map((item) => (
                    <button
                        key={item}
                        onClick={() => setFilter(item)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            filter === item
                                ? 'bg-slate-900 text-white'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {item === 'all'
                            ? 'All Drives'
                            : item.charAt(0).toUpperCase() + item.slice(1)}
                    </button>
                ))}
            </div>

            {filteredDrives.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
                    <CalendarPlus className="mx-auto mb-3 h-12 w-12 opacity-30" />
                    <p>No drives found for this filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {filteredDrives.map((drive) => (
                        <div
                            key={drive.id}
                            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {drive.company_name}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {drive.role_offered}
                                    </p>
                                </div>
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                                        drive.status
                                    )}`}
                                >
                                    {statusIcon(drive.status)}
                                    {drive.status}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Package
                                    </p>
                                    <p className="mt-2 font-bold text-slate-900">
                                        {drive.package_lpa} LPA
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Openings
                                    </p>
                                    <p className="mt-2 font-bold text-slate-900">
                                        {drive.openings || 0}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Application Deadline
                                    </p>
                                    <p className="mt-2 font-bold text-slate-900">
                                        {new Date(
                                            drive.application_deadline || drive.drive_date
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Applications
                                    </p>
                                    <p className="mt-2 font-bold text-slate-900">
                                        {applicationsByDrive[drive.id] || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Required Skills
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {(drive.required_skills || []).length ? (
                                            drive.required_skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                                                >
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400">
                                                General aptitude round only
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Eligible Departments
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {(drive.eligible_departments || []).map((department) => (
                                            <span
                                                key={department}
                                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                            >
                                                {department}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {drive.description && (
                                <p className="mt-4 text-sm leading-6 text-slate-600">
                                    {drive.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
