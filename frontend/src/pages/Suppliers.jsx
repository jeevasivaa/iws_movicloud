import { useMemo, useState } from 'react'
import { Search, Truck } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const SUPPLIERS = [
  { id: 'SUP-101', name: 'Kerala Coconut Farms', contact: 'Anand Mathew', material: 'Tender Coconuts', region: 'Kerala', score: 94, status: 'Preferred', risk: 'Low', visibleToFinance: true },
  { id: 'SUP-102', name: 'PurePack Solutions', contact: 'Sara Joseph', material: 'Tetra Packs', region: 'Tamil Nadu', score: 88, status: 'Approved', risk: 'Medium', visibleToFinance: true },
  { id: 'SUP-103', name: 'EcoCap Industries', contact: 'Neeraj Khanna', material: 'Bottle Caps', region: 'Gujarat', score: 82, status: 'Conditional', risk: 'Medium', visibleToFinance: false },
  { id: 'SUP-104', name: 'Cold Chain Movers', contact: 'Ritwik Banerjee', material: 'Reefer Logistics', region: 'Pan India', score: 91, status: 'Preferred', risk: 'Low', visibleToFinance: true },
]

function Suppliers() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const scopedRows = useMemo(() => {
    const byRole = SUPPLIERS.filter((row) => {
      if (user?.role === ROLES.ADMIN || user?.role === ROLES.OPERATIONS) return true
      if (user?.role === ROLES.FINANCE) return row.visibleToFinance
      return false
    })

    return byRole.filter((row) => [row.name, row.id, row.material].join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [query, user?.role])

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Suppliers</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">CRM-style sourcing partner list with SLA risk and quality scorecards.</p>
      </header>

      <div className="bento-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search supplier, material, or ID"
              className="w-full rounded-xl border-none bg-slate-100/50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Supplier</th>
                <th className="px-8 py-5">Material</th>
                <th className="px-8 py-5">Region</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Score</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {scopedRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900">{row.name}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{row.id}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.material}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.region}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-600">{row.contact}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{row.score}%</td>
                  <td className="px-8 py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      row.status === 'Preferred' ? 'bg-emerald-50 text-emerald-700' : row.status === 'Approved' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      row.risk === 'Low' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {row.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {scopedRows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-8 py-10 text-sm font-semibold text-slate-500">
            <Truck className="h-4 w-4" />
            No supplier records available.
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Suppliers
