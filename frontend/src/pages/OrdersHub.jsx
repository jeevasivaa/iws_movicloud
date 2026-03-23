import { useEffect, useMemo, useState } from 'react'
import { Eye, Plus, Search, Truck } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

function getStatusClasses(status) {
  if (status === 'Processing') return 'bg-amber-100 text-amber-700'
  if (status === 'Shipped') return 'bg-blue-100 text-blue-700'
  if (status === 'Pending') return 'bg-red-100 text-red-700'
  return 'bg-green-100 text-green-700'
}

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function OrdersHub() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [clientsById, setClientsById] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadOrders = async () => {
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

        const [ordersResponse, clientsResponse] = await Promise.all([
          apiGet('/api/orders', token, { signal: controller.signal }),
          apiGet('/api/marketing', token, { signal: controller.signal }),
        ])

        if (!isActive) return

        setRows(Array.isArray(ordersResponse) ? ordersResponse : [])
        setClientsById(
          new Map((Array.isArray(clientsResponse) ? clientsResponse : []).map((client) => [client._id, client])),
        )
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setRows([])
        setClientsById(new Map())
        setError(err.message || 'Failed to load orders')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex])

  const mappedRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        clientName: clientsById.get(String(row.client_id))?.company_name || row.client_name || 'Client',
      })),
    [clientsById, rows],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return mappedRows
    }

    return mappedRows.filter((row) =>
      [row.order_id, row.clientName, row.status, row.date].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [mappedRows, query])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-base text-gray-500">Manage client orders, shipments, and delivery tracking</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          New Order
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

      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search orders..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Client</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Items</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Total</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={7}>
                  Loading orders...
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row._id || row.order_id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-5 text-sm text-gray-700">{row.order_id}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.clientName}</td>
                  <td className="px-6 py-5 text-sm text-gray-500">{row.date}</td>
                  <td className="px-6 py-5 text-sm text-gray-900">{(Number(row.total_items) || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{formatCurrency(row.total_amount)}</td>

                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`View ${row.order_id}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        aria-label={`Track ${row.order_id}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Truck size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No orders found for this search.</div>
        ) : null}
      </div>
    </section>
  )
}

export default OrdersHub
