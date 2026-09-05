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
import { PortfolioModal } from './components/PortfolioModal';
import { AddBusinessWizard } from './components/AddBusinessWizard';
import { AuthView } from './components/AuthView';
import { MorningBriefData, IssueItem } from './types';
import { api } from './services/api';
import { useWebSocket } from './context/WebSocketContext';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sparkles, X, Zap, Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoadingAuth: authLoading } = useAuth();
  const { currentMerchant } = useBusiness();
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
    if (!isAuthenticated || !currentMerchant) return;
    setLoadingBrief(true);
    api.getMorningBrief(currentMerchant?.id)
      .then(data => setBriefData(data))
      .catch(err => console.error('Error loading morning brief:', err))
      .finally(() => setLoadingBrief(false));
  };

  useEffect(() => {
    loadMorningBrief();
  }, [refreshTrigger, currentMerchant?.id, isAuthenticated]);

  // Handle live WebSocket incoming events
  useEffect(() => {
    if (lastMessage) {
      if (
        lastMessage.type === 'NEW_ANOMALY_DETECTED' ||
        lastMessage.type === 'ACTION_UPDATED' ||
        lastMessage.type === 'METRICS_UPDATED'
      ) {
        const msg = lastMessage.data?.message || 'Live operational update received from autonomous agent.';
        setToastMessage(msg);
        setRefreshTrigger(prev => prev + 1);

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

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/30 animate-pulse">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-base font-bold font-display tracking-tight mb-1">MitraOS Operations Suite</h2>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Synchronizing workspace...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render Login/Register portal
  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-indigo-600 selection:text-white">
      
      {/* Live Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top duration-150 z-50 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-bold text-amber-300">Live Agent Event:</span>
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
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

      {/* Main Content Area - Disciplined padding for laptop viewports & mobile clearance */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 pb-20 md:pb-6">
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

        {activeTab === 'catalog' && (
          <CatalogView />
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

        {activeTab === 'audit' && (
          <AuditLogTable />
        )}
      </main>

      {/* Desktop Subtle Footer */}
      <footer className="hidden md:block border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5 font-medium">
            <span className="font-extrabold text-slate-900 tracking-tight font-display">MitraOS</span>
            <span>— Autonomous Early-Warning & Action System for Small Businesses</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Razorpay Buildathon 2026</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Bounded Autonomy Protocol</span>
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

      <PortfolioModal />
      <AddBusinessWizard />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BusinessProvider>
        <MainApp />
      </BusinessProvider>
    </AuthProvider>
  );
};
