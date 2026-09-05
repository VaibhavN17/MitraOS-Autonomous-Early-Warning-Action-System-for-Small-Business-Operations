import React from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Store, 
  DollarSign,
  Check
} from 'lucide-react';
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
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-modal border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50/40 border-b border-slate-100">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Portfolio Revenue (Yesterday)</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block metric-number">
              {formatPaise(totalYesterdayRev)}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Across {merchants.length} operating businesses</span>
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Operational Risks Requiring Action</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 metric-number">{totalRisks}</span>
              <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                {totalHighRisks} High Priority
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Autonomous remediation drafts prepared
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Autonomy Boundary Guardrail</span>
            <div className="flex items-center space-x-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold text-slate-900">Enforced & Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Zero unauthorized spend or vendor orders across all entities.
            </p>
          </div>
        </div>

        {/* Business Grid */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Connected Businesses ({merchants.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Click any card to switch operational context
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {merchants.map((merchant) => {
              const isSelected = merchant.id === currentMerchant?.id;
              const hasHigh = (merchant.high_risk_count ?? 0) > 0;

              return (
                <div
                  key={merchant.id}
                  onClick={() => {
                    setCurrentMerchant(merchant);
                    setIsPortfolioModalOpen(false);
                  }}
                  className={`bg-white rounded-xl border p-4 transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-card'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarGradient(merchant.avatar_color)} flex items-center justify-center font-bold text-xs shadow-xs`}>
                        {getInitials(merchant.name)}
                      </div>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {merchant.razorpay_account_id}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {merchant.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {merchant.category}
                    </p>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Yesterday Revenue:</span>
                        <span className="font-bold text-slate-900 metric-number">{formatPaise(merchant.yesterday_revenue_paise)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Health Status:</span>
                        {hasHigh ? (
                          <span className="font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[10px]">
                            {merchant.high_risk_count} Risk
                          </span>
                        ) : (
                          <span className="font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                            Nominal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {isSelected ? 'Active Context' : 'Select Workspace'}
                    </span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
