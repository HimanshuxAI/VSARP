import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export default function AiAssistant() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I am the VSARP System Copilot. I can help you verify policies or explain features on this screen.' }
    ]);
    const [input, setInput] = useState('');

    const contextMap = {
        '/student/submit': 'You are on the Submission Page. I can help verify if your activity qualifies for specific categories.',
        '/faculty/review': 'You are reviewing submissions. I scan documents for authenticity and highlight risk factors.',
        '/admin/overview': 'This is Mission Control. I am monitoring 4 data streams for compliance anomalies.'
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsgs = [...messages, { role: 'user', text: input }];
        setMessages(newMsgs);
        setInput('');

        // Mock AI Response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: "I analyzed the current view. Everything appears to be within 98% compliance parameters. (This is a V10 Mock Response)"
            }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">

            {/* Chat Interface */}
            <div className={cn(
                "bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl w-80 mb-4 overflow-hidden origin-bottom-right transition-all duration-300 pointer-events-auto",
                isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none h-0"
            )}>
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-white" />
                        <span className="text-white font-bold text-sm">System Copilot</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white/80 hover:bg-white/20 h-6 w-6 p-0 rounded-full">
                        <X className="w-3 h-3" />
                    </Button>
                </div>

                <div className="h-64 bg-slate-50 p-4 overflow-y-auto space-y-3">
                    {/* Context Hint */}
                    <div className="text-[10px] text-center text-gray-400 font-mono uppercase tracking-wider mb-2">
                        Context: {location.pathname}
                    </div>

                    {messages.map((msg, i) => (
                        <div key={i} className={cn(
                            "p-3 rounded-xl text-xs max-w-[85%] shadow-sm",
                            msg.role === 'ai' ? "bg-white text-gray-700 mr-auto rounded-tl-none border border-gray-100" : "bg-blue-600 text-white ml-auto rounded-tr-none"
                        )}>
                            {msg.text}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSend} className="p-2 bg-white border-t border-gray-100 flex gap-2">
                    <input
                        className="flex-1 bg-gray-50 text-xs px-3 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Ask Copilot..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button size="sm" type="submit" className="h-8 w-8 rounded-full bg-blue-600 p-0">
                        <ChevronRight className="w-4 h-4 text-white" />
                    </Button>
                </form>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto h-12 w-12 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center group hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-500 animate-pulse"></div>
                <div className="relative bg-white rounded-full h-[90%] w-[90%] flex items-center justify-center z-10">
                    <Sparkles className={cn("w-5 h-5 text-gray-400 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-tr group-hover:from-violet-500 group-hover:to-fuchsia-500 transition-colors", isOpen && "text-violet-600")} />
                </div>
                {/* Notification Dot */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                    </span>
                )}
            </button>
        </div>
    );
}
