import { useMemo, useState } from 'react'
import { Calculator, FilePlus2 } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const GST_RATE = 0.18

const DRAFT_INVOICES = [
  { id: 'INV-7801', client: 'Fresh Gulf Retail', subtotal: 142000, gst: 25560, total: 167560, status: 'Draft' },
  { id: 'INV-7802', client: 'Hydra Wellness Co.', subtotal: 68000, gst: 12240, total: 80240, status: 'Review' },
  { id: 'INV-7803', client: 'Urban Nature Drinks', subtotal: 92000, gst: 16560, total: 108560, status: 'Ready' },
]

function Billing() {
  const { user } = useAuth()
  const [lineItemValue, setLineItemValue] = useState('75000')

  const parsedSubtotal = Number(lineItemValue) || 0
  const gstAmount = Math.round(parsedSubtotal * GST_RATE)
  const grandTotal = parsedSubtotal + gstAmount

  const visibleDrafts = useMemo(() => {
    if (user?.role === ROLES.ADMIN || user?.role === ROLES.FINANCE) return DRAFT_INVOICES
    return DRAFT_INVOICES.filter((invoice) => invoice.status === 'Ready')
  }, [user?.role])

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Billing</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">GST-ready invoice creation for customers, including tax summary and draft control.</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="bento-card p-6 xl:col-span-2">
          <div className="flex items-center gap-2">
            <FilePlus2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Create Invoice</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              Client
              <input className="mt-2 w-full rounded-xl border-none bg-slate-100/60 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100" defaultValue="Fresh Gulf Retail" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Invoice Date
              <input type="date" className="mt-2 w-full rounded-xl border-none bg-slate-100/60 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100" defaultValue="2026-03-18" />
            </label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Line Item Amount (INR)
              <input
                value={lineItemValue}
                onChange={(event) => setLineItemValue(event.target.value)}
                className="mt-2 w-full rounded-xl border-none bg-slate-100/60 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">GST Calculation</p>
            <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>INR {parsedSubtotal.toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span>GST (18%)</span><span>INR {gstAmount.toLocaleString()}</span></div>
              <div className="h-px bg-slate-200" />
              <div className="flex items-center justify-between text-base font-black text-slate-900"><span>Total</span><span>INR {grandTotal.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary text-[10px] uppercase tracking-widest px-6 py-3">Save Draft</button>
            <button className="btn-secondary text-[10px] uppercase tracking-widest px-6 py-3">Generate GST Invoice</button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-300" />
            <h2 className="text-lg font-black">Tax Snapshot</h2>
          </div>
          <p className="mt-4 text-sm text-slate-200">Current month GST output tax exceeds last month by 7.2%. Reconcile 2 invoices before filing.</p>
          <div className="mt-6 space-y-3 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center justify-between"><span className="text-slate-400">Output GST</span><span className="text-blue-200">INR 1,84,320</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-400">Input Credit</span><span className="text-emerald-300">INR 92,140</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-400">Payable</span><span className="text-orange-300">INR 92,180</span></div>
          </div>
        </article>
      </div>

      <article className="bento-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Invoice Drafts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Invoice</th>
                <th className="px-8 py-5">Client</th>
                <th className="px-8 py-5">Subtotal</th>
                <th className="px-8 py-5">GST</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleDrafts.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{row.id}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.client}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">INR {row.subtotal.toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">INR {row.gst.toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">INR {row.total.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      row.status === 'Ready' ? 'bg-emerald-50 text-emerald-700' : row.status === 'Review' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
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

export default Billing
