import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ArrowRight, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
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
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span>High Severity</span>
        </span>
      );
    }
    if (isMedium) {
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <span>Medium Severity</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
    if (action?.action_type === 'retry_payment') return 'Approve Payment Recovery';
    if (action?.action_type === 'create_purchase_order') return 'Review & Approve PO';
    if (action?.action_type === 'send_reengagement_campaign') return 'Approve VIP Re-engagement';
    return 'Approve Action';
  };

  const getPrepTag = () => {
    if (action?.action_type === 'retry_payment') return '✓ Razorpay Recovery Link Ready';
    if (action?.action_type === 'create_purchase_order') return '✓ Supplier PO Draft Ready';
    if (action?.action_type === 'send_reengagement_campaign') return '✓ VIP 15% Incentive Ready';
    return '✓ Remediation Action Prepared';
  };

  return (
    <div className={`bg-white rounded-xl border p-5 transition-all glow-card-hover ${
      isHigh ? 'border-red-200 hover:border-red-300' : isMedium ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          {severityBadge()}
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
            {getPrepTag()}
          </span>
        </div>

        {/* Estimated Revenue Impact */}
        <div className="text-right">
          <span className="text-xs text-slate-500 block uppercase font-medium">Estimated Impact</span>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            {formatPaise(issue.estimated_impact_paise)}
          </span>
        </div>
      </div>

      {/* Explanation Text */}
      <p className="text-slate-800 text-sm font-medium leading-relaxed mb-4">
        {issue.explanation}
      </p>

      {/* Root Cause Step Summary Pill */}
      {issue.root_cause_chain && issue.root_cause_chain.length > 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4 text-xs text-slate-600">
          <div className="flex items-center space-x-1 font-semibold text-slate-700 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Root-Cause Diagnostic:</span>
          </div>
          <p className="text-slate-600 line-clamp-1">
            {issue.root_cause_chain[issue.root_cause_chain.length - 1]?.detail || issue.root_cause_chain[0]?.detail}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        
        {/* Secondary: Ask why / inspect root cause */}
        <button
          onClick={() => onInspect(issue)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Why is this happening?</span>
        </button>

        {/* Primary: Approve / Execute Action */}
        <div className="flex items-center space-x-2">
          {action?.action_type === 'create_purchase_order' && !isCompleted && onOpenDraftModal && (
            <button
              onClick={() => onOpenDraftModal(issue)}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
            >
              <span>Edit Draft PO</span>
            </button>
          )}

          {isCompleted ? (
            <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resolved</span>
            </span>
          ) : isExecuting ? (
            <button
              disabled
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-brand-600/80 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Executing Fix...</span>
            </button>
          ) : (
            <button
              onClick={() => onApprove(issue)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
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
