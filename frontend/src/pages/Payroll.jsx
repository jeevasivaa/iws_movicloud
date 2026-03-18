import { useMemo } from 'react'
import { Banknote, CircleDollarSign } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const PAYROLL_ROWS = [
  { id: 'EMP-001', name: 'Anika Das', department: 'Production', base: 54000, allowance: 6000, deduction: 2500, net: 57500, status: 'Approved' },
  { id: 'EMP-002', name: 'Ravi Menon', department: 'Quality', base: 48000, allowance: 4500, deduction: 2100, net: 50400, status: 'Pending' },
  { id: 'EMP-003', name: 'Nisha Patel', department: 'Finance', base: 62000, allowance: 7000, deduction: 3200, net: 65800, status: 'Approved' },
  { id: 'EMP-004', name: 'Zane Roy', department: 'Finance', base: 58000, allowance: 5200, deduction: 2800, net: 60400, status: 'Processed' },
]

function Payroll() {
  const { user } = useAuth()

  const visibleRows = useMemo(() => {
    if (user?.role === ROLES.ADMIN || user?.role === ROLES.FINANCE) return PAYROLL_ROWS
    return PAYROLL_ROWS.filter((row) => row.department !== 'Finance')
  }, [user?.role])

  const payoutTotal = visibleRows.reduce((sum, row) => sum + row.net, 0)

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payroll</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Employee salary management with allowances, deductions, and payout status.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cycle Payout</p>
          <p className="mt-1 text-2xl font-black text-slate-900">INR {payoutTotal.toLocaleString()}</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cycle Stage</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">Verification</h2>
          <p className="mt-3 text-sm font-semibold text-slate-600">7 of 9 salary sheets validated. Remaining 2 require manager approval.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment Window</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">March 26, 2026</h2>
          <p className="mt-3 text-sm font-semibold text-slate-600">NEFT batch transfer is scheduled for 17:00 IST.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Compliance</p>
          <h2 className="mt-2 text-xl font-black tracking-tight">PF/ESI Ready</h2>
          <p className="mt-3 text-sm text-slate-200">No variance found in statutory contributions for this cycle.</p>
        </article>
      </div>

      <article className="bento-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Salary Register</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Employee</th>
                <th className="px-8 py-5">Base</th>
                <th className="px-8 py-5">Allowance</th>
                <th className="px-8 py-5">Deduction</th>
                <th className="px-8 py-5">Net</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900">{row.name}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{row.id} • {row.department}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">INR {row.base.toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-emerald-700">+ INR {row.allowance.toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-red-600">- INR {row.deduction.toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">INR {row.net.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      row.status === 'Processed' ? 'bg-emerald-50 text-emerald-700' : row.status === 'Approved' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {row.status === 'Processed' ? <Banknote className="h-3.5 w-3.5" /> : <CircleDollarSign className="h-3.5 w-3.5" />}
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

export default Payroll
