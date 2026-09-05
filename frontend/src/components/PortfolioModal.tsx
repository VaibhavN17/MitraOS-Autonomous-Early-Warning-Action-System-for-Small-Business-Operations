import React from 'react';
import { X, Building2, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Store, DollarSign } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { MerchantInfo } from '../types';

export const PortfolioModal: React.FC = () => {
  const { merchants, currentMerchant, setCurrentMerchant, isPortfolioModalOpen, setIsPortfolioModalOpen } = useBusiness();

  if (!isPortfolioModalOpen) return null;

  const formatPaise = (paise?: number) => {
    if (!paise) return '₹0';
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  const totalYesterdayRev = merchants.reduce((sum, m) => sum + (m.yesterday_revenue_paise || 0), 0);
  const totalRisks = merchants.reduce((sum, m) => sum + (m.active_issues_count || 0), 0);
  const totalHighRisks = merchants.reduce((sum, m) => sum + (m.high_risk_count || 0), 0);

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-modal border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Multi-Business Portfolio Health
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Consolidated operational telemetry across all registered Razorpay accounts
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPortfolioModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-slate-50/40 border-b border-slate-100">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
            <span className="text-xs text-slate-500 font-semibold block uppercase">Total Portfolio Revenue (Yesterday)</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {formatPaise(totalYesterdayRev)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Across {merchants.length} operating businesses</span>
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
            <span className="text-xs text-slate-500 font-semibold block uppercase">Operational Risks Requiring Action</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{totalRisks}</span>
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                {totalHighRisks} High Priority
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Autonomous remediation drafts prepared
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
            <span className="text-xs text-slate-500 font-semibold block uppercase">Autonomy Boundary Guardrail</span>
            <div className="flex items-center space-x-2 mt-1">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-bold text-slate-900">Enforced & Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Zero unauthorized spend or vendor orders across all entities.
            </p>
          </div>
        </div>

        {/* Business Grid */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Connected Businesses ({merchants.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Click to switch current operational context
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {merchants.map((merchant) => {
              const isSelected = merchant.id === currentMerchant?.id;
              const hasHigh = (merchant.high_risk_count ?? 0) > 0;

              return (
                <div
                  key={merchant.id}
                  className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-card'
                  }`}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(merchant.avatar_color)} flex items-center justify-center font-bold text-xs shadow-sm`}>
                        {getInitials(merchant.name)}
                      </div>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {merchant.razorpay_account_id}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base leading-snug">
                      {merchant.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {merchant.category}
                    </p>

                    {/* Stats List */}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Yesterday's Revenue:</span>
                        <span className="font-bold text-slate-900">{formatPaise(merchant.yesterday_revenue_paise)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Operational Health:</span>
                        {hasHigh ? (
                          <span className="font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[11px]">
                            {merchant.high_risk_count} High Risk
                          </span>
                        ) : (
                          <span className="font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                            Nominal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Switch Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    {isSelected ? (
                      <div className="w-full py-2 text-center text-xs font-bold text-brand-700 bg-brand-50 rounded-xl border border-brand-200">
                        Active Business
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setCurrentMerchant(merchant);
                          setIsPortfolioModalOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <span>Switch Context</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Autonomous agent isolates telemetry, logs, and action drafts per business entity.</span>
          </div>
          <button
            onClick={() => setIsPortfolioModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
