import React, { useState, useEffect } from 'react';
import { PackageSearch, ShoppingBag, Users, AlertTriangle, CheckCircle2, RefreshCw, Store } from 'lucide-react';
import { ProductItem, OrderItem, CustomerItem } from '../types';
import { api } from '../services/api';
import { useBusiness } from '../context/BusinessContext';

export const CatalogView: React.FC = () => {
  const { currentMerchant } = useBusiness();
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders' | 'customers'>('products');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const mId = currentMerchant?.id;
    Promise.all([
      api.getProducts(mId),
      api.getRecentOrders(50, mId),
      api.getCustomers(50, mId)
    ])
      .then(([prods, ords, custs]) => {
        setProducts(prods);
        setOrders(ords);
        setCustomers(custs);
      })
      .catch(err => console.error('Error fetching catalog data:', err))
      .finally(() => setLoading(false));
  }, [currentMerchant?.id]);

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-7 lg:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg w-fit border border-teal-100">
            <PackageSearch className="w-3.5 h-3.5" />
            <span>BUSINESS INVENTORY & STORE RECORDS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {currentMerchant?.name || 'Catalog & Operations'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Real-time catalog SKUs, customer lifetime value, and Razorpay order transactions for <strong className="text-slate-800 font-semibold">{currentMerchant?.category}</strong>
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PackageSearch className="w-4 h-4" />
            <span>SKUs ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('customers')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'customers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({customers.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-sm font-semibold">Loading records for {currentMerchant?.name}...</span>
          </div>
        ) : activeSubTab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Product & SKU</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Category</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Current Stock</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Lead Time</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Unit Cost</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Selling Price</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLowStock = p.current_stock <= 15;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{p.sku}</div>
                      </td>
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-extrabold text-sm">
                        <span className={isLowStock ? 'text-amber-600' : 'text-slate-900'}>
                          {p.current_stock} units
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {p.supplier_lead_time_days} days
                      </td>
                      <td className="py-4 px-5 text-slate-500 font-medium">
                        {formatPaise(p.unit_cost_paise)}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {formatPaise(p.unit_price_paise)}
                      </td>
                      <td className="py-4 px-5">
                        {isLowStock ? (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Low Stock Alert</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span>Sufficient</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : activeSubTab === 'orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Customer</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Product Ordered</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Quantity</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Amount</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Method</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Status</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 text-sm">{o.customer_name}</td>
                    <td className="py-4 px-5 text-slate-700 font-medium">{o.product_name}</td>
                    <td className="py-4 px-5 text-slate-600">{o.quantity}</td>
                    <td className="py-4 px-5 font-bold text-slate-900">{formatPaise(o.amount_paise)}</td>
                    <td className="py-4 px-5">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase">
                        {o.payment_method}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {o.status === 'paid' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>Paid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <span>Failed</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Customer Name</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Email</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Phone</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Historical LTV</th>
                  <th className="py-4 px-5 font-bold text-slate-600 uppercase">Last Order Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 text-sm">{c.name}</td>
                    <td className="py-4 px-5 text-slate-600">{c.email}</td>
                    <td className="py-4 px-5 text-slate-500 font-mono">{c.phone}</td>
                    <td className="py-4 px-5 font-extrabold text-slate-900">{formatPaise(c.total_lifetime_value_paise)}</td>
                    <td className="py-4 px-5 text-slate-500">
                      {c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
