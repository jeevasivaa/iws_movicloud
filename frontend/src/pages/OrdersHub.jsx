import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const StatusPill = ({ status }) => {
  const styles = {
    New: 'bg-blue-50 text-blue-600 border-blue-100',
    Processing: 'bg-orange-50 text-orange-600 border-orange-100',
    Dispatched: 'bg-purple-50 text-purple-600 border-purple-100',
    Delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.New}`}>
      {status}
    </span>
  );
};

const SparklinePlaceholder = ({ colorClass }) => (
  <div className="w-24 h-10 flex items-end space-x-1">
    {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
      <div 
        key={i} 
        className={`w-full rounded-t-lg ${colorClass} transition-all duration-500 hover:opacity-100`} 
        style={{ height: `${h}%`, opacity: 0.2 + (i * 0.1) }}
      />
    ))}
  </div>
);

const OrdersHub = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('New');
  
  const tabs = [
    { id: 'New', count: 12 },
    { id: 'Processing', count: 8 },
    { id: 'Dispatched', count: 24 },
    { id: 'Delivered', count: 36 },
  ];

  const mockOrders = [
    { id: '#VSA-99023', client: 'Global Refreshments', location: 'London, UK', status: 'New', amount: '$4,250.00', color: 'bg-blue-500', owner: 'operations', timeline: 'Order placed 20m ago' },
    { id: '#VSA-99024', client: 'Oceanic Beverages', location: 'Sydney, AU', status: 'Processing', amount: '$1,820.50', color: 'bg-orange-500', owner: 'operations', timeline: 'QC checkpoint due in 40m' },
    { id: '#VSA-99025', client: 'Alpine Springs', location: 'Zurich, CH', status: 'Dispatched', amount: '$12,400.00', color: 'bg-purple-500', owner: 'all', timeline: 'Departed warehouse at 09:45' },
    { id: '#VSA-99026', client: 'Desert Oasis Co.', location: 'Dubai, UAE', status: 'Delivered', amount: '$940.00', color: 'bg-emerald-500', owner: 'all', timeline: 'Delivered at 14:20, POD uploaded' },
  ];

  const visibleOrders = mockOrders.filter((order) => {
    if (user?.role === ROLES.ADMIN) return true
    if (user?.role === ROLES.OPERATIONS) return true
    if (user?.role === ROLES.FINANCE) return order.owner === 'all'
    return false
  }).filter((order) => order.status === activeTab)

  return (
    <div className="space-y-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Orders Management</h1>
          <p className="text-slate-500 font-semibold tracking-wide">Monitor and manage global beverage distribution flows.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary text-[10px] uppercase tracking-widest px-6 py-3">
            <Download className="h-4 w-4 mr-2" strokeWidth={2.5} />
            <span>Export Report</span>
          </button>
          <button className="btn-primary text-[10px] uppercase tracking-widest px-6 py-3">
            <Plus className="h-4 w-4 mr-2" strokeWidth={2.5} />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 gap-6">
        <div className="flex items-center space-x-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-5 px-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative group ${
                activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>{tab.id}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                }`}>
                  {tab.count}
                </span>
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.3)]" />
              )}
            </button>
          ))}
        </div>
        
        <div className="relative pb-5">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pb-5 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Search Order ID or Client..."
            className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-slate-100/50 border-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bento-card overflow-hidden">
        {/* Table Filters Row */}
        <div className="px-8 py-6 bg-slate-50/30 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-100 rounded-xl pl-5 pr-12 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm">
                <option>All Clients</option>
                <option>Global Markets</option>
                <option>Beverage Co.</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" strokeWidth={2.5} />
            </div>
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-100 rounded-xl pl-5 pr-12 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm">
                <option>Date: Last 7 days</option>
                <option>Last 30 days</option>
                <option>Custom Range</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 rotate-90 pointer-events-none" strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
            Displaying 1-12 of 80 total orders
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 border-b border-slate-50">
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Client Entity</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Operational Flow</th>
                <th className="px-8 py-6">Value</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-8">
                    <span className="text-sm font-black text-slate-900 tracking-tight">{order.id}</span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{order.client}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{order.location}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="px-8 py-8">
                    <div>
                      <SparklinePlaceholder colorClass={order.color} />
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{order.timeline}</p>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-sm font-black text-slate-900 tracking-tight">{order.amount}</span>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-white hover:text-blue-600 hover:shadow-premium-md transition-all active:scale-95">
                      <MoreHorizontal size={18} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="px-8 py-10 text-center text-sm font-semibold text-slate-500">
            No orders found in {activeTab} for your role.
          </div>
        ) : null}

        {/* Pagination Footer */}
        <div className="px-8 py-8 bg-slate-50/20 border-t border-slate-50 flex items-center justify-between">
          <div className="flex space-x-2">
            <button className="p-3 border border-slate-100 rounded-xl text-slate-300 bg-white disabled:opacity-50" disabled>
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button className="p-3 border border-slate-100 rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-all">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {[1, 2, 3, '...', 8].map((p, i) => (
              <button 
                key={i}
                className={`w-10 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  p === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersHub;
