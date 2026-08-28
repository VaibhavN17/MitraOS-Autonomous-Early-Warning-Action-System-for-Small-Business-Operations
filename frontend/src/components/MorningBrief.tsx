import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, ShoppingBag, DollarSign, AlertCircle, RefreshCw, Zap } from 'lucide-react';
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
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading daily Morning Brief & telemetry...</p>
      </div>
    );
  }

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Morning Brief Top Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 glow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md w-fit border border-brand-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DAILY MORNING BRIEF</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {data.date}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Autonomous overnight analysis for {data.merchant.name}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold uppercase block">Yesterday's Revenue</span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatPaise(data.yesterday_summary.revenue_paise)}
              </span>
            </div>

            <div className="border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-500 font-semibold uppercase block">Orders Processed</span>
              <span className="text-lg font-extrabold text-slate-900">
                {data.yesterday_summary.orders_count}
              </span>
            </div>

            <div className="border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-500 font-semibold uppercase block">Avg Order Value</span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatPaise(data.yesterday_summary.avg_order_value_paise)}
              </span>
            </div>
          </div>

        </div>

        {/* Risk Counter Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-700">Flagged Risks Awaiting Action:</span>
            <div className="flex items-center space-x-2">
              <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold border border-red-200">
                {data.risk_counts.high} High
              </span>
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                {data.risk_counts.medium} Medium
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                {data.risk_counts.low} Low
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Live Anomaly (Judge Demo)</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Issues Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Actionable Issues Detected ({data.active_issues.length})
          </h2>
          <span className="text-xs text-slate-500">
            Ranked by revenue risk severity
          </span>
        </div>

        {data.active_issues.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">All Operations Nominal</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active revenue degradation signals detected. All flagged items have been handled.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.active_issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onInspect={onInspectIssue}
                onApprove={onApproveIssue}
                onOpenDraftModal={onOpenDraftModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Handled Today Section */}
      {data.handled_today && data.handled_today.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Handled & Executed Today ({data.handled_today.length})</span>
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {data.handled_today.map((issue) => (
              <div
                key={issue.id}
                className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-800">
                      ✓ {issue.action?.action_type === 'retry_payment' ? 'Payment Recovery Executed' : issue.action?.action_type === 'create_purchase_order' ? 'Purchase Order Dispatched' : 'Campaign Dispatched'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {issue.action?.result?.summary || 'Action completed via Razorpay APIs'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{issue.explanation}</p>
                </div>

                <div className="text-right shrink-0 pl-4">
                  <span className="text-[11px] text-slate-500 uppercase block font-semibold">Recovered / Protected</span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    {formatPaise(issue.action?.result?.amount_recovered_paise || issue.estimated_impact_paise)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
