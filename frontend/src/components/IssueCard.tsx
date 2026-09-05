import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ArrowRight, Sparkles, HelpCircle, Loader2, ShieldCheck, FileEdit } from 'lucide-react';
import { IssueItem } from '../types';

interface IssueCardProps {
  issue: IssueItem;
  onInspect: (issue: IssueItem) => void;
  onApprove: (issue: IssueItem) => void;
  onOpenDraftModal?: (issue: IssueItem) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onInspect,
  onApprove,
  onOpenDraftModal
}) => {
  const isHigh = issue.severity === 'high';
  const isMedium = issue.severity === 'medium';
  const isLow = issue.severity === 'low';

  const severityBadge = () => {
    if (isHigh) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span>High Severity</span>
        </span>
      );
    }
    if (isMedium) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <span>Medium Severity</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        <span>Low Severity</span>
      </span>
    );
  };

  const action = issue.action;
  const isExecuting = action?.status === 'executing';
  const isCompleted = action?.status === 'completed' || issue.status === 'completed';

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  const getActionLabel = () => {
    if (action?.action_type === 'retry_payment') return 'Approve Recovery';
    if (action?.action_type === 'create_purchase_order') return 'Approve PO';
    if (action?.action_type === 'send_reengagement_campaign') return 'Approve Campaign';
    return 'Approve Action';
  };

  const getPrepTag = () => {
    if (action?.action_type === 'retry_payment') return 'Razorpay Batch Ready';
    if (action?.action_type === 'create_purchase_order') return 'Supplier PO Drafted';
    if (action?.action_type === 'send_reengagement_campaign') return 'VIP Incentives Ready';
    return 'Remediation Ready';
  };

  return (
    <div className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-sm ${
      isHigh
        ? 'border-red-200 hover:border-red-300'
        : isMedium
        ? 'border-amber-200 hover:border-amber-300'
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          {severityBadge()}
          <span className="text-[11px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
            {getPrepTag()}
          </span>
        </div>

        {/* Estimated Revenue Impact */}
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">At Risk</span>
          <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight block">
            {formatPaise(issue.estimated_impact_paise)}
          </span>
        </div>
      </div>

      {/* Plain-Language Explanation */}
      <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed mb-3">
        {issue.explanation}
      </p>

      {/* Root Cause Step Summary Pill */}
      {issue.root_cause_chain && issue.root_cause_chain.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 mb-3 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-[11px] mb-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Autonomous Root Cause:</span>
          </div>
          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
            {issue.root_cause_chain[issue.root_cause_chain.length - 1]?.detail || issue.root_cause_chain[0]?.detail}
          </p>
        </div>
      )}

      {/* Action Controls Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
        
        {/* Secondary: Inspect telemetry */}
        <button
          onClick={() => onInspect(issue)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Inspect Root Cause</span>
        </button>

        {/* Primary Action Buttons */}
        <div className="flex items-center space-x-2">
          {action?.action_type === 'create_purchase_order' && !isCompleted && onOpenDraftModal && (
            <button
              onClick={() => onOpenDraftModal(issue)}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileEdit className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Draft</span>
            </button>
          )}

          {isCompleted ? (
            <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Remediated</span>
            </span>
          ) : isExecuting ? (
            <button
              disabled
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg cursor-not-allowed"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Executing...</span>
            </button>
          ) : (
            <button
              onClick={() => onApprove(issue)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 px-3.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
            >
              <span>{getActionLabel()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
