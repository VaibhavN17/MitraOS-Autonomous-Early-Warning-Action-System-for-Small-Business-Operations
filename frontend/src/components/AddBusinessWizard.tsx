import React, { useState } from 'react';
import { X, Building2, Store, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Loader2, DollarSign, Bell } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export const AddBusinessWizard: React.FC = () => {
  const { isAddBusinessModalOpen, setIsAddBusinessModalOpen, createBusiness } = useBusiness();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('D2C Retail & E-commerce');
  const [avatarColor, setAvatarColor] = useState('indigo');
  const [razorpayAccountId, setRazorpayAccountId] = useState('');
  const [autoSpendLimit, setAutoSpendLimit] = useState(10000); // in Rupees
  const [notifyChannels, setNotifyChannels] = useState(['whatsapp', 'email']);

  if (!isAddBusinessModalOpen) return null;

  const handleNext = () => {
    if (step === 1 && !businessName.trim()) {
      alert('Please enter a business or brand name');
      return;
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createBusiness({
        name: businessName,
        category,
        razorpay_account_id: razorpayAccountId.trim() || undefined,
        avatar_color: avatarColor,
        auto_spend_limit_paise: autoSpendLimit * 100
      });
      // Reset & close
      setIsAddBusinessModalOpen(false);
      setStep(1);
      setBusinessName('');
    } catch (err: any) {
      alert(`Failed to add business: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'D2C Retail & E-commerce',
    'Ethnic Apparel & Luxury Fashion',
    'Specialty Food, Cafe & Beverages',
    'Health, Beauty & Ayurveda',
    'Home Decor & Urban Living',
    'Consumer Electronics & Hardware'
  ];

  const colorOptions = [
    { id: 'indigo', label: 'Indigo', class: 'bg-indigo-600' },
    { id: 'purple', label: 'Purple', class: 'bg-purple-600' },
    { id: 'emerald', label: 'Emerald', class: 'bg-emerald-600' },
    { id: 'amber', label: 'Amber', class: 'bg-amber-600' },
    { id: 'rose', label: 'Rose', class: 'bg-rose-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-modal border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Add & Onboard New Business
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Step {step} of 3: {step === 1 ? 'Brand & Sector' : step === 2 ? 'Razorpay Integration' : 'Bounded Autonomy Policies'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddBusinessModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-colors ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Step 1: Brand & Sector */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Anaya Fine Jewels"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Industry / Business Vertical
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Brand Color Accent
                </label>
                <div className="flex items-center space-x-3">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAvatarColor(opt.id)}
                      className={`w-8 h-8 rounded-full ${opt.class} flex items-center justify-center text-white transition-transform ${
                        avatarColor === opt.id ? 'ring-4 ring-indigo-200 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {avatarColor === opt.id && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Razorpay Credentials */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs text-slate-600">
                <div className="flex items-center space-x-2 font-bold text-indigo-900 mb-1">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Connect Razorpay Merchant Account</span>
                </div>
                <p>
                  MitraOS reads webhook events and handles automated customer payment links. Leave blank to auto-generate mock test credentials.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Razorpay Merchant Account ID (Optional)
                </label>
                <input
                  type="text"
                  value={razorpayAccountId}
                  onChange={(e) => setRazorpayAccountId(e.target.value)}
                  placeholder="e.g. acc_AFJ_rzp_2026 (or auto-generated)"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Active Payment Methods to Monitor
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['UPI (PhonePe, GPay, Paytm)', 'Credit & Debit Cards (3DS)', 'Netbanking (Major Banks)', 'Recurring AutoPay Mandates'].map((method) => (
                    <div key={method} className="flex items-center space-x-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="font-semibold text-slate-700">{method}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Bounded Autonomy Guardrails */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
                <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Set Policy Boundaries for Autonomous Agent</span>
                </div>
                <p>
                  Any supplier order or financial disbursement exceeding this threshold requires explicit one-tap approval from you.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Max Auto-Spend Threshold (₹ INR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={autoSpendLimit}
                  onChange={(e) => setAutoSpendLimit(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Vendor purchase orders over <strong>₹{autoSpendLimit.toLocaleString('en-IN')}</strong> will pause and request your approval.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Emergency Alert Notifications
                </label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-medium text-slate-700">WhatsApp 1-Click Approval Alerts</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-medium text-slate-700">Daily 8:00 AM Morning Brief via Email</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 transition-all shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Onboarding & Initializing Telemetry...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Launch Business Cockpit</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
