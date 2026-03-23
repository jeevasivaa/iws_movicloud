import React from 'react'
import { 
  TrendingUp, 
  Activity, 
  Package, 
  Zap, 
  ArrowUpRight, 
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Plus
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts'
import { useAuth } from '../context/useAuth'

const SALES_DATA = [
  { name: 'Jan', value: 42000 },
  { name: 'Feb', value: 38000 },
  { name: 'Mar', value: 52000 },
  { name: 'Apr', value: 48000 },
  { name: 'May', value: 61000 },
  { name: 'Jun', value: 55000 },
]

const PRODUCTION_DATA = [
  { name: 'Mon', value: 2400 },
  { name: 'Tue', value: 3200 },
  { name: 'Wed', value: 2800 },
  { name: 'Thu', value: 3800 },
  { name: 'Fri', value: 4100 },
  { name: 'Sat', value: 3500 },
  { name: 'Sun', value: 3000 },
]

const KPICard = ({ title, value, trend, icon, isWarning }) => (
  <div className={`vsa-card p-6 group transition-all duration-300 ${isWarning ? 'border-red-200 ring-4 ring-red-50' : 'hover:shadow-md hover:border-slate-300'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl transition-colors ${isWarning ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400 group-hover:text-[#1e3a8a]'}`}>
        {React.createElement(icon, { size: 20 })}
      </div>
      {trend && (
        <span className={`badge ${
          trend.startsWith('+') ? 'badge-success' : 'badge-error'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-slate-900">{value}</h3>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'User'} 👋
          </h1>
          <p className="text-slate-500 font-semibold mt-1">
            Secure Terminal Portal • Station Beta-9
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary text-[10px] uppercase tracking-widest px-6">
            Generate Report
          </button>
          <button className="btn-primary text-[10px] uppercase tracking-widest px-6 shadow-sm">
            Quick Action
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value="₹3,02,000" 
          trend="+12.5%" 
          icon={DollarSign} 
        />
        <KPICard 
          title="Active Orders" 
          value="48" 
          trend="+8 today" 
          icon={Package} 
        />
        <KPICard 
          title="Production Batches" 
          value="12" 
          trend="In Progress" 
          icon={Activity} 
        />
        <KPICard 
          title="Low Stock Items" 
          value="7" 
          trend="Critical" 
          icon={AlertTriangle} 
          isWarning={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Monthly Sales Bar Chart */}
            <div className="vsa-card p-6 h-[350px]">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Monthly Sales</h4>
                <div className="badge badge-success px-2 py-1">Optimal</div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontWeight: 700,
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Production Output Line Chart */}
            <div className="vsa-card p-6 h-[350px]">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Production Output</h4>
                <div className="badge badge-info px-2 py-1">Stable</div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PRODUCTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontWeight: 700,
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#1e3a8a" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Additional Operational Area */}
          <div className="vsa-card p-8 bg-[#1e3a8a] text-white relative overflow-hidden shadow-lg shadow-blue-900/10">
            <div className="absolute top-0 right-0 w-[45%] h-full bg-white/5 skew-x-12 translate-x-1/4 pointer-events-none backdrop-blur-[2px]" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6">
                  <Zap size={14} className="text-teal-400 fill-teal-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Intelligence Core</span>
                </div>
                <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight max-w-md">Demand Spike Detected for Q3 Cycle</h2>
                <p className="text-blue-100/80 text-lg font-medium max-w-lg leading-relaxed">
                  Logistics reallocation recommended for Sector 4 based on 14-day cycle velocity.
                </p>
              </div>
              <button className="bg-white text-[#1e3a8a] px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-xl shadow-blue-900/40 active:scale-95 shrink-0 self-start md:self-center">
                <span>View Details</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="vsa-card p-10 flex flex-col h-full">
          <h2 className="text-xl font-black text-slate-900 mb-10 tracking-tight flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a]" />
            AI Operations Insights
          </h2>
          <div className="flex-1 space-y-10">
            {[
              { 
                title: 'Efficiency Calibration', 
                desc: 'Line B is operating at 62% efficiency. Reassigning available staff to Station 4 could increase throughput by 12%.',
                color: 'text-blue-600'
              },
              { 
                title: 'Revenue Projection', 
                desc: 'Current order velocity predicts a 15% increase in month-end revenue compared to Q1 baseline.',
                color: 'text-teal-600'
              },
              { 
                title: 'Stock Optimization', 
                desc: 'Glass bottle supply chain update: Scheduled delivery tomorrow at 09:00 AM will resolve current critical alerts.',
                color: 'text-amber-600'
              },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-black text-[13px] uppercase tracking-widest ${item.color}`}>{item.title}</h4>
                </div>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed group-hover:text-slate-900 transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <button className="w-full mt-12 py-4 border border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-200 hover:text-[#1e3a8a] transition-all bg-slate-50/50">
            View Analytics Detail
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
