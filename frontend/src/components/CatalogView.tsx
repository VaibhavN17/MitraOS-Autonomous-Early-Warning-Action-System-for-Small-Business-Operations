import React, { useState, useEffect } from 'react';
import { 
  PackageSearch, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Store,
  Search,
  ArrowUpDown,
  Filter
} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = filterLowStockOnly ? p.current_stock <= 15 : true;
    return matchesSearch && matchesLowStock;
  });

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="saas-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md w-fit border border-teal-100">
            <PackageSearch className="w-3.5 h-3.5" />
            <span>OPERATIONAL CATALOG & COMMERCE TELEMETRY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight font-display">
            {currentMerchant?.name || 'Catalog & Operations'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time catalog SKUs, customer lifetime value, and Razorpay order transactions for <strong className="text-slate-800 font-semibold">{currentMerchant?.category}</strong>
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs shrink-0">
          <button
            onClick={() => {
              setActiveSubTab('products');
              setSearchTerm('');
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PackageSearch className="w-3.5 h-3.5" />
            <span>SKUs ({products.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('orders');
              setSearchTerm('');
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('customers');
              setSearchTerm('');
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'customers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers ({customers.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeSubTab}...`}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        {activeSubTab === 'products' && (
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              filterLowStockOnly
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Show Low Stock Only ({products.filter(p => p.current_stock <= 15).length})</span>
          </button>
        )}
      </div>

      {/* Main Table Container */}
      <div className="saas-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-xs font-semibold">Synchronizing catalog records...</span>
          </div>
        ) : activeSubTab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Product & SKU</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Category</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Current Stock</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Lead Time</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Unit Cost</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Selling Price</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Telemetry Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No matching SKUs found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLowStock = p.current_stock <= 15;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">{p.sku}</div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-bold text-sm metric-number">
                          <span className={isLowStock ? 'text-amber-600' : 'text-slate-900'}>
                            {p.current_stock} units
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium">
                          {p.supplier_lead_time_days} days
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 font-medium metric-number">
                          {formatPaise(p.unit_cost_paise)}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-900 metric-number">
                          {formatPaise(p.unit_price_paise)}
                        </td>
                        <td className="py-3.5 px-5">
                          {isLowStock ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Restock Horizon</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Sufficient Buffer</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : activeSubTab === 'orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Customer</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Product Ordered</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Quantity</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Amount</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Payment Method</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Gateway Status</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900 text-xs sm:text-sm">{o.customer_name}</td>
                      <td className="py-3.5 px-5 text-slate-700 font-medium">{o.product_name}</td>
                      <td className="py-3.5 px-5 text-slate-600 metric-number">{o.quantity}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900 metric-number">{formatPaise(o.amount_paise)}</td>
                      <td className="py-3.5 px-5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold uppercase">
                          {o.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {o.status === 'paid' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span>Captured</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Customer Name</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Email</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Phone</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Historical LTV</th>
                  <th className="py-3 px-5 font-bold text-slate-600 uppercase text-[11px]">Last Order Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No matching customer records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900 text-xs sm:text-sm">{c.name}</td>
                      <td className="py-3.5 px-5 text-slate-600">{c.email}</td>
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">{c.phone}</td>
                      <td className="py-3.5 px-5 font-extrabold text-slate-900 metric-number">{formatPaise(c.total_lifetime_value_paise)}</td>
                      <td className="py-3.5 px-5 text-slate-500">
                        {c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
