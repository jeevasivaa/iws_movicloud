import { useMemo, useState } from 'react'
import { Receipt, TrendingDown, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const EXPENSE_ROWS = [
  { id: 'EXP-9001', category: 'Logistics', description: 'Cold chain fuel surcharge', amount: 18200, owner: 'Operations', status: 'Approved' },
  { id: 'EXP-9002', category: 'Plant Utilities', description: 'Line C power correction', amount: 9600, owner: 'Operations', status: 'Pending' },
  { id: 'EXP-9003', category: 'Finance Ops', description: 'Tax consultant retainer', amount: 22000, owner: 'Finance', status: 'Approved' },
  { id: 'EXP-9004', category: 'HR & Payroll', description: 'Payroll system support', amount: 12500, owner: 'Finance', status: 'Approved' },
]

function Expenses() {
  const { user } = useAuth()
  const [amount, setAmount] = useState('5000')

  const visibleRows = useMemo(() => {
    if (user?.role === ROLES.ADMIN) return EXPENSE_ROWS
    if (user?.role === ROLES.OPERATIONS) return EXPENSE_ROWS.filter((row) => row.owner === 'Operations')
    if (user?.role === ROLES.FINANCE) return EXPENSE_ROWS
    return []
  }, [user?.role])

  const total = visibleRows.reduce((sum, row) => sum + row.amount, 0)

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expenses</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Capture and monitor company costs by category with approval tracking.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visible Spend</p>
          <p className="mt-1 text-2xl font-black text-slate-900">INR {total.toLocaleString()}</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="bento-card p-6 xl:col-span-2">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Log Expense</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              Category
              <select className="mt-2 w-full rounded-xl border-none bg-slate-100/60 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100">
                <option>Logistics</option>
                <option>Plant Utilities</option>
                <option>Finance Ops</option>
                <option>HR & Payroll</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">
              Amount (INR)
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-2 w-full rounded-xl border-none bg-slate-100/60 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Description
              <input className="mt-2 w-full rounded-xl border-none bg-slate-100/60 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100" placeholder="Describe the expense" />
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="btn-primary text-[10px] uppercase tracking-widest px-6 py-3">Submit Expense</button>
            <button className="btn-secondary text-[10px] uppercase tracking-widest px-6 py-3">Save Draft</button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Spend Trend</p>
          <h2 className="mt-2 text-lg font-black">Category Signal</h2>
          <div className="mt-4 space-y-3 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Logistics</span>
              <span className="inline-flex items-center gap-1 text-orange-300"><TrendingUp className="h-4 w-4" /> +12%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Plant Utilities</span>
              <span className="inline-flex items-center gap-1 text-emerald-300"><TrendingDown className="h-4 w-4" /> -5%</span>
            </div>
          </div>
        </article>
      </div>

      <article className="bento-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Expense Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Expense</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Owner</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{row.id}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.category}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-600">{row.description}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.owner}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">INR {row.amount.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      row.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <Receipt className="h-3.5 w-3.5" />
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

export default Expenses
