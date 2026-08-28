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
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                issue.severity === 'high' ? 'bg-red-100 text-red-700' : issue.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {issue.severity.toUpperCase()} RISK
              </span>
              <span className="text-xs text-slate-500">Signal ID: {issue.signal_id?.slice(0, 8)}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Root-Cause Investigation & Remediation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Plain Language Summary */}
          <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">
              Issue Explanation
            </h3>
            <p className="text-slate-800 text-sm font-medium leading-relaxed">
              {issue.explanation}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-brand-100/60">
              <span>Estimated Revenue at Risk:</span>
              <span className="text-sm font-extrabold text-slate-900">
                {formatPaise(issue.estimated_impact_paise)}
              </span>
            </div>
          </div>

          {/* Root Cause Narrowing Step Chain */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>Root-Cause Narrowing Chain</span>
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {issue.root_cause_chain?.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Step bullet */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-[10px] font-bold text-brand-700 shadow-sm">
                    {step.step}
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 hover:bg-slate-100/80 transition-colors">
                    <span className="text-xs font-bold text-slate-900 block">{step.title}</span>
                    <span className="text-xs text-slate-600 font-medium leading-normal">{step.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Underlying Data & Charts */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>Underlying Signal Data & Charts</span>
              {showCharts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCharts && (
              <div className="p-4 bg-white border-t border-slate-100">
                {loadingCharts ? (
                  <div className="flex items-center justify-center p-6 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Loading telemetry data...</span>
                  </div>
                ) : underlyingData?.type === 'payment_failure_chart' ? (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2">
                      Hourly Payment Failure Rates vs 7.5% Baseline
                    </h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={underlyingData.hourly_data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="failed" name="Failed Payments" fill="#DC2626" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="success" name="Successful Payments" fill="#1F5D3A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 bg-red-50 p-2 rounded">
                      <span className="font-semibold text-red-700">NPCI Gateway Error:</span>
                      <span className="font-mono text-slate-800 font-semibold">{underlyingData.root_error}</span>
                    </div>
                  </div>
                ) : underlyingData?.type === 'stock_depletion_chart' ? (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2">
                      {underlyingData.title}
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={underlyingData.projection}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="stock" name="Stock Units on Hand" stroke="#EA580C" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="safety_threshold" name="Safety Threshold" stroke="#94A3B8" strokeDasharray="4 4" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : underlyingData?.type === 'churn_cohort_table' ? (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2">
                      Target VIP Customers Inactive 45+ Days
                    </h4>
                    <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b">
                          <tr>
                            <th className="p-2">Customer</th>
                            <th className="p-2">Historical LTV</th>
                            <th className="p-2">Days Inactive</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {underlyingData.customers?.map((c, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 font-medium text-slate-900">{c.name}</td>
                              <td className="p-2 text-slate-700 font-semibold">{formatPaise(c.ltv_paise)}</td>
                              <td className="p-2 text-red-600 font-bold">{c.days_inactive} days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Structured telemetry verified.</p>
                )}
              </div>
            )}
          </div>

          {/* Recommended Action Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">
                Recommended Remediation Action
              </span>
              <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Policy Verified</span>
              </div>
            </div>

            <div className="text-sm font-semibold text-slate-100">
              {issue.action?.action_type === 'retry_payment' && 'Automated Razorpay Retry Batch + 1-Click WhatsApp Payment Link Dispatch'}
              {issue.action?.action_type === 'create_purchase_order' && 'Issue Supplier Purchase Order to Restock 70 Units'}
              {issue.action?.action_type === 'send_reengagement_campaign' && 'Dispatch VIP 15% Incentive Re-engagement Coupon'}
            </div>

            {isCompleted ? (
              <div className="bg-emerald-950/80 border border-emerald-800 rounded-lg p-3 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Action completed successfully. Revenue recovery logged.</span>
              </div>
            ) : isExecuting ? (
              <div className="bg-brand-950/80 border border-brand-800 rounded-lg p-3 text-xs text-brand-300 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                <span>Executing remediation action on Razorpay APIs...</span>
              </div>
            ) : (
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => onReject(issue)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Dismiss / Reject
                </button>
                <button
                  onClick={() => onApprove(issue)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow transition-all active:scale-95"
                >
                  <span>Approve & Execute Fix</span>
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
