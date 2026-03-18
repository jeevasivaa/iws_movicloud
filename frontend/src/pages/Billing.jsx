import { Brain, Plus, Sparkles } from 'lucide-react'

const invoiceItems = [
  {
    id: 'item-1',
    description: 'Tender Coconut Water 250ml (Case of 24)',
    hsn: '2202',
    qty: 120,
    unitPrice: 760,
    gstRate: '18%',
  },
  {
    id: 'item-2',
    description: 'Premium Glass Bottle Label Pack',
    hsn: '4821',
    qty: 50,
    unitPrice: 280,
    gstRate: '12%',
  },
]

const billedTo = {
  client: 'Fresh Gulf Retail LLC',
  gstin: '29AABCV9427R1ZP',
  address: 'Al Quoz Industrial Area 3, Dubai, UAE',
}

const subtotal = invoiceItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
const cgst = Math.round(subtotal * 0.09)
const sgst = Math.round(subtotal * 0.09)
const grandTotal = subtotal + cgst + sgst

function Billing() {
  return (
    <section className="space-y-6 bg-slate-50">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Create New Invoice</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">VSA Beverages billing desk - prepared by James Wilson</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Billed To</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold text-slate-700 md:col-span-2">
                Client
                <select className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-200 focus:ring-2 focus:ring-blue-100">
                  <option>{billedTo.client}</option>
                  <option>Hydra Wellness Co.</option>
                  <option>Urban Nature Drinks</option>
                </select>
              </label>

              <label className="text-sm font-bold text-slate-700">
                GSTIN
                <input
                  disabled
                  value={billedTo.gstin}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
                />
              </label>

              <label className="text-sm font-bold text-slate-700">
                Address
                <input
                  disabled
                  value={billedTo.address}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
                />
              </label>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Itemized Details</h2>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:shadow-md">
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-3 py-3">Description</th>
                    <th className="px-3 py-3">HSN/SAC</th>
                    <th className="px-3 py-3">QTY</th>
                    <th className="px-3 py-3">Unit Price</th>
                    <th className="px-3 py-3">GST Rate</th>
                    <th className="px-3 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceItems.map((item) => {
                    const total = item.qty * item.unitPrice
                    return (
                      <tr key={item.id} className="transition hover:bg-slate-50">
                        <td className="px-3 py-4 text-sm font-semibold text-slate-800">{item.description}</td>
                        <td className="px-3 py-4 text-sm font-bold text-slate-700">{item.hsn}</td>
                        <td className="px-3 py-4 text-sm font-bold text-slate-700">{item.qty}</td>
                        <td className="px-3 py-4 text-sm font-bold text-slate-700">INR {item.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-4 text-sm font-bold text-slate-700">{item.gstRate}</td>
                        <td className="px-3 py-4 text-right text-sm font-black text-slate-900">INR {total.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Terms & Conditions</h3>
              <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
                <li>Payment due within 21 days from invoice date.</li>
                <li>Goods once dispatched will not be returned.</li>
                <li>Late payment attracts 1.5% monthly interest.</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Bank Details</h3>
              <div className="mt-4 space-y-2 text-sm font-semibold text-slate-700">
                <p>Account Name: VSA Beverages Pvt. Ltd.</p>
                <p>Bank: HDFC Bank</p>
                <p>Account No: 50200114589722</p>
                <p>IFSC: HDFC0001247</p>
              </div>
            </article>
          </div>
        </div>

        <aside className="space-y-4">
          <article className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Invoice Summary</h2>

            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>INR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>CGST (9%)</span>
                <span>INR {cgst.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SGST (9%)</span>
                <span>INR {sgst.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex items-center justify-between text-base font-black text-slate-900">
                <span>Grand Total</span>
                <span>INR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
              <div className="flex items-start gap-2">
                <Brain className="mt-0.5 h-4 w-4 text-teal-700" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">AI Insight</p>
                  <p className="mt-2 text-sm font-semibold text-teal-900">Offer 2% early-payment discount to improve monthly DSO by an estimated 4.2 days.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button className="w-full rounded-xl bg-[#1e3a8a] px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm transition hover:shadow-md">
                Save as Draft
              </button>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-800 shadow-sm transition hover:shadow-md">
                <Sparkles className="h-4 w-4 text-teal-600" />
                Generate Final Invoice
              </button>
            </div>
          </article>
        </aside>
      </div>
    </section>
  )
}

export default Billing
