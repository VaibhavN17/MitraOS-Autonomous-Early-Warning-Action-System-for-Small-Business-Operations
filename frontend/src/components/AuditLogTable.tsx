import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, User, Bot, Sparkles, RefreshCw, Filter } from 'lucide-react';
import { AuditLogItem } from '../types';
import { api } from '../services/api';

export const AuditLogTable: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState<string>('');

  const fetchLogs = () => {
    setLoading(true);
    api.getAuditLogs(50, actorFilter || undefined)
      .then(data => setLogs(data))
      .catch(err => console.error('Error fetching audit logs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [actorFilter]);

  const formatActorBadge = (actor: string) => {
    if (actor.startsWith('human')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <User className="w-3 h-3" />
          <span>{actor}</span>
        </span>
      );
    }
    if (actor === 'llm') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
          <Bot className="w-3 h-3" />
          <span>AI Reasoning</span>
        </span>
      );
    }
    if (actor === 'ml_model') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-3 h-3" />
          <span>ML Detection</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
        <ShieldCheck className="w-3 h-3" />
        <span>{actor}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 glow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md w-fit border border-brand-100">
            <History className="w-3.5 h-3.5" />
            <span>AUDIT TRAIL & DECISION TRACE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Immutable Agent Audit Trail
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Full end-to-end traceability of all signals, LLM recommendations, policy checks, and owner decisions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:ring-0 cursor-pointer"
            >
              <option value="">All Actors</option>
              <option value="human">Human Owner</option>
              <option value="llm">AI Reasoning (LLM)</option>
              <option value="ml_model">ML Detection Layer</option>
              <option value="system_rule">System Rules</option>
            </select>
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 glow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
            <span>Loading audit log records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Decision / Payload Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {l.entity_type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        l.event === 'approved' || l.event === 'executed' ? 'bg-emerald-50 text-emerald-700' : l.event === 'failed' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {l.event}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {formatActorBadge(l.actor)}
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono text-[11px] max-w-md truncate">
                      {JSON.stringify(l.payload)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
