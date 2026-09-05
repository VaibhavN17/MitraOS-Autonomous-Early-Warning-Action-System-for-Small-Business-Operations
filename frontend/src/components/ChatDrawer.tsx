import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, CheckCircle2, ArrowRight, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { ChatMessage, ActionPlanCard } from '../types';
import { api } from '../services/api';
import { useBusiness } from '../context/BusinessContext';

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
  const { currentMerchant } = useBusiness();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [executingPlanId, setExecutingPlanId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reset welcome message when currentMerchant changes
  useEffect(() => {
    if (currentMerchant) {
      setMessages([
        {
          id: 'init',
          sender: 'agent',
          text: `Hello! I'm Mitra, your autonomous operations agent for ${currentMerchant.name}. I'm continuously monitoring your Razorpay payment streams, inventory velocities, and customer cohorts. How can I assist you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [currentMerchant?.id]);

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
      const resp = await api.sendChatMessage(query, currentMerchant?.id);
      const agentMsg: ChatMessage = {
        id: resp.id,
        sender: 'agent',
        text: resp.reply,
        structured_plan: resp.structured_plan,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'agent',
        text: `Sorry, I encountered an issue: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePlan = async (plan: ActionPlanCard) => {
    setExecutingPlanId(plan.action_id);
    try {
      await api.approveAction(plan.action_id);
      if (onActionExecuted) onActionExecuted();

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'agent',
          text: `✓ Plan "${plan.title}" has been approved and executed via Razorpay APIs. Operations and telemetry have been updated.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      alert(`Error approving plan: ${err.message}`);
    } finally {
      setExecutingPlanId(null);
    }
  };

  const quickPrompts = [
    "What's my operational status today?",
    "Review payment dropouts and prepare recovery",
    "Check stockout risk and draft reorders"
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">Mitra AI Copilot</h3>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    Autonomous
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
                  {currentMerchant?.name}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container with comfortable margins */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#F8FAFC]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start space-x-2.5 max-w-[90%]">
                  {m.sender === 'agent' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-card'
                    }`}
                  >
                    <p className="font-medium whitespace-pre-wrap">{m.text}</p>
                    <span
                      className={`text-[10px] mt-1.5 block ${
                        m.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Structured Action Plan Card Embedded in Chat */}
                {m.structured_plan && (
                  <div className="mt-3 ml-9 max-w-[85%] bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Remediation Action Plan
                      </span>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Policy Guarded</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs">
                      {m.structured_plan.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      {m.structured_plan.summary}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                      {Object.entries(m.structured_plan.metrics).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-slate-400 font-medium block text-[10px] uppercase">{k}</span>
                          <span className="font-bold text-slate-900">{String(v)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Execution Button */}
                    <button
                      onClick={() => handleExecutePlan(m.structured_plan!)}
                      disabled={executingPlanId === m.structured_plan.action_id}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:bg-slate-400"
                    >
                      {executingPlanId === m.structured_plan.action_id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Remediation...</span>
                        </>
                      ) : (
                        <>
                          <span>Approve & Execute via Razorpay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 ml-9 bg-white p-3 rounded-xl border border-slate-200 w-fit shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Mitra is reasoning over {currentMerchant?.name} telemetry...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-[11px]">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask Mitra about ${currentMerchant?.name}...`}
                className="flex-1 text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
