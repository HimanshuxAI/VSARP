import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, ChevronDown, ChevronUp, FileText, Command, Sparkles, RotateCcw, User, RefreshCw, Save, Shuffle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * VSARP Resume Builder
 * Integrated with Auth Context and scoped LocalStorage
 */

const SectionHeader = ({ title, isOpen, toggle }) => (
    <button
        onClick={toggle}
        className="w-full flex justify-between items-center py-4 px-1 text-zinc-100 font-medium transition-all hover:text-white group"
    >
        <span className="text-sm tracking-wide group-hover:pl-1 transition-all">{title}</span>
        <span className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-zinc-100' : ''}`}>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
    </button>
);

const InputGroup = ({ label, value, onChange, placeholder, type = "text", className = "" }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 focus:bg-purple-900/10 transition-all placeholder:text-zinc-600"
        />
    </div>
);

const TextAreaGroup = ({ label, value, onChange, placeholder }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">{label}</label>
        <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-white/5 border border-white/10 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 focus:bg-purple-900/10 transition-all placeholder:text-zinc-600 resize-y"
        />
    </div>
);

const ActionButton = ({ onClick, icon: Icon, label, variant = "primary" }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 
      ${variant === 'primary'
                ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
    >
        {Icon && <Icon size={14} />}
        {label}
    </button>
);

// --- Resume Paper (ATS Optimized) - Extracted as static component ---
const ResumePreview = ({ resume }) => (
    <div className="bg-white text-black w-full h-full min-h-[1056px] shadow-2xl mx-auto p-[0.4in] sm:p-[0.5in] md:p-[0.75in] font-serif text-[10.5pt] leading-normal resume-paper text-left" id="resume-preview">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-2 mb-2">
            <h1 className="text-3xl font-bold uppercase tracking-wide font-sans mb-1">{resume.personal.fullName}</h1>
            <div className="flex flex-wrap justify-center gap-x-4 text-sm text-gray-800">
                {resume.personal.email && <span>{resume.personal.email}</span>}
                {resume.personal.phone && <span>{resume.personal.phone}</span>}
                {resume.personal.linkedin && <a href={`https://${resume.personal.linkedin}`} className="hover:underline">{resume.personal.linkedin}</a>}
                {resume.personal.github && <a href={`https://${resume.personal.github}`} className="hover:underline">{resume.personal.github}</a>}
                {resume.personal.website && <a href={`https://${resume.personal.website}`} className="hover:underline">{resume.personal.website}</a>}
            </div>
        </div>

        {/* Education */}
        {resume.education.length > 0 && (
            <div className="mb-3">
                <h2 className="font-sans font-bold text-lg uppercase border-b border-black mb-1.5">Education</h2>
                {resume.education.map(edu => (
                    <div key={edu.id} className="mb-2">
                        <div className="flex justify-between font-bold">
                            <span>{edu.school}</span>
                            <span>{edu.location}</span>
                        </div>
                        <div className="flex justify-between italic">
                            <span>{edu.degree} {edu.gpa && `- GPA: ${edu.gpa}`}</span>
                            <span>{edu.date}</span>
                        </div>
                        {edu.coursework && (
                            <div className="text-sm mt-0.5">
                                <span className="font-semibold">Coursework:</span> {edu.coursework}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* Skills */}
        <div className="mb-3">
            <h2 className="font-sans font-bold text-lg uppercase border-b border-black mb-1.5">Technical Skills</h2>
            <div className="text-sm">
                <div className="mb-0.5"><span className="font-bold">Languages:</span> {resume.skills.languages}</div>
                <div className="mb-0.5"><span className="font-bold">Frameworks:</span> {resume.skills.frameworks}</div>
                <div><span className="font-bold">Developer Tools:</span> {resume.skills.tools}</div>
            </div>
        </div>

        {/* Experience */}
        {resume.experience.length > 0 && (
            <div className="mb-3">
                <h2 className="font-sans font-bold text-lg uppercase border-b border-black mb-1.5">Experience</h2>
                {resume.experience.map(exp => (
                    <div key={exp.id} className="mb-3">
                        <div className="flex justify-between font-bold">
                            <span>{exp.role}</span>
                            <span>{exp.date}</span>
                        </div>
                        <div className="flex justify-between italic mb-1">
                            <span>{exp.company}</span>
                            <span>{exp.location}</span>
                        </div>
                        <ul className="list-disc ml-5 space-y-0.5">
                            {exp.points.map((point, idx) => (
                                <li key={idx} className="pl-1">{point}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
            <div className="mb-3">
                <h2 className="font-sans font-bold text-lg uppercase border-b border-black mb-1.5">Projects</h2>
                {resume.projects.map(proj => (
                    <div key={proj.id} className="mb-3">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <div>
                                <span className="font-bold mr-2">{proj.name}</span>
                                <span className="italic text-gray-700 text-sm">| {proj.tech}</span>
                            </div>
                            {proj.link && <span className="text-sm">{proj.date}</span>}
                        </div>
                        <ul className="list-disc ml-5 space-y-0.5">
                            {proj.points.map((point, idx) => (
                                <li key={idx} className="pl-1">{point}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        )}

        {/* Achievements */}
        {resume.achievements.length > 0 && resume.achievements[0] !== "" && (
            <div className="mb-3">
                <h2 className="font-sans font-bold text-lg uppercase border-b border-black mb-1.5">Achievements</h2>
                <ul className="list-disc ml-5 space-y-0.5">
                    {resume.achievements.map((ach, idx) => (
                        ach && <li key={idx} className="pl-1">{ach}</li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

export default function ResumeBuilder() {
    const { user } = useAuth();
    const STORAGE_KEY = `vsarp_resume_${user?.id || 'guest'}`;

    const defaultPersonal = {
        fullName: user?.name || "Student Name",
        email: user?.email || "student@university.edu",
        phone: "+1 (555) 000-0000",
        linkedin: "linkedin.com/in/student",
        github: "github.com/student",
        website: "student.portfolio",
    };

    const initialData = {
        personal: defaultPersonal,
        education: [
            {
                id: 1,
                school: "Tech University",
                degree: "Bachelor of Science in Computer Science",
                location: "San Francisco, CA",
                date: "Aug. 2021 – May 2025",
                gpa: "3.8/4.0",
                coursework: "Data Structures, Algorithms, OS, Distributed Systems"
            }
        ],
        skills: {
            languages: "Java, Python, C++, JavaScript, TypeScript, SQL",
            frameworks: "React, Node.js, Spring Boot, Docker, Kubernetes",
            tools: "Git, Linux, Jenkins, MongoDB, PostgreSQL"
        },
        experience: [],
        projects: [],
        achievements: []
    };

    const [resume, setResume] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse resume data", e);
                }
            }
        }
        return initialData;
    });

    const [activeTab] = useState('editor');
    const [sections, setSections] = useState({
        personal: true,
        education: false,
        skills: false,
        experience: false,
        projects: false,
        achievements: false
    });
    const [lastSaved, setLastSaved] = useState(null);

    // Sync user data if missing (e.g. first load)
    useEffect(() => {
        if (user && (!resume.personal.fullName || resume.personal.fullName === "Student Name")) {
            queueMicrotask(() => setResume(prev => ({
                ...prev,
                personal: {
                    ...prev.personal,
                    fullName: user.name,
                    email: user.email
                }
            })));
        }
    }, [user, resume.personal.fullName]);

    // Save to LocalStorage
    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
            setLastSaved(new Date());
        }, 1000);
        return () => clearTimeout(timeout);
    }, [resume, STORAGE_KEY]);

    const toggleSection = (key) => setSections(prev => ({ ...prev, [key]: !prev[key] }));

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset? This will restore the default template populated with your profile data.")) {
            const resetData = { ...initialData, personal: defaultPersonal };
            setResume(resetData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
        }
    };

    const handleAutoFill = () => {
        if (window.confirm("Auto-fill personal details from your VSARP Profile?")) {
            setResume(prev => ({
                ...prev,
                personal: {
                    ...prev.personal,
                    fullName: user.name,
                    email: user.email
                }
            }));
        }
    };

    const handleRandomFill = () => {
        if (window.confirm("This will overwrite your current resume with random sample data. Continue?")) {
            setResume({
                personal: {
                    fullName: "Alex Rivera",
                    email: "alex.rivera@example.com",
                    phone: "+1 (555) 123-4567",
                    linkedin: "linkedin.com/in/arivera",
                    github: "github.com/arivera",
                    website: "arivera.dev"
                },
                education: [
                    {
                        id: Date.now(),
                        school: "State University of Technology",
                        degree: "B.S. Computer Science",
                        location: "Austin, TX",
                        date: "Aug 2020 - May 2024",
                        gpa: "3.9/4.0",
                        coursework: "Advanced Algorithms, Machine Learning, Database Systems, Cloud Computing"
                    }
                ],
                skills: {
                    languages: "JavaScript (ES6+), TypeScript, Python, Java, SQL",
                    frameworks: "React, Next.js, Node.js, Express, Django, TailwindCSS",
                    tools: "Git, Docker, AWS (EC2, S3), Firebase, Vercel, Figma"
                },
                experience: [
                    {
                        id: Date.now() + 1,
                        role: "Full Stack Developer Intern",
                        company: "TechFlow Solutions",
                        location: "Remote",
                        date: "Jun 2023 - Aug 2023",
                        points: [
                            "Developed and deployed a customer feedback portal using React and Node.js, improving user engagement by 25%.",
                            "Optimized database queries in PostgreSQL, reducing API response time by 40%.",
                            "Collaborated with design team to implement responsive UI components matching provided high-fidelity mockups."
                        ]
                    },
                    {
                        id: Date.now() + 2,
                        role: "Teaching Assistant",
                        company: "University CS Department",
                        location: "Austin, TX",
                        date: "Jan 2023 - May 2023",
                        points: [
                            "Mentored 50+ students in Data Structures and Algorithms, achieving a 4.8/5.0 average feedback rating.",
                            "Automated grading scripts using Python, saving 10+ hours of manual grading time per week."
                        ]
                    }
                ],
                projects: [
                    {
                        id: Date.now() + 3,
                        name: "SmartTask AI",
                        tech: "React, Python, OpenAI API",
                        link: "github.com/arivera/smart-task",
                        date: "Fall 2023",
                        points: [
                            "Built an AI-powered task management app that auto-categorizes todos using natural language processing.",
                            "Integrated Stripe for payment processing and leveraged Firebase Auth for secure user management.",
                            "Deployed frontend to Vercel and backend to Render, handling 500+ daily requests during demo period."
                        ]
                    }
                ],
                achievements: [
                    "Winner, University Hackathon 2023 (1st place out of 40 teams)",
                    "Dean's List (All Semesters)",
                    "AWS Certified Cloud Practitioner"
                ]
            });
            // Open all sections to show the data
            setSections({
                personal: true,
                education: true,
                skills: true,
                experience: true,
                projects: true,
                achievements: true
            });
        }
    };

    // --- State Handlers ---
    const handlePersonalChange = (field, value) => setResume(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
    const handleSkillChange = (field, value) => setResume(prev => ({ ...prev, skills: { ...prev.skills, [field]: value } }));

    const addItem = (section, template) => {
        setResume(prev => ({ ...prev, [section]: [...prev[section], { ...template, id: Date.now() }] }));
        if (!sections[section]) toggleSection(section);
    };

    const removeItem = (section, id) => {
        if (window.confirm("Delete this item?")) {
            setResume(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }));
        }
    };

    const updateItem = (section, id, field, value) => {
        setResume(prev => ({
            ...prev,
            [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const updateArrayPoint = (section, id, pointIndex, value) => {
        setResume(prev => ({
            ...prev,
            [section]: prev[section].map(item => {
                if (item.id !== id) return item;
                const newPoints = [...item.points];
                newPoints[pointIndex] = value;
                return { ...item, points: newPoints };
            })
        }));
    };

    const addPoint = (section, id) => {
        setResume(prev => ({
            ...prev,
            [section]: prev[section].map(item => item.id === id ? { ...item, points: [...item.points, ""] } : item)
        }));
    };

    const removePoint = (section, id, pointIndex) => {
        setResume(prev => ({
            ...prev,
            [section]: prev[section].map(item => item.id === id ? { ...item, points: item.points.filter((_, i) => i !== pointIndex) } : item)
        }));
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=850,height=1100');
        if (!printWindow) {
            alert('Please allow popups to download PDF');
            return;
        }

        // Build contact info line
        const contactParts = [
            resume.personal.email,
            resume.personal.phone,
            resume.personal.linkedin,
            resume.personal.github,
            resume.personal.website
        ].filter(Boolean);

        // Build education HTML
        const eduHTML = resume.education.map(edu => `
            <div style="margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;font-weight:bold">
                    <span>${edu.school || ''}</span><span>${edu.location || ''}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-style:italic">
                    <span>${edu.degree || ''}${edu.gpa ? ' - GPA: ' + edu.gpa : ''}</span><span>${edu.date || ''}</span>
                </div>
                ${edu.coursework ? `<div style="font-size:9.5pt;margin-top:2px"><b>Coursework:</b> ${edu.coursework}</div>` : ''}
            </div>
        `).join('');

        // Build experience HTML
        const expHTML = resume.experience.map(exp => `
            <div style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;font-weight:bold">
                    <span>${exp.role || ''}</span><span>${exp.date || ''}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-style:italic;margin-bottom:4px">
                    <span>${exp.company || ''}</span><span>${exp.location || ''}</span>
                </div>
                <ul>${exp.points.filter(p => p).map(p => `<li>${p}</li>`).join('')}</ul>
            </div>
        `).join('');

        // Build projects HTML
        const projHTML = resume.projects.map(proj => `
            <div style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px">
                    <div><b>${proj.name || ''}</b> <span style="font-style:italic;color:#444;font-size:9.5pt">${proj.tech ? '| ' + proj.tech : ''}</span></div>
                    <span style="font-size:9.5pt">${proj.date || ''}</span>
                </div>
                <ul>${proj.points.filter(p => p).map(p => `<li>${p}</li>`).join('')}</ul>
            </div>
        `).join('');

        // Build achievements HTML
        const achHTML = resume.achievements.filter(a => a).map(a => `<li>${a}</li>`).join('');

        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>${resume.personal.fullName || 'Resume'} - VSARP</title>
    <style>
        @page { margin: 0; size: letter; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', Georgia, serif;
            color: #000;
            background: #fff;
            font-size: 10.5pt;
            line-height: 1.35;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 0.45in 0.55in;
        }
        .page { max-width: 7.5in; margin: 0 auto; }
        h1 {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 22pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            text-align: center;
            margin-bottom: 4px;
        }
        .contact {
            text-align: center;
            font-size: 9.5pt;
            color: #333;
            margin-bottom: 2px;
        }
        .divider { border-bottom: 2px solid #000; margin-bottom: 8px; padding-bottom: 6px; }
        .section { margin-bottom: 8px; }
        .section-title {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            padding-bottom: 1px;
        }
        ul { margin-left: 18px; list-style-type: disc; }
        li { padding-left: 2px; margin-bottom: 1px; font-size: 10pt; }
    </style>
</head>
<body>
    <div class="page">
        <div class="divider">
            <h1>${resume.personal.fullName || ''}</h1>
            <div class="contact">${contactParts.join('  &nbsp;|&nbsp;  ')}</div>
        </div>

        ${resume.education.length > 0 ? `
        <div class="section">
            <div class="section-title">Education</div>
            ${eduHTML}
        </div>` : ''}

        ${(resume.skills.languages || resume.skills.frameworks || resume.skills.tools) ? `
        <div class="section">
            <div class="section-title">Technical Skills</div>
            <div style="font-size:10pt">
                ${resume.skills.languages ? `<div style="margin-bottom:2px"><b>Languages:</b> ${resume.skills.languages}</div>` : ''}
                ${resume.skills.frameworks ? `<div style="margin-bottom:2px"><b>Frameworks:</b> ${resume.skills.frameworks}</div>` : ''}
                ${resume.skills.tools ? `<div><b>Developer Tools:</b> ${resume.skills.tools}</div>` : ''}
            </div>
        </div>` : ''}

        ${resume.experience.length > 0 ? `
        <div class="section">
            <div class="section-title">Experience</div>
            ${expHTML}
        </div>` : ''}

        ${resume.projects.length > 0 ? `
        <div class="section">
            <div class="section-title">Projects</div>
            ${projHTML}
        </div>` : ''}

        ${achHTML ? `
        <div class="section">
            <div class="section-title">Achievements</div>
            <ul>${achHTML}</ul>
        </div>` : ''}
    </div>
</body>
</html>`);
        printWindow.document.close();

        // Wait for content to render then trigger print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.onafterprint = () => printWindow.close();
            }, 250);
        };
        // Fallback
        setTimeout(() => {
            try { printWindow.print(); } catch(e) { /* already printed */ }
        }, 800);
    };



    return (
        <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white rounded-xl overflow-hidden border border-white/5 shadow-2xl">
            <style>{`
        @media print {
          @page {
            margin: 0;
            size: letter portrait;
          }

          /* HIDE EVERYTHING NOT NEEDED */
          nav, 
          #editor-panel, 
          #app-sidebar,
          .no-print,
          button,
          .bg-zinc-900\\/50,
          .lg\\:hidden
          {
            display: none !important;
          }

          /* RESET PAGE CONTAINERS */
          body, html, #root, main, #app-main {
            background: white !important;
            color: black !important;
            height: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
          }

          /* SHOW PREVIEW PANEL CONTAINER */
          #preview-panel {
             display: block !important;
             background: white !important;
             width: 100% !important;
             height: auto !important;
             position: static !important;
             overflow: visible !important;
             padding: 0 !important;
             margin: 0 !important;
          }

          /* TARGET RESUME WRAPPER (Previously scaled) */
          #resume-preview-wrapper {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            transform: none !important; /* Remove zoom/scale */
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            left: 0 !important;
            top: 0 !important;
            height: auto !important;
            min-height: auto !important;
          }

          /* TARGET RESUME CONTENT */
          #resume-preview {
            width: 100% !important;
            max-width: 8.5in !important;
            height: auto !important;
            min-height: auto !important;
            padding: 0.5in !important; /* Standard Print Margin */
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Force Text Colors */
          #resume-preview * {
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #09090b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>

            {/* Navbar - Relative to container */}
            <nav className="h-14 w-full flex-none flex items-center justify-between px-4 bg-zinc-950 border-b border-white/10 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur text-white p-1.5 rounded-lg border border-white/10">
                        <FileText size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-sm tracking-tight text-white">VSARP <span className="text-zinc-500 font-normal">CV Studio</span></h1>
                        {lastSaved && <span className="text-[10px] text-zinc-500">Saved {lastSaved.toLocaleTimeString()}</span>}
                    </div>
                </div>

                {/* Mobile Tabs */}
                <div className="flex lg:hidden bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button onClick={() => {}} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'editor' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Editor</button>
                    <button onClick={() => {}} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Preview</button>
                </div>

                <div className="hidden sm:flex items-center gap-3">
                    <button onClick={handleAutoFill} aria-label="Auto-fill personal details" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white/5" title="Auto-fill from Profile">
                        <User size={14} /> Auto-fill
                    </button>
                    <button onClick={handleRandomFill} aria-label="Fill with random sample data" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white/5" title="Random Data Fill">
                        <Shuffle size={14} /> Random
                    </button>
                    <button onClick={handleReset} aria-label="Reset resume to default template" className="text-zinc-500 hover:text-white transition-colors" title="Reset"><RotateCcw size={16} /></button>
                    <div className="h-4 w-px bg-zinc-800 mx-1"></div>
                    <ActionButton onClick={handlePrint} aria-label="Download resume as PDF" icon={Download} label="Download PDF" variant="primary" />
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex gap-0 lg:gap-0 overflow-hidden relative">

                {/* LEFT: Editor Panel */}
                <div id="editor-panel" className={`flex-1 flex-col h-full overflow-hidden bg-zinc-950 border-r border-white/5 ${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="flex-none p-3 px-6 flex items-center gap-2 text-zinc-500 border-b border-white/5 bg-zinc-950/50 backdrop-blur-sm z-10 sticky top-0">
                        <Sparkles size={14} className="text-purple-400" />
                        <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">Editor Details</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 pb-20">

                        {/* Personal Info */}
                        <div className="group border-b border-zinc-900 pb-2">
                            <SectionHeader title="Personal Information" isOpen={sections.personal} toggle={() => toggleSection('personal')} />
                            {sections.personal && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1 py-4 animate-in slide-in-from-top-1 fade-in duration-200">
                                    <InputGroup label="Full Name" value={resume.personal.fullName} onChange={(v) => handlePersonalChange('fullName', v)} placeholder="Jane Doe" className="md:col-span-2" />
                                    <InputGroup label="Email" value={resume.personal.email} onChange={(v) => handlePersonalChange('email', v)} placeholder="jane@example.com" />
                                    <InputGroup label="Phone" value={resume.personal.phone} onChange={(v) => handlePersonalChange('phone', v)} placeholder="+1 555-0123" />
                                    <InputGroup label="LinkedIn" value={resume.personal.linkedin} onChange={(v) => handlePersonalChange('linkedin', v)} placeholder="linkedin.com/in/jane" />
                                    <InputGroup label="GitHub" value={resume.personal.github} onChange={(v) => handlePersonalChange('github', v)} placeholder="github.com/jane" />
                                    <InputGroup label="Portfolio" value={resume.personal.website} onChange={(v) => handlePersonalChange('website', v)} placeholder="jane.dev" className="md:col-span-2" />
                                </div>
                            )}
                        </div>

                        {/* Education */}
                        <div className="group border-b border-zinc-900 pb-2">
                            <div className="flex justify-between items-center pr-2">
                                <SectionHeader title="Education" isOpen={sections.education} toggle={() => toggleSection('education')} />
                                <button onClick={() => addItem('education', { school: "", degree: "", location: "", date: "", gpa: "", coursework: "" })} className="text-zinc-600 hover:text-white transition-colors"><Plus size={16} /></button>
                            </div>
                            {sections.education && (
                                <div className="flex flex-col gap-8 px-1 py-4 animate-in slide-in-from-top-1 fade-in duration-200">
                                    {resume.education.map((edu) => (
                                        <div key={edu.id} className="relative pl-4 border-l border-zinc-800 hover:border-zinc-600 transition-colors">
                                            <button onClick={() => removeItem('education', edu.id)} className="absolute right-0 top-0 text-zinc-700 hover:text-red-400 p-1 transition-colors"><Trash2 size={14} /></button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                                                <InputGroup label="University" value={edu.school} onChange={(v) => updateItem('education', edu.id, 'school', v)} placeholder="University Name" />
                                                <InputGroup label="Location" value={edu.location} onChange={(v) => updateItem('education', edu.id, 'location', v)} placeholder="City, State" />
                                                <InputGroup label="Degree" value={edu.degree} onChange={(v) => updateItem('education', edu.id, 'degree', v)} placeholder="BS Computer Science" />
                                                <InputGroup label="Date" value={edu.date} onChange={(v) => updateItem('education', edu.id, 'date', v)} placeholder="Aug 2021 - May 2025" />
                                                <InputGroup label="GPA" value={edu.gpa} onChange={(v) => updateItem('education', edu.id, 'gpa', v)} placeholder="3.8/4.0" />
                                                <InputGroup label="Coursework" value={edu.coursework} onChange={(v) => updateItem('education', edu.id, 'coursework', v)} placeholder="Relevant courses..." />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="group border-b border-zinc-900 pb-2">
                            <SectionHeader title="Technical Skills" isOpen={sections.skills} toggle={() => toggleSection('skills')} />
                            {sections.skills && (
                                <div className="grid grid-cols-1 gap-5 px-1 py-4 animate-in slide-in-from-top-1 fade-in duration-200">
                                    <TextAreaGroup label="Languages" value={resume.skills.languages} onChange={(v) => handleSkillChange('languages', v)} placeholder="Python, Java, C++..." />
                                    <TextAreaGroup label="Frameworks" value={resume.skills.frameworks} onChange={(v) => handleSkillChange('frameworks', v)} placeholder="React, Spring..." />
                                    <TextAreaGroup label="Tools" value={resume.skills.tools} onChange={(v) => handleSkillChange('tools', v)} placeholder="Git, Docker, AWS..." />
                                </div>
                            )}
                        </div>

                        {/* Experience */}
                        <div className="group border-b border-zinc-900 pb-2">
                            <div className="flex justify-between items-center pr-2">
                                <SectionHeader title="Experience" isOpen={sections.experience} toggle={() => toggleSection('experience')} />
                                <button onClick={() => addItem('experience', { role: "", company: "", location: "", date: "", points: [""] })} className="text-zinc-600 hover:text-white transition-colors"><Plus size={16} /></button>
                            </div>
                            {sections.experience && (
                                <div className="flex flex-col gap-10 px-1 py-4 animate-in slide-in-from-top-1 fade-in duration-200">
                                    {resume.experience.map((exp) => (
                                        <div key={exp.id} className="relative pl-4 border-l border-zinc-800 hover:border-zinc-600 transition-colors">
                                            <button onClick={() => removeItem('experience', exp.id)} className="absolute right-0 top-0 text-zinc-700 hover:text-red-400 p-1 transition-colors"><Trash2 size={14} /></button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6 mb-4">
                                                <InputGroup label="Role" value={exp.role} onChange={(v) => updateItem('experience', exp.id, 'role', v)} placeholder="Software Engineer Intern" />
                                                <InputGroup label="Company" value={exp.company} onChange={(v) => updateItem('experience', exp.id, 'company', v)} placeholder="Tech Company" />
                                                <InputGroup label="Location" value={exp.location} onChange={(v) => updateItem('experience', exp.id, 'location', v)} placeholder="Remote / NY" />
                                                <InputGroup label="Date" value={exp.date} onChange={(v) => updateItem('experience', exp.id, 'date', v)} placeholder="May 2024 - Aug 2024" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Bullet Points</label>
                                                {exp.points.map((pt, i) => (
                                                    <div key={i} className="flex gap-2 group/point">
                                                        <div className="pt-2 text-zinc-600">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/point:bg-zinc-600 transition-colors"></div>
                                                        </div>
                                                        <textarea
                                                            value={pt}
                                                            onChange={(e) => updateArrayPoint('experience', exp.id, i, e.target.value)}
                                                            className="flex-1 bg-transparent border-b border-zinc-800 text-zinc-300 text-sm py-1 focus:outline-none focus:border-zinc-500 focus:text-white transition-colors resize-y placeholder:text-zinc-700"
                                                            rows={1}
                                                            placeholder="Action Verb + Task + Result"
                                                        />
                                                        <button onClick={() => removePoint('experience', exp.id, i)} className="text-zinc-800 hover:text-red-400 transition-colors opacity-0 group-hover/point:opacity-100"><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addPoint('experience', exp.id)} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mt-2 transition-colors"><Plus size={12} /> Add Bullet Point</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Projects */}
                        <div className="group border-b border-zinc-900 pb-2">
                            <div className="flex justify-between items-center pr-2">
                                <SectionHeader title="Projects" isOpen={sections.projects} toggle={() => toggleSection('projects')} />
                                <button onClick={() => addItem('projects', { name: "", tech: "", link: "", points: [""] })} className="text-zinc-600 hover:text-white transition-colors"><Plus size={16} /></button>
                            </div>
                            {sections.projects && (
                                <div className="flex flex-col gap-10 px-1 py-4 animate-in slide-in-from-top-1 fade-in duration-200">
                                    {resume.projects.map((proj) => (
                                        <div key={proj.id} className="relative pl-4 border-l border-zinc-800 hover:border-zinc-600 transition-colors">
                                            <button onClick={() => removeItem('projects', proj.id)} className="absolute right-0 top-0 text-zinc-700 hover:text-red-400 p-1 transition-colors"><Trash2 size={14} /></button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6 mb-4">
                                                <InputGroup label="Name" value={proj.name} onChange={(v) => updateItem('projects', proj.id, 'name', v)} placeholder="Project Name" />
                                                <InputGroup label="Tech Stack" value={proj.tech} onChange={(v) => updateItem('projects', proj.id, 'tech', v)} placeholder="React, Node, MongoDB" />
                                                <InputGroup label="Link" value={proj.link} onChange={(v) => updateItem('projects', proj.id, 'link', v)} placeholder="github.com/user/repo" className="md:col-span-2" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Bullet Points</label>
                                                {proj.points.map((pt, i) => (
                                                    <div key={i} className="flex gap-2 group/point">
                                                        <div className="pt-2 text-zinc-600">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/point:bg-zinc-600 transition-colors"></div>
                                                        </div>
                                                        <textarea
                                                            value={pt}
                                                            onChange={(e) => updateArrayPoint('projects', proj.id, i, e.target.value)}
                                                            className="flex-1 bg-transparent border-b border-zinc-800 text-zinc-300 text-sm py-1 focus:outline-none focus:border-zinc-500 focus:text-white transition-colors resize-y placeholder:text-zinc-700"
                                                            rows={1}
                                                            placeholder="Describe the feature and technology"
                                                        />
                                                        <button onClick={() => removePoint('projects', proj.id, i)} className="text-zinc-800 hover:text-red-400 transition-colors opacity-0 group-hover/point:opacity-100"><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addPoint('projects', proj.id)} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mt-2 transition-colors"><Plus size={12} /> Add Bullet Point</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Achievements */}
                        <div className="group pb-20">
                            <SectionHeader title="Achievements" isOpen={sections.achievements} toggle={() => toggleSection('achievements')} />
                            {sections.achievements && (
                                <div className="px-1 py-4 animate-in slide-in-from-top-1 fade-in duration-200">
                                    <div className="flex flex-col gap-3">
                                        {resume.achievements.map((ach, i) => (
                                            <div key={i} className="flex gap-2 items-center group/ach">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                                                <input
                                                    type="text"
                                                    value={ach}
                                                    onChange={(e) => {
                                                        const newAch = [...resume.achievements];
                                                        newAch[i] = e.target.value;
                                                        setResume({ ...resume, achievements: newAch });
                                                    }}
                                                    className="flex-1 bg-transparent border-b border-zinc-800 text-zinc-300 text-sm py-2 focus:outline-none focus:border-zinc-500 focus:text-white transition-colors"
                                                    placeholder="Award, Certification, or Ranking"
                                                />
                                                <button onClick={() => {
                                                    const newAch = resume.achievements.filter((_, idx) => idx !== i);
                                                    setResume({ ...resume, achievements: newAch });
                                                }} className="text-zinc-800 hover:text-red-400 transition-colors opacity-0 group-hover/ach:opacity-100"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setResume({ ...resume, achievements: [...resume.achievements, ""] })} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mt-2 transition-colors w-max"><Plus size={12} /> Add Achievement</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Resume Preview */}
                <div id="preview-panel" className={`flex-1 flex-col items-center justify-center relative bg-zinc-900 ${activeTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="flex-none w-full p-4 flex items-center justify-center gap-2 text-zinc-500 border-b border-white/5 bg-zinc-900/50 backdrop-blur-sm absolute top-0 z-10">
                        <FileText size={14} className="text-zinc-500" />
                        <span className="text-xs uppercase tracking-widest font-bold">Live Preview</span>
                    </div>

                    <div className="w-full h-full flex items-center justify-center overflow-auto p-8 pt-20 custom-scrollbar relative">
                        {/* Background grid for pizzazz in preview area */}
                        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {/* Print Button Mobile */}
                        <div className="lg:hidden absolute top-4 right-4 flex gap-2 z-20">
                            <button onClick={handleReset} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><RotateCcw size={18} /></button>
                            <ActionButton onClick={handlePrint} icon={Download} label="Export" variant="primary" />
                        </div>

                        {/* WRAPPER WITH ID FOR CSS TARGETING */}
                        <div id="resume-preview-wrapper" className="w-[8.5in] z-10 transform scale-[0.6] sm:scale-[0.7] md:scale-[0.8] xl:scale-[0.9] transition-transform duration-300 bg-white shadow-2xl">
                            <ResumePreview resume={resume} />
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}