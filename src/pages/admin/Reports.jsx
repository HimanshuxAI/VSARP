import React from 'react';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Download } from 'lucide-react';

/**
 * Reports allows administrator users to export various reports.
 * Exportable types include Activity Summaries, Student Participation Indices, and Audit Logs.
 */
export default function Reports() {
    const { activities, auditLog } = useData();

    const reports = [
        {
            id: "activity_summary",
            name: "Activity Summary Report",
            desc: "List of all approved activities with student details.",
            generate: () => {
                const header = "Student Name,Activity Title,Category,Date,Status,Approver,Hash\n";
                const rows = activities.filter(a => a.status === 'approved').map(a =>
                    `"${a.student_name}","${a.title}","${a.category}","${a.date}","${a.status}","${a.approved_by}","${a.hash}"`
                ).join("\n");
                return header + rows;
            }
        },
        {
            id: "participation_index",
            name: "Student Participation Index",
            desc: "Count of activities per student.",
            generate: () => {
                const counts = {};
                activities.filter(a => a.status === 'approved').forEach(a => {
                    counts[a.student_name] = (counts[a.student_name] || 0) + 1;
                });
                const header = "Student Name,Approved Activities Count\n";
                const rows = Object.entries(counts).map(([name, count]) => `"${name}",${count}`).join("\n");
                return header + rows;
            }
        },
        {
            id: "audit_dump",
            name: "Full System Audit Dump",
            desc: "Complete log of all system actions for compliance.",
            generate: () => {
                const header = "Timestamp,Actor ID,Role,Action,Record ID,Details\n";
                const rows = auditLog.map(l =>
                    `"${l.timestamp}","${l.actorId}","${l.role}","${l.actionType}","${l.recordId}","${l.details}"`
                ).join("\n");
                return header + rows;
            }
        }
    ];

    const handleExport = (report) => {
        const csvContent = report.generate();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `VSARP_${report.id}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Compliance Reports</h2>
            <div className="grid gap-4">
                {reports.map((report, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                                    <p className="text-sm text-gray-500">{report.desc}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleExport(report)}>
                                    <Download className="mr-2 h-4 w-4" /> Export CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
