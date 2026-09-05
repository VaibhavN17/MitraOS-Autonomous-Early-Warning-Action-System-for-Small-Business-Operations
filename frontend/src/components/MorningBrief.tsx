import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  Calendar,
  Lock
} from 'lucide-react';
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
  // Skeleton Loading State
  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="saas-card p-6 space-y-4">
          <div className="h-4 w-40 bg-slate-200 rounded-md" />
          <div className="h-8 w-72 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-44 bg-white rounded-xl border border-slate-200" />
            <div className="h-44 bg-white rounded-xl border border-slate-200" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-32 bg-white rounded-xl border border-slate-200" />
            <div className="h-48 bg-white rounded-xl border border-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  const totalRevenueAtRisk = (data.active_issues || []).reduce((acc, curr) => acc + (curr.estimated_impact_paise || 0), 0);
  const highRiskCount = data.risk_counts?.high ?? 0;
  const mediumRiskCount = data.risk_counts?.medium ?? 0;
  const lowRiskCount = data.risk_counts?.low ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Executive Overview Banner */}
      <div className="saas-card p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md w-fit border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>OVERNIGHT INTELLIGENCE DISPATCH</span>
            </div>
            
            <div className="flex items-baseline space-x-2.5 mt-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                Morning Operations Brief
              </h1>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                • {data.date}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Autonomous diagnostic report and revenue guardrails for{' '}
              <strong className="text-slate-800 font-semibold">{data.merchant.name}</strong>
            </p>
          </div>

          {/* Yesterday Performance Strip */}
          <div className="flex items-center space-x-4 sm:space-x-8 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200/80 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Yesterday Revenue</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 block metric-number">
                {formatPaise(data.yesterday_summary.revenue_paise)}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-slate-200" />

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Orders Placed</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 block metric-number">
                {data.yesterday_summary.orders_count}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-slate-200" />

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Order (AOV)</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 block metric-number">
                {formatPaise(data.yesterday_summary.avg_order_value_paise)}
              </span>
            </div>
          </div>

        </div>

        {/* Actionable Risk Counters Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
            <span className="font-semibold text-slate-600 text-xs">Action Items Requiring Consent:</span>
            <span className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-bold border border-red-200 flex items-center space-x-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <span>{highRiskCount} High Risk</span>
            </span>
            <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-bold border border-amber-200 flex items-center space-x-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{mediumRiskCount} Medium</span>
            </span>
            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center space-x-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>{lowRiskCount} Low</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Sync Telemetry</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center space-x-1.5 text-xs text-indigo-700 hover:text-indigo-900 font-bold px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/70 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simulate Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Priority Diagnostic Feed (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Operational Risk & Remediation Feed
              </h2>
              <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-md font-bold">
                {(data.active_issues || []).length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Click card to inspect root causes</span>
          </div>

          {!data.active_issues || data.active_issues.length === 0 ? (
            <div className="saas-card p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-display">All Operational Signals Nominal</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                MitraOS detected zero anomalies across payment flows, supplier stockout horizons, or customer activity.
              </p>
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

        {/* Right Column: Operational Exposure & Bounded Policies (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Revenue at Risk Summary Card */}
          <div className="saas-card p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Revenue Exposure
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display metric-number">
                {formatPaise(totalRevenueAtRisk)}
              </span>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                {(data.active_issues || []).filter(i => i.status !== 'completed').length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Remediation blueprints drafted for Razorpay payment retries, supplier purchase orders, and VIP cohorts.
            </p>
          </div>

          {/* Autonomous Policy Enforcement */}
          <div className="saas-card p-5">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Bounded Autonomy Guardrails
              </h3>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Spend Authorization Ceiling:</span>
                <span className="font-bold text-slate-900">₹10,000 / action</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">High-Impact Vendor POs:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Consent Required</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Razorpay Gateway Retries:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Soft-Retry Active</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 font-medium">Immutable Audit Trail:</span>
                <span className="font-bold text-slate-800">100% Provenance</span>
              </div>
            </div>
          </div>

          {/* Tenant Context Box */}
          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/70 text-xs text-slate-600">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-800 text-[11px]">Active Account:</span>
              <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {data.merchant.razorpay_account_id || data.merchant.id}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              Multi-tenant isolated data partitions, autonomous triggers, and dedicated payment gateway routing.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
