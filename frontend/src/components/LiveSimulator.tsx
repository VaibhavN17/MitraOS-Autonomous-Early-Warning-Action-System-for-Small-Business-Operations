import React, { useState } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  Store,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useBusiness } from '../context/BusinessContext';

interface LiveSimulatorProps {
  onAnomalyInjected: () => void;
  onResetComplete: () => void;
}

export const LiveSimulator: React.FC<LiveSimulatorProps> = ({
  onAnomalyInjected,
  onResetComplete
}) => {
  const { currentMerchant, refreshMerchants } = useBusiness();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ time: string; message: string; type: 'info' | 'success' | 'warn' }>>([
    {
      time: new Date().toLocaleTimeString(),
      message: 'MitraOS Autonomous Simulator initialized. Multi-tenant live event bus listening.',
      type: 'info'
    }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), message, type }, ...prev.slice(0, 19)]);
  };

  const handleInjectCardWave = async () => {
    setLoadingAction('card');
    addLog(`Simulating 15 failed Card payments for ${currentMerchant?.name}...`, 'warn');
    try {
      const res = await api.injectLiveAnomaly('payment_failure_wave', currentMerchant?.id);
      addLog(`✓ Anomaly detected! Formulated ${res.issues_created} new issue. WebSockets broadcasted to client.`, 'success');
      await refreshMerchants();
      onAnomalyInjected();
    } catch (err: any) {
      addLog(`Failed to inject anomaly: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInjectStockDepletion = async () => {
    setLoadingAction('stock');
    addLog(`Simulating sudden stock depletion on hero SKU for ${currentMerchant?.name}...`, 'warn');
    try {
      const res = await api.injectLiveAnomaly('inventory_stockout', currentMerchant?.id);
      addLog(`✓ Stockout risk flagged! Autonomous supplier restock PO drafted.`, 'success');
      await refreshMerchants();
      onAnomalyInjected();
    } catch (err: any) {
      addLog(`Error injecting stockout: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetData = async () => {
    setLoadingAction('reset');
    addLog('Resetting multi-tenant businesses with fresh ground truth seed dataset...', 'info');
    try {
      const res = await api.resetDatabase();
      addLog(`✓ Reset complete! Generated ${res.signals_count} signals, ${res.issues_count} issues across 3 businesses.`, 'success');
      await refreshMerchants();
      onResetComplete();
    } catch (err: any) {
      addLog(`Reset failed: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunPipeline = async () => {
    setLoadingAction('pipeline');
    addLog(`Triggering immediate autonomous pipeline pass for ${currentMerchant?.name}...`, 'info');
    try {
      const res = await api.runPipeline(currentMerchant?.id);
      addLog(`✓ Pipeline executed! Evaluated ${res.signals} signals, ${res.issues} issues, prepared ${res.actions} actions.`, 'success');
      await refreshMerchants();
      onAnomalyInjected();
    } catch (err: any) {
      addLog(`Pipeline execution error: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="saas-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md w-fit border border-amber-100">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>JUDGE DEMO & SCENARIO SIMULATOR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight font-display">
            Live Scenario Injection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Inject real-time operational anomalies for <strong className="text-slate-800 font-semibold">{currentMerchant?.name}</strong> to inspect autonomous detection, root-cause inference, and WebSocket push in seconds.
          </p>
        </div>

        {/* Global Reset Button */}
        <button
          onClick={handleResetData}
          disabled={loadingAction !== null}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 self-start md:self-auto border border-slate-200 shadow-xs"
        >
          {loadingAction === 'reset' ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <RotateCcw className="w-4 h-4 text-slate-500" />
          )}
          <span>Reset Demo Dataset</span>
        </button>
      </div>

      {/* Trigger Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card Outage Wave */}
        <div className="saas-card p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300">
          <div>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3.5 border border-red-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 font-display">
              Card Gateway Failure Wave
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
              Simulates 15 consecutive card declines to trigger the Razorpay gateway degradation anomaly and prepare batch retries.
            </p>
          </div>

          <button
            onClick={handleInjectCardWave}
            disabled={loadingAction !== null}
            className="mt-5 w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs disabled:opacity-50 active:scale-95"
          >
            {loadingAction === 'card' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>Inject Payment Spike</span>
          </button>
        </div>

        {/* Stockout Anomaly */}
        <div className="saas-card p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300">
          <div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3.5 border border-amber-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 font-display">
              Critical Inventory Stockout
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
              Drops stock on hero SKU to 3 units, activating stockout horizon rules and formulating an automated supplier restock PO.
            </p>
          </div>

          <button
            onClick={handleInjectStockDepletion}
            disabled={loadingAction !== null}
            className="mt-5 w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs disabled:opacity-50 active:scale-95"
          >
            {loadingAction === 'stock' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>Trigger Stockout Horizon</span>
          </button>
        </div>

        {/* Run Pipeline Pass */}
        <div className="saas-card p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300">
          <div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3.5 border border-indigo-100">
              <Play className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 font-display">
              Synchronous Pipeline Pass
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
              Triggers the autonomous reasoning engine across orders, telemetry, and customer cohorts for {currentMerchant?.name}.
            </p>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={loadingAction !== null}
            className="mt-5 w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 transition-colors shadow-xs disabled:opacity-50 active:scale-95"
          >
            {loadingAction === 'pipeline' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Execute Pipeline Now</span>
          </button>
        </div>

      </div>

      {/* Simulator Real-Time Console Log */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 shadow-card border border-slate-800 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Autonomous Agent Telemetry & WebSocket Event Log</span>
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Tenant: {currentMerchant?.name}
          </span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-3 py-0.5">
              <span className="text-slate-500 shrink-0 text-[10px]">{log.time}</span>
              <span className={
                log.type === 'success' ? 'text-emerald-400 font-semibold' :
                log.type === 'warn' ? 'text-amber-300 font-semibold' : 'text-slate-300'
              }>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
