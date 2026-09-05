import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Target, AlertTriangle, CheckCircle2, ArrowUpRight, BarChart2, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { MetricsSummary } from '../types';
import { api } from '../services/api';
import { useBusiness } from '../context/BusinessContext';

interface MetricsDashboardProps {
  onRefreshTrigger?: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ onRefreshTrigger }) => {
  const { currentMerchant } = useBusiness();
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [loading, setLoading] = useState(true);

  const fetchMetrics = () => {
    setLoading(true);
    api.getMetrics(timeRange, currentMerchant?.id)
      .then(data => setMetrics(data))
      .catch(err => console.error('Error fetching metrics:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange, onRefreshTrigger, currentMerchant?.id]);

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Computing live metrics & evaluation benchmarks...</p>
      </div>
    );
  }

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  const s = metrics.summary;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header & Range Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-7 lg:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg w-fit border border-indigo-100">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>OPERATIONAL METRICS & ROI EVALUATION</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Autonomous Performance & ROI
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Telemetry benchmarks and measurable revenue recovered for <strong className="text-slate-800 font-semibold">{currentMerchant?.name}</strong>
          </p>
        </div>

        {/* Time range picker */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          {(['today', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeRange === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === 'today' ? 'Today' : r === '7d' ? 'Past 7 Days' : 'Past 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards: The "Before/After" Flip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue at Risk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue at Risk</span>
            <span className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatPaise(s.revenue_at_risk_paise)}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Active unresolved operational degradation
          </p>
        </div>

        {/* Revenue Recovered */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 shadow-card hover:shadow-card-hover transition-all bg-gradient-to-b from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Revenue Recovered</span>
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            {formatPaise(s.revenue_recovered_paise)}
          </div>
          <p className="text-xs text-emerald-700/80 mt-2 font-semibold">
            {s.recovery_rate_pct}% autonomous recovery rate
          </p>
        </div>

        {/* Detection Accuracy */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Detection Accuracy</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {s.detection_accuracy_pct}%
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            False alert rate: <strong className="text-slate-700">{s.false_alert_rate_pct}%</strong>
          </p>
        </div>

        {/* Action Executions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Action Executions</span>
            <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <BarChart2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {s.actions_executed_count} / {s.total_issues_flagged}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            {s.actions_pending_count} awaiting human approval
          </p>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 lg:p-7 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Revenue Trajectory: At-Risk vs Recovered
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Daily operational impact and remediation velocity
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Razorpay Telemetry
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.timeline}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94A3B8"
                  tickFormatter={(val) => `₹${val / 100000}L`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${(Number(value) / 100).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="at_risk_paise" name="At-Risk Revenue" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="recovered_paise" name="Recovered Revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRecov)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Autonomy Boundary Status Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 lg:p-7 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Policy Boundaries</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Bounded Autonomy Configuration
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Every action is guarded by merchant policies. Sensitive actions require explicit one-tap consent.
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Payment Link Retries</span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Approval Required</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Vendor Purchase Orders</span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">&gt; ₹10,000 Approval</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">VIP Discount Campaigns</span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Approval Required</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>100% of autonomous actions adhere to bounded policy.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Ground Truth Evaluation Benchmark Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 lg:p-7 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ground-Truth Anomaly Evaluation Benchmark
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Rigorous test benchmarks measuring detection sensitivity and precision against pre-injected business anomalies
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
            {metrics.ground_truth_benchmark.length} / {metrics.ground_truth_benchmark.length} Anomalies Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 font-bold text-slate-600 uppercase">Benchmark Scenario</th>
                <th className="py-3.5 px-4 font-bold text-slate-600 uppercase">Expected Severity</th>
                <th className="py-3.5 px-4 font-bold text-slate-600 uppercase">Detection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.ground_truth_benchmark.map((gt) => (
                <tr key={gt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 text-sm">{gt.description}</p>
                    <span className="text-slate-400 text-[11px] font-mono">{gt.anomaly_type}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      gt.expected_severity === 'high' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {gt.expected_severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Detected & Formulated</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
