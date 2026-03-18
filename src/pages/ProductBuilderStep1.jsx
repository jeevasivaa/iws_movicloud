import { useState } from 'react'
import { Link } from 'react-router-dom'

function ProductBuilderStep1() {
  const [selectedProduct, setSelectedProduct] = useState('tender-coconut')
  const [selectedPackaging, setSelectedPackaging] = useState('glass-bottle')

  /* Compute price estimate based on selections */
  const basePrices = { 'tender-coconut': 0.45, concentrate: 0.62 }
  const packagingPrices = { 'pet-bottle': 0.10, 'glass-bottle': 0.18, 'tetra-pack': 0.12 }
  const packagingLabels = { 'pet-bottle': 'PET Packaging', 'glass-bottle': 'Glass Packaging', 'tetra-pack': 'Tetra Packaging' }

  const basePrice = basePrices[selectedProduct] || 0.45
  const packagingPrice = packagingPrices[selectedPackaging] || 0.18
  const totalPrice = (basePrice + packagingPrice).toFixed(2)

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Top Navigation */}
        <header className="flex items-center justify-between border-b border-primary/10 bg-white dark:bg-background-dark px-6 md:px-20 py-4 sticky top-0 z-50" style={{ borderColor: 'rgba(26, 53, 91, 0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#1a355b' }}>
              <span className="material-symbols-outlined">temp_preferences_custom</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: '#1a355b' }}>VSA Foods</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/orders" className="flex items-center justify-center rounded-lg h-10 w-10 hover:opacity-80 transition-colors" style={{ backgroundColor: 'rgba(26, 53, 91, 0.1)', color: '#1a355b' }}>
              <span className="material-symbols-outlined">shopping_cart</span>
            </Link>
            <button className="flex items-center justify-center rounded-lg h-10 w-10 hover:opacity-80 transition-colors" style={{ backgroundColor: 'rgba(26, 53, 91, 0.1)', color: '#1a355b' }}>
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </header>
        <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Progress Header */}
            <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border" style={{ borderColor: 'rgba(26, 53, 91, 0.05)' }}>
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm uppercase tracking-wider" style={{ color: '#1a355b' }}>Step 1 of 4</span>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Product &amp; Packaging</h1>
                </div>
                <p className="text-slate-500 font-medium">25% Complete</p>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(26, 53, 91, 0.1)' }}>
                <div className="h-full w-1/4 rounded-full" style={{ backgroundColor: '#1a355b' }}></div>
              </div>
            </div>
            {/* Product Selection */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ color: '#1a355b' }}>category</span>
                <h2 className="text-xl font-bold">Select Product Type</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1 - Tender Coconut Water */}
                <div
                  className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl p-5 cursor-pointer hover:shadow-md transition-all border-2 ${
                    selectedProduct === 'tender-coconut' ? '' : 'border-transparent hover:border-primary/30'
                  }`}
                  style={selectedProduct === 'tender-coconut' ? { borderColor: '#1a355b' } : {}}
                  onClick={() => setSelectedProduct('tender-coconut')}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 53, 91, 0.1)', color: '#1a355b' }}>
                      <span className="material-symbols-outlined text-3xl">water_drop</span>
                    </div>
                    {selectedProduct === 'tender-coconut' && (
                      <div className="text-white w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a355b' }}>
                        <span className="material-symbols-outlined text-sm">check</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1">Tender Coconut Water</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">100% pure, natural coconut water with no added sugar or preservatives.</p>
                </div>
                {/* Card 2 - Concentrate */}
                <div
                  className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl p-5 cursor-pointer hover:shadow-md transition-all border-2 ${
                    selectedProduct === 'concentrate' ? '' : 'border-transparent hover:border-primary/30'
                  }`}
                  style={selectedProduct === 'concentrate' ? { borderColor: '#1a355b' } : {}}
                  onClick={() => setSelectedProduct('concentrate')}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 53, 91, 0.1)', color: '#1a355b' }}>
                      <span className="material-symbols-outlined text-3xl">liquor</span>
                    </div>
                    {selectedProduct === 'concentrate' && (
                      <div className="text-white w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a355b' }}>
                        <span className="material-symbols-outlined text-sm">check</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1">Concentrate</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Highly concentrated coconut base for industrial applications and rehydration.</p>
                </div>
              </div>
            </section>
            {/* Packaging Selection */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ color: '#1a355b' }}>package_2</span>
                <h2 className="text-xl font-bold">Choose Packaging</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Packaging 1 - PET Bottle */}
                <div
                  className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden transition-all cursor-pointer group ${
                    selectedPackaging === 'pet-bottle' ? 'border-2 hover:shadow-md' : 'border border-slate-200 dark:border-slate-800 hover:shadow-md'
                  }`}
                  style={selectedPackaging === 'pet-bottle' ? { borderColor: '#1a355b' } : {}}
                  onClick={() => setSelectedPackaging('pet-bottle')}
                >
                  <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className={`material-symbols-outlined text-5xl transition-colors ${selectedPackaging === 'pet-bottle' ? '' : 'text-slate-400 group-hover:text-primary'}`} style={selectedPackaging === 'pet-bottle' ? { color: '#1a355b' } : {}}>pill</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold">PET Bottle</h4>
                    <p className="text-xs text-slate-500 mt-1">Lightweight, recyclable, and cost-effective for retail.</p>
                  </div>
                </div>
                {/* Packaging 2 - Glass Bottle */}
                <div
                  className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden transition-all cursor-pointer group ${
                    selectedPackaging === 'glass-bottle' ? 'border-2 hover:shadow-md' : 'border border-slate-200 dark:border-slate-800 hover:shadow-md'
                  }`}
                  style={selectedPackaging === 'glass-bottle' ? { borderColor: '#1a355b' } : {}}
                  onClick={() => setSelectedPackaging('glass-bottle')}
                >
                  <div className="h-32 flex items-center justify-center" style={{ backgroundColor: selectedPackaging === 'glass-bottle' ? 'rgba(26, 53, 91, 0.05)' : '' }}>
                    <span className="material-symbols-outlined text-5xl" style={{ color: '#1a355b' }}>wine_bar</span>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold">Glass Bottle</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(26, 53, 91, 0.1)', color: '#1a355b' }}>PREMIUM</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Superior shelf life and premium brand positioning.</p>
                  </div>
                </div>
                {/* Packaging 3 - Tetra Pack */}
                <div
                  className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden transition-all cursor-pointer group ${
                    selectedPackaging === 'tetra-pack' ? 'border-2 hover:shadow-md' : 'border border-slate-200 dark:border-slate-800 hover:shadow-md'
                  }`}
                  style={selectedPackaging === 'tetra-pack' ? { borderColor: '#1a355b' } : {}}
                  onClick={() => setSelectedPackaging('tetra-pack')}
                >
                  <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className={`material-symbols-outlined text-5xl transition-colors ${selectedPackaging === 'tetra-pack' ? '' : 'text-slate-400 group-hover:text-primary'}`} style={selectedPackaging === 'tetra-pack' ? { color: '#1a355b' } : {}}>box</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold">Tetra Pack</h4>
                    <p className="text-xs text-slate-500 mt-1">Aseptic packaging for long-term storage without cooling.</p>
                  </div>
                </div>
              </div>
            </section>
            <div className="flex justify-between items-center pt-6 border-t mt-4" style={{ borderColor: 'rgba(26, 53, 91, 0.1)' }}>
              <button className="px-6 py-2.5 rounded-lg border font-bold transition-colors" style={{ borderColor: 'rgba(26, 53, 91, 0.2)', color: '#1a355b' }}>
                Save Draft
              </button>
              <button className="px-8 py-2.5 rounded-lg text-white font-bold transition-colors shadow-lg flex items-center gap-2" style={{ backgroundColor: '#1a355b', boxShadow: '0 10px 25px -5px rgba(26, 53, 91, 0.2)' }}>
                Next Step
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex flex-col gap-6">
            {/* Price Estimation Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: 'rgba(26, 53, 91, 0.05)' }}>
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ backgroundColor: 'rgba(26, 53, 91, 0.05)', borderColor: 'rgba(26, 53, 91, 0.05)' }}>
                <span className="material-symbols-outlined text-xl" style={{ color: '#1a355b' }}>payments</span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Live Estimate</h3>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Base Price ({selectedProduct === 'tender-coconut' ? 'Tender' : 'Concentrate'})</span>
                  <span className="font-medium">${basePrice.toFixed(2)}/unit</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">{packagingLabels[selectedPackaging]}</span>
                  <span className="font-medium">+${packagingPrice.toFixed(2)}/unit</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                <div className="flex justify-between items-end">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">Total Estimated</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: '#1a355b' }}>${totalPrice}</p>
                    <p className="text-[10px] text-slate-400">per unit EXW</p>
                  </div>
                </div>
              </div>
            </div>
            {/* AI Recommendations */}
            <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden text-white">
              <div className="px-5 py-4 bg-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400">smart_toy</span>
                  <h3 className="font-bold text-sm uppercase tracking-wider">AI Insights</h3>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg h-fit">
                    <span className="material-symbols-outlined text-blue-400 text-sm">lightbulb</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-blue-300">Market Suggestion</p>
                    <p className="text-sm text-slate-300 leading-relaxed">"Glass packaging is trending +24% for premium beverage exports in the EU."</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg h-fit">
                    <span className="material-symbols-outlined text-purple-400 text-sm">eco</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-purple-300">Sustainability</p>
                    <p className="text-sm text-slate-300 leading-relaxed">Glass offers 100% recyclability, matching your eco-friendly brand goals.</p>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-colors">
                  Apply Optimized Setup
                </button>
              </div>
            </div>
            {/* Helpful Tip */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(26, 53, 91, 0.05)', borderColor: 'rgba(26, 53, 91, 0.1)' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#1a355b' }}>
                <strong>Pro Tip:</strong> Shipping Tetra Packs can reduce logistics costs by up to 15% due to stackability.
              </p>
            </div>
          </aside>
        </main>
        {/* Footer Info */}
        <footer className="mt-auto px-6 md:px-20 py-6 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm" style={{ borderColor: 'rgba(26, 53, 91, 0.1)' }}>
          <p>© 2024 VSA Foods Industrial Co. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="hover:text-primary transition-colors" href="#">Help Center</a>
            <a className="hover:text-primary transition-colors" href="#">Sourcing Standards</a>
            <a className="hover:text-primary transition-colors" href="#">Contact Expert</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default ProductBuilderStep1
