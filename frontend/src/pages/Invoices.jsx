import { useMemo, useState } from 'react'
import { 
  FileText, 
  Search, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react'

const PENDING_INVOICES = [
  { id: 'ORD-2041', client: 'Fresh Gulf Retail', value: 167560, gst: 30160.8, status: 'Approval', date: 'Mar 22' },
  { id: 'ORD-2038', client: 'Hydra Wellness Co.', value: 80240, gst: 14443.2, status: 'Draft', date: 'Mar 21' },
  { id: 'ORD-2035', client: 'Urban Nature Drinks', value: 108560, gst: 19540.8, status: 'Sent', date: 'Mar 19' },
  { id: 'ORD-2032', client: 'Pure Sip Waters', value: 45000, gst: 8100.0, status: 'Draft', date: 'Mar 18' },
]

const RECENT_EXPENSES = [
  { desc: 'Raw Material Purchase', amount: 4200, date: 'Today', trend: 'up' },
  { desc: 'Warehouse Electricity', amount: 800, date: 'Yesterday', trend: 'down' },
  { desc: 'Staff Payroll - Mar', amount: 25000, date: 'Mar 15', trend: 'stable' },
]

function Invoices() {
  const [query, setQuery] = useState('')

  const filteredInvoices = useMemo(() => {
    return PENDING_INVOICES.filter(inv => 
      inv.client.toLowerCase().includes(query.toLowerCase()) || 
      inv.id.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance Control</h1>
          <p className="text-sm font-semibold text-slate-500">Revenue tracking and GST compliance terminal.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-[10px] uppercase tracking-widest px-6">
            Export Ledger
          </button>
          <button className="btn-primary text-[10px] uppercase tracking-widest px-6">
            <Plus className="w-3.5 h-3.5" />
            New Entry
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: '₹14,28,400', icon: DollarSign, color: 'text-[#1e3a8a]', trend: '+12.5%' },
          { label: 'Receivables', value: '₹3,42,000', icon: Clock, color: 'text-amber-600', trend: '+2.1%' },
          { label: 'Total Expenses', value: '₹8,12,500', icon: TrendingUp, color: 'text-red-600', trend: '-4.3%' },
          { label: 'GST Collected', value: '₹2,57,112', icon: Percent, color: 'text-teal-600', trend: '+8.4%' },
        ].map((kpi, i) => (
          <div key={i} className="vsa-card p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-xl">
                <kpi.icon className="w-5 h-5 text-slate-400" />
              </div>
              <span className={`badge ${kpi.trend.startsWith('+') ? 'badge-success' : 'badge-error'}`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Pending Invoices & Ledger */}
        <div className="flex-[2] vsa-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
            <h2 className="text-lg font-black text-slate-900">Active Ledger</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search ledger..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 focus:border-[#1e3a8a] outline-none w-64 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">ID / Date</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4 text-right">Value</th>
                  <th className="px-6 py-4 text-right">GST (18%)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-black text-slate-900">{inv.id}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{inv.date}</p>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-semibold text-slate-600">{inv.client}</td>
                    <td className="px-6 py-4 text-[13px] font-black text-slate-900 text-right">₹{inv.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-400 text-right">₹{inv.gst.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge ${
                        inv.status === 'Sent' ? 'badge-success' :
                        inv.status === 'Draft' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                        'badge-info'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 transition-colors">
                        Generate GST
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Cash Flow Overview */}
        <div className="flex-1 space-y-6">
          <div className="vsa-card p-6 bg-white">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Velocity Insight
            </h3>
            
            {/* Minimal Bar Chart */}
            <div className="h-40 flex items-end justify-between gap-2 mb-8 px-2">
              {[40, 70, 45, 90, 65, 80, 55, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative group">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-[#1e3a8a] rounded-t-lg transition-all duration-500 group-hover:bg-teal-500" 
                    style={{ height: `${h}%` }} 
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Recent Outflow</h4>
              {RECENT_EXPENSES.map((exp, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 group cursor-pointer hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      exp.trend === 'up' ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-500'
                    }`}>
                      {exp.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 leading-none mb-1">{exp.desc}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{exp.date}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-slate-900">₹{exp.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 flex items-center justify-center gap-2">
              Detailed Ledger
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-[#1e3a8a] p-8 rounded-xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-300/80 mb-6">GST Compliance</p>
            <div className="flex items-end justify-between mb-2">
              <h4 className="text-xl font-black">Q1 Filing Ready</h4>
              <span className="text-teal-400 text-[10px] font-black tracking-widest">98% SYNC</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-8">
              <div className="h-full bg-teal-400 w-[98%] shadow-[0_0_12px_rgba(45,212,191,0.5)]" />
            </div>
            <button className="w-full py-3.5 bg-white text-[#1e3a8a] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-900/40 active:scale-95">
              Initiate GSTR-1
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Percent = ({ className, size = 16 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
)

export default Invoices
