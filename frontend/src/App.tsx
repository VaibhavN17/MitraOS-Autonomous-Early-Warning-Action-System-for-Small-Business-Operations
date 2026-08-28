import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MorningBrief } from './components/MorningBrief';
import { IssueDetailModal } from './components/IssueDetailModal';
import { PurchaseOrderModal } from './components/PurchaseOrderModal';
import { ChatDrawer } from './components/ChatDrawer';
import { MetricsDashboard } from './components/MetricsDashboard';
import { LiveSimulator } from './components/LiveSimulator';
import { AuditLogTable } from './components/AuditLogTable';
import { CatalogView } from './components/CatalogView';
import { MorningBriefData, IssueItem } from './types';
import { api } from './services/api';
import { useWebSocket } from './context/WebSocketContext';
import { Sparkles, X, CheckCircle2, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('brief');
  const [briefData, setBriefData] = useState<MorningBriefData | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(true);
  
  // Modals & Drawers
  const [selectedIssueForDetail, setSelectedIssueForDetail] = useState<IssueItem | null>(null);
  const [selectedIssueForPO, setSelectedIssueForPO] = useState<IssueItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { lastMessage } = useWebSocket();

  const loadMorningBrief = () => {
    setLoadingBrief(true);
    api.getMorningBrief()
      .then(data => setBriefData(data))
      .catch(err => console.error('Error loading morning brief:', err))
      .finally(() => setLoadingBrief(false));
  };

  useEffect(() => {
    loadMorningBrief();
  }, [refreshTrigger]);

  // Handle live WebSocket incoming events
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'NEW_ANOMALY_DETECTED' || lastMessage.type === 'ACTION_UPDATED' || lastMessage.type === 'METRICS_UPDATED') {
        const msg = lastMessage.data?.message || 'Live operational update received from autonomous agent.';
        setToastMessage(msg);
        setRefreshTrigger(prev => prev + 1);

        // Auto clear toast after 6s
        const timer = setTimeout(() => {
          setToastMessage(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [lastMessage]);

  // Actions
  const handleApproveIssue = async (issue: IssueItem) => {
    if (!issue.action) return;
    try {
      await api.approveAction(issue.action.id);
      loadMorningBrief();
      setRefreshTrigger(prev => prev + 1);
      setSelectedIssueForDetail(null);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleRejectIssue = async (issue: IssueItem) => {
    if (!issue.action) return;
    try {
      await api.rejectAction(issue.action.id);
      loadMorningBrief();
      setRefreshTrigger(prev => prev + 1);
      setSelectedIssueForDetail(null);
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleApprovePO = async (actionId: string, customParams: Record<string, any>) => {
    try {
      await api.approveAction(actionId, customParams);
      loadMorningBrief();
      setRefreshTrigger(prev => prev + 1);
      setSelectedIssueForPO(null);
    } catch (err: any) {
      alert(`PO approval error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col selection:bg-brand-500 selection:text-white">
      
      {/* Live Toast Banner */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-2.5 shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-top duration-150 z-50">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300">Live Agent Event:</span>
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenChat={() => setIsChatOpen(true)}
        onResetData={() => loadMorningBrief()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'brief' && (
          <MorningBrief
            data={briefData}
            loading={loadingBrief}
            onRefresh={loadMorningBrief}
            onInspectIssue={(issue) => setSelectedIssueForDetail(issue)}
            onApproveIssue={handleApproveIssue}
            onOpenDraftModal={(issue) => setSelectedIssueForPO(issue)}
            onOpenSimulator={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsDashboard onRefreshTrigger={refreshTrigger} />
        )}

        {activeTab === 'simulator' && (
          <LiveSimulator
            onAnomalyInjected={() => {
              loadMorningBrief();
              setRefreshTrigger(prev => prev + 1);
            }}
            onResetComplete={() => {
              loadMorningBrief();
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogView />
        )}

        {activeTab === 'audit' && (
          <AuditLogTable />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-1.5 font-medium">
            <span className="font-bold text-slate-800">MitraOS</span>
            <span>— Autonomous Early-Warning & Action System for Small-Business Operations</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>Razorpay Buildathon 2026</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Bounded Autonomy Architecture</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <IssueDetailModal
        issue={selectedIssueForDetail}
        onClose={() => setSelectedIssueForDetail(null)}
        onApprove={handleApproveIssue}
        onReject={handleRejectIssue}
      />

      <PurchaseOrderModal
        issue={selectedIssueForPO}
        onClose={() => setSelectedIssueForPO(null)}
        onApprovePO={handleApprovePO}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onActionExecuted={() => {
          loadMorningBrief();
          setRefreshTrigger(prev => prev + 1);
        }}
      />

    </div>
  );
};
