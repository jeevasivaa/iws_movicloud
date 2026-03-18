import React from 'react';
import { 
  TrendingUp, 
  Activity, 
  Truck, 
  Package, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

const KPICard = ({ title, value, trend, icon, colorClass }) => (
  <div className="bento-card p-8 group overflow-hidden relative">
    {/* Subtle gradient overlay on hover */}
    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-premium-md transition-all duration-300`}>
        {React.createElement(icon, { size: 24, strokeWidth: 2.5 })}
      </div>
      {trend && (
        <span className={`flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
          trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-10">
      {/* Header with quick stats or actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Operational Hub</h1>
          <p className="text-slate-500 font-semibold tracking-wide flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System Live: Monitoring 1,240 active data points
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary text-xs uppercase tracking-widest px-8">Export Intelligence</button>
          <button className="btn-primary text-xs uppercase tracking-widest px-8">Quick Action</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Active Orders" 
          value="124 Units" 
          trend="+12%" 
          icon={Package} 
          colorClass="from-blue-500 to-blue-600"
        />
        <div className="bento-card p-8 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-premium-md transition-all duration-300">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600">Optimal</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Production Load</p>
            <div className="flex items-end justify-between mb-3">
              <h3 className="text-3xl font-black text-slate-900">88%</h3>
              <span className="text-[10px] font-bold text-slate-400">Peak Capacity</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full group-hover:bg-orange-500 transition-colors duration-500" style={{ width: '88%' }}></div>
            </div>
          </div>
        </div>
        <KPICard 
          title="Global Transit" 
          value="14 Hubs" 
          trend="Live" 
          icon={Truck} 
          colorClass="from-emerald-500 to-emerald-600"
        />
        <KPICard 
          title="Health Index" 
          value="42% Margin" 
          trend="Stable" 
          icon={ShieldCheck} 
          colorClass="from-purple-500 to-purple-600"
        />
      </div>

      {/* Central Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bento-card p-10 bg-[#0f172a] text-white relative overflow-hidden group min-h-[450px] flex flex-col justify-center border-none">
          {/* Decorative geometric elements */}
          <div className="absolute top-0 right-0 w-[40%] h-full bg-blue-600/10 skew-x-12 translate-x-1/2 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-10">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/40">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">AI Intelligence Core</span>
            </div>
            
            <h2 className="text-5xl font-black mb-8 leading-[1.1] tracking-tight">Demand Spike <br /><span className="text-blue-500">Predicted for Q3</span></h2>
            <p className="text-slate-400 text-xl font-medium max-w-xl leading-relaxed mb-12">
              Our neural models indicate a 24% increase in organic demand over the next 14 days. 
              Suggesting immediate logistics reallocation for Sector 4.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-[#0f172a] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center space-x-3 group/btn">
                <span>Calibrate Strategy</span>
                <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
              <button className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                Access Raw Feed
              </button>
            </div>
          </div>
        </div>

        <div className="bento-card p-10 flex flex-col">
          <h2 className="text-xl font-black text-slate-900 mb-10 tracking-tight">Cost Efficiency</h2>
          <div className="flex-1 space-y-8">
            {[
              { title: 'Logistics Pivot', desc: 'Consolidate Hub 4 & 5', save: '$1.2k', color: 'text-blue-600' },
              { title: 'Energy Shaving', desc: 'Off-peak sterilization', save: '$2.4k', color: 'text-emerald-600' },
              { title: 'Waste Protocol', desc: 'Calibrate Line B sensors', save: '$850', color: 'text-orange-600' },
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{item.title}</h4>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.save}</span>
                </div>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-12 py-5 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-200 hover:text-blue-600 transition-all">
            Unlock Full Optimization
          </button>
        </div>
      </div>

      {/* Footer Section: Order Lifecycle */}
      <div className="bento-card p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Lifecycle</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Tracking Unit #VSA-99023</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status:</span>
            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">In Production</span>
          </div>
        </div>

        <div className="relative py-4">
          <div className="absolute top-[41px] left-0 w-full h-1 bg-slate-50 z-0">
            <div className="h-full bg-blue-600 w-1/2 rounded-full shadow-lg shadow-blue-500/20 transition-all duration-1000" />
          </div>

          <div className="relative z-10 flex justify-between items-start">
            {[
              { label: 'Placed', info: '09:00 AM', status: 'done' },
              { label: 'Allocated', info: '11:30 AM', status: 'done' },
              { label: 'Production', info: 'Active', status: 'active' },
              { label: 'Shipped', info: 'Scheduled', status: 'pending' },
              { label: 'Delivered', info: 'Estimated', status: 'pending' },
            ].map((node, i) => (
              <div key={i} className="flex flex-col items-center group/node">
                <div className={`w-5 h-5 rounded-full border-4 mb-5 transition-all duration-500 ${
                  node.status === 'done' 
                    ? 'bg-blue-600 border-white ring-4 ring-blue-50' 
                    : node.status === 'active'
                    ? 'bg-white border-[#0f172a] ring-4 ring-slate-100 shadow-xl'
                    : 'bg-white border-slate-100'
                }`}>
                  {node.status === 'done' && <CheckCircle2 className="h-full w-full text-white p-0.5" />}
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${
                  node.status === 'pending' ? 'text-slate-300' : 'text-slate-900'
                }`}>
                  {node.label}
                </h4>
                <p className={`text-[10px] font-bold ${
                  node.status === 'active' ? 'text-blue-500' : 'text-slate-400'
                }`}>
                  {node.info}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
