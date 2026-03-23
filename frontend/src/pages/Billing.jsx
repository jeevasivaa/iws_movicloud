import { Download, Eye, Plus, Send } from 'lucide-react'

const BILLING_KPIS = [
  { label: 'Total Billed', value: '₹2,28,700', valueClass: 'text-gray-900' },
  { label: 'Received', value: '₹74,100', valueClass: 'text-emerald-600' },
  { label: 'Outstanding', value: '₹1,54,600', valueClass: 'text-red-500' },
]

const INVOICE_ROWS = [
  {
    invoice: 'INV-2024-001',
    client: 'FreshMart Stores',
    date: '2024-03-01',
    amount: 45200,
    status: 'Paid',
  },
  {
    invoice: 'INV-2024-002',
    client: "Nature's Best Co.",
    date: '2024-03-05',
    amount: 32800,
    status: 'Pending',
  },
  {
    invoice: 'INV-2024-003',
    client: 'Green Valley Foods',
    date: '2024-03-08',
    amount: 67500,
    status: 'Overdue',
  },
  {
    invoice: 'INV-2024-004',
    client: 'Organic Hub',
    date: '2024-03-10',
    amount: 28900,
    status: 'Paid',
  },
]

function getStatusClasses(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-700'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function Billing() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Billing</h1>
          <p className="mt-1 text-base text-gray-500">Generate invoices, track payments, and manage billing</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          Create Invoice
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {BILLING_KPIS.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`mt-2 text-5xl font-semibold ${kpi.valueClass}`}>{kpi.value}</p>
          </article>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Invoice</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Client</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {INVOICE_ROWS.map((row) => (
              <tr key={row.invoice} className="border-b border-gray-100 last:border-b-0">
                <td className="px-6 py-5 text-sm text-gray-700">{row.invoice}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.client}</td>
                <td className="px-6 py-5 text-sm text-gray-500">{row.date}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-900">₹{row.amount.toLocaleString('en-IN')}</td>

                <td className="px-6 py-5">
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                    {row.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`View ${row.invoice}`}
                      className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Download ${row.invoice}`}
                      className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Download size={17} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Send ${row.invoice}`}
                      className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Send size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Billing
