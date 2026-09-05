import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Building2, 
  ShieldCheck, 
  ChevronDown, 
  Plus, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Bot,
  Command,
  LayoutDashboard,
  BarChart3,
  PackageSearch,
  Zap,
  History,
  Menu,
  X
} from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { BusinessSwitcher } from './BusinessSwitcher';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenChat: () => void;
  onOpenSearch?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenChat,
  onOpenSearch
}) => {
  const { isConnected } = useWebSocket();
  const { setIsPortfolioModalOpen, setIsAddBusinessModalOpen, currentMerchant } = useBusiness();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-subtle">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Menu Trigger + Business Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo on small screens where sidebar is hidden */}
            <div className="flex lg:hidden items-center space-x-2 mr-1">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight font-display sm:inline hidden">
                MitraOS
              </span>
            </div>

            {/* Multi-Tenant Business Switcher */}
            <BusinessSwitcher />
          </div>

          {/* Center / Search Action Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all shadow-xs group"
            >
              <div className="flex items-center space-x-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                <span className="group-hover:text-slate-600">Search operations, orders, SKUs, or run action...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center space-x-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Portfolio Overview */}
            <button
              onClick={() => setIsPortfolioModalOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition-colors"
              title="Multi-business portfolio health"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Portfolio</span>
            </button>

            {/* Live Connection Pill */}
            <div 
              className="flex items-center space-x-1.5 text-xs font-medium bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200"
              title={isConnected ? "WebSocket connected to autonomous event bus" : "Reconnecting to event stream..."}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline text-slate-600 text-[11px] font-semibold">
                {isConnected ? 'Live Agent' : 'Connecting'}
              </span>
            </div>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-modal border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Autonomous Activity Feed
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Real-time
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto px-3 py-2 space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">Payment Gateway Guardrail</span>
                        <span className="text-slate-400 text-[10px]">Just now</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Soft retry mechanism engaged for failed UPI collections.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">Inventory Telemetry Sync</span>
                        <span className="text-slate-400 text-[10px]">2h ago</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {currentMerchant?.name} SKUs re-evaluated against 7-day velocity baseline.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 px-3 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        setActiveTab('audit');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      View complete immutable audit trail →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Ask Mitra Copilot (Mobile/Tablet quick button) */}
            <button
              onClick={onOpenChat}
              className="lg:hidden flex items-center space-x-1.5 bg-slate-900 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-300" />
              <span>Mitra</span>
            </button>

            {/* User Profile Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : (user?.merchant_name ? user.merchant_name.slice(0, 2).toUpperCase() : 'BO')}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-modal border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{user?.full_name || user?.merchant_name || 'Business Owner'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'owner@mitraos.com'}</p>
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {user?.role === 'admin' ? 'Administrator' : 'Verified Business Owner'}
                    </div>
                  </div>

                  <div className="py-1.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsAddBusinessModalOpen(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Add New Business</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsPortfolioModalOpen(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
                    >
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <span>Portfolio Overview</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1.5 mt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-bold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 space-y-1 animate-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => {
                setActiveTab('brief');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'brief' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span>Morning Brief</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('metrics');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'metrics' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Metrics & ROI</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('catalog');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PackageSearch className="w-4 h-4 text-teal-600" />
              <span>Catalog & Orders</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('simulator');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'simulator' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Live Scenario Simulator</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('audit');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audit' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Audit Trail</span>
            </button>
          </div>
        )}

      </div>

      {/* Mobile Sticky Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => setActiveTab('brief')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'brief' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 mb-0.5 ${activeTab === 'brief' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Brief</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'metrics' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className={`w-4 h-4 mb-0.5 ${activeTab === 'metrics' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'catalog' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <PackageSearch className={`w-4 h-4 mb-0.5 ${activeTab === 'catalog' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'simulator' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Zap className={`w-4 h-4 mb-0.5 ${activeTab === 'simulator' ? 'text-amber-500 stroke-[2.5]' : 'text-slate-500'}`} />
          <span className="text-[9px]">Simulate</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'audit' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className={`w-4 h-4 mb-0.5 ${activeTab === 'audit' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Audit</span>
        </button>

        <button
          onClick={onOpenChat}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-slate-900 hover:text-indigo-600 transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center mb-0.5 shadow-sm">
            <Bot className="w-3 h-3 text-indigo-300" />
          </div>
          <span className="text-[9px] font-bold">Mitra</span>
        </button>
      </nav>
    </header>
  );
};
