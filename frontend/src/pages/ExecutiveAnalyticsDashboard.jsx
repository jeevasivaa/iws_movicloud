import { Brain, Box, DollarSign, Gauge, Truck } from 'lucide-react'

const kpis = [
  {
    id: 'revenue',
    label: 'Monthly Revenue',
    value: 'USD 4.8M',
    trend: '+9.4% vs target',
    positive: true,
    icon: DollarSign,
  },
  {
    id: 'margin',
    label: 'Gross Margin',
    value: '31.2%',
    trend: '+1.8% MoM',
    positive: true,
    icon: Gauge,
  },
  {
    id: 'capacity',
    label: 'Capacity Utilization',
    value: '84%',
    trend: '-2.1% in South line',
    positive: false,
    icon: Box,
  },
  {
    id: 'delivery',
    label: 'On-Time Delivery',
    value: '93%',
    trend: '+3.1% QoQ',
    positive: true,
    icon: Truck,
  },
]

const topProducts = [
  { name: 'Tender Coconut Water 250ml', share: 60, color: 'bg-[#1e3a8a]' },
  { name: 'Tender Coconut Water 500ml', share: 25, color: 'bg-teal-500' },
  { name: 'Coconut Concentrate 20L', share: 15, color: 'bg-slate-400' },
]

const aiInsights = [
  'Revenue can exceed forecast by 6.2% if UAE channel promo starts before week 3.',
  'Bottle cap volatility may suppress margin by 0.9 pts unless vendor shift is approved.',
  'Premium mix adjustment in hospitality segment can unlock USD 320K annual upside.',
]

function ExecutiveAnalyticsDashboard() {
  return (
    <section className="space-y-6 bg-slate-50">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Executive Analytics</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Enterprise performance command for VSA Beverages</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <article key={kpi.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{kpi.label}</p>
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{kpi.value}</p>
              <p className={`mt-2 text-xs font-black uppercase tracking-widest ${kpi.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpi.trend}
              </p>
            </article>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Revenue vs Target</h2>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <svg viewBox="0 0 700 280" className="h-64 w-full" role="img" aria-label="Revenue versus target trend">
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d="M40 220 L660 220" stroke="#cbd5e1" strokeDasharray="6 6" />
              <path d="M40 180 C160 140, 230 170, 320 130 C410 90, 510 110, 660 70" fill="none" stroke="#1e3a8a" strokeWidth="4" />
              <path d="M40 200 C150 170, 240 180, 330 150 C430 125, 520 145, 660 120" fill="none" stroke="#14b8a6" strokeWidth="4" />
              <path d="M40 200 C150 170, 240 180, 330 150 C430 125, 520 145, 660 120 L660 220 L40 220 Z" fill="url(#actualGradient)" />
            </svg>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
              <span className="inline-flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-[#1e3a8a]" />Target</span>
              <span className="inline-flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-teal-500" />Actual</span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Top Products</h2>
          <div className="mt-4 space-y-4">
            {topProducts.map((product) => (
              <div key={product.name}>
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{product.name}</span>
                  <span>{product.share}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${product.color}`} style={{ width: `${product.share}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-black uppercase tracking-widest text-amber-700">Warning</p>
            <p className="mt-1 text-sm font-semibold text-amber-900">500ml line margin trending lower due to packaging cost increases.</p>
          </div>
        </article>
      </div>

      <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal-300" />
              Live AI
            </span>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">AI Strategic Insights</h2>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <Brain className="mt-1 h-5 w-5 text-teal-300" />
            <ul className="space-y-2 text-sm text-slate-100">
              {aiInsights.map((insight) => (
                <li key={insight} className="rounded-lg bg-white/5 p-3">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      <footer className="pb-2 text-center text-xs font-semibold text-slate-500">© 2024 VSA Beverages</footer>
    </section>
  )
}

export default ExecutiveAnalyticsDashboard
