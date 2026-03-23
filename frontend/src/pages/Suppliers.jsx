import { useEffect, useMemo, useState } from 'react'
import { Edit, Plus, Search, Star, Truck } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-green-100 text-green-700'
  if (status === 'Under Review') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function Suppliers() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadSuppliers = async () => {
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

        const response = await apiGet('/api/suppliers', token, { signal: controller.signal })
        if (isActive) {
          setRows(Array.isArray(response) ? response : [])
        }
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setRows([])
        setError(err.message || 'Failed to load suppliers')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadSuppliers()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return rows
    }

    return rows.filter((row) =>
      [row.name, row.location, row.category_supplied, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query, rows])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Suppliers</h1>
          <p className="mt-1 text-base text-gray-500">Manage your supplier directory and procurement</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          Add Supplier
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
          placeholder="Search suppliers..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm md:col-span-2 xl:col-span-3">
            Loading suppliers...
          </div>
        ) : (
          filteredRows.map((row) => (
          <article key={row._id || row.name} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                  <Truck size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{row.name}</h2>
                  <p className="text-sm text-gray-500">{row.location}</p>
                </div>
              </div>

              <button
                type="button"
                className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label={`Edit ${row.name}`}
              >
                <Edit size={17} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{row.category_supplied}</span>

              <span className="inline-flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {(Number(row.rating) || 0).toFixed(1)}
              </span>

              <span>{(Number(row.total_orders) || 0).toLocaleString('en-IN')} orders</span>
            </div>

            <div className="mt-4">
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                {row.status}
              </span>
            </div>
          </article>
        ))
        )}
      </div>

      {!loading && filteredRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No suppliers found for this search.
        </div>
      ) : null}
    </section>
  )
}

export default Suppliers
