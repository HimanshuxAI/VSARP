import { env } from 'node:process';

const NVIDIA_CHAT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemma-3n-e2b-it';

function sanitizeMessage(value, maxLength = 2000) {
    return String(value || '').trim().slice(0, maxLength);
}

function normalizeHistory(history = []) {
    return history
        .filter((message) => message?.text && ['ai', 'user'].includes(message.role))
        .slice(-6)
        .map((message) => ({
            role: message.role === 'ai' ? 'assistant' : 'user',
            content: sanitizeMessage(message.text, 1200),
        }));
}

export function buildNvidiaPayload({ message, pathname = '/', history = [] }) {
    const pageContext = sanitizeMessage(pathname, 200);

    return {
        model: env.NVIDIA_MODEL || DEFAULT_MODEL,
        messages: [
            {
                role: 'system',
                content:
                    'You are VSARP Copilot, a concise assistant inside the VSARP student portfolio and placement readiness app. Help with employability scoring, approved activities, aptitude analytics, placement drives, CSV uploads, activity review, and NAAC/accreditation workflows. Keep answers practical and presentation-friendly. Current page: ' +
                    pageContext,
            },
            ...normalizeHistory(history),
            {
                role: 'user',
                content: sanitizeMessage(message),
            },
        ],
        max_tokens: 512,
        temperature: 0.2,
        top_p: 0.7,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
    };
}

export function extractAssistantText(data) {
    return (
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.delta?.content ||
        ''
    ).trim();
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = env.NVIDIA_API_KEY;
    if (!apiKey) {
        res.status(503).json({ error: 'NVIDIA_API_KEY is not configured' });
        return;
    }

    const { message, pathname, history } = req.body || {};
    const cleanMessage = sanitizeMessage(message);

    if (!cleanMessage) {
        res.status(400).json({ error: 'Message is required' });
        return;
    }

    try {
        const upstream = await fetch(NVIDIA_CHAT_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                buildNvidiaPayload({
                    message: cleanMessage,
                    pathname,
                    history,
                })
            ),
        });

        const data = await upstream.json().catch(() => ({}));

        if (!upstream.ok) {
            res.status(upstream.status).json({
                error: data?.error?.message || 'NVIDIA assistant request failed',
            });
            return;
        }

        const reply = extractAssistantText(data);
        res.status(200).json({
            reply: reply || 'I could not generate a response for that prompt.',
        });
    } catch (error) {
        res.status(502).json({
            error: error?.message || 'Assistant service unavailable',
        });
    }
}
