import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { careerApi } from '../../lib/api/career';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, BrainCircuit, Sparkles, Target, Binary, PenTool, Users, BarChart3 } from 'lucide-react';

const INTEREST_TAGS = [
    { id: 'coding', label: 'Coding & Tech', icon: Binary },
    { id: 'data', label: 'Data Analysis', icon: BarChart3 },
    { id: 'design', label: 'Design & Creative', icon: PenTool },
    { id: 'leading', label: 'Leadership', icon: Users },
    { id: 'strategy', label: 'Business Strategy', icon: Target },
    { id: 'communication', label: 'Communication', icon: Users }, // Reusing Users for simplicity
    { id: 'research', label: 'Research', icon: BrainCircuit },
];

export default function CareerGoalDefinition() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedCareer, setSelectedCareer] = useState(null);

    const toggleInterest = (id) => {
        if (selectedInterests.includes(id)) {
            setSelectedInterests(selectedInterests.filter(i => i !== id));
        } else {
            setSelectedInterests([...selectedInterests, id]);
        }
    };

    const handleAnalyze = async () => {
        setStep(2); // Move to loading/analysis view
        setIsAnalyzing(true);
        try {
            const results = await careerApi.submitAssessment(user.id, { interests: selectedInterests });
            setSuggestions(results);
            setStep(3); // Move to results
        } catch (error) {
            console.error(error);
            alert("Failed to analyze profile. Please try again.");
            setStep(1);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSelectCareer = async (careerId) => {
        try {
            await careerApi.setStudentGoal(user.id, careerId);
            navigate('/student/career-navigator'); // Redirect to main dashboard
        } catch (error) {
            console.error(error);
            alert("Failed to save goal.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900">Career Discovery Engine</h1>
                <p className="text-slate-500 mt-2">Let AI help you define your professional path.</p>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    What excites you?
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {INTEREST_TAGS.map((tag) => {
                                        const isSelected = selectedInterests.includes(tag.id);
                                        const Icon = tag.icon;
                                        return (
                                            <div
                                                key={tag.id}
                                                onClick={() => toggleInterest(tag.id)}
                                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 h-32
                                                ${isSelected
                                                        ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md transform scale-105'
                                                        : 'border-slate-100 bg-white text-slate-600 hover:border-purple-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <Icon className={`w-8 h-8 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                                                <span className="font-medium text-center">{tag.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={selectedInterests.length === 0}
                                        className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Analyze My Profile <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-64 text-center"
                    >
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                            <BrainCircuit className="absolute inset-0 m-auto text-purple-600 w-8 h-8 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">AI is analyzing your profile...</h3>
                        <p className="text-slate-500 mt-2">Matching your interests with 500+ career paths.</p>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-center mb-8">We found {suggestions.length} paths for you</h2>
                        <div className="grid grid-cols-1 gap-6">
                            {suggestions.map((career) => (
                                <div
                                    key={career.id}
                                    onClick={() => setSelectedCareer(career.id)}
                                    className={`relative group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 bg-white hover:shadow-xl
                                    ${selectedCareer === career.id ? 'border-purple-600 ring-2 ring-purple-100' : 'border-slate-100 hover:border-purple-200'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{career.title}</h3>
                                            <p className="text-slate-500 text-sm mt-1">{career.description}</p>

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {career.required_skills.slice(0, 3).map(skill => (
                                                    <span key={skill.id} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                                                        {skill.name}
                                                    </span>
                                                ))}
                                                {career.required_skills.length > 3 && (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-400 text-xs rounded-md font-medium">
                                                        +{career.required_skills.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-400">Avg. Salary</div>
                                            <div className="font-bold text-green-600">₹{(career.average_salary / 100000).toFixed(1)} LPA</div>

                                            <div className="mt-2 text-sm text-slate-400 shadow-sm">Growth</div>
                                            <div className="font-medium text-purple-600">{career.growth_outlook}</div>
                                        </div>
                                    </div>

                                    {/* Selection Indicator */}
                                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${selectedCareer === career.id ? 'bg-purple-600 border-purple-600' : 'border-slate-300'}`}>
                                        {selectedCareer === career.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center">
                            <Button
                                onClick={() => handleSelectCareer(selectedCareer)}
                                disabled={!selectedCareer}
                                className="w-full max-w-md h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm & Start Roadmap
                            </Button>
                        </div>
                        {/* Spacing for fixed footer */}
                        <div className="h-20"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
