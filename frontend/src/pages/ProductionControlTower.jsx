import { Activity, Play, Search, Sparkles, Users } from 'lucide-react'

const productionWidgets = [
  {
    id: 'utilization',
    title: 'Line Utilization',
    value: '78%',
    helper: 'Across 6 active lines',
    progress: 78,
    variant: 'teal',
  },
  {
    id: 'batches',
    title: 'Active Batches',
    value: '12',
    helper: '3 at risk of delay',
    variant: 'avatars',
    avatars: ['AW', 'KP', 'MN', '+4'],
  },
  {
    id: 'insights',
    title: 'Predictive Insights',
    value: '1 critical alert',
    helper: 'Line B likely bottleneck in 35 min',
    variant: 'dark',
  },
]

const kanbanColumns = [
  {
    key: 'planned',
    title: 'Planned',
    cards: [
      { id: 'BCH-3042', sku: 'TCW-250', qty: '8,200 units', owner: 'Line A', progress: 20, priority: 'Normal' },
      { id: 'BCH-3043', sku: 'CON-20L', qty: '420 drums', owner: 'Line C', progress: 12, priority: 'High' },
    ],
  },
  {
    key: 'production',
    title: 'In Production',
    cards: [
      { id: 'BCH-3037', sku: 'TCW-500', qty: '5,600 units', owner: 'Line B', progress: 58, priority: 'Normal' },
      { id: 'BCH-3038', sku: 'SPK-330', qty: '3,100 units', owner: 'Line F', progress: 42, priority: 'Normal' },
    ],
  },
  {
    key: 'qc',
    title: 'Quality Check (QC)',
    cards: [
      { id: 'BCH-3032', sku: 'TCW-250', qty: '9,000 units', owner: 'Lab 2', progress: 88, priority: 'High' },
    ],
  },
  {
    key: 'completed',
    title: 'Completed',
    cards: [
      { id: 'BCH-3028', sku: 'CON-5L', qty: '1,220 canisters', owner: 'Dock 1', progress: 100, priority: 'Normal' },
      { id: 'BCH-3025', sku: 'TCW-500', qty: '4,900 units', owner: 'Dock 2', progress: 100, priority: 'Normal' },
    ],
  },
]

function ProductionControlTower() {
  return (
    <section className="space-y-6 bg-slate-50">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-600" />
            </span>
            Live Feed
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Production Control Tower</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">VSA Beverages - Operations lead: James Wilson</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <label className="relative min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              defaultValue=""
              placeholder="Search batch, SKU, line"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-3 text-sm font-black uppercase tracking-widest text-white shadow-sm transition hover:shadow-md">
            <Play className="h-4 w-4" />
            Start New Batch
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {productionWidgets.map((widget) => {
          if (widget.variant === 'dark') {
            return (
              <article key={widget.id} className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{widget.title}</p>
                  <Sparkles className="h-4 w-4 text-teal-300" />
                </div>
                <p className="mt-3 text-lg font-black tracking-tight">{widget.value}</p>
                <p className="mt-2 text-sm text-slate-200">{widget.helper}</p>
                <button className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-teal-200 transition hover:bg-white/20">
                  View Recommendation
                </button>
              </article>
            )
          }

          if (widget.variant === 'avatars') {
            return (
              <article key={widget.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{widget.title}</p>
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{widget.value}</p>
                <div className="mt-4 flex items-center -space-x-2">
                  {widget.avatars.map((avatar) => (
                    <span
                      key={avatar}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-black uppercase text-slate-700"
                    >
                      {avatar}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-500">{widget.helper}</p>
              </article>
            )
          }

          return (
            <article key={widget.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{widget.title}</p>
                <Activity className="h-4 w-4 text-teal-600" />
              </div>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{widget.value}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${widget.progress}%` }} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-500">{widget.helper}</p>
            </article>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {kanbanColumns.map((column) => (
          <article key={column.key} className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">{column.title}</h2>
            <div className="mt-4 space-y-3">
              {column.cards.map((card) => (
                <div
                  key={card.id}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black tracking-tight text-slate-900">{card.id}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                        card.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {card.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700">{card.sku}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{card.qty}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${card.progress === 100 ? 'bg-teal-500' : 'bg-[#1e3a8a]'}`}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>{card.owner}</span>
                    <span>{card.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProductionControlTower
