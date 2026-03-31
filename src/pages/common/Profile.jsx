import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

function FieldRow({
    label,
    value,
    isEditable = false,
    editValue,
    setEditValue,
    highlight = false,
    isEditing = false,
}) {
    return (
        <tr className="border-b border-gray-200 last:border-0">
            <td className="py-3 pl-0 pr-4 w-1/3 text-sm font-bold text-gray-700 uppercase tracking-widest">{label}</td>
            <td className={`py-3 px-0 w-2/3 text-base ${highlight ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                {isEditable && isEditing ? (
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="max-w-[200px] h-10 text-base"
                    />
                ) : (
                    value
                )}
            </td>
        </tr>
    );
}

export default function Profile() {
    const { user } = useAuth();
    const { activities } = useData();
    const [phone, setPhone] = useState(user.phone || '9876543210');
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    // Metric: "Approved X activities"
    const approvedCount = user.role !== 'student'
        ? activities.filter(a => a.approved_by === user.name).length
        : 0;

    const handleSave = () => {
        setIsEditing(false);
        setMessage('Profile updated successfully.');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-5 border border-gray-300 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Institutional Profile</h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-sm border ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            user.role === 'faculty' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                'bg-green-100 text-green-800 border-green-300'
                        }`}>
                        {user.role} Status: Active
                    </span>
                </div>
            </div>

            <div className="border border-gray-300 bg-white">
                <div className="bg-gray-100 border-b border-gray-300 px-6 py-3">
                    <h3 className="text-lg font-bold text-gray-900">Account Details</h3>
                </div>
                <div className="p-6">
                    <table className="w-full">
                        <tbody className="divide-y divide-gray-200 block">
                            <FieldRow label="Full Name" value={user.name} highlight={true} isEditing={isEditing} />
                            <FieldRow label="Institutional ID" value={user.student_id || user.id} highlight={true} isEditing={isEditing} />
                            <FieldRow label="Email Address" value={user.email || 'Not available'} isEditing={isEditing} />
                            <FieldRow label="Department" value={user.department || 'General'} isEditing={isEditing} />
                            <FieldRow label="Academic Year" value="2025-2026" isEditing={isEditing} />

                            {user.role === 'student' && (
                                <FieldRow
                                    label="Contact Number"
                                    value={phone}
                                    isEditable={true}
                                    editValue={phone}
                                    setEditValue={setPhone}
                                    isEditing={isEditing}
                                />
                            )}

                            {user.role !== 'student' && (
                                <FieldRow label="Accountability Metric" value={`${approvedCount} Activities Approved`} isEditing={isEditing} />
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Identity Provenance Indicator */}
                <div className="bg-gray-50 border-t border-gray-300 px-6 py-4 flex flex-col gap-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Identity Provenance</p>
                    <div className="flex gap-6 text-sm text-gray-600 font-mono">
                        <span>Last Verified By: <strong className="text-gray-800">System Admin (ADM001)</strong></span>
                        <span>Last Updated: <strong className="text-gray-800">01/08/2025</strong></span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-2">
                <div className="text-sm text-green-700 font-bold h-6">
                    {message}
                </div>
                <div className="flex gap-4">
                    {user.role === 'student' && !isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)} className="h-11">Edit Contact Info</Button>
                    )}
                    {user.role === 'student' && isEditing && (
                        <>
                            <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-11">Cancel</Button>
                            <Button onClick={handleSave} className="h-11">Save Changes</Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
