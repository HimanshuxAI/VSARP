import React from 'react';
import { useData } from '../../context/DataContext';
import { ShieldAlert, Terminal } from 'lucide-react';

/**
 * AuditLogs displays system-wide actions for monitoring compliance and security.
 * Renders timestamp, actor details, action type, record targets, and event information.
 */
export default function AuditLogs() {
    const { auditLog } = useData();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-gray-700" />
                        System Audit Logs
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Immutable record of all critical system actions. Read-only.</p>
                </div>
                <div className="text-xs font-mono bg-gray-100 px-3 py-1 rounded text-gray-500">
                    Log Retention: Permanent
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="py-3 px-6 w-48">Timestamp</th>
                                <th className="py-3 px-6 w-48">Actor Identity</th>
                                <th className="py-3 px-6 w-32">Action</th>
                                <th className="py-3 px-6 w-40">Target ID</th>
                                <th className="py-3 px-6">Event Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-mono text-xs">
                            {auditLog.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400 flex flex-col items-center justify-center">
                                        <Terminal className="w-8 h-8 mb-2 opacity-50" />
                                        No audit events recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                [...auditLog].reverse().map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-6 text-gray-600">
                                            {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                                        </td>
                                        <td className="py-3 px-6 font-semibold text-gray-900">
                                            {log.actorId}
                                            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-normal text-gray-600">{log.role}</span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${log.actionType === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    log.actionType === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {log.actionType}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-gray-500">{log.recordId}</td>
                                        <td className="py-3 px-6 text-gray-800 break-words">{log.details}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="text-center text-[10px] text-gray-400">
                End of Log Stream. All actions form a cryptographic chain.
            </div>
        </div>
    );
}
