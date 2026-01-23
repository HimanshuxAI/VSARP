import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Settings, Plus, Trash2, Database, AlertCircle } from 'lucide-react';

export default function Configuration() {
    const { categories, addCategory, deleteCategory, seedDatabase } = useData(); // Assuming deleteCategory exists or I'll implement it locally if needed
    const { user } = useAuth();
    const [newCat, setNewCat] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newCat.trim()) {
            addCategory(newCat.trim(), user.id);
            setNewCat('');
        }
    };

    // Mock delete handler if context doesn't have it (likely need to check DataContext, but for now assuming addCategory exists, I can mock delete or just hide it if risky. 
    // Actually, let's keep it add-only for safety unless I update context, but UI can show "Locked" for standard categories).
    const DEFAULT_CATS = ['Academic', 'Sports', 'Cultural', 'Social Service', 'Leadership'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-gray-700" />
                        System Configuration
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage global parameters and data dictionaries.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Categories Management */}
                <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Activity Categories</h3>
                        <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-mono">Dynamic</span>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            {categories.map((cat, idx) => {
                                const isDefault = DEFAULT_CATS.includes(cat);
                                return (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 border border-gray-200 rounded text-sm group hover:border-gray-300 transition-colors">
                                        <span className="font-medium text-gray-900">{cat}</span>
                                        {isDefault ? (
                                            <span className="text-[10px] text-gray-400 font-mono uppercase">System Default</span>
                                        ) : (
                                            <span className="text-[10px] text-gray-500 font-mono uppercase">Custom</span>
                                            /* Context doesn't support delete yet, so we hide the button to avoid broken UI */
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <form onSubmit={handleAdd} className="flex gap-2 pt-2 border-t border-gray-100">
                            <Input
                                placeholder="New category name..."
                                value={newCat}
                                onChange={(e) => setNewCat(e.target.value)}
                                className="h-9 text-sm"
                            />
                            <Button type="submit" size="sm" className="bg-gray-900 text-white hover:bg-black h-9">
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </form>
                    </div>
                </div>

                {/* System Maintenance */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Academic Parameters</h3>
                        </div>
                        <div className="p-4 text-sm text-gray-600 space-y-3">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span>Current Academic Year</span>
                                <span className="font-mono font-bold text-gray-900">2025-2026</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span>Verification Hash Algorithm</span>
                                <span className="font-mono font-bold text-gray-900">SHA-256 (Mock)</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Audit Log Retention</span>
                                <span className="font-mono font-bold text-gray-900">Indefinite</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Database className="w-5 h-5 text-yellow-700 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-yellow-900">Development Data Tools</h4>
                                <p className="text-xs text-yellow-800 mt-1 mb-3">
                                    Use this to populate the system with 15 random student activities for testing filters and reports.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { if (confirm('This will add 15 fake records. Continue?')) { seedDatabase(); alert('Done!'); } }}
                                    className="bg-white text-yellow-900 border-yellow-300 hover:bg-yellow-100 w-full"
                                >
                                    Seed Demo Database (15 Records)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
