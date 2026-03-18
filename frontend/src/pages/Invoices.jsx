import { useMemo, useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const INVOICE_DOCS = [
  { id: 'INV-7801', client: 'Fresh Gulf Retail', issueDate: '2026-03-14', dueDate: '2026-03-28', amount: 167560, status: 'Sent' },
  { id: 'INV-7797', client: 'Hydra Wellness Co.', issueDate: '2026-03-11', dueDate: '2026-03-25', amount: 80240, status: 'Paid' },
  { id: 'INV-7788', client: 'Urban Nature Drinks', issueDate: '2026-03-05', dueDate: '2026-03-19', amount: 108560, status: 'Overdue' },
]

function Invoices() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const visibleRows = useMemo(() => {
    const byRole = INVOICE_DOCS.filter((row) => {
      if (user?.role === ROLES.ADMIN || user?.role === ROLES.FINANCE) return true
      return row.status !== 'Overdue'
    })

    return byRole.filter((row) => [row.id, row.client, row.status].join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [query, user?.role])

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Invoices</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Invoice document storage, payment status tracking, and due-date visibility.</p>
      </header>

      <article className="bento-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search invoice, client, or status"
              className="w-full rounded-xl border-none bg-slate-100/50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Invoice ID</th>
                <th className="px-8 py-5">Client</th>
                <th className="px-8 py-5">Issue Date</th>
                <th className="px-8 py-5">Due Date</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{row.id}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.client}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-600">{row.issueDate}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-600">{row.dueDate}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">INR {row.amount.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      row.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : row.status === 'Overdue' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleRows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-8 py-10 text-sm font-semibold text-slate-500">
            <FileText className="h-4 w-4" />
            No invoice documents found.
          </div>
        ) : null}
      </article>
    </section>
  )
}

export default Invoices
