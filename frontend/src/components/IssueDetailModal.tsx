import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRight, TrendingDown, Layers, ChevronDown, ChevronUp, Clock, ShieldCheck, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-modal border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2.5 mb-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                issue.severity === 'high' ? 'bg-red-100 text-red-700' : issue.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {issue.severity.toUpperCase()} RISK
              </span>
              <span className="text-xs text-slate-500 font-medium">Signal ID: {issue.signal_id?.slice(0, 8)}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Root-Cause Investigation & Remediation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Plain Language Summary */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1.5">
              Issue Explanation
            </h3>
            <p className="text-slate-800 text-sm font-medium leading-relaxed">
              {issue.explanation}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-indigo-100/70">
              <span className="font-semibold text-slate-600">Estimated Revenue at Risk:</span>
              <span className="text-base font-extrabold text-slate-900">
                {formatPaise(issue.estimated_impact_paise)}
              </span>
            </div>
          </div>

          {/* Root Cause Narrowing Step Chain */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Root-Cause Narrowing Step Chain</span>
            </h3>

            <div className="relative pl-7 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {issue.root_cause_chain?.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Step bullet */}
                  <div className="absolute -left-7 top-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-[11px] font-bold text-indigo-700 shadow-sm">
                    {step.step}
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 hover:bg-slate-100/70 transition-colors">
                    <span className="text-xs font-bold text-slate-900 block mb-0.5">{step.title}</span>
                    <span className="text-xs text-slate-600 font-medium leading-relaxed">{step.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Underlying Data & Charts */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-subtle">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="w-full flex items-center justify-between p-4 bg-slate-50/80 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>Underlying Signal Telemetry & Breakdown</span>
              {showCharts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCharts && (
              <div className="p-5 bg-white border-t border-slate-100">
                {loadingCharts ? (
                  <div className="flex items-center justify-center p-8 text-slate-400 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-indigo-600" />
                    <span>Loading telemetry data...</span>
                  </div>
                ) : underlyingData?.type === 'payment_failure_chart' ? (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">
                      Hourly Payment Failure Rate vs 7.5% Baseline
                    </h4>
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={underlyingData.hourly_data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="failed" name="Failed Transactions" fill="#EF4444" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="success" name="Successful Transactions" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : underlyingData?.type === 'inventory_depletion_chart' ? (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2">
                      Stock Depletion Projection (SKU: {underlyingData.sku})
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      Safety Threshold: 10 units | Daily Burn: {underlyingData.daily_burn_rate} units/day
                    </p>
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={underlyingData.projection}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="stock" stroke="#F59E0B" strokeWidth={2.5} name="Projected Units" dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="safety_threshold" stroke="#EF4444" strokeDasharray="4 4" name="Reorder Point" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : underlyingData?.type === 'churn_cohort_table' ? (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">
                      High-LTV Customer Cohort (Inactive &gt; 45 Days)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 font-bold text-slate-600">Customer</th>
                            <th className="p-2.5 font-bold text-slate-600">Lifetime Value</th>
                            <th className="p-2.5 font-bold text-slate-600">Days Inactive</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {underlyingData.customers?.map((c, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2.5 font-semibold text-slate-900">{c.name}</td>
                              <td className="p-2.5 text-slate-700 font-bold">{formatPaise(c.ltv_paise)}</td>
                              <td className="p-2.5 text-red-600 font-bold">{c.days_inactive} days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Structured telemetry verified against merchant signals.</p>
                )}
              </div>
            )}
          </div>

          {/* Recommended Action Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Autonomous Remediation Action Plan
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Bounded Autonomy Verified</span>
              </div>
            </div>

            <div className="text-sm font-semibold text-slate-100 leading-relaxed">
              {issue.action?.action_type === 'retry_payment' && 'Automated Razorpay Retry Batch + 1-Click WhatsApp Payment Link Dispatch'}
              {issue.action?.action_type === 'create_purchase_order' && 'Issue Supplier Purchase Order to Restock Critical Units'}
              {issue.action?.action_type === 'send_reengagement_campaign' && 'Dispatch VIP 15% Incentive Re-engagement Campaign'}
            </div>

            {isCompleted ? (
              <div className="bg-emerald-950/80 border border-emerald-800 rounded-xl p-3.5 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Remediation action executed successfully. Revenue recovery logged.</span>
              </div>
            ) : isExecuting ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin mr-1.5 text-indigo-400" />
                <span>Executing remediation action via Razorpay APIs...</span>
              </div>
            ) : (
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => onReject(issue)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Dismiss / Reject
                </button>
                <button
                  onClick={() => onApprove(issue)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all active:scale-95"
                >
                  <span>Approve & Execute Fix</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
