import React from 'react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const DEMO_PASSWORD = 'password123';

const adminAccount = {
    email: 'admin@vsarp.edu',
    name: 'System Admin',
    role: 'Admin',
    department: 'General',
};

const demoStudents = [
    {
        email: 'aarav.sharma@vsarp.edu',
        name: 'Aarav Sharma',
        studentId: 'CS-2023-001',
        department: 'Computer Science',
        skills: ['Python', 'Machine Learning', 'SQL'],
    },
    {
        email: 'priya.patel@vsarp.edu',
        name: 'Priya Patel',
        studentId: 'CS-2023-002',
        department: 'Computer Science',
        skills: ['Java', 'Spring Boot', 'AWS'],
    },
    {
        email: 'rohan.deshmukh@vsarp.edu',
        name: 'Rohan Deshmukh',
        studentId: 'EC-2023-003',
        department: 'Electronics',
        skills: ['Python', 'IoT', 'Data Structures'],
    },
    {
        email: 'sneha.kulkarni@vsarp.edu',
        name: 'Sneha Kulkarni',
        studentId: 'IT-2023-004',
        department: 'Information Technology',
        skills: ['React', 'Node.js', 'MongoDB'],
    },
    {
        email: 'arjun.mehta@vsarp.edu',
        name: 'Arjun Mehta',
        studentId: 'ME-2023-005',
        department: 'Mechanical',
        skills: ['Java', 'Data Structures', 'System Design'],
    },
    {
        email: 'neha.reddy@vsarp.edu',
        name: 'Neha Reddy',
        studentId: 'CS-2023-006',
        department: 'Computer Science',
        skills: ['Python', 'Data Visualization', 'SQL'],
    },
    {
        email: 'vikram.singh@vsarp.edu',
        name: 'Vikram Singh',
        studentId: 'CS-2023-007',
        department: 'Computer Science',
        skills: ['Cloud', 'DevOps', 'Linux'],
    },
    {
        email: 'kavya.menon@vsarp.edu',
        name: 'Kavya Menon',
        studentId: 'CS-2023-008',
        department: 'Computer Science',
        skills: ['Cybersecurity', 'Networking', 'Python'],
    },
    {
        email: 'ishaan.kapoor@vsarp.edu',
        name: 'Ishaan Kapoor',
        studentId: 'CS-2023-009',
        department: 'Computer Science',
        skills: ['JavaScript', 'React', 'UI Engineering'],
    },
    {
        email: 'tanvi.rao@vsarp.edu',
        name: 'Tanvi Rao',
        studentId: 'CS-2023-010',
        department: 'Computer Science',
        skills: ['AI', 'NLP', 'Python'],
    },
];

export default function SeedPage() {
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-12">
            <div className="mx-auto max-w-5xl space-y-8">
                <div className="space-y-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                        Demo Access
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Built-in Student Demo Accounts
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600">
                        Running <code className="rounded bg-slate-100 px-1.5 py-0.5">supabase/schema.sql</code>{' '}
                        creates ten Computer Science student accounts with sample results,
                        activities, placement applications, notifications, and aptitude
                        history.
                    </p>
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-900">
                            Shared Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm font-semibold text-slate-900">
                            {DEMO_PASSWORD}
                        </div>
                        <p className="mt-3 text-sm text-slate-500">
                            Use any email below with the shared password after the SQL
                            file has been executed in Supabase.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-slate-900 text-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            Admin Account
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p className="font-semibold">{adminAccount.name}</p>
                        <p className="font-mono text-slate-200">{adminAccount.email}</p>
                        <p className="text-slate-300">
                            Role: {adminAccount.role} · Department: {adminAccount.department}
                        </p>
                        <p className="text-slate-300">
                            Login and open the User Approvals screen to activate newly
                            registered accounts.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {demoStudents.map((student) => (
                        <Card
                            key={student.email}
                            className="border-slate-200 bg-white shadow-sm"
                        >
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-lg text-slate-900">
                                    {student.name}
                                </CardTitle>
                                <p className="font-mono text-xs text-slate-500">
                                    {student.email}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1 text-sm text-slate-600">
                                    <p>
                                        <span className="font-semibold text-slate-900">
                                            Student ID:
                                        </span>{' '}
                                        {student.studentId}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-900">
                                            Department:
                                        </span>{' '}
                                        {student.department}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {student.skills.map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="secondary"
                                            className="bg-slate-100 text-slate-700"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
