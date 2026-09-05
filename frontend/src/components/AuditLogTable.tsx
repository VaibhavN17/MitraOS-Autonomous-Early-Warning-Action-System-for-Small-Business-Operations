import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, User, Bot, Sparkles, RefreshCw, Filter, Store } from 'lucide-react';
import { AuditLogItem } from '../types';
import { api } from '../services/api';
import { useBusiness } from '../context/BusinessContext';

export const AuditLogTable: React.FC = () => {
  const { currentMerchant } = useBusiness();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState<string>('');

  const fetchLogs = () => {
    setLoading(true);
    api.getAuditLogs(50, actorFilter || undefined, currentMerchant?.id)
      .then(data => setLogs(data))
      .catch(err => console.error('Error fetching audit logs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [actorFilter, currentMerchant?.id]);

  const formatActorBadge = (actor: string) => {
    if (actor.startsWith('human')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <User className="w-3 h-3" />
          <span>{actor}</span>
        </span>
      );
    }
    if (actor === 'llm' || actor === 'ai_agent') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Bot className="w-3 h-3" />
          <span>AI Reasoning</span>
        </span>
      );
    }
    if (actor === 'ml_model' || actor.includes('rule')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-3 h-3" />
          <span>Detection Engine</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <ShieldCheck className="w-3 h-3" />
        <span>{actor}</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-7 lg:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg w-fit border border-indigo-100">
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>IMMUTABLE AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Autonomous Action & Approval Logs
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Complete provenance and audit verification trail for <strong className="text-slate-800 font-semibold">{currentMerchant?.name}</strong>
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setActorFilter('')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                actorFilter === '' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Actors
            </button>
            <button
              onClick={() => setActorFilter('human')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                actorFilter === 'human' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Human Owner
            </button>
            <button
              onClick={() => setActorFilter('llm')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                actorFilter === 'llm' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Agent
            </button>
          </div>

          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-subtle"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-sm font-semibold">Loading audit logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No audit events recorded for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Timestamp</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Actor</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Entity</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Event Action</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-5">
                      {formatActorBadge(log.actor)}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      {log.entity_type}
                    </td>
                    <td className="py-4 px-5">
                      <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-md text-[11px]">
                        {log.event}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-mono text-[11px] max-w-md truncate">
                      {JSON.stringify(log.payload)}
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
