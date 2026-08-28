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
  const supplierName = initialParams.supplier_name || 'Mysore Exotic Flora Supplies';
  const sku = initialParams.sku || 'PLN-MON-01';
  const productName = initialParams.product_name || 'Monstera Deliciosa (Large)';

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              DRAFT PURCHASE ORDER
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Restock Purchase Order Review
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Supplier and SKU Meta */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5 font-medium">
                <Truck className="w-3.5 h-3.5 text-brand-600" />
                <span>Supplier Partner:</span>
              </span>
              <span className="font-bold text-slate-900">{supplierName}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5 font-medium">
                <Package className="w-3.5 h-3.5 text-brand-600" />
                <span>Product / SKU:</span>
              </span>
              <span className="font-bold text-slate-900">{productName} ({sku})</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Lead Time vs Runway:</span>
              </span>
              <span className="font-bold text-amber-700">4 Days Stock Left vs 7 Days Lead Time</span>
            </div>
          </div>

          {/* Editable Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Order Quantity (Units)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="10"
                max="500"
                step="5"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="block w-32 px-3.5 py-2 text-sm font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <span className="text-xs text-slate-500 font-medium">
                @ {formatPaise(unitCostPaise)} per unit wholesale
              </span>
            </div>
          </div>

          {/* Calculated Cost & Revenue Protected Breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Total Estimated Purchase Order Cost:</span>
              <span className="text-sm font-extrabold text-slate-900">{formatPaise(totalCostPaise)}</span>
            </div>

            <div className="flex items-center justify-between text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <span>Projected Lost Revenue Protected:</span>
              <span className="text-sm font-extrabold text-emerald-900">{formatPaise(preventedRevenuePaise)}</span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow transition-all active:scale-95"
            >
              <span>Approve & Place PO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
