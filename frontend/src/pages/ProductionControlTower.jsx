import { useMemo } from 'react'
import { Factory, Timer } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const KANBAN_COLUMNS = [
  {
    key: 'planned',
    title: 'Planned',
    color: 'bg-slate-50 border-slate-200',
    cards: [
      { id: 'BCH-3012', sku: 'TCW-250', qty: '8,000 units', owner: 'Line A', shift: 'Morning' },
      { id: 'BCH-3013', sku: 'CON-20L', qty: '450 drums', owner: 'Line C', shift: 'Evening' },
    ],
  },
  {
    key: 'blending',
    title: 'Blending',
    color: 'bg-blue-50 border-blue-100',
    cards: [
      { id: 'BCH-3007', sku: 'TCW-500', qty: '5,500 units', owner: 'Line B', shift: 'Morning' },
    ],
  },
  {
    key: 'filling',
    title: 'Filling & Packing',
    color: 'bg-amber-50 border-amber-100',
    cards: [
      { id: 'BCH-3002', sku: 'TCW-250', qty: '9,200 units', owner: 'Line A', shift: 'Day' },
      { id: 'BCH-3003', sku: 'PKG-GLS', qty: '3,200 units', owner: 'Line D', shift: 'Day' },
    ],
  },
  {
    key: 'qa',
    title: 'QA Hold',
    color: 'bg-red-50 border-red-100',
    cards: [
      { id: 'BCH-2998', sku: 'CON-5L', qty: '120 canisters', owner: 'Lab-2', shift: 'Night' },
    ],
  },
  {
    key: 'dispatch',
    title: 'Ready For Dispatch',
    color: 'bg-emerald-50 border-emerald-100',
    cards: [
      { id: 'BCH-2994', sku: 'TCW-250', qty: '10,000 units', owner: 'Dock 1', shift: 'Day' },
      { id: 'BCH-2991', sku: 'TCW-500', qty: '6,000 units', owner: 'Dock 2', shift: 'Day' },
    ],
  },
]

function ProductionControlTower() {
  const { user } = useAuth()

  const visibleColumns = useMemo(() => {
    if (user?.role === ROLES.ADMIN || user?.role === ROLES.OPERATIONS) return KANBAN_COLUMNS
    return KANBAN_COLUMNS.filter((col) => col.key !== 'planned' && col.key !== 'blending')
  }, [user?.role])

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Production</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Kanban board for factory floor progress from planning to dispatch.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Batches</p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {visibleColumns.reduce((sum, col) => sum + col.cards.length, 0)}
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {visibleColumns.map((column) => (
          <article key={column.key} className={`rounded-2xl border p-4 ${column.color}`}>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">{column.title}</h2>
            <div className="mt-4 space-y-3">
              {column.cards.map((card) => (
                <div key={card.id} className="rounded-xl border border-white/80 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-slate-900 tracking-tight">{card.id}</p>
                    <Factory className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest text-blue-600">{card.sku}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{card.qty}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>{card.owner}</span>
                    <span>{card.shift}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Factory Recommendation</p>
        <p className="mt-3 text-sm font-medium text-slate-200">
          Move two operators from Line D to Line B in the next shift to prevent 45-minute filling bottleneck.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-blue-100">
          <Timer className="h-4 w-4" />
          Action Window: Next 40 minutes
        </div>
      </div>
    </section>
  )
}

export default ProductionControlTower
