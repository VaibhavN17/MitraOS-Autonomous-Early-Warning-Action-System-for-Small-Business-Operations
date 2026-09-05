import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Building2, Store, Sparkles, AlertCircle, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { MerchantInfo } from '../types';

export const BusinessSwitcher: React.FC = () => {
  const { merchants, currentMerchant, setCurrentMerchant, setIsPortfolioModalOpen } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentMerchant) return null;

  const getAvatarGradient = (color?: string) => {
    switch (color) {
      case 'purple':
        return 'from-purple-600 to-indigo-600 text-white';
      case 'amber':
        return 'from-amber-500 to-orange-600 text-white';
      case 'emerald':
      default:
        return 'from-emerald-600 to-teal-700 text-white';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(w => !['&', 'and', 'the'].includes(w.toLowerCase()))
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  };

  const formatPaise = (paise?: number) => {
    if (!paise) return '₹0';
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 transition-all text-left group shadow-sm hover:border-slate-300"
      >
        {/* Business Avatar Icon */}
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getAvatarGradient(currentMerchant.avatar_color)} flex items-center justify-center font-bold text-xs shadow-sm`}>
          {getInitials(currentMerchant.name)}
        </div>

        {/* Business Text */}
        <div className="hidden sm:block">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
              {currentMerchant.name}
            </span>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              {currentMerchant.razorpay_account_id ? currentMerchant.razorpay_account_id.replace('acc_', '') : 'RZP'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {currentMerchant.category || 'Retail & E-commerce'}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 mb-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>Select Active Business</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{merchants.length} Connected</span>
          </div>

          {/* Business Options */}
          <div className="max-h-72 overflow-y-auto px-1.5 space-y-1">
            {merchants.map((merchant) => {
              const isSelected = merchant.id === currentMerchant.id;
              const hasHighRisk = (merchant.high_risk_count ?? 0) > 0;

              return (
                <button
                  key={merchant.id}
                  onClick={() => {
                    setCurrentMerchant(merchant);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    isSelected
                      ? 'bg-brand-50/60 border border-brand-200/80 shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getAvatarGradient(merchant.avatar_color)} flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                      {getInitials(merchant.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-brand-900' : 'text-slate-900'}`}>
                          {merchant.name}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {merchant.category}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[11px] text-slate-500">
                          Yesterday: <strong className="text-slate-700 font-semibold">{formatPaise(merchant.yesterday_revenue_paise)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    {hasHighRisk ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        <span>{merchant.high_risk_count} Risk</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Nominal
                      </span>
                    )}

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer: Portfolio Overview Modal Trigger */}
          <div className="mt-2 pt-2 px-3 border-t border-slate-100">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsPortfolioModalOpen(true);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Multi-Business Portfolio Overview</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
