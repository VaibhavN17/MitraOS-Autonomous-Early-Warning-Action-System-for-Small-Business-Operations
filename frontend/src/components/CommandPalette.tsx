import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  BarChart3, 
  PackageSearch, 
  Zap, 
  History, 
  Building2, 
  Plus, 
  Bot, 
  ArrowRight, 
  X 
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onOpenChat: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenChat
}) => {
  const [query, setQuery] = useState('');
  const { merchants, setCurrentMerchant, setIsAddBusinessModalOpen, setIsPortfolioModalOpen } = useBusiness();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open trigger handled in parent or global event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'tab-brief',
      title: 'Morning Brief & Diagnostic Feed',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => onSelectTab('brief'),
    },
    {
      id: 'tab-metrics',
      title: 'Metrics & ROI Telemetry',
      category: 'Navigation',
      icon: BarChart3,
      action: () => onSelectTab('metrics'),
    },
    {
      id: 'tab-catalog',
      title: 'Catalog, SKUs & Orders',
      category: 'Navigation',
      icon: PackageSearch,
      action: () => onSelectTab('catalog'),
    },
    {
      id: 'tab-simulator',
      title: 'Live Scenario Simulator',
      category: 'Sandbox',
      icon: Zap,
      action: () => onSelectTab('simulator'),
    },
    {
      id: 'tab-audit',
      title: 'Immutable Audit Trail',
      category: 'Governance',
      icon: History,
      action: () => onSelectTab('audit'),
    },
    {
      id: 'action-chat',
      title: 'Ask Mitra Autonomous Copilot',
      category: 'AI Assistant',
      icon: Bot,
      action: onOpenChat,
    },
    {
      id: 'action-portfolio',
      title: 'View Portfolio Health Overview',
      category: 'Multi-Business',
      icon: Building2,
      action: () => setIsPortfolioModalOpen(true),
    },
    {
      id: 'action-add-business',
      title: 'Onboard & Add New Business Entity',
      category: 'Multi-Business',
      icon: Plus,
      action: () => setIsAddBusinessModalOpen(true),
    },
  ];

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMerchants = merchants.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-100">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-modal border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, navigate views, or switch businesses..."
            className="w-full text-sm text-slate-900 placeholder-slate-400 bg-transparent border-none focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4 text-xs">
          
          {/* Quick Actions & Navigation */}
          {filteredActions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                Quick Commands & Views
              </div>
              <div className="space-y-1">
                {filteredActions.map(a => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        a.action();
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800 group-hover:text-slate-900">{a.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {a.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Switch Active Business */}
          {filteredMerchants.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                Switch Business Entity
              </div>
              <div className="space-y-1">
                {filteredMerchants.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCurrentMerchant(m);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 group-hover:text-slate-900 block">{m.name}</span>
                        <span className="text-[10px] text-slate-400">{m.category}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredMerchants.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No matching commands or entities found for "{query}"</p>
            </div>
          )}

        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Use <strong>Esc</strong> to close</span>
          <span><strong>↵</strong> to select</span>
        </div>

      </div>
    </div>
  );
};
