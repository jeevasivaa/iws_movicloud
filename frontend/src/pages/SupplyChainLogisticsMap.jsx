import React, { useState, useMemo } from 'react'
import { 
  Search, 
  Download, 
  Plus, 
  Filter, 
  AlertTriangle,
  Package,
  Warehouse,
  Calendar,
  MoreVertical
} from 'lucide-react'

const INVENTORY_DATA = [
  { id: 1, item: 'Glass Bottles (500ml)', type: 'Packaging', warehouse: 'Alpha-1', stock: 1200, capacity: 10000, expiry: '2027-12-31', status: 'Low' },
  { id: 2, item: 'Natural Sweetener', type: 'Raw Material', warehouse: 'Alpha-2', stock: 45, capacity: 500, expiry: '2026-06-15', status: 'Critical' },
  { id: 3, item: 'Mango Pulp', type: 'Raw Material', warehouse: 'Beta-4', stock: 8500, capacity: 10000, expiry: '2026-04-20', status: 'Adequate' },
  { id: 4, item: 'Capping Seals', type: 'Packaging', warehouse: 'Alpha-1', stock: 800, capacity: 20000, expiry: '2028-01-10', status: 'Critical' },
  { id: 5, item: 'Tender Coconut Water', type: 'Raw Material', warehouse: 'Gamma-2', stock: 15000, capacity: 20000, expiry: '2026-03-25', status: 'Adequate' },
  { id: 6, item: 'Cardboard Shipper', type: 'Packaging', warehouse: 'Alpha-3', stock: 2500, capacity: 5000, expiry: 'N/A', status: 'Adequate' },
  { id: 7, item: 'Aloe Vera Extract', type: 'Raw Material', warehouse: 'Beta-1', stock: 0, capacity: 1000, expiry: '2026-02-10', status: 'Critical' },
]

function SupplyChainLogisticsMap() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredInventory = useMemo(() => {
    return INVENTORY_DATA.filter(item => 
      item.item.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const getStockFormatting = (item) => {
    const percentage = (item.stock / item.capacity) * 100
    const isExpired = item.expiry !== 'N/A' && new Date(item.expiry) < new Date()
    
    if (item.stock === 0 || isExpired) {
      return { text: 'text-red-600', badge: 'badge-error', label: 'Critical' }
    }
    if (percentage < 20) {
      return { text: 'text-amber-600', badge: 'badge-warning', label: 'Low' }
    }
    return { text: 'text-slate-500', badge: 'badge-success', label: 'Adequate' }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Ledger</h1>
          <p className="text-slate-500 font-semibold mt-2">Centralized resource tracking and warehouse logistics.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary text-[11px] uppercase tracking-widest px-8 py-3">
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
          <button className="btn-primary text-[11px] uppercase tracking-widest px-8 py-3 shadow-md">
            <Plus size={16} className="mr-2" />
            Stock Entry
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="vsa-card p-5 bg-white/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border-slate-200/60 rounded-2xl">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search items specification..."
            className="w-full pl-12 pr-5 py-3 bg-slate-100/50 border border-slate-200/60 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 focus:border-[#1e3a8a] outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} />
            Filters
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {filteredInventory.length} Tracking Units
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="vsa-card overflow-hidden border-slate-200/60 shadow-xl rounded-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-200/60">
                <th className="px-8 py-6">Item Specification</th>
                <th className="px-8 py-6">Classification</th>
                <th className="px-8 py-6">Warehouse</th>
                <th className="px-8 py-6 text-right">Stock Level</th>
                <th className="px-8 py-6 text-center">Expiry</th>
                <th className="px-8 py-6 text-center">Health</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const format = getStockFormatting(item)
                return (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-all group">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#1e3a8a] group-hover:bg-blue-50 transition-all duration-300">
                          <Package size={20} />
                        </div>
                        <span className="text-[14px] font-black text-slate-700">{item.item}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 uppercase tracking-widest">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2.5 text-slate-600 font-semibold">
                        <Warehouse size={16} className="text-slate-400" />
                        <span className="text-[14px]">{item.warehouse}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-[15px] font-black ${format.text}`}>
                          {item.stock.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          of {item.capacity.toLocaleString()} Max
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-center">
                      <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-slate-500 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100">
                        <Calendar size={14} className="text-slate-300" />
                        {item.expiry}
                      </div>
                    </td>
                    <td className="px-8 py-7 text-center">
                      <span className={`badge ${format.badge} py-1.5 px-4`}>
                        {format.label}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <button className="p-2.5 text-slate-400 hover:text-[#1e3a8a] hover:bg-slate-100 rounded-2xl transition-all active:scale-90">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="px-8 py-24 text-center bg-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-50 mb-6 border border-slate-100">
              <Search size={28} className="text-slate-200" />
            </div>
            <p className="text-lg font-bold text-slate-400 leading-none">No resource matches found</p>
            <p className="text-sm text-slate-300 mt-2">Try adjusting your specification search.</p>
          </div>
        )}
      </div>

      {/* Critical Stock Alert Banner */}
      <div className="vsa-card p-8 bg-red-50 border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-red-500/5 skew-x-12 translate-x-1/3 pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h4 className="text-lg font-black text-red-900 uppercase tracking-widest mb-1 leading-none">Resource Depletion Alert</h4>
            <p className="text-sm font-semibold text-red-800/70">
              3 mission-critical items have dropped below operational thresholds.
            </p>
          </div>
        </div>
        <button className="px-10 py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95 relative z-10">
          Initiate Reorder
        </button>
      </div>
    </div>
  )
}

export default SupplyChainLogisticsMap
