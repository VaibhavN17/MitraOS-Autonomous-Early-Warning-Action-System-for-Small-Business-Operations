import React, { useState } from 'react';
import { Zap, RotateCcw, Play, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface LiveSimulatorProps {
  onAnomalyInjected: () => void;
  onResetComplete: () => void;
}

export const LiveSimulator: React.FC<LiveSimulatorProps> = ({
  onAnomalyInjected,
  onResetComplete
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ time: string; message: string; type: 'info' | 'success' | 'warn' }>>([
    {
      time: new Date().toLocaleTimeString(),
      message: 'Demo Simulator initialized. Ready for judge live anomaly injections.',
      type: 'info'
    }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), message, type }, ...prev.slice(0, 15)]);
  };

  const handleInjectCardWave = async () => {
    setLoadingAction('card');
    addLog('Injecting 15 failed Card payments (Visa Auth Gateway Reject)...', 'warn');
    try {
      const res = await api.injectLiveAnomaly('payment_failure_wave');
      addLog(`✓ Live Anomaly Detected! Created ${res.issues_created} new issue. WebSockets broadcasted.`, 'success');
      onAnomalyInjected();
    } catch (err: any) {
      addLog(`Error injecting anomaly: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInjectStockDepletion = async () => {
    setLoadingAction('stock');
    addLog('Simulating sudden stock depletion on Fiddle Leaf Fig (Stock drops to 3 units)...', 'warn');
    try {
      const res = await api.injectLiveAnomaly('inventory_stockout');
      addLog(`✓ Stockout Risk Flagged! Purchase order draft prepared automatically.`, 'success');
      onAnomalyInjected();
    } catch (err: any) {
      addLog(`Error injecting stockout: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetData = async () => {
    setLoadingAction('reset');
    addLog('Regenerating synthetic merchant with 2,000+ orders and 3 ground truth anomalies...', 'info');
    try {
      const res = await api.resetDatabase();
      addLog(`✓ Database reset successfully! Generated ${res.signals_count} signals, ${res.issues_count} issues, ${res.actions_count} actions.`, 'success');
      onResetComplete();
    } catch (err: any) {
      addLog(`Error resetting database: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunPipeline = async () => {
    setLoadingAction('pipeline');
    addLog('Triggering manual autonomous pass (Detect -> Reason -> Plan)...', 'info');
    try {
      const res = await api.runPipeline();
      addLog(`✓ Pipeline execution complete: ${res.signals} signals, ${res.issues} issues, ${res.actions} actions.`, 'success');
      onAnomalyInjected();
    } catch (err: any) {
      addLog(`Error running pipeline: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 glow-card">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md w-fit border border-amber-200">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>JUDGE DEMO & LIVE ANOMALY SIMULATOR</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
          Live Operational Injection Engine
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Demonstrate MitraOS's autonomous <b>Detect → Understand → Decide → Act</b> loop live by injecting real-time events.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Inject Payment Failure Wave */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 glow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Scenario A: Payment Gateway Surge</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Razorpay Ingestion</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Inject Card Payment Network Outage
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fires 15 rapid failed Card payment events with <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">GATEWAY_REJECT_CARD_NETWORK</code> error. Watch the agent detect the spike and draft an automated recovery plan!
          </p>

          <button
            onClick={handleInjectCardWave}
            disabled={loadingAction !== null}
            className="w-full inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingAction === 'card' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <Zap className="w-3.5 h-3.5 mr-1" />
            )}
            <span>Inject Live Card Failure Wave</span>
          </button>
        </div>

        {/* Card 2: Inject Sudden Stockout */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 glow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Scenario B: Inventory Velocity Deficit</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">ERP / Stock Telemetry</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Simulate Fiddle Leaf Fig Stock Depletion
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Instantly drops stock level of 'Fiddle Leaf Fig' to 3 units against a 5-day lead time. Watch the agent calculate lost revenue and generate a draft PO!
          </p>

          <button
            onClick={handleInjectStockDepletion}
            disabled={loadingAction !== null}
            className="w-full inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingAction === 'stock' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <Zap className="w-3.5 h-3.5 mr-1" />
            )}
            <span>Inject Inventory Stockout Risk</span>
          </button>
        </div>

      </div>

      {/* Control Buttons: Re-seed & Manual Pipeline Pass */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleRunPipeline}
          disabled={loadingAction !== null}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition-all"
        >
          {loadingAction === 'pipeline' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-brand-600" />}
          <span>Run Autonomous Pipeline Pass</span>
        </button>

        <button
          onClick={handleResetData}
          disabled={loadingAction !== null}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition-all"
        >
          {loadingAction === 'reset' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 text-slate-600" />}
          <span>Reset Demo Database & Re-seed</span>
        </button>
      </div>

      {/* Live Event Console Log */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-5 glow-card space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Real-Time Simulator Telemetry Console</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Live WebSocket Channel</span>
        </div>

        <div className="space-y-2 font-mono text-xs max-h-52 overflow-y-auto">
          {logs.map((l, i) => (
            <div key={i} className="flex items-start space-x-2">
              <span className="text-slate-500 text-[11px] shrink-0">{l.time}</span>
              <span className={`leading-relaxed ${
                l.type === 'success' ? 'text-emerald-400 font-semibold' : l.type === 'warn' ? 'text-amber-400 font-semibold' : 'text-slate-300'
              }`}>
                {l.message}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
