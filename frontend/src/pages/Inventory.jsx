import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpDown, Package2, Plus, Search } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

function getStatusPillClasses(status) {
  if (status === 'Adequate') return 'bg-green-100 text-green-700'
  if (status === 'Low') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function getProgressBarClasses(status) {
  if (status === 'Adequate') return 'bg-green-500'
  if (status === 'Low') return 'bg-amber-500'
  return 'bg-red-500'
}

function Inventory() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [kpis, setKpis] = useState({ total_items: 0, low_stock_items: 0, critical_items: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadInventory = async () => {
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

        const [kpiResponse, rowsResponse] = await Promise.all([
          apiGet('/api/inventory/kpis', token, { signal: controller.signal }),
          apiGet('/api/inventory', token, { signal: controller.signal }),
        ])

        if (!isActive) return

        setKpis({
          total_items: Number(kpiResponse?.total_items) || 0,
          low_stock_items: Number(kpiResponse?.low_stock_items) || 0,
          critical_items: Number(kpiResponse?.critical_items) || 0,
        })
        setRows(Array.isArray(rowsResponse) ? rowsResponse : [])
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setRows([])
        setKpis({ total_items: 0, low_stock_items: 0, critical_items: 0 })
        setError(err.message || 'Failed to load inventory data')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadInventory()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex])

  const kpiCards = useMemo(
    () => [
      {
        title: 'Total Items',
        value: kpis.total_items,
        icon: Package2,
        iconClasses: 'text-emerald-600',
      },
      {
        title: 'Low Stock Items',
        value: kpis.low_stock_items,
        icon: AlertTriangle,
        iconClasses: 'text-amber-600',
      },
      {
        title: 'Critical Items',
        value: kpis.critical_items,
        icon: AlertTriangle,
        iconClasses: 'text-red-600',
      },
    ],
    [kpis.critical_items, kpis.low_stock_items, kpis.total_items],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return rows
    }

    return rows.filter((row) =>
      [row.item_name, row.type, row.warehouse_location, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query, rows])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Inventory</h1>
          <p className="mt-1 text-base text-gray-500">Monitor stock levels, warehouse mapping, and expiry tracking</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowUpDown size={16} />
            Stock Movement
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <Plus size={16} />
            Add Stock
          </button>
        </div>
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
        {kpiCards.map((card) => {
          const Icon = card.icon

          return (
            <article key={card.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="mt-1 text-4xl font-semibold text-gray-900">{Number(card.value).toLocaleString('en-IN')}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <Icon className={card.iconClasses} size={22} />
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search inventory..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Item</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Type</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Warehouse</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Stock Level</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Expiry</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={6}>
                  Loading inventory...
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const stock = Number(row.current_stock) || 0
                const capacity = Number(row.max_capacity) || 0
                const progress = capacity > 0 ? Math.min(100, Math.round((stock / capacity) * 100)) : 0

                return (
                  <tr key={row._id || `${row.item_name}-${row.warehouse_location}`} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.item_name}</td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {row.type}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700">{row.warehouse_location}</td>

                    <td className="px-6 py-5">
                      <div className="w-56">
                        <p className="text-sm text-gray-900">
                          {stock.toLocaleString('en-IN')} / {capacity.toLocaleString('en-IN')}
                        </p>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                          <div
                            className={`h-2 rounded-full ${getProgressBarClasses(row.status)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-500">{row.expiry_date || 'N/A'}</td>

                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusPillClasses(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {!loading && filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No inventory items found for this search.</div>
        ) : null}
      </div>
    </section>
  )
}

export default Inventory
