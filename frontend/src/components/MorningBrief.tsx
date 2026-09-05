import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, ShoppingBag, DollarSign, AlertCircle, RefreshCw, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { MorningBriefData, IssueItem } from '../types';
import { IssueCard } from './IssueCard';

interface MorningBriefProps {
  data: MorningBriefData | null;
  loading: boolean;
  onRefresh: () => void;
  onInspectIssue: (issue: IssueItem) => void;
  onApproveIssue: (issue: IssueItem) => void;
  onOpenDraftModal: (issue: IssueItem) => void;
  onOpenSimulator: () => void;
}

export const MorningBrief: React.FC<MorningBriefProps> = ({
  data,
  loading,
  onRefresh,
  onInspectIssue,
  onApproveIssue,
  onOpenDraftModal,
  onOpenSimulator
}) => {
  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading daily Morning Brief & operational telemetry...</p>
      </div>
    );
  }

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  const totalRevenueAtRisk = (data.active_issues || []).reduce((acc, curr) => acc + (curr.estimated_impact_paise || 0), 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Executive Overview Banner - Crisp, space-disciplined & responsive */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md w-fit border border-indigo-100">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>OVERNIGHT INTELLIGENCE</span>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {data.date}
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                for <strong className="text-slate-800 font-semibold">{data.merchant.name}</strong>
              </span>
            </div>
          </div>

          {/* Inline Yesterday KPI Strip */}
          <div className="flex items-center space-x-3 sm:space-x-6 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Yesterday Revenue</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 block">
                {formatPaise(data.yesterday_summary.revenue_paise)}
              </span>
            </div>

            <div className="h-7 w-[1px] bg-slate-200" />

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Orders</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 block">
                {data.yesterday_summary.orders_count}
              </span>
            </div>

            <div className="h-7 w-[1px] bg-slate-200" />

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Order (AOV)</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 block">
                {formatPaise(data.yesterday_summary.avg_order_value_paise)}
              </span>
            </div>
          </div>

        </div>

        {/* Actionable Risk Counters Strip */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-semibold text-slate-600 text-xs">Action Items Requiring Approval:</span>
            <span className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-bold border border-red-200 flex items-center space-x-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{data.risk_counts.high} High</span>
            </span>
            <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-bold border border-amber-200 flex items-center space-x-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{data.risk_counts.medium} Medium</span>
            </span>
            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center space-x-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{data.risk_counts.low} Low</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 font-bold px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/70 transition-colors"
            >
              <Zap className="w-3 h-3 text-indigo-600" />
              <span>Simulate Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Responsive 2-column layout on laptop/desktop; scales fluidly on larger displays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Side: Priority Anomaly Feed (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <span>Operational Risk Diagnostic Feed</span>
              <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                {(data.active_issues || []).length}
              </span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Click card to inspect root causes</span>
          </div>

          {!data.active_issues || data.active_issues.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-900">All Operations Clear</h3>
              <p className="text-xs text-slate-500 mt-1">No anomalies detected across Razorpay payments, inventory, or customers.</p>
            </div>
          ) : (
            data.active_issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onInspect={onInspectIssue}
                onApprove={onApproveIssue}
                onOpenDraftModal={onOpenDraftModal}
              />
            ))
          )}
        </div>

        {/* Right Side: Operational Guardrails & Impact Summary (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Revenue at Risk Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Revenue Exposure
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formatPaise(totalRevenueAtRisk)}
              </span>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                {(data.active_issues || []).filter(i => i.status !== 'completed').length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Autonomous remediation drafts prepared with Razorpay payment retries and supplier replenishment.
            </p>
          </div>

          {/* Autonomous Guardrails Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Bounded Autonomy Guardrails
              </h3>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Spend Authorization Limit:</span>
                <span className="font-bold text-slate-900">₹10,000 / action</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">High-Impact POs:</span>
                <span className="font-bold text-brand-700">Consent Required</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Payment Gateway Retries:</span>
                <span className="font-bold text-emerald-600">Soft-Retry Active</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Audit Trail:</span>
                <span className="font-bold text-slate-700">100% Immutable</span>
              </div>
            </div>
          </div>

          {/* Tenant Context Pill */}
          <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/60 text-xs text-slate-600">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-800 text-[11px]">Active Tenant:</span>
              <span className="font-mono text-[10px] text-slate-500">{data.merchant.razorpay_account_id || data.merchant.id}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Isolated order catalog, synthetic anomaly injection, and distinct vendor contracts.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
