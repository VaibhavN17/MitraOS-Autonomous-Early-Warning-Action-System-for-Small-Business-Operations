import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Bot, 
  BarChart3, 
  LayoutDashboard, 
  History, 
  PackageSearch, 
  Sparkles, 
  Building2, 
  User, 
  LogOut, 
  Plus, 
  ChevronDown 
} from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { BusinessSwitcher } from './BusinessSwitcher';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenChat: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenChat }) => {
  const { isConnected } = useWebSocket();
  const { setIsPortfolioModalOpen, setIsAddBusinessModalOpen } = useBusiness();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-15 gap-2 sm:gap-3">
            
            {/* Logo & Business Switcher */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="hidden lg:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-base text-slate-900 tracking-tight font-display">MitraOS</span>
                    <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                      2026
                    </span>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

              {/* Multi-Tenant Business Switcher */}
              <BusinessSwitcher />
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden xl:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
              <button
                onClick={() => setActiveTab('brief')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'brief'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-brand-500" />
                <span>Morning Brief</span>
              </button>

              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'metrics'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Metrics & ROI</span>
              </button>

              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <PackageSearch className="w-3.5 h-3.5 text-teal-600" />
                <span>Catalog & Orders</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'simulator'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Simulator</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'audit'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Audit Trail</span>
              </button>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center space-x-2 shrink-0">
              
              {/* Portfolio Overview Trigger */}
              <button
                onClick={() => setIsPortfolioModalOpen(true)}
                className="hidden md:flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200/80 transition-colors"
                title="View all operating businesses"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Portfolio</span>
              </button>

              {/* Bounded Autonomy Guardrail Badge */}
              <div className="hidden 2xl:flex items-center space-x-1.5 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span className="font-semibold text-slate-800">Bounded Autonomy</span>
              </div>

              {/* Live Status Indicator */}
              <div className="flex items-center space-x-1.5 text-xs font-medium bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200/80">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="hidden sm:inline text-slate-600 text-[11px] font-semibold">{isConnected ? 'Live' : 'Syncing'}</span>
              </div>

              {/* Ask Mitra Trigger Button */}
              <button
                onClick={onOpenChat}
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden sm:inline">Ask Mitra</span>
              </button>

              {/* User Profile Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                  aria-label="User profile menu"
                >
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-600 to-brand-500 text-white flex items-center justify-center font-bold text-[11px]">
                    {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : (user?.merchant_name ? user.merchant_name.slice(0, 2).toUpperCase() : 'BO')}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user?.full_name || user?.merchant_name || 'Business Owner'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || 'owner@mitraos.com'}</p>
                      <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {user?.role === 'admin' ? 'Administrator' : 'Verified Business Owner'}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsAddBusinessModalOpen(true);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Add New Business</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsPortfolioModalOpen(true);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Portfolio Overview</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition-colors font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Tablet/Medium Sub-Navigation Bar */}
          <div className="hidden md:flex xl:hidden items-center space-x-1 overflow-x-auto py-1.5 border-t border-slate-100 text-xs scrollbar-none">
            <button
              onClick={() => setActiveTab('brief')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition-colors ${
                activeTab === 'brief' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Morning Brief</span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition-colors ${
                activeTab === 'metrics' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Metrics & ROI</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition-colors ${
                activeTab === 'catalog' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PackageSearch className="w-3 h-3" />
              <span>Catalog & Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition-colors ${
                activeTab === 'simulator' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition-colors ${
                activeTab === 'audit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="w-3 h-3" />
              <span>Audit Trail</span>
            </button>
          </div>

        </div>
      </header>

      {/* Android & Mobile Native Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => setActiveTab('brief')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'brief'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 mb-0.5 ${activeTab === 'brief' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Brief</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'metrics'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className={`w-4 h-4 mb-0.5 ${activeTab === 'metrics' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'catalog'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <PackageSearch className={`w-4 h-4 mb-0.5 ${activeTab === 'catalog' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'simulator'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Zap className={`w-4 h-4 mb-0.5 ${activeTab === 'simulator' ? 'text-amber-500 stroke-[2.5]' : 'text-slate-500'}`} />
          <span className="text-[9px]">Simulate</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
            activeTab === 'audit'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
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
    </>
  );
};
