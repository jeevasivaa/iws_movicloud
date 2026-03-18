import { useMemo } from 'react'
import { CalendarClock, FileSignature } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const CONTRACTS = [
  { id: 'CTR-401', party: 'Fresh Gulf Retail', type: 'Sales Agreement', startDate: '2026-01-01', endDate: '2026-12-31', owner: 'Finance', status: 'Active' },
  { id: 'CTR-402', party: 'Kerala Coconut Farms', type: 'Raw Material Supply', startDate: '2025-10-01', endDate: '2026-09-30', owner: 'Operations', status: 'Renewal Soon' },
  { id: 'CTR-403', party: 'PurePack Solutions', type: 'Packaging Procurement', startDate: '2025-12-15', endDate: '2026-12-14', owner: 'Operations', status: 'Active' },
  { id: 'CTR-404', party: 'Urban Nature Drinks', type: 'Brand Partnership', startDate: '2026-02-10', endDate: '2026-08-10', owner: 'Finance', status: 'Review Pending' },
]

function Contracts() {
  const { user } = useAuth()

  const visibleRows = useMemo(() => {
    if (user?.role === ROLES.ADMIN) return CONTRACTS
    if (user?.role === ROLES.OPERATIONS) return CONTRACTS.filter((row) => row.owner === 'Operations' || row.status === 'Renewal Soon')
    if (user?.role === ROLES.FINANCE) return CONTRACTS.filter((row) => row.owner === 'Finance' || row.type === 'Sales Agreement')
    return []
  }, [user?.role])

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Contracts</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Document lifecycle tracking for supplier and client agreements.</p>
      </header>

      <article className="bento-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Contract Register</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Contract</th>
                <th className="px-8 py-5">Party</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Period</th>
                <th className="px-8 py-5">Owner</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{row.id}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.party}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.type}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-600">{row.startDate} to {row.endDate}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.owner}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : row.status === 'Renewal Soon' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {row.status === 'Renewal Soon' ? <CalendarClock className="h-3.5 w-3.5" /> : <FileSignature className="h-3.5 w-3.5" />}
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

export default Contracts
