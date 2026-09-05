import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  TrendingDown, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ShieldCheck, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { IssueItem, UnderlyingDataResponse } from '../types';
import { api } from '../services/api';

interface IssueDetailModalProps {
  issue: IssueItem | null;
  onClose: () => void;
  onApprove: (issue: IssueItem) => void;
  onReject: (issue: IssueItem) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onApprove,
  onReject
}) => {
  const [underlyingData, setUnderlyingData] = useState<UnderlyingDataResponse | null>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(false);

  useEffect(() => {
    if (issue) {
      setLoadingCharts(true);
      api.getUnderlyingData(issue.id)
        .then(data => setUnderlyingData(data))
        .catch(err => console.error('Error fetching underlying data:', err))
        .finally(() => setLoadingCharts(false));
    }
  }, [issue]);

  if (!issue) return null;

  const isCompleted = issue.status === 'completed' || issue.action?.status === 'completed';
  const isExecuting = issue.action?.status === 'executing';

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-modal border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                issue.severity === 'high' ? 'bg-red-100 text-red-700' : issue.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {issue.severity.toUpperCase()} RISK
              </span>
              <span className="text-xs text-slate-400 font-mono">Signal #{issue.signal_id?.slice(0, 8)}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
              Root-Cause Diagnostic & Remediation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Explanation Summary Box */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-1.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Plain-Language Synthesis</span>
            </h3>
            <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
              {issue.explanation}
            </p>
            <div className="mt-3.5 flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-indigo-100">
              <span className="font-semibold text-slate-600">Estimated Exposure:</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 metric-number">
                {formatPaise(issue.estimated_impact_paise)}
              </span>
            </div>
          </div>

          {/* Root Cause Narrowing Step Chain */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Root-Cause Narrowing Step Chain</span>
            </h3>

            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {issue.root_cause_chain?.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Step indicator */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-[10px] font-bold text-indigo-700 shadow-xs">
                    {step.step}
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 hover:bg-slate-100/70 transition-colors">
                    <span className="text-xs font-bold text-slate-900 block mb-0.5">{step.title}</span>
                    <span className="text-xs text-slate-600 font-medium leading-relaxed">{step.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Underlying Data & Charts */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>Underlying Signal Telemetry & Breakdown</span>
              {showCharts ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {showCharts && (
              <div className="p-4 bg-white border-t border-slate-100">
                {loadingCharts ? (
                  <div className="flex items-center justify-center p-8 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-indigo-600" />
                    <span>Loading telemetry stream...</span>
                  </div>
                ) : underlyingData?.type === 'payment_failure_chart' ? (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2">
                      Hourly Payment Failure Rate vs 7.5% Baseline
                    </h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={underlyingData.hourly_data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Bar dataKey="failed" name="Failed Transactions" fill="#EF4444" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="successful" name="Successful Transactions" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : underlyingData?.type === 'inventory_depletion_chart' ? (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2">
                      Inventory Depletion Rate vs Supplier Lead Time (7 Days)
                    </h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={underlyingData.projection || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="stock" name="Stock Level (Units)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-2">
                    Telemetry metrics compiled and validated against historical 30-day merchant baseline.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recommended Action Box */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                Autonomous Remediation Action Plan
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bounded Policy Enforced</span>
              </div>
            </div>

            <div className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
              {issue.action?.action_type === 'retry_payment' && 'Execute Soft Retry Wave on Failed Razorpay Links + 1-Click WhatsApp Recovery'}
              {issue.action?.action_type === 'create_purchase_order' && 'Issue Automated Restock Purchase Order to Authorized Vendor'}
              {issue.action?.action_type === 'send_reengagement_campaign' && 'Dispatch Targeted VIP 15% Incentive Re-engagement Campaign'}
            </div>

            {isCompleted ? (
              <div className="bg-emerald-950/80 border border-emerald-800 rounded-lg p-3 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Remediation action executed successfully. Capital recovery logged.</span>
              </div>
            ) : isExecuting ? (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Executing remediation action via Razorpay APIs...</span>
              </div>
            ) : (
              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  onClick={() => onReject(issue)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => onApprove(issue)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all active:scale-95"
                >
                  <span>Approve & Execute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
