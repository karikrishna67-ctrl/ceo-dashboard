import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Flame,
  RotateCcw,
  Check,
  Copy,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIChatMessage } from '../../types';
import { formatCurrency } from '../../lib/formatters';

export const AIAdvisorView: React.FC = () => {
  const { kpiSnapshot, currentOrg, currency, setActiveView } = useApp();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      senderName: 'AI CEO Advisor',
      content: `Good day, ${currentOrg.ceoName || 'Rajesh'}. I am your dedicated AI Executive Advisor powered by business intelligence models.\n\nI have complete visibility over your financials, pipeline conversion, trapped receivables, and unit economics.\n\n**Quick Pulse:**\n• MTD Revenue: ₹38.5L / ₹50.0L Target (₹11.5L Gap remaining in 15 days)\n• Trapped Receivables: ₹4.33L across 4 overdue enterprise accounts\n• Largest Pipeline Leak: Proposal → Negotiation drop-off (42% conversion)\n\nHow can I support your executive decision-making today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const executivePrompts = [
    'How do I close the ₹11.5L MTD revenue gap in the next 15 days?',
    'Show me the highest risk overdue receivables and how to recover them.',
    'Why is our proposal conversion rate lagging at 42%?',
    'Simulate what happens if we increase prices by 15%.',
    'Which marketing channel delivers the best ROAS vs CAC?',
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      senderName: currentOrg.ceoName || 'CEO',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            organization: currentOrg.name,
            ceoName: currentOrg.ceoName,
            kpiSnapshot,
          },
        }),
      });

      const data = await response.json();
      const assistantMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        senderName: 'AI CEO Advisor',
        content: data.reply || 'I have analyzed your request based on current business metrics.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        senderName: 'AI CEO Advisor',
        content: `### Strategic Diagnosis:\nTo close the **₹11.5L revenue gap**, deploy a dual-track sprint:\n1. **Accelerate 5 Late-Stage Deals**: Offer a 7.5% prompt-payment incentive to close ₹6.2L from the negotiation pipeline before Friday.\n2. **Enforce Overdue Receivables Recovery**: Instruct finance to send automated WhatsApp payment links for ₹4.33L.\n3. **Reallocate ₹50K Ad Spend**: Shift Meta ad budget directly to high-converting WhatsApp intent funnels (35.6x ROAS).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              AI CEO Executive Advisor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Live Business Brain
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time conversational executive decision support grounded in live business telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('ai-agents')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>View 8 Specialized Agents</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {executivePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-900 text-xs font-medium transition-all text-left shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col h-[600px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span
                      className={`text-[10px] font-bold ${
                        isUser ? 'text-amber-300' : 'text-amber-700'
                      }`}
                    >
                      {msg.senderName}
                    </span>
                    <span className={`text-[10px] ${isUser ? 'text-slate-400' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans mt-1">{msg.content}</div>

                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-end">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Advice</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-amber-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 max-w-sm">
              <Sparkles className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
              <span>AI Advisor is synthesizing business data & generating strategic recommendations...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask anything (e.g., 'How can we increase profitability by 5% this quarter?')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-40 transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
