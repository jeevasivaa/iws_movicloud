import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, Plus, Send } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

function getStatusClasses(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-700'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function Billing() {
  const { token } = useAuth()
  const [summary, setSummary] = useState({
    total_billed: 0,
    total_received: 0,
    total_outstanding: 0,
  })
  const [rows, setRows] = useState([])
  const [clientsById, setClientsById] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadBillingData = async () => {
      if (!token) {
        if (isActive) {
          setRows([])
          setError('Authentication token missing. Please sign in again.')
          setLoading(false)
        }
        return
      }

      try {
        if (isActive) {
          setLoading(true)
          setError('')
        }

        const [summaryResponse, invoicesResponse, clientsResponse] = await Promise.all([
          apiGet('/api/billing/summary', token, { signal: controller.signal }),
          apiGet('/api/billing', token, { signal: controller.signal }),
          apiGet('/api/marketing', token, { signal: controller.signal }),
        ])

        if (!isActive) return

        setSummary({
          total_billed: Number(summaryResponse?.total_billed) || 0,
          total_received: Number(summaryResponse?.total_received) || 0,
          total_outstanding: Number(summaryResponse?.total_outstanding) || 0,
        })
        setRows(Array.isArray(invoicesResponse) ? invoicesResponse : [])
        setClientsById(
          new Map((Array.isArray(clientsResponse) ? clientsResponse : []).map((client) => [client._id, client])),
        )
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setRows([])
        setClientsById(new Map())
        setSummary({ total_billed: 0, total_received: 0, total_outstanding: 0 })
        setError(err.message || 'Failed to load billing data')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadBillingData()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex])

  const billingKpis = useMemo(
    () => [
      { label: 'Total Billed', value: formatCurrency(summary.total_billed), valueClass: 'text-gray-900' },
      { label: 'Received', value: formatCurrency(summary.total_received), valueClass: 'text-emerald-600' },
      { label: 'Outstanding', value: formatCurrency(summary.total_outstanding), valueClass: 'text-red-500' },
    ],
    [summary.total_billed, summary.total_received, summary.total_outstanding],
  )

  const mappedRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        clientName: clientsById.get(String(row.client_id))?.company_name || row.client_name || 'Client',
      })),
    [clientsById, rows],
  )

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

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRefreshIndex((value) => value + 1)}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {billingKpis.map((kpi) => (
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
            {loading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={6}>
                  Loading invoices...
                </td>
              </tr>
            ) : (
              mappedRows.map((row) => (
                <tr key={row._id || row.invoice_number} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-5 text-sm text-gray-700">{row.invoice_number}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.clientName}</td>
                  <td className="px-6 py-5 text-sm text-gray-500">{row.date}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{formatCurrency(row.amount)}</td>

                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`View ${row.invoice_number}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        aria-label={`Download ${row.invoice_number}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Download size={17} />
                      </button>

                      <button
                        type="button"
                        aria-label={`Send ${row.invoice_number}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Send size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && mappedRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No invoices found.</div>
        ) : null}
      </div>
    </section>
  )
}

export default Billing
