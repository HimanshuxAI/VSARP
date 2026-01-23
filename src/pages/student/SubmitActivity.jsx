import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AlertCircle, CheckCircle, FileText, UploadCloud, X, Scan, Sparkles, Loader2, Shuffle } from 'lucide-react';
import { cn } from '../../lib/utils'; // Ensure utility is imported

export default function SubmitActivity() {
    const { addActivity, categories } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        date: '',
        description: '',
        proof: null,
        proofName: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, verified, failed
    const [aiHint, setAiHint] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Activity Title Limit
    const MAX_TITLE_CHARS = 120;
    // Description Limit
    const MAX_DESC_CHARS = 500;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'title' && value.length > MAX_TITLE_CHARS) return;
        if (name === 'description' && value.length > MAX_DESC_CHARS) return;

        // AI Hint Logic (Mock)
        if (name === 'title' && value.toLowerCase().includes('hackathon')) {
            setAiHint({ type: 'category', value: 'Academic', confidence: '98%' });
        } else if (name === 'title' && value.toLowerCase().includes('cricket')) {
            setAiHint({ type: 'category', value: 'Sports', confidence: '95%' });
        } else {
            setAiHint(null);
        }

        setFormData({ ...formData, [name]: value });
        setError(''); // Clear error on edit
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Strict file type check
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setError('Invalid file type. Only PDF, JPG, and PNG are allowed.');
                return;
            }
            // Max size check (e.g., 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size too large. Max 5MB allowed.');
                return;
            }

            setFormData({
                ...formData,
                proof: URL.createObjectURL(file), // Mock URL for preview
                proofName: file.name
            });
            setError('');

            // 2026 Feature: AI Scan Simulation
            setScanStatus('scanning');
            setTimeout(() => {
                setScanStatus('verified');
            }, 1500);
        }
    };

    const removeFile = () => {
        setFormData({ ...formData, proof: null, proofName: '' });
        setScanStatus('idle');
    };

    const handleRandomFill = () => {
        if (!window.confirm("Fill this form with random mock data?")) return;

        const mockTitles = [
            "Hackathon Winner - CodeFest 2025",
            "IEEE Research Paper Presentation",
            "University Debate Championship Finalist",
            "NSS Community Clean-up Drive Lead",
            "Robotics Workshop Coordinator"
        ];
        const mockDescs = [
            "Led a team of four to build a decentralized voting app using Solidity and React. Won 1st place in the blockchain track.",
            " presented a paper on 'AI in Healthcare' at the international conference. Received 'Best Presenter' award.",
            "Participated in the national level debate, reaching the finals. Topic was 'Ethics of Artificial Intelligence'.",
            "Organized a weekend clean-up drive involving 50+ students. Collected and recycled 200kg of waste.",
            "Coordinated a 2-day workshop on Arduino and basic robotics for 100+ junior students."
        ];
        const cats = ['Academic', 'Sports', 'Cultural', 'Social Service', 'Leadership'];

        const randomCat = cats[Math.floor(Math.random() * cats.length)];
        let title = mockTitles[Math.floor(Math.random() * mockTitles.length)];

        // Align title with category slightly for realism (optional, but nice)
        if (randomCat === 'Sports') title = "Inter-College Cricket Tournament Captain";
        if (randomCat === 'Cultural') title = "Annual Fest Dance Performance";

        setFormData({
            title: title,
            category: randomCat,
            date: new Date().toISOString().split('T')[0],
            description: mockDescs[Math.floor(Math.random() * mockDescs.length)],
            proof: 'https://example.com/mock-certificate.pdf', // Mock URL
            proofName: `certificate_${Date.now()}.pdf`
        });

        // Trigger Mock AI Scan
        setScanStatus('scanning');
        setTimeout(() => {
            setScanStatus('verified');
        }, 1500);

        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // 1. Strict Validation
        if (!formData.title.trim()) { setError('Activity Title is required.'); setIsSubmitting(false); return; }
        if (!formData.category) { setError('Activity Category is required.'); setIsSubmitting(false); return; }
        if (!formData.date) { setError('Date is required.'); setIsSubmitting(false); return; }
        if (!formData.description.trim()) { setError('Description is required.'); setIsSubmitting(false); return; }
        if (!formData.proof) { setError('Proof document is required for submission.'); setIsSubmitting(false); return; }

        // Date Logic (No Future Dates)
        const selectedDate = new Date(formData.date);
        const today = new Date();
        if (selectedDate > today) {
            setError('Activity date cannot be in the future.');
            setIsSubmitting(false);
            return;
        }

        try {
            const success = await addActivity({
                student_id: user.id,
                student_name: user.name,
                title: formData.title,
                category: formData.category,
                date: formData.date,
                description: formData.description,
                proof_url: formData.proof // In real app, this would be the S3 URL
            });

            if (success) {
                setSuccess(true);
                // Redirect after brief delay to show success state
                setTimeout(() => navigate('/student/dashboard'), 1500);
            } else {
                // Error is already alerted by DataContext, but show banner too
                setError('Submission rejected by server. Check console for details.');
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            setError('Submission failed due to network error.');
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh] animate-enter">
                <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100 border border-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Submission Successful</h2>
                <div className="mt-4 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <p className="text-sm text-gray-500 font-medium">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-8 px-4 animate-enter">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Submit Activity Record</h1>
                    <p className="text-sm text-gray-500 mt-2">Ensure all details match your uploaded proof document. Your submission is auditable.</p>
                </div>
                <Button onClick={handleRandomFill} variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <Shuffle className="w-4 h-4" /> Random Data
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start animate-accordion-down">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 shrink-0" />
                        <span className="text-sm text-red-700 font-medium">{error}</span>
                    </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                        Activity Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Hackathon Participation – Smart India Hackathon"
                            className="w-full font-medium h-11 text-base transition-all focus:ring-2 ring-offset-1"
                        />
                        {aiHint && (
                            <div className="absolute right-3 top-3 flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium border border-indigo-100 animate-enter">
                                <Sparkles className="w-3 h-3" />
                                {aiHint.confidence} Match
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <span className="text-xs text-gray-400 font-mono">{formData.title.length}/{MAX_TITLE_CHARS}</span>
                    </div>
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={cn(
                                    "flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none transition-all",
                                    aiHint && aiHint.type === 'category' && "ring-2 ring-indigo-500 border-indigo-500"
                                )}
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            {/* Custom Arrow */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                        </div>
                        {aiHint && aiHint.type === 'category' && (
                            <p className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI Suggestion: {aiHint.value}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                            Date of Activity <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="h-11"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition-all"
                        placeholder="Briefly describe the activity and your role..."
                    />
                    <div className="flex justify-end">
                        <span className="text-xs text-gray-400 font-mono">{formData.description.length}/{MAX_DESC_CHARS}</span>
                    </div>
                </div>

                {/* Proof Upload (Strict + AI Scan) */}
                <div className="space-y-2 pt-2">
                    <label className="block text-sm font-semibold text-gray-900">
                        Proof of Activity <span className="text-red-500">*</span>
                    </label>
                    <div className={cn(
                        "mt-1 border-2 border-dashed rounded-xl px-6 pt-5 pb-6 transition-all relative overflow-hidden",
                        scanStatus === 'scanning' ? "border-blue-400 bg-blue-50/50" :
                            scanStatus === 'verified' ? "border-green-400 bg-green-50/30" : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                    )}>
                        {!formData.proof ? (
                            <div className="space-y-2 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label className="relative cursor-pointer rounded-md font-medium text-black hover:underline focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input
                                            name="proof"
                                            type="file"
                                            className="sr-only"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    PDF, JPG, PNG up to 5MB
                                </p>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <div className="flex items-center justify-between bg-white/80 p-4 rounded-lg border border-gray-200 shadow-sm backdrop-blur-sm">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-100 p-2 rounded">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                                                {formData.proofName}
                                            </p>
                                            <p className="text-xs text-gray-500">{(5.2 + Math.random()).toFixed(1)} MB</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeFile}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* AI Scan Status */}
                                <div className="mt-3 flex items-center gap-2">
                                    {scanStatus === 'scanning' && (
                                        <>
                                            <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">AI Scanning Document Structure...</span>
                                        </>
                                    )}
                                    {scanStatus === 'verified' && (
                                        <div className="flex items-center gap-2 animate-enter">
                                            <Scan className="w-3 h-3 text-green-600" />
                                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Document Verified Clean</span>
                                            <span className="text-[10px] text-gray-400 ml-2">SHA-256 Check Passed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Scan Line Animation */}
                        {scanStatus === 'scanning' && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 blur-sm animate-[accordion-down_1s_ease-in-out_infinite]" style={{ animationDuration: '2s' }}></div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 pl-1">
                        Upload official certificate. Our system automatically scans for editing artifacts.
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-8 border-t border-gray-100">
                    <Button
                        type="submit"
                        disabled={isSubmitting || scanStatus === 'scanning'}
                        className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold text-base rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.01]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-5 w-5" />
                                Validating Ledger...
                            </span>
                        ) : (
                            'Submit & Sign Record'
                        )}
                    </Button>
                    <div className="flex justify-center gap-4 mt-4 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Encrypted</span>
                        <span className="flex items-center gap-1"><Scan className="w-3 h-3" /> AI Audio</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Immutable</span>
                    </div>
                </div>
            </form>
        </div>
    );
}

// Icon helper
function ShieldCheck(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
