import React from 'react';
import toast from 'react-hot-toast';
import { 
  BrainCircuit, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  Target, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

const InsightCard = ({ title, value, trend, icon, colorClass, description }) => (
  <div className="bento-card p-8 group">
    <div className="flex justify-between items-start mb-8">
      <div className={`p-3.5 rounded-2xl bg-slate-50 ${colorClass} transition-all duration-500 group-hover:bg-white group-hover:shadow-premium-md`}>
        {React.createElement(icon, { size: 24, strokeWidth: 2.5 })}
      </div>
      <div className="flex items-center space-x-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg">
        <TrendingUp size={12} strokeWidth={3} />
        <span>{trend}</span>
      </div>
    </div>
    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</h3>
    <div className="text-3xl font-black text-slate-900 tracking-tight mb-3">{value}</div>
    <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const AIInsights = () => {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Neural Intelligence</h1>
          <p className="text-slate-500 font-semibold tracking-wide flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Predictive clusters active across global supply nodes
          </p>
        </div>
        <div className="flex p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100">
          <button
            type="button"
            onClick={() => toast.success('Showing live feed view')}
            className="px-8 py-2.5 bg-white rounded-xl shadow-premium-sm text-xs font-black uppercase tracking-widest text-slate-900"
          >
            Real-time Feed
          </button>
          <button
            type="button"
            onClick={() => toast('Neural history stream is coming soon')}
            className="px-8 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Neural History
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard 
          title="Predictive Demand"
          value="+24.8%"
          trend="Alpha"
          icon={BrainCircuit}
          colorClass="text-blue-600"
          description="Expected surge in organic categories next week."
        />
        <InsightCard 
          title="Efficiency Score"
          value="94/100"
          trend="Peak"
          icon={Zap}
          colorClass="text-amber-600"
          description="Logistics performance is at an all-time high."
        />
        <InsightCard 
          title="Cost Avoidance"
          value="$12,400"
          trend="Saved"
          icon={Target}
          colorClass="text-emerald-600"
          description="AI-driven route optimization savings."
        />
        <InsightCard 
          title="Risk Index"
          value="Minimal"
          trend="Secure"
          icon={ShieldAlert}
          colorClass="text-purple-600"
          description="No significant disruptions predicted (72h)."
        />
      </div>

      {/* Main Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main AI Panel */}
          <div className="bento-card p-12 bg-[#0f172a] text-white relative overflow-hidden group min-h-[450px] flex flex-col justify-center border-none shadow-2xl shadow-slate-900/40">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none bg-gradient-to-l from-blue-600/20 to-transparent" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-10">
                <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles size={20} className="text-white fill-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Neural Expansion Logic</span>
              </div>
              
              <h2 className="text-5xl font-black mb-8 leading-[1.1] tracking-tight">Strategic Growth <br /><span className="text-blue-500 text-6xl">Alpha Identified</span></h2>
              <p className="text-slate-400 text-xl font-medium max-w-xl leading-relaxed mb-12">
                Predictive models indicate a significant opportunity in EU Nordic clusters. 
                Demand for premium glass vessel products is projected to rise 42%.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => toast.success('Expansion plan created in draft mode')}
                  className="bg-white text-[#0f172a] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center space-x-3 group/btn active:scale-[0.98]"
                >
                  <span>Initiate Expansion Plan</span>
                  <ArrowRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-1.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => toast('Neural raw feed export is not available yet')}
                  className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Neural Raw Feed
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bento-card p-10 group overflow-hidden relative">
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Supply Chain Mapping</h3>
                <Layers size={18} className="text-slate-300" strokeWidth={2.5} />
              </div>
              <div className="aspect-[16/10] rounded-3xl bg-slate-50 relative overflow-hidden flex items-center justify-center border border-slate-100 group-hover:border-blue-100 transition-colors duration-500">
                <div className="absolute inset-0 opacity-[0.07] bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-center bg-no-repeat bg-contain" />
                <div className="relative">
                  <div className="w-6 h-6 bg-blue-600/20 rounded-full animate-ping absolute -inset-2" />
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full relative shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                </div>
              </div>
              <div className="mt-8 flex justify-between items-end relative z-10">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Global Nodes</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">24 Active</span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal</span>
              </div>
            </div>

            <div className="bento-card p-10 flex flex-col group">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory Health</h3>
                <BarChart3 size={18} className="text-slate-300" strokeWidth={2.5} />
              </div>
              <div className="flex-1 space-y-8 flex flex-col justify-center">
                {[
                  { label: 'Raw Materials', val: 88, color: 'bg-blue-600' },
                  { label: 'Finished Goods', val: 62, color: 'bg-emerald-500' },
                  { label: 'Packaging Unit', val: 45, color: 'bg-amber-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2.5">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-900">{item.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-1000 group-hover:shadow-[0_0_8px_rgba(0,0,0,0.1)]`} style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
          <div className="bento-card p-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Optimization Queue</h3>
            <div className="space-y-10">
              {[
                { title: 'Logistics Pivot', desc: 'Consolidate Hub 4 & 5 flows', type: 'High Alpha' },
                { title: 'Re-slotting Logic', desc: 'Shift SKUs to Zone A clusters', type: 'Medium' },
                { title: 'Packaging Swap', desc: 'Transition SKU-22 to eco-PET', type: 'Suggestion' },
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors tracking-tight">{item.title}</h4>
                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.type}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 leading-relaxed mb-5">{item.desc}</p>
                  <button
                    type="button"
                    onClick={() => toast.success(`${item.title} queued for execution`)}
                    className="w-full py-3.5 rounded-xl border border-slate-100 bg-slate-50 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-white hover:text-blue-600 hover:border-blue-100 hover:shadow-premium-md transition-all active:scale-[0.98]"
                  >
                    Execute Node
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card p-8 bg-blue-600 text-white shadow-2xl shadow-blue-600/30 border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-[0.05] rounded-full -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] mb-8 opacity-80">Neural Core Status</h3>
            <div className="space-y-6">
              {[
                { label: 'AI Synthesis', status: 'Optimal' },
                { label: 'Data Sync Hub', status: 'Live' },
                { label: 'Neural Engine', status: 'Steady' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <span className="text-[11px] font-bold text-blue-100">{item.label}</span>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse" />
                    <span className="text-xs font-black tracking-tight">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 p-5 bg-white/10 rounded-2xl border border-white/5 group-hover:bg-white/[0.15] transition-colors duration-500">
              <p className="text-[11px] font-semibold text-blue-50 leading-relaxed">
                All systems operating at 100% capacity. No latency detected in global supply nodes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
