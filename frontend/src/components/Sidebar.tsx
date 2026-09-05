import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  PackageSearch, 
  Zap, 
  History, 
  Sparkles, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Bot,
  Layers,
  Building2
} from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { useBusiness } from '../context/BusinessContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenChat: () => void;
  pendingIssuesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onOpenChat,
  pendingIssuesCount = 0
}) => {
  const { isConnected } = useWebSocket();
  const { currentMerchant, setIsPortfolioModalOpen } = useBusiness();

  const navGroups = [
    {
      groupTitle: 'INTELLIGENCE & ACTIONS',
      items: [
        {
          id: 'brief',
          label: 'Morning Brief',
          subLabel: 'Risk & remediation feed',
          icon: LayoutDashboard,
          badge: pendingIssuesCount > 0 ? `${pendingIssuesCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          id: 'simulator',
          label: 'Scenario Simulator',
          subLabel: 'Judge anomaly injector',
          icon: Zap,
          accent: 'text-amber-500',
        },
      ]
    },
    {
      groupTitle: 'OPERATIONS & RECOVERY',
      items: [
        {
          id: 'metrics',
          label: 'Metrics & ROI',
          subLabel: 'Financial recovery & telemetry',
          icon: BarChart3,
          accent: 'text-indigo-500',
        },
        {
          id: 'catalog',
          label: 'Catalog & Orders',
          subLabel: 'Inventory SKUs & customer LTV',
          icon: PackageSearch,
          accent: 'text-teal-600',
        },
      ]
    },
    {
      groupTitle: 'GOVERNANCE',
      items: [
        {
          id: 'audit',
          label: 'Audit Trail',
          subLabel: 'Immutable provenance logs',
          icon: History,
          accent: 'text-slate-500',
        },
      ]
    }
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200/90 transition-all duration-300 z-20 select-none shrink-0 ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100/90">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight font-display">
                  MitraOS
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate font-medium">Autonomous Ops System</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                {group.groupTitle}
              </h4>
            )}
            
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl transition-all group ${
                    isCollapsed 
                      ? 'justify-center p-2.5' 
                      : 'px-3 py-2.5 space-x-3 text-left'
                  } ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-900 font-bold shadow-xs border border-indigo-100/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                  }`}
                >
                  <Icon 
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-600' : (item.accent || 'text-slate-400 group-hover:text-slate-600')
                    }`} 
                  />

                  {!isCollapsed && (
                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-xs block leading-tight">{item.label}</span>
                        <span className={`text-[10px] block leading-tight mt-0.5 truncate ${
                          isActive ? 'text-indigo-600/75' : 'text-slate-400'
                        }`}>
                          {item.subLabel}
                        </span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${item.badgeColor || 'bg-indigo-600 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {isCollapsed && item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer: Ask Mitra Copilot Trigger & Autonomy Guardrail */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/40">
        
        {/* Ask Mitra Copilot Action */}
        <button
          onClick={onOpenChat}
          className={`w-full flex items-center rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold transition-all shadow-sm group active:scale-98 ${
            isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 space-x-2.5'
          }`}
          title="Ask Mitra Copilot"
        >
          <Bot className="w-4 h-4 text-indigo-300 group-hover:text-white shrink-0" />
          {!isCollapsed && (
            <div className="text-left flex-1">
              <span className="text-xs block leading-tight">Ask Mitra</span>
              <span className="text-[10px] text-slate-300 block font-normal leading-tight">Autonomous Copilot</span>
            </div>
          )}
        </button>

        {/* Bounded Autonomy Guardrail Card */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-1.5 text-xs text-indigo-700 font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bounded Autonomy</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">
              Consent enforced for actions &gt; ₹10k. 100% audit logging active.
            </p>
          </div>
        ) : (
          <div 
            className="flex justify-center p-2 rounded-lg text-indigo-600 hover:bg-slate-100 cursor-pointer"
            title="Bounded Autonomy Enforced"
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
        )}

      </div>
    </aside>
  );
};
