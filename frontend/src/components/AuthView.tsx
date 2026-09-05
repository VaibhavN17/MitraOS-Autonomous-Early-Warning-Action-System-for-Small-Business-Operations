import React, { useState } from 'react';
import { Sparkles, ShieldCheck, ArrowRight, Lock, Mail, User, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

export const AuthView: React.FC = () => {
  const { login, register, quickDemoLogin } = useAuth();
  const { merchants } = useBusiness();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('D2C Retail & E-commerce');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!fullName.trim()) throw new Error('Please enter your full name');
        await register({
          full_name: fullName,
          email,
          password,
          phone,
          business_name: businessName || undefined,
          category
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      id: merchants[0]?.id || 'acc_GLN_rzp_2026',
      name: merchants[0]?.name || 'GreenLeaf Botanics',
      category: 'D2C Nursery',
      email: 'owner@greenleafnursery.in',
      tag: 'Garden Retail',
      initials: 'GL'
    },
    {
      id: merchants[1]?.id || 'acc_KSC_rzp_2026',
      name: merchants[1]?.name || 'Kavita Silks',
      category: 'Luxury Fashion',
      email: 'owner@kavitasilks.in',
      tag: 'Ethnic Couture',
      initials: 'KS'
    },
    {
      id: merchants[2]?.id || 'acc_BAR_rzp_2026',
      name: merchants[2]?.name || 'BlueStone Roasters',
      category: 'Specialty Coffee',
      email: 'owner@bluestoneroasters.in',
      tag: 'Subscriptions',
      initials: 'BR'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-3 sm:p-4 selection:bg-indigo-600 selection:text-white">
      
      {/* Centered Executive Card - Engineered to fit standard laptop viewports comfortably */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Col: Brand & System Guardrails */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 flex flex-col justify-between border-r border-slate-800/80">
          <div>
            {/* Top Brand Tag */}
            <div className="flex items-center space-x-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Sparkles className="w-4 h-4 text-indigo-200" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white font-display">MitraOS</span>
                <span className="block text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">Autonomous Ops Cockpit</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span>Razorpay Buildathon 2026</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                One Autonomous Brain for your Entire Business
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Continuous correlation of payment telemetry, inventory depletion, and customer churn with policy-bounded remediation.
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[11px] font-bold">
                  ✓
                </div>
                <span className="text-slate-200 text-xs font-medium">
                  <strong className="text-white font-semibold">Bounded Autonomy:</strong> Zero unconsented spend
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-[11px] font-bold">
                  ✓
                </div>
                <span className="text-slate-200 text-xs font-medium">
                  <strong className="text-white font-semibold">Multi-Tenant:</strong> Switch businesses in 1-click
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-[11px] font-bold">
                  ✓
                </div>
                <span className="text-slate-200 text-xs font-medium">
                  <strong className="text-white font-semibold">Real-time Webhooks:</strong> Sub-second action loops
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enterprise Security</span>
            <span className="text-indigo-400 font-semibold">Verified Sandbox</span>
          </div>
        </div>

        {/* Right Col: Forms & Quick 1-Click Fast Pass */}
        <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between bg-white">
          <div>
            
            {/* Mode Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 mb-4 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                  mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Owner Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                  mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account & Business
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Arjun Mehta"
                        className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Mehta Naturals"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Industry
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-xs px-2 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                      >
                        <option value="D2C Retail & E-commerce">D2C Retail</option>
                        <option value="Fashion & Luxury Apparel">Fashion & Apparel</option>
                        <option value="Specialty Food & Beverage">Food & Beverage</option>
                        <option value="Health, Wellness & Beauty">Wellness & Health</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourbusiness.in"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Demo: <code className="text-indigo-600 font-bold font-mono">MitraOS@2026</code>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Cockpit' : 'Launch New Business'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* 1-Click Fast Pass Section (Horizontal compact pills for instant demo) */}
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Evaluator 1-Click Fast Pass
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>3 Live Seeded Tenants</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => quickDemoLogin(account.id, account.name, account.email)}
                    className="flex flex-col items-start p-2 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-1.5 w-full mb-1">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {account.initials}
                      </span>
                      <span className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                        {account.name.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 truncate w-full font-medium">
                      {account.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
