import { useMemo, useState } from 'react'
import { Handshake, Search } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const CLIENTS = [
  { id: 'CL-201', company: 'Fresh Gulf Retail', owner: 'Nadia Khan', segment: 'Retail Chain', location: 'Dubai', openOrders: 6, creditStatus: 'Good', contract: 'Annual', relationship: 'Key Account' },
  { id: 'CL-202', company: 'Urban Nature Drinks', owner: 'James Lin', segment: 'Brand Owner', location: 'Singapore', openOrders: 4, creditStatus: 'Watch', contract: 'Quarterly', relationship: 'Growth' },
  { id: 'CL-203', company: 'Hydra Wellness Co.', owner: 'Divya Raman', segment: 'Brand Owner', location: 'Mumbai', openOrders: 2, creditStatus: 'Good', contract: 'Annual', relationship: 'Strategic' },
  { id: 'CL-204', company: 'Nile Organic Foods', owner: 'Tariq Suleman', segment: 'Distributor', location: 'Cairo', openOrders: 1, creditStatus: 'Hold', contract: 'Pilot', relationship: 'New' },
]

function Clients() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const scopedRows = useMemo(() => {
    const byRole = CLIENTS.filter((row) => {
      if (user?.role === ROLES.ADMIN) return true
      if (user?.role === ROLES.MANAGER) return row.openOrders > 0
      if (user?.role === ROLES.FINANCE) return row.creditStatus !== 'Hold'
      return false
    })

    return byRole.filter((row) => [row.company, row.segment, row.id].join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [query, user?.role])

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clients</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">CRM workspace for buyers and brand owners with order and credit visibility.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visible Accounts</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{scopedRows.length}</p>
        </div>
      </header>

      <div className="bento-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search client, segment, or ID"
              className="w-full rounded-xl border-none bg-slate-100/50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 xl:grid-cols-3">
          {scopedRows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-premium-md transition-shadow">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{row.id}</p>
              <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900">{row.company}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{row.segment} • {row.location}</p>

              <div className="mt-5 space-y-2 text-sm font-semibold text-slate-600">
                <p>Owner: {row.owner}</p>
                <p>Open Orders: {row.openOrders}</p>
                <p>Contract: {row.contract}</p>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  row.creditStatus === 'Good' ? 'bg-emerald-50 text-emerald-700' : row.creditStatus === 'Watch' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                }`}>
                  {row.creditStatus}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{row.relationship}</span>
              </div>
            </article>
          ))}
        </div>

        {scopedRows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-8 pb-8 text-sm font-semibold text-slate-500">
            <Handshake className="h-4 w-4" />
            No client records available.
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Clients
