import React, { useState } from 'react';
import { 
  Check, 
  Droplets, 
  FlaskConical, 
  Container, 
  GlassWater, 
  Box, 
  Sparkles, 
  Recycle, 
  ArrowRight, 
  Save 
} from 'lucide-react';

const ProductCard = ({ id, title, desc, icon, selected, onClick }) => (
  <div 
    onClick={() => onClick(id)}
    className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer group h-full ${
      selected 
        ? 'border-blue-600 bg-blue-50/20 shadow-premium-xl' 
        : 'border-slate-100 hover:border-slate-200 bg-white'
    }`}
  >
    {selected && (
      <div className="absolute top-6 right-6 bg-blue-600 text-white rounded-full p-1.5 shadow-lg shadow-blue-600/30">
        <Check className="h-4 w-4" strokeWidth={3} />
      </div>
    )}
    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 ${
      selected ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
    }`}>
      {React.createElement(icon, { size: 32, strokeWidth: 2 })}
    </div>
    <h3 className={`text-xl font-black mb-3 tracking-tight ${selected ? 'text-blue-600' : 'text-slate-900'}`}>
      {title}
    </h3>
    <p className="text-sm font-semibold text-slate-400 leading-relaxed">
      {desc}
    </p>
  </div>
);

const PackagingCard = ({ id, title, desc, icon, premium, selected, onClick }) => (
  <div 
    onClick={() => onClick(id)}
    className={`relative p-6 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer group ${
      selected 
        ? 'border-blue-600 bg-blue-50/20 shadow-premium-lg' 
        : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm'
    }`}
  >
    {selected && (
      <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1 shadow-lg shadow-blue-600/30">
        <Check className="h-3 w-3" strokeWidth={3} />
      </div>
    )}
    <div className="flex flex-col items-center text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-all duration-500 ${
        selected ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-50 text-slate-400'
      }`}>
        {React.createElement(icon, { size: 28, strokeWidth: 2 })}
      </div>
      <div className="flex items-center space-x-2 mb-2">
        <h4 className={`font-black tracking-tight ${selected ? 'text-blue-600' : 'text-slate-900'}`}>{title}</h4>
        {premium && (
          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700">Premium</span>
        )}
      </div>
      <p className="text-[11px] font-semibold text-slate-400 line-clamp-2 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ProductBuilder = () => {
  const [product, setProduct] = useState('coconut');
  const [packaging, setPackaging] = useState('glass');

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 pb-32">
        {/* Left Column (Builder Area) */}
        <div className="lg:col-span-7 space-y-12">
          <header>
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 block">Configuration Module</span>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Product & Packaging</h1>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest block mb-1">25%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complete</span>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-blue-600 w-1/4 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]" />
            </div>
          </header>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center space-x-4">
              <span className="w-10 h-10 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center text-sm font-black shadow-lg">01</span>
              <span className="tracking-tight uppercase text-xs tracking-[0.2em] text-slate-400">Select Product Type</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProductCard 
                id="coconut"
                title="Tender Coconut Water"
                desc="100% pure, natural coconut water with no added sugar or preservatives."
                icon={Droplets}
                selected={product === 'coconut'}
                onClick={setProduct}
              />
              <ProductCard 
                id="concentrate"
                title="Concentrate"
                desc="Highly concentrated coconut base for industrial applications and rehydration."
                icon={FlaskConical}
                selected={product === 'concentrate'}
                onClick={setProduct}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center space-x-4">
              <span className="w-10 h-10 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center text-sm font-black shadow-lg">02</span>
              <span className="tracking-tight uppercase text-xs tracking-[0.2em] text-slate-400">Choose Packaging</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PackagingCard 
                id="pet"
                title="PET Bottle"
                desc="Lightweight, recyclable, and cost-effective for retail."
                icon={Container}
                selected={packaging === 'pet'}
                onClick={setPackaging}
              />
              <PackagingCard 
                id="glass"
                title="Glass Bottle"
                desc="Superior shelf life and premium brand positioning."
                icon={GlassWater}
                premium
                selected={packaging === 'glass'}
                onClick={setPackaging}
              />
              <PackagingCard 
                id="tetra"
                title="Tetra Pack"
                desc="Aseptic packaging for long-term storage without cooling."
                icon={Box}
                selected={packaging === 'tetra'}
                onClick={setPackaging}
              />
            </div>
          </section>
        </div>

        {/* Right Column (Sticky Sidebar) */}
        <div className="lg:col-span-3 space-y-8">
          <div className="sticky top-32 space-y-8">
            {/* Live Estimate Card */}
            <div className="bento-card p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-8">Live Estimation</h3>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-widest">Base Formula</span>
                  <span className="font-black text-slate-900">$0.45 / unit</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-widest">Glass Vessel</span>
                  <span className="font-black text-emerald-600">+$0.18 / unit</span>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Estimated</span>
                    <span className="text-4xl font-black text-[#1e3a8a] leading-none tracking-tight">$0.63</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1">EXW Price</span>
                </div>
              </div>
            </div>

            {/* AI INSIGHTS Card */}
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="h-4 w-4 text-white fill-white" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Intelligence</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Feed</span>
                </div>
              </div>

              <div className="space-y-8 mb-10">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                    <Droplets className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-blue-400 mb-1.5 uppercase tracking-widest">Market Alpha</h4>
                    <p className="text-[11px] font-semibold text-slate-300 leading-relaxed">
                      "Glass vessel demand is projected to surge +24% in EU Nordic clusters."
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                    <Recycle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-400 mb-1.5 uppercase tracking-widest">Sustainability</h4>
                    <p className="text-[11px] font-semibold text-slate-300 leading-relaxed">
                      "Selected vessel offers 100% recyclability, matching EU Green Directives."
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                Optimize Configuration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar (Sticky Footer) */}
      <div className="fixed bottom-0 left-64 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-10 py-6 z-20 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button className="flex items-center space-x-3 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
          <Save className="h-4 w-4" strokeWidth={2.5} />
          <span>Save Draft</span>
        </button>
        <button className="flex items-center space-x-4 px-12 py-3.5 bg-[#0f172a] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 group active:scale-[0.98]">
          <span>Proceed to Step 2</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default ProductBuilder;
