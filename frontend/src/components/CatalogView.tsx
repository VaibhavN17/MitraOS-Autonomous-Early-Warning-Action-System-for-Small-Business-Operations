import React, { useState, useEffect } from 'react';
import { PackageSearch, ShoppingBag, Users, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { ProductItem, OrderItem, CustomerItem } from '../types';
import { api } from '../services/api';

export const CatalogView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders' | 'customers'>('products');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getProducts(),
      api.getRecentOrders(),
      api.getCustomers()
    ])
      .then(([prods, ords, custs]) => {
        setProducts(prods);
        setOrders(ords);
        setCustomers(custs);
      })
      .catch(err => console.error('Error fetching catalog data:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatPaise = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 glow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md w-fit border border-brand-100">
            <PackageSearch className="w-3.5 h-3.5" />
            <span>NURSERY INVENTORY & ORDERS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Live Catalog & Customer Records
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Live business records ingested from store orders and stock telemetry
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PackageSearch className="w-3.5 h-3.5" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('customers')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'customers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers ({customers.length})</span>
          </button>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl border border-slate-200 glow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
            <span>Loading catalog data...</span>
          </div>
        ) : activeSubTab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Lead Time</th>
                  <th className="p-3.5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3.5 font-mono text-slate-500">{p.sku}</td>
                    <td className="p-3.5 text-slate-600">{p.category || 'Plants'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        p.current_stock <= 15 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {p.current_stock} units
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{p.supplier_lead_time_days} days</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">{formatPaise(p.unit_price_paise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeSubTab === 'orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Item</th>
                  <th className="p-3.5">Qty</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{o.customer_name}</td>
                    <td className="p-3.5 text-slate-700">{o.product_name}</td>
                    <td className="p-3.5 text-slate-600">{o.quantity}</td>
                    <td className="p-3.5 font-mono text-slate-600">{o.payment_method}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        o.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">{formatPaise(o.amount_paise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Last Purchase</th>
                  <th className="p-3.5 text-right">Lifetime Value (LTV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3.5 text-slate-500 font-mono">{c.email}</td>
                    <td className="p-3.5 text-slate-500 font-mono">{c.phone}</td>
                    <td className="p-3.5 text-slate-600">
                      {c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-emerald-700">{formatPaise(c.total_lifetime_value_paise)}</td>
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
