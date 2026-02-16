
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { careerApi } from '../../lib/api/career';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import {
    Briefcase, Target, BookOpen, TrendingUp, AlertCircle,
    CheckCircle2, ArrowRight, Video, FileText, Calendar,
    Code
} from 'lucide-react';

export default function CareerNavigator() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const userGoal = await careerApi.getStudentGoal(user.id);
                setGoal(userGoal);

                if (userGoal) {
                    const skillGap = await careerApi.getSkillGap(user.id, userGoal.career_id);
                    setAnalysis(skillGap);
                }
            } catch (error) {
                console.error("Failed to load career data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user.id]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            </div>
        );
    }

    if (!goal) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8 bg-gradient-to-b from-white to-purple-50 rounded-3xl border border-purple-100">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <Target className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Where do you want to go?</h2>
                <p className="text-slate-500 max-w-md mb-8 text-lg">
                    You haven't set a career goal yet. Let our AI help you discover the perfect path based on your interests.
                </p>
                <Button
                    onClick={() => navigate('/student/career-goals')}
                    className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-lg shadow-lg hover:shadow-xl transition-all"
                >
                    Launch Career Discovery <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <Badge variant="outline" className="mb-2 bg-purple-50 text-purple-700 border-purple-200">
                        Targeting: {goal.career_title}
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Career Roadmap</h2>
                    <p className="text-slate-500 mt-1">Your personalized path to becoming a {goal.career_title}.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/student/career-goals')}>
                        Change Goal
                    </Button>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 border-l-4 border-l-purple-600 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Readiness Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-900">
                            {analysis ? analysis.readiness_score : 0}%
                        </div>
                        <Progress value={analysis ? analysis.readiness_score : 0} className="h-2 mt-4 bg-purple-100" indicatorClassName="bg-purple-600" />
                        <p className="text-xs text-slate-400 mt-2">Based on skills and projects completed</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Next Milestone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Code className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">Advanced Python</div>
                                <div className="text-xs text-slate-500">Due in 2 weeks</div>
                            </div>
                        </div>
                        <Button variant="link" className="px-0 text-blue-600 h-auto mt-2 text-xs">View Syllabus &rarr;</Button>
                    </CardContent>
                </Card>

                <Card className="col-span-1 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Industry Demand</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <span className="font-bold text-slate-900">Very High</span>
                        </div>
                        <p className="text-xs text-slate-500">15,000+ new jobs posted this month.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Skill Gap Analysis */}
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Skill Gap Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis && analysis.skill_gaps.map((skill) => (
                    <Card key={skill.id} className={`border-l-4 shadow-sm ${skill.gap_level === 'None' ? 'border-l-green-500' :
                            skill.gap_level === 'Moderate' ? 'border-l-yellow-500' : 'border-l-red-500'
                        }`}>
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                        {skill.name}
                                        {skill.gap_level === 'None' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-1">Required: {skill.level}</p>
                                </div>
                                <Badge variant="secondary" className={`${skill.gap_level === 'None' ? 'bg-green-100 text-green-700' :
                                        skill.gap_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {skill.gap_level === 'None' ? 'Mastered' : `${skill.gap_level} Gap`}
                                </Badge>
                            </div>

                            {skill.gap_level !== 'None' && (
                                <div className="mt-4 bg-slate-50 p-3 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Recommended Action</h5>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white p-2 rounded border border-slate-100">
                                            <Video className="w-4 h-4 text-red-500" />
                                            <span>Complete "Mastering {skill.name}" on Coursera</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white p-2 rounded border border-slate-100">
                                            <Briefcase className="w-4 h-4 text-blue-500" />
                                            <span>Build a mini-project using {skill.name}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Need a Mentor?</h3>
                    <p className="text-purple-200 max-w-lg mb-6">
                        Connect with alumni working as {goal.career_title}s to get real-world guidance.
                    </p>
                    <Button className="bg-white text-purple-900 hover:bg-purple-50">Find a Mentor</Button>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12"></div>
            </div>
        </div>
    );
}
