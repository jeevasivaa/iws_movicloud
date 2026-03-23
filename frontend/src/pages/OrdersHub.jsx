import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  Search, 
  Download, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

const ORDERS_DATA = [
  { id: 'ORD-7721', client: 'Fresh Gulf Retail', date: '2026-03-22', items: 12, total: 167560, status: 'Processing' },
  { id: 'ORD-7718', client: 'Hydra Wellness Co.', date: '2026-03-21', items: 5, total: 80240, status: 'Shipped' },
  { id: 'ORD-7715', client: 'Urban Nature Drinks', date: '2026-03-19', items: 8, total: 108560, status: 'Delivered' },
  { id: 'ORD-7712', client: 'Pure Sip Waters', date: '2026-03-18', items: 24, total: 45000, status: 'Pending' },
  { id: 'ORD-7709', client: 'Eco thirst Ltd', date: '2026-03-17', items: 3, total: 12400, status: 'Processing' },
  { id: 'ORD-7706', client: 'Bistro Group', date: '2026-03-15', items: 15, total: 210500, status: 'Delivered' },
  { id: 'ORD-7703', client: 'Fresh Gulf Retail', date: '2026-03-14', items: 6, total: 88400, status: 'Shipped' },
];

const StatusBadge = ({ status }) => {
  const styles = {
    Processing: 'badge-info',
    Shipped: 'badge-warning',
    Pending: 'badge-error',
    Delivered: 'badge-success',
  };

  return (
    <span className={`badge ${styles[status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
      {status}
    </span>
  );
};

const OrdersHub = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = useMemo(() => ['All', 'Processing', 'Shipped', 'Pending', 'Delivered'], []);

  const counts = useMemo(() => {
    const obj = { All: ORDERS_DATA.length };
    tabs.slice(1).forEach(tab => {
      obj[tab] = ORDERS_DATA.filter(order => order.status === tab).length;
    });
    return obj;
  }, [tabs]);

  const filteredOrders = useMemo(() => {
    let base = ORDERS_DATA;
    if (activeTab !== 'All') {
      base = base.filter(order => order.status === activeTab);
    }
    if (searchQuery) {
      base = base.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.client.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return base;
  }, [activeTab, searchQuery]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Orders Pipeline</h1>
          <p className="text-slate-500 font-semibold mt-2">Real-time logistics tracking and order fulfillment.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary text-[11px] uppercase tracking-widest px-8 py-3">
            <Download size={16} className="mr-2" />
            Manifest
          </button>
          <button className="btn-primary text-[11px] uppercase tracking-widest px-8 py-3 shadow-md">
            <Plus size={16} className="mr-2" />
            New Order
          </button>
        </div>
      </div>

      {/* Tabs & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 bg-white/50 backdrop-blur-sm px-8 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-10 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-6 px-1 text-[12px] font-black uppercase tracking-[0.25em] transition-all relative flex items-center gap-3 whitespace-nowrap ${
                activeTab === tab ? 'text-[#1e3a8a]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] border transition-all ${
                activeTab === tab ? 'bg-blue-50 border-blue-100 text-[#1e3a8a]' : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}>
                {counts[tab]}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1e3a8a] rounded-t-full shadow-[0_-2px_10px_rgba(30,58,138,0.3)]" />
              )}
            </button>
          ))}
        </div>

        <div className="relative py-4 w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search Orders..."
            className="w-full bg-slate-100/50 border border-slate-200/60 rounded-2xl pl-12 pr-5 py-3 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-[#1e3a8a] outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="vsa-card overflow-hidden border-slate-200/60 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-200/60">
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Client Entity</th>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6 text-center">Items</th>
                <th className="px-8 py-6 text-right">Total (INR)</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                  <td className="px-8 py-7">
                    <span className="text-[14px] font-black text-slate-700 group-hover:text-[#1e3a8a] transition-colors">{order.id}</span>
                  </td>
                  <td className="px-8 py-7 text-[14px] font-bold text-slate-600">{order.client}</td>
                  <td className="px-8 py-7 text-[12px] font-bold text-slate-400 uppercase tracking-wider">{order.date}</td>
                  <td className="px-8 py-7 text-[14px] font-black text-slate-600 text-center">{order.items}</td>
                  <td className="px-8 py-7 text-[14px] font-black text-slate-800 text-right">₹{order.total.toLocaleString()}</td>
                  <td className="px-8 py-7 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-8 py-7 text-right">
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-white hover:text-[#1e3a8a] hover:shadow-premium-md transition-all active:scale-95 border border-transparent hover:border-slate-200">
                      <Eye size={20} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="px-8 py-20 text-center bg-white">
            <p className="text-base font-bold text-slate-400">No matching orders found in {activeTab}.</p>
            <p className="text-sm text-slate-300 mt-1">Adjust filters or search parameters.</p>
          </div>
        ) : null}

        {/* Pagination Footer */}
        <div className="px-8 py-8 bg-slate-50/40 border-t border-slate-200/60 flex items-center justify-between">
          <div className="flex gap-3">
            <button className="p-3 border border-slate-200 rounded-2xl text-slate-300 bg-white shadow-sm" disabled>
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button className="p-3 border border-slate-200 rounded-2xl text-slate-600 bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Viewing page 1 of 8</p>
        </div>
      </div>
    </div>
  );
};

export default OrdersHub;
