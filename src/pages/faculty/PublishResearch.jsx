
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BookOpen, Link as LinkIcon, Calendar, CheckCircle2, FlaskConical } from 'lucide-react';

/**
 * PublishResearch allows faculty users to record and manage their research papers.
 * Integrates abstract parsing, DOI links, and date validators.
 */
export default function PublishResearch() {
    const { user } = useAuth();
    const { addResearchPaper, researchPapers, fillRandomResearchPapers } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        publication_date: '',
        journal_conference: '',
        url: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const success = await addResearchPaper(formData);
            if (success) {
                alert("Research Paper Published Successfully!");
                setFormData({
                    title: '',
                    abstract: '',
                    publication_date: '',
                    journal_conference: '',
                    url: ''
                });
            }
        } catch (error) {
            console.error(error);
            alert("Failed to publish paper");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter my papers
    const myPapers = researchPapers.filter(p => p.faculty_id === user.id);

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Research Publications</h2>
                    <p className="text-slate-500 mt-1">Manage and publish your academic research work.</p>
                </div>
                <Button variant="outline" onClick={fillRandomResearchPapers} className="gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Fill Random Data
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submission Form */}
                <div className="lg:col-span-2">
                    <Card className="shadow-lg border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 text-purple-600" />
                                Add New Publication
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Paper Title</label>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="E.g. AI in Healthcare..."
                                        required
                                        className="bg-slate-50"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1 block">Journal / Conference Name</label>
                                        <Input
                                            name="journal_conference"
                                            value={formData.journal_conference}
                                            onChange={handleChange}
                                            placeholder="E.g. IEEE Access"
                                            required
                                            className="bg-slate-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1 block">Publication Date</label>
                                        <Input
                                            type="date"
                                            name="publication_date"
                                            value={formData.publication_date}
                                            onChange={handleChange}
                                            required
                                            className="bg-slate-50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Abstract</label>
                                    <Textarea
                                        name="abstract"
                                        value={formData.abstract}
                                        onChange={handleChange}
                                        placeholder="Brief summary of the research..."
                                        rows={4}
                                        className="bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Paper URL / DOI</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <Input
                                            name="url"
                                            value={formData.url}
                                            onChange={handleChange}
                                            placeholder="https://doi.org/..."
                                            className="pl-10 bg-slate-50"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800">
                                        {isSubmitting ? 'Publishing...' : 'Publish Paper'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Previous Publications List */}
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Your Publications
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {myPapers.length === 0 ? (
                            <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-500 text-sm">No papers published yet.</p>
                            </div>
                        ) : (
                            myPapers.map(paper => (
                                <Card key={paper.id} className="border-slate-100 hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <h4 className="font-bold text-slate-900 line-clamp-2">{paper.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(paper.publication_date).toLocaleDateString()}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 border-purple-100">
                                                {paper.journal_conference}
                                            </Badge>
                                            {paper.url && (
                                                <a
                                                    href={paper.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:underline text-xs"
                                                >
                                                    View Link
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
