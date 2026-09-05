import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Truck, Package, Clock } from 'lucide-react';
import { IssueItem } from '../types';

interface PurchaseOrderModalProps {
  issue: IssueItem | null;
  onClose: () => void;
  onApprovePO: (actionId: string, customParams: Record<string, any>) => void;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  issue,
  onClose,
  onApprovePO
}) => {
  if (!issue || !issue.action) return null;

  const action = issue.action;
  const initialParams = action.parameters || {};

  const [quantity, setQuantity] = useState<number>(initialParams.quantity || 70);
  const unitCostPaise = initialParams.unit_cost_paise || 65000;
  const supplierName = initialParams.supplier_name || 'Authorized Regional Vendor Network';
  const sku = initialParams.sku || 'HERO-SKU-01';
  const productName = initialParams.product_name || 'Target Inventory SKU';

  const totalCostPaise = quantity * unitCostPaise;
  const preventedRevenuePaise = issue.estimated_impact_paise;

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApprovePO(action.id, {
      quantity,
      estimated_total_cost_paise: totalCostPaise,
      supplier_name: supplierName,
      sku
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-modal border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
              DRAFT PURCHASE ORDER
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1.5 font-display">
              Restock Purchase Order Review
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Supplier and SKU Meta */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5 font-medium">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Supplier Partner:</span>
              </span>
              <span className="font-bold text-slate-900">{supplierName}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 border-t border-slate-200/50 pt-2">
              <span className="flex items-center space-x-1.5 font-medium">
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                <span>Product / SKU:</span>
              </span>
              <span className="font-bold text-slate-900">{productName} ({sku})</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 border-t border-slate-200/50 pt-2">
              <span className="flex items-center space-x-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Supplier Lead Time:</span>
              </span>
              <span className="font-bold text-amber-700">{initialParams.supplier_lead_time_days || 7} Days</span>
            </div>
          </div>

          {/* Editable Quantity Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Order Quantity (Units)
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-base font-extrabold border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Unit Wholesale Cost: <strong>{formatPaise(unitCostPaise)}</strong>
            </p>
          </div>

          {/* Impact Comparison Box */}
          <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Total Purchase Cost</span>
              <span className="text-base font-extrabold text-slate-900 block mt-0.5 metric-number">
                {formatPaise(totalCostPaise)}
              </span>
            </div>
            <div className="border-l border-indigo-100 pl-3">
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Revenue Protected</span>
              <span className="text-base font-extrabold text-emerald-700 block mt-0.5 metric-number">
                {formatPaise(preventedRevenuePaise)}
              </span>
            </div>
          </div>

          {/* Autonomy Transparency Callout */}
          <div className="flex items-start space-x-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              <strong>Bounded Policy Gate:</strong> This PO exceeds the auto-spend policy threshold (₹10,000). Nothing is dispatched to vendor until you approve.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-indigo-600 text-white shadow-xs transition-all active:scale-95"
            >
              <span>Approve & Dispatch PO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
