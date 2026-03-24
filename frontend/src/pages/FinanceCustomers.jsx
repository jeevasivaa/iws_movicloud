import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function FinanceCustomers() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchCustomers = useCallback(
    async (signal) => {
      if (!token) {
        setRows([])
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const [clientsResponse, invoicesResponse] = await Promise.all([
          apiClient.get('/api/marketing?scope=finance', { ...authConfig, signal }),
          apiClient.get('/api/billing', { ...authConfig, signal }),
        ])

        const clients = Array.isArray(clientsResponse.data) ? clientsResponse.data : []
        const invoices = Array.isArray(invoicesResponse.data) ? invoicesResponse.data : []

        const invoiceStatsByClient = invoices.reduce((acc, invoice) => {
          const clientId = String(invoice.client_id || '')
          if (!clientId) {
            return acc
          }

          const amount = Number(invoice.amount) || 0
          if (!acc[clientId]) {
            acc[clientId] = { totalBilled: 0, outstanding: 0 }
          }

          acc[clientId].totalBilled += amount
          if (invoice.status !== 'Paid') {
            acc[clientId].outstanding += amount
          }

          return acc
        }, {})

        const normalizedRows = clients.map((client) => {
          const stats = invoiceStatsByClient[String(client._id)] || { totalBilled: 0, outstanding: 0 }
          return {
            _id: client._id,
            name: client.company_name || 'Client',
            gstin: client.gstin || '-',
            billing_address: client.billing_address || '-',
            total_billed: Math.round((stats.totalBilled || 0) * 100) / 100,
            outstanding_balance: Math.round((stats.outstanding || 0) * 100) / 100,
          }
        })

        setRows(normalizedRows)
      } catch (err) {
        if (signal?.aborted) {
          return
        }

        setRows([])
        setError(getErrorMessage(err, 'Failed to load customer finance data'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchCustomers(controller.signal)
    return () => controller.abort()
  }, [fetchCustomers])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return rows
    }

    return rows.filter((row) =>
      [row.name, row.gstin, row.billing_address].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query, rows])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">Clients</h1>
        <p className="mt-1 text-base text-gray-500">Customer billing context for finance operations</p>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchCustomers()}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="relative w-full max-w-xl">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients by name, GSTIN, or address..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[1080px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Client Name</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">GSTIN</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Billing Address</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Total Billed</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Outstanding Balance</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={5}>
                  Loading clients...
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row._id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-5 text-sm text-gray-600">{row.gstin}</td>
                  <td className="px-6 py-5 text-sm text-gray-600">{row.billing_address}</td>
                  <td className="px-6 py-5 text-sm font-semibold text-gray-900">{formatCurrency(row.total_billed)}</td>
                  <td className="px-6 py-5 text-sm font-semibold text-red-600">{formatCurrency(row.outstanding_balance)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No client records found for this search.</div>
        ) : null}
      </div>
    </section>
  )
}

export default FinanceCustomers
