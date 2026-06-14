const CONTEXT_HINTS = {
    '/student/dashboard':
        'I can help you understand your portfolio metrics, activity status, employability score, and placement readiness.',
    '/student/submit':
        'Need help submitting an activity? I can guide you through categories, tiers, and proof requirements.',
    '/student/academics':
        'I can explain SGPA/CGPA calculations, result verification status, and CSV upload format.',
    '/student/placements':
        'I can help you find matching placement drives, interpret aptitude analytics, and explain skill-based matching.',
    '/faculty/review':
        'I can help you review submissions faster. Ask me about verification policies or risk factors.',
    '/hod/dashboard':
        'I can explain department metrics, placement readiness calculation, and student rankings.',
    '/hod/accreditation':
        'I can walk you through NAAC criteria, benchmark meanings, and export options.',
    '/placement/drives':
        'I can help with drive creation, CSV question upload format, and aptitude analytics.',
    '/admin/overview':
        'I can explain user management, audit logs, and system-wide statistics.',
};

const SMART_RESPONSES = [
    {
        pattern: /score|employability/i,
        reply:
            'The Employability Score (0-100) uses approved activities, category caps, quality tiers, recency, internship type, and aptitude percentile bonus. Internships, certifications, research, and hackathons all contribute differently.',
    },
    {
        pattern: /naac|accreditation|ssr/i,
        reply:
            'VSARP auto-generates NAAC SSR data for Criteria 1, 2, 3, 5 and 6. Go to HOD -> Accreditation Reports -> Show NAAC SSR to view readiness and export CSV/JSON.',
    },
    {
        pattern: /placement|drive|apply/i,
        reply:
            'Placement drives match students by skills, CGPA, and department. Go to Placements to see eligible drives and apply with one click.',
    },
    {
        pattern: /verify|approve|review/i,
        reply:
            'Activities and results start as Pending. Faculty reviews and approves or rejects them. Each approval generates a unique integrity hash for verification.',
    },
    {
        pattern: /csv|upload|bulk/i,
        reply:
            'CSV uploads are supported for semester results and aptitude questions. Aptitude format: question, opt1, opt2, opt3, opt4, correct_index.',
    },
    {
        pattern: /intern/i,
        reply:
            'Internships are weighted by type: Paid On-site Long = 18pts, Paid Remote = 15pts, Unpaid On-site = 12pts, Short-term = 10pts, Unpaid Remote = 8pts. Max 2 internships count.',
    },
    {
        pattern: /certif/i,
        reply:
            'Certifications use a 2-tier system: Tier 1 national/global credentials = 10pts, Tier 2 college/local credentials = 5pts. Max 3 certifications count.',
    },
    {
        pattern: /aptitude|test|percentile/i,
        reply:
            'Aptitude scoring is percentile-based: Top 10% = +17pts, Top 25% = +12pts, everyone else who passes = +10pts. Student analytics show attempts, best score, pass rate, and cohort percentile.',
    },
    {
        pattern: /hello|hi|hey/i,
        reply:
            "Hello! I'm VSARP Copilot. I can help with activity scoring, placement drives, aptitude analytics, NAAC reports, and more.",
    },
    {
        pattern: /help|what can you/i,
        reply:
            'I can help with employability score breakdowns, activity submission guidelines, placement drive eligibility, aptitude analytics, NAAC SSR metrics, CSV upload formats, and verification status.',
    },
];

export function getFallbackAIResponse(userMsg, pathname) {
    const match = SMART_RESPONSES.find((response) => response.pattern.test(userMsg));
    if (match) return match.reply;

    const context = Object.entries(CONTEXT_HINTS).find(([path]) =>
        pathname.startsWith(path)
    );
    if (context) {
        return `Live AI is unavailable right now. For this page: ${context[1]}`;
    }

    return 'Live AI is unavailable right now. Try asking about employability scores, aptitude analytics, placement drives, CSV uploads, or verification workflows.';
}

export async function requestAssistantReply({ message, pathname, history }) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    try {
        const apiKey = import.meta.env.VITE_NVIDIA_API_KEY || import.meta.env.NVIDIA_API_KEY || '';
        const systemPrompt = `You are the VSARP Copilot, an AI assistant for the Verified Secure Academic Record Platform. You help students, faculty, and admins. The user is currently on: ${pathname}. Give helpful, concise answers. If they ask about a developer roadmap (python, web, etc), provide a clear step-by-step roadmap.`;
        
        const formattedHistory = (history || [])
            .filter(msg => msg && msg.text)
            .map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.text
            }));

        const msgs = [
            { role: "system", content: systemPrompt },
            ...formattedHistory,
            { role: "user", content: message }
        ];

        const response = await fetch("/nvidia-api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "meta/llama-3.1-8b-instruct",
                messages: msgs,
                max_tokens: 512,
                temperature: 0.7
            }),
            signal: controller.signal
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("NVIDIA API Error:", data);
            throw new Error(data?.error?.message || 'Assistant request failed');
        }

        return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    } finally {
        window.clearTimeout(timeoutId);
    }
}
