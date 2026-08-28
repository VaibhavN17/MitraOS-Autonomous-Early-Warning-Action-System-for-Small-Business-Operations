import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, CheckCircle2, ArrowRight, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { ChatMessage, ActionPlanCard } from '../types';
import { api } from '../services/api';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onActionExecuted?: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  onActionExecuted
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'agent',
      text: "Hello! I'm Mitra, your autonomous operations agent. I'm actively monitoring your Razorpay payments, inventory velocities, and customer cohorts. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [executingPlanId, setExecutingPlanId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const resp = await api.sendChatMessage(query);
      const agentMsg: ChatMessage = {
        id: resp.id,
        sender: 'agent',
        text: resp.reply,
        structured_plan: resp.structured_plan,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'agent',
          text: "I'm having trouble retrieving data right now. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePlan = async (plan: ActionPlanCard) => {
    setExecutingPlanId(plan.action_id);
    try {
      const res = await api.approveAction(plan.action_id);
      
      const successMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'agent',
        text: `✓ **Action Executed:** ${res.result?.summary || 'Plan executed successfully via Razorpay.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, successMsg]);
      if (onActionExecuted) onActionExecuted();
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'agent',
        text: `Execution notice: ${err.message || 'Action executed or already resolved.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setExecutingPlanId(null);
    }
  };

  const promptChips = [
    "Handle the payment issue",
    "Review inventory risks",
    "Summarize yesterday's revenue",
    "Re-engage VIP customers"
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <span>Mitra AI Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Autonomous Operations & Tool-Calling</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[92%] ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                m.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-brand-100 text-brand-700'
              }`}>
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Bubble */}
              <div>
                <div className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/50 font-medium'
                }`}>
                  {m.text}
                </div>

                {/* Structured Plan Card embedded in agent reply */}
                {m.structured_plan && (
                  <div className="mt-2.5 bg-white border border-brand-200 rounded-xl p-3.5 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-brand-600" />
                        <span>{m.structured_plan.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                        Approval Required
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-snug">
                      {m.structured_plan.summary}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-[11px] border border-slate-100">
                      {Object.entries(m.structured_plan.metrics).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-slate-500 block text-[10px] uppercase font-semibold">{k}</span>
                          <span className="font-bold text-slate-900">{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Approve Button */}
                    <button
                      onClick={() => handleApprovePlan(m.structured_plan!)}
                      disabled={executingPlanId === m.structured_plan.action_id}
                      className="w-full inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 p-2 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      {executingPlanId === m.structured_plan.action_id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Executing via Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <span>Approve & Execute Plan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 mt-1 block">
                  {m.timestamp}
                </span>
              </div>

            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Mitra is reasoning over signals...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1.5">
        {promptChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(chip)}
            className="text-[11px] font-medium text-slate-700 bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 px-2.5 py-1 rounded-full transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask Mitra or give a command ('Handle payment issue')..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
