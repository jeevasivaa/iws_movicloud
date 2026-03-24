import { Link } from 'react-router-dom'

function SmartDashboard() {
  /* KPI data for dynamic rendering */
  const kpiCards = [
    {
      icon: 'shopping_cart',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-blue-500',
      trendIcon: 'trending_up',
      trendText: '12%',
      trendColor: 'text-green-500',
      label: 'Active Orders',
      value: '124',
      unit: 'units',
      footer: '18 pending fulfillment',
    },
    {
      icon: 'precision_manufacturing',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      borderColor: 'border-l-amber-500',
      trendIcon: 'horizontal_rule',
      trendText: 'Steady',
      trendColor: 'text-amber-500',
      label: 'Production Status',
      value: '88%',
      unit: 'capacity',
      progressWidth: '88%',
      progressColor: 'bg-amber-500',
    },
    {
      icon: 'local_shipping',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      borderColor: 'border-l-emerald-500',
      trendIcon: 'check_circle',
      trendText: 'On Track',
      trendColor: 'text-emerald-500',
      label: 'Shipments in Transit',
      value: '14',
      unit: 'active',
      footer: '3 due for delivery today',
    },
    {
      icon: 'inventory_2',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
      borderColor: 'border-l-purple-500',
      trendIcon: 'warning',
      trendText: 'Low Stock',
      trendColor: 'text-red-500',
      label: 'Inventory Reserved',
      value: '42%',
      unit: 'utilization',
      footer: 'Reorder triggered for 5 items',
    },
  ]

  const inventoryItems = [
    { icon: 'grain', name: 'Organic Wheat Flour', qty: '2.4k kg', width: '45%', color: 'bg-primary' },
    { icon: 'opacity', name: 'Sunflower Oil', qty: '850 L', width: '15%', color: 'bg-red-500' },
    { icon: 'egg_alt', name: 'Pasteurized Eggs', qty: '12.8k pcs', width: '82%', color: 'bg-green-500' },
  ]

  const costOptimizations = [
    { title: 'Logistics Consolidation', saving: 'Save $1.2k', description: 'Combine shipments #882 and #884 to reduce last-mile overhead.' },
    { title: 'Energy Peak Shaving', saving: 'Save $400', description: 'Schedule high-power production blocks before 4:00 PM today.' },
    { title: 'Waste Reduction', saving: 'Save 15%', description: 'Recalibrate sorting sensors in Line B to minimize yield loss.' },
  ]

  const orderTimeline = [
    { icon: 'receipt_long', label: 'Placed', date: 'Oct 12, 09:14 AM', active: true },
    { icon: 'inventory', label: 'Allocated', date: 'Oct 12, 01:45 PM', active: true, highlight: true },
    { icon: 'factory', label: 'In Production', date: 'Oct 13, 08:30 AM', active: true, highlight: true },
    { icon: 'local_shipping', label: 'Shipped', date: 'Est. Oct 15', active: false },
    { icon: 'check_circle', label: 'Delivered', date: '--', active: false },
  ]

  return (
    <div className="font-display text-sm text-slate-900 dark:text-slate-100" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f6f7f8' }}>
      <div className="flex h-screen overflow-hidden">
        {/* Side Navigation */}
        <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="rounded-lg p-2 text-white" style={{ backgroundColor: '#1a355b' }}>
              <span className="material-symbols-outlined text-2xl">restaurant</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none" style={{ color: '#1a355b' }}>VSA Foods</h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Enterprise</p>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            <Link to="/smart-dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold" style={{ backgroundColor: 'rgba(26, 53, 91, 0.1)', color: '#1a355b' }}>
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">package_2</span>
              <span>Active Orders</span>
            </Link>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
              <span className="material-symbols-outlined">factory</span>
              <span>Production</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
              <span className="material-symbols-outlined">warehouse</span>
              <span>Inventory</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
              <span className="material-symbols-outlined">local_shipping</span>
              <span>Shipments</span>
            </a>
            <div className="pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Intelligence</div>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
              <span className="material-symbols-outlined" style={{ color: '#1a355b' }}>auto_awesome</span>
              <span>AI Insights</span>
            </a>
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <Link to="/orders" className="w-full text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: '#1a355b' }}>
              <span className="material-symbols-outlined text-sm">add</span>
              <span>New Order</span>
            </Link>
          </div>
        </aside>
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-4 w-96">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20" placeholder="Search orders, SKU or analytics..." type="text" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="text-slate-500 hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
              </button>
              <button className="text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
              <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-800"></div>
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">James Wilson</p>
                  <p className="text-[10px] text-slate-500 font-medium">Operations Manager</p>
                </div>
                <img
                  className="h-10 w-10 rounded-full border-2"
                  style={{ borderColor: 'rgba(26, 53, 91, 0.2)' }}
                  alt="User profile avatar of James Wilson"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCya0lChFqMD4a6RTjpiQQlIzspN6P8OHO3ayuQ2xP-IvLLpyx1Z9wR316RN5MKSCgWN1ex-HHwUvWaNB_d0pEPpg7w45fdlzoicDt7M7JGoWvEJ71Sbsup4DwR_teIKQpaySk2YswIG5l7hjBZT_wh3Q7F4S0liVE0sx_Ol4cJXvfj-wdHfI2Qj_9ggaNzW75DijVaYDdPcLLigyKEgDZ9kEFKEVsMRjZEuyLC7a2w7_TfpWrWKg693elQQknez5ro58gq-a6fglY"
                />
              </div>
            </div>
          </header>
          {/* Dashboard Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Hero Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">Operational Overview</h2>
                <p className="text-slate-500 mt-1 italic font-medium">Live data feed from supply chain clusters</p>
              </div>
              <div className="flex gap-2 text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                <button className="px-4 py-1.5 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm">Real-time</button>
                <button className="px-4 py-1.5">Last 24h</button>
                <button className="px-4 py-1.5">Weekly</button>
              </div>
            </div>
            {/* Glassmorphic KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiCards.map((kpi, i) => (
                <div key={i} className={`glass-card p-6 rounded-xl shadow-sm border-l-4 ${kpi.borderColor}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 ${kpi.iconBg} rounded-lg ${kpi.iconColor}`}>
                      <span className="material-symbols-outlined">{kpi.icon}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${kpi.trendColor} flex items-center gap-0.5`}>
                      <span className="material-symbols-outlined text-[12px]">{kpi.trendIcon}</span> {kpi.trendText}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold">{kpi.label}</p>
                  <h3 className="text-lg font-black">{kpi.value} <span className="text-xs font-normal text-slate-400">{kpi.unit}</span></h3>
                  {kpi.progressWidth ? (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className={`${kpi.progressColor} h-full rounded-full`} style={{ width: kpi.progressWidth }}></div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-2">{kpi.footer}</p>
                  )}
                </div>
              ))}
            </div>
            {/* AI Insight Panel */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="material-symbols-outlined" style={{ color: '#1a355b' }}>auto_awesome</span>
                <h2 className="text-base font-bold tracking-tight">AI Insight Panel</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-primary to-[#2a4d7d] rounded-xl p-8 text-white relative overflow-hidden shadow-xl" style={{ background: 'linear-gradient(to bottom right, #1a355b, #2a4d7d)' }}>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="max-w-md">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">Predictive Analysis</span>
                      <h3 className="text-lg font-bold mb-2">Demand Spike Predicted</h3>
                      <p className="text-blue-100 text-xs leading-relaxed">AI models predict a 24% increase in organic grain demand over the next 14 days due to seasonal market shifts. Suggesting immediate inventory allocation.</p>
                    </div>
                    <div className="mt-8 flex gap-4">
                      <button className="bg-white px-6 py-2.5 rounded-lg font-bold text-xs shadow-lg hover:bg-blue-50 transition-colors" style={{ color: '#1a355b' }}>Adjust Strategy</button>
                      <button className="bg-transparent border border-white/30 text-white px-6 py-2.5 rounded-lg font-bold text-xs hover:bg-white/10 transition-colors">View Details</button>
                    </div>
                  </div>
                  <div className="absolute right-[-40px] bottom-[-40px] opacity-10">
                    <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">savings</span> Cost Optimization
                  </h3>
                  <div className="space-y-4">
                    {costOptimizations.map((item, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>{item.title}</span>
                          <span className="text-emerald-500">{item.saving}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            {/* Order Lifecycle Timeline */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-base font-bold tracking-tight">Recent Order Lifecycle</h2>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Order #VSA-99023</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                <div className="relative flex justify-between items-center">
                  {/* Connecting Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 z-0"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2/3 h-1 z-0" style={{ backgroundColor: '#1a355b' }}></div>
                  {orderTimeline.map((step, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 ${
                          step.active
                            ? 'text-white shadow-lg'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}
                        style={step.active ? { backgroundColor: '#1a355b' } : {}}
                      >
                        <span className="material-symbols-outlined text-sm">{step.icon}</span>
                      </div>
                      <p className={`mt-3 text-xs font-bold ${step.highlight ? '' : step.active ? '' : 'text-slate-400'}`} style={step.highlight ? { color: '#1a355b' } : {}}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-500">{step.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {/* Table or Secondary Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold">Inventory Levels</h3>
                  <button className="text-xs font-bold hover:underline" style={{ color: '#1a355b' }}>Full Report</button>
                </div>
                <div className="p-5 space-y-4">
                  {inventoryItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-500">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>{item.name}</span>
                          <span>{item.qty}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full`} style={{ width: item.width }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold mb-4">Shipment Mapping</h3>
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-20 bg-cover bg-center"
                      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClcFAWNFfay0aoPRU99x1hTP8Vr_Dp8apPevgy42IPrqoR9tMO6Ieg6EdHytepYqRkUdlyL5PNvv-aBcZo_tL5gM1UoDZo9Tl4HOH7-WAdnSjWltuKQcHpQsS9CEacAPigEhe07scFQb68VN8NmxiAdLo8mZMxElN1LsiZAmaUz6HY2XWHHr4eR52Cg9PaE5ppArpMRwrrvyOq3klfvQ3WizFjePku4ncPrmqZjtTFdtVKcadrJqgCDf2EZwde6S34hbJhnmEJlks')" }}
                    ></div>
                    <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                      <span className="material-symbols-outlined text-xl" style={{ color: '#1a355b', fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      <div className="bg-white dark:bg-slate-700 text-[10px] font-bold px-2 py-0.5 rounded shadow mt-1">Chicago DC</div>
                    </div>
                    <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center">
                      <span className="material-symbols-outlined text-xl" style={{ color: '#1a355b', fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      <div className="bg-white dark:bg-slate-700 text-[10px] font-bold px-2 py-0.5 rounded shadow mt-1">Atlanta Hub</div>
                    </div>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <path d="M150,100 Q300,150 450,250" fill="none" stroke="#1a355b" strokeDasharray="5,5" strokeWidth="2"></path>
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-xs text-slate-500">Currently tracking <strong className="text-slate-900 dark:text-white">14 deliveries</strong></span>
                  <button className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded font-bold hover:bg-slate-200 transition-colors">Open Map</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SmartDashboard
