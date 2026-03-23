import { useEffect, useMemo, useState } from 'react'
import { Mail, MessageSquare, Plus, Search, Send, Star } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

function Marketing() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadClients = async () => {
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

        const response = await apiGet('/api/marketing', token, { signal: controller.signal })
        if (isActive) {
          setRows(Array.isArray(response) ? response : [])
        }
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setRows([])
        setError(err.message || 'Failed to load client data')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadClients()

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
      [row.company_name, row.contact_person, row.email, row.last_order_date].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query, rows])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Marketing & Clients</h1>
          <p className="mt-1 text-base text-gray-500">Manage client relationships, feedback, and promotions</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Send size={16} />
            Send Campaign
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <Plus size={16} />
            Add Client
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

      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm xl:col-span-3">
            Loading clients...
          </div>
        ) : (
          filteredRows.map((row) => (
            <article key={row._id || row.email} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{row.company_name}</h2>
                  <p className="text-sm text-gray-500">{row.contact_person}</p>
                </div>

                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {(Number(row.rating) || 0).toFixed(1)}
                </span>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p className="flex items-center gap-2">
                  <Mail size={15} />
                  {row.email}
                </p>
                <p className="mt-2">
                  {(Number(row.total_orders) || 0).toLocaleString('en-IN')} total orders
                  <span className="text-gray-300"> · </span>
                  Last: {row.last_order_date}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Mail size={16} />
                  Email
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <MessageSquare size={16} />
                  Feedback
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {!loading && filteredRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No clients found for this search.
        </div>
      ) : null}
    </section>
  )
}

export default Marketing
