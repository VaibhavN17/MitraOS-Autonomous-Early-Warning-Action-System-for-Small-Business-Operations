import React, { useState, useEffect } from 'react';
import { 
  History, 
  ShieldCheck, 
  User, 
  Bot, 
  Sparkles, 
  RefreshCw, 
  Search, 
  Code, 
  X,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { AuditLogItem } from '../types';
import { api } from '../services/api';
import { useBusiness } from '../context/BusinessContext';

export const AuditLogTable: React.FC = () => {
  const { currentMerchant } = useBusiness();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogPayload, setSelectedLogPayload] = useState<any | null>(null);

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
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <User className="w-3 h-3" />
          <span>{actor}</span>
        </span>
      );
    }
    if (actor === 'llm' || actor === 'ai_agent') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Bot className="w-3 h-3" />
          <span>AI Reasoning</span>
        </span>
      );
    }
    if (actor === 'ml_model' || actor.includes('rule')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-3 h-3" />
          <span>Detection Engine</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <ShieldCheck className="w-3 h-3" />
        <span>{actor}</span>
      </span>
    );
  };

  const filteredLogs = logs.filter(l =>
    l.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.actor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="saas-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md w-fit border border-indigo-100">
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>IMMUTABLE GOVERNANCE AUDIT TRAIL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight font-display">
            Autonomous Action & Approval Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Complete provenance and cryptographic audit verification trail for <strong className="text-slate-800 font-semibold">{currentMerchant?.name}</strong>
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setActorFilter('')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                actorFilter === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Actors
            </button>
            <button
              onClick={() => setActorFilter('human')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                actorFilter === 'human' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Human Owner
            </button>
            <button
              onClick={() => setActorFilter('llm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                actorFilter === 'llm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Agent
            </button>
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search audit events, entities, or actors..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredLogs.length} verified audit records
        </span>
      </div>

      {/* Table Card */}
      <div className="saas-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-xs font-semibold">Retrieving immutable log provenance...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No audit events recorded matching current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Timestamp</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Actor</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Entity Type</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Event Action</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Payload Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5">
                      {formatActorBadge(log.actor)}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      {log.entity_type}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-0.5 rounded-md text-[11px]">
                        {log.event}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => setSelectedLogPayload({
                          event: log.event,
                          actor: log.actor,
                          timestamp: log.created_at,
                          payload: log.payload
                        })}
                        className="inline-flex items-center space-x-1.5 text-[11px] text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2.5 py-1 rounded border border-slate-200 font-mono transition-colors"
                      >
                        <Code className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-xs">{JSON.stringify(log.payload).slice(0, 40)}...</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Payload Inspection Modal */}
      {selectedLogPayload && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-modal border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Audit Payload Inspector: {selectedLogPayload.event}
                </h4>
              </div>
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(selectedLogPayload.payload, null, 2)}</pre>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
