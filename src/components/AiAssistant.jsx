import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import {
    getFallbackAIResponse,
    requestAssistantReply,
} from '../lib/aiAssistant';

export default function AiAssistant() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: '👋 Hi! I\'m the VSARP Copilot. Ask me about activity scoring, placements, NAAC reports, or anything on this page.' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        const conversation = [...messages, { role: 'user', text: userMsg }];
        setMessages(conversation);
        setInput('');
        setIsTyping(true);

        try {
            const response = await requestAssistantReply({
                message: userMsg,
                pathname: location.pathname,
                history: messages,
            });
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        } catch {
            const response = getFallbackAIResponse(userMsg, location.pathname);
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {/* Chat Panel */}
            <div className={cn(
                "w-[340px] rounded-2xl shadow-2xl border border-slate-200 bg-white overflow-hidden origin-bottom-right transition-all duration-300",
                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none h-0"
            )}>
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold leading-none">VSARP Copilot</p>
                            <p className="text-white/50 text-[10px] font-mono">AI Assistant</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Context Bar */}
                <div className="bg-slate-50 px-4 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                        📍 {location.pathname}
                    </p>
                </div>

                {/* Messages */}
                <div className="h-72 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[80%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line",
                                msg.role === 'ai'
                                    ? "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md"
                                    : "bg-slate-900 text-white rounded-br-md"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 2 && (
                    <div className="px-3 py-2 border-t border-slate-100 bg-white flex gap-1.5 flex-wrap">
                        {['Score breakdown', 'NAAC metrics', 'CSV format'].map(q => (
                            <button key={q} onClick={() => { setInput(q); }} className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium">
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-100 flex gap-2 items-center">
                    <input
                        className="flex-1 bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all placeholder:text-slate-400"
                        placeholder="Ask anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={isTyping || !input.trim()}
                        className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-3.5 h-3.5 text-white" />
                    </button>
                </form>
            </div>

            {/* FAB Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
                    isOpen
                        ? "bg-slate-900 rotate-0"
                        : "bg-gradient-to-br from-slate-900 to-slate-700"
                )}
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-white" />
                ) : (
                    <>
                        <Sparkles className="w-5 h-5 text-white" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
                        </span>
                    </>
                )}
            </button>
        </div>
    );
}
