'use client';

import { AnalysisReport } from '@/types';
import { Bot, HelpCircle, Send, Sparkles, User } from 'lucide-react';
import React, { useState } from 'react';

interface AiExplanationAssistantProps {
  report: AnalysisReport;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

const PRESET_QUESTIONS = [
  'Why is this recommendation given?',
  'Why is this pattern confirmed or waiting?',
  'Where is the exact stop-loss and why?',
  'What happens if key support breaks?',
  'Explain this chart in plain simple English'
];

export const AiExplanationAssistant: React.FC<AiExplanationAssistantProps> = ({ report }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hello! I am your CHARTIQ technical analyst assistant. I have reviewed all 15 technical layers for ${report.stockInfo.symbol} at ₹${report.stockInfo.currentPrice}. How can I clarify this trading plan or pattern structure for you?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg = questionText.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, report })
      });
      const data = await res.json();
      const answer = data.answer || 'Unable to generate explanation at this moment.';
      setMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Error contacting assistant engine. Please rephrase.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#0b0f17] border border-[#1a2333] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0d131f] border-b border-[#1a2333] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide font-mono">CHARTIQ AI ASSISTANT</h4>
            <p className="text-[10px] text-slate-400">Context-Grounded in Verified OHLC Data</p>
          </div>
        </div>
        <span className="text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono">
          NO FABRICATION GUARANTEE
        </span>
      </div>

      {/* Preset Quick Chips */}
      <div className="p-2.5 bg-[#070a0f] border-b border-[#161f30] flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-500 text-[10px] uppercase font-mono px-1">Quick:</span>
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="whitespace-nowrap px-2.5 py-1 rounded bg-[#161f30] hover:bg-[#202c42] text-slate-300 hover:text-white border border-[#24334c] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#070a0f]/60">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white font-medium rounded-br-none shadow-md'
                  : 'bg-[#101622] text-slate-200 border border-[#1e293b] rounded-bl-none shadow-lg'
              }`}
            >
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 pl-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Analyzing chart parameters & verified candles...</span>
          </div>
        )}
      </div>

      {/* Input row */}
      <div className="p-3 bg-[#0d131f] border-t border-[#1a2333] flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Ask anything about this chart, confirmation, or risk level..."
          className="flex-1 bg-[#070a0f] border border-[#1e293b] focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-sans"
        />
        <button
          type="button"
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isTyping}
          className="p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

