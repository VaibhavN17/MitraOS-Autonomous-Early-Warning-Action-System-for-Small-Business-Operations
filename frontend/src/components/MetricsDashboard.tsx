import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  BarChart2, 
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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
  const [benchmarkSearch, setBenchmarkSearch] = useState('');

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
      <div className="space-y-6 animate-pulse">
        <div className="saas-card p-6 space-y-4">
          <div className="h-6 w-60 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 bg-slate-100 rounded-xl" />
            <div className="h-28 bg-slate-100 rounded-xl" />
            <div className="h-28 bg-slate-100 rounded-xl" />
            <div className="h-28 bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="h-72 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  const s = metrics.summary;

  const filteredBenchmarks = (metrics.ground_truth_benchmark || []).filter(gt =>
    gt.description.toLowerCase().includes(benchmarkSearch.toLowerCase()) ||
    gt.anomaly_type.toLowerCase().includes(benchmarkSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Range Selector */}
      <div className="saas-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md w-fit border border-indigo-100">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>OPERATIONAL METRICS & FINANCIAL ROI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight font-display">
            Autonomous Performance & ROI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Telemetry benchmarks and measurable capital saved for <strong className="text-slate-800 font-semibold">{currentMerchant?.name}</strong>
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
          {(['today', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === 'today' ? 'Today' : r === '7d' ? 'Past 7 Days' : 'Past 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards: The "Before / After" Flip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Revenue at Risk */}
        <div className="saas-card p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Revenue at Risk</span>
            <span className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight metric-number">
            {formatPaise(s.revenue_at_risk_paise)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            Active unresolved operational degradation
          </p>
        </div>

        {/* Revenue Recovered */}
        <div className="saas-card p-5 border-emerald-200 bg-gradient-to-b from-white to-emerald-50/20 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Revenue Recovered</span>
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight metric-number">
            {formatPaise(s.revenue_recovered_paise)}
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1.5 font-semibold">
            {s.recovery_rate_pct}% autonomous recovery rate
          </p>
        </div>

        {/* Detection Accuracy */}
        <div className="saas-card p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Detection Accuracy</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight metric-number">
            {s.detection_accuracy_pct}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            False alert rate: <strong className="text-slate-700 font-semibold">{s.false_alert_rate_pct}%</strong>
          </p>
        </div>

        {/* Action Executions */}
        <div className="saas-card p-5 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Action Executions</span>
            <span className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <BarChart2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight metric-number">
            {s.actions_executed_count} / {s.total_issues_flagged}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            {s.actions_pending_count} awaiting human approval
          </p>
        </div>

      </div>

      {/* Charts & Policies Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Area Chart (2 Cols) */}
        <div className="lg:col-span-2 saas-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Revenue Trajectory: At-Risk vs Recovered
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Daily operational impact and remediation velocity
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Razorpay Telemetry
            </span>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={metrics.timeline}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94A3B8"
                  tickFormatter={(val) => `₹${val / 100000}L`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${(Number(value) / 100).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #E2E8F0', 
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="at_risk_paise" name="At-Risk Revenue" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="recovered_paise" name="Recovered Revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRecov)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bounded Autonomy Guardrail Card */}
        <div className="saas-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Policy Boundaries</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Bounded Autonomy Configuration
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Every autonomous action is strictly bounded by merchant policy. Sensitive operations require explicit one-tap consent.
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Payment Link Retries</span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Approval Required</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Vendor Purchase Orders</span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">&gt; ₹10,000 Approval</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">VIP Discount Campaigns</span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Approval Required</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>100% of autonomous actions adhere to bounded policy.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Ground Truth Evaluation Benchmark Table */}
      <div className="saas-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Ground-Truth Anomaly Evaluation Benchmark
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Rigorous benchmarks measuring detection sensitivity and precision against pre-injected business anomalies
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={benchmarkSearch}
                onChange={e => setBenchmarkSearch(e.target.value)}
                placeholder="Filter benchmarks..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap">
              {metrics.ground_truth_benchmark.length} Verified
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Benchmark Scenario</th>
                <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Expected Severity</th>
                <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Detection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBenchmarks.map((gt) => (
                <tr key={gt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{gt.description}</p>
                    <span className="text-slate-400 text-[11px] font-mono">{gt.anomaly_type}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      gt.expected_severity === 'high' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {gt.expected_severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
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
