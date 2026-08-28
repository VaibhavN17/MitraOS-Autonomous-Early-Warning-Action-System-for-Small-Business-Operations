import React from 'react';
import { ShieldCheck, Zap, Bot, BarChart3, LayoutDashboard, History, PackageSearch, Sparkles, RefreshCw } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenChat: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenChat, onResetData }) => {
  const { isConnected } = useWebSocket();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Merchant Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">MitraOS</span>
                <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-semibold border border-brand-100">
                  Razorpay Buildathon
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">GreenLeaf Botanics & Nursery</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('brief')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'brief'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Morning Brief</span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'metrics'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Metrics & Evaluation</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Demo Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <PackageSearch className="w-4 h-4" />
              <span>Inventory & Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Trail</span>
            </button>
          </nav>

          {/* Right Controls: Bounded Autonomy, WS status, Chat trigger */}
          <div className="flex items-center space-x-3">
            {/* Bounded Autonomy Policy Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span className="font-medium">Bounded Autonomy:</span>
              <span className="text-slate-900 font-semibold">Approval Required</span>
            </div>

            {/* Live WebSocket Indicator */}
            <div className="flex items-center space-x-1.5 text-xs font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="hidden sm:inline text-slate-600">{isConnected ? 'Live' : 'Syncing'}</span>
            </div>

            {/* Ask AI Trigger Button */}
            <button
              onClick={onOpenChat}
              className="flex items-center space-x-1.5 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Mitra</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
