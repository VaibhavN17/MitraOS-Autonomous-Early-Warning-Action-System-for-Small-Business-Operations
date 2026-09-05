import React, { useState } from 'react';
import { Zap, RotateCcw, Play, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Loader2, ArrowRight, Store } from 'lucide-react';
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
      message: 'Demo Simulator initialized. Multi-tenant anomaly injector ready.',
      type: 'info'
    }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), message, type }, ...prev.slice(0, 15)]);
  };

  const handleInjectCardWave = async () => {
    setLoadingAction('card');
    addLog(`Injecting 15 failed Card payments for ${currentMerchant?.name}...`, 'warn');
    try {
      const res = await api.injectLiveAnomaly('payment_failure_wave', currentMerchant?.id);
      addLog(`✓ Live Anomaly Detected! Created ${res.issues_created} new issue. WebSockets broadcasted.`, 'success');
      await refreshMerchants();
      onAnomalyInjected();
    } catch (err: any) {
      addLog(`Error injecting anomaly: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInjectStockDepletion = async () => {
    setLoadingAction('stock');
    addLog(`Simulating sudden stock depletion on hero SKU for ${currentMerchant?.name}...`, 'warn');
    try {
      const res = await api.injectLiveAnomaly('inventory_stockout', currentMerchant?.id);
      addLog(`✓ Stockout Risk Flagged! Autonomous PO draft prepared for review.`, 'success');
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
    addLog('Regenerating multi-tenant businesses with ground truth anomalies across all entities...', 'info');
    try {
      const res = await api.resetDatabase();
      addLog(`✓ Database reset successfully! Generated ${res.signals_count} signals, ${res.issues_count} issues, ${res.actions_count} actions across 3 businesses.`, 'success');
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
    addLog(`Triggering immediate detection & action pipeline pass for ${currentMerchant?.name}...`, 'info');
    try {
      const res = await api.runPipeline(currentMerchant?.id);
      addLog(`✓ Pipeline executed! Found ${res.signals} signals, formulated ${res.issues} issues, prepared ${res.actions} bounded actions.`, 'success');
      await refreshMerchants();
      onAnomalyInjected();
    } catch (err: any) {
      addLog(`Pipeline pass error: ${err.message}`, 'warn');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-7 lg:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg w-fit border border-amber-100">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>JUDGE DEMO & SCENARIO SIMULATOR</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Live Scenario Injection
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Inject real-time anomalies for <strong className="text-slate-800 font-semibold">{currentMerchant?.name}</strong> to demonstrate autonomous detection, reasoning, and WebSocket broadcast in seconds.
          </p>
        </div>

        {/* Global Reset Button */}
        <button
          onClick={handleResetData}
          disabled={loadingAction !== null}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 self-start md:self-auto border border-slate-200"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card Outage Wave */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Inject Card Payment Wave
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              Injects 15 consecutive failed Card transactions simulating a Visa/Mastercard 3D Secure bank gateway outage for {currentMerchant?.name}.
            </p>
          </div>

          <button
            onClick={handleInjectCardWave}
            disabled={loadingAction !== null}
            className="mt-6 w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 active:scale-95"
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 border border-amber-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Inject Critical Stockout
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              Instantly drops hero SKU inventory to 3 units, triggering the autonomous stockout detection rule and drafting an automated supplier PO.
            </p>
          </div>

          <button
            onClick={handleInjectStockDepletion}
            disabled={loadingAction !== null}
            className="mt-6 w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50 active:scale-95"
          >
            {loadingAction === 'stock' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>Trigger Stockout Risk</span>
          </button>
        </div>

        {/* Run Pipeline Pass */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 border border-indigo-100">
              <Play className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Run Autonomous Pipeline
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              Forces an immediate synchronous execution of Detection → Reasoning → Action Planning across {currentMerchant?.name} orders and inventory.
            </p>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={loadingAction !== null}
            className="mt-6 w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 active:scale-95"
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
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-modal border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Agent Telemetry & WebSocket Event Feed
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Active Tenant: {currentMerchant?.name}
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs max-h-56 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-3 py-1">
              <span className="text-slate-500 shrink-0 text-[11px]">{log.time}</span>
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
