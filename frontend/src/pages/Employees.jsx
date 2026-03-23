import { useEffect, useMemo, useState } from 'react'
import { Mail, Phone, Plus, Search } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-green-100 text-green-700'
  if (status === 'On Leave') return 'bg-amber-100 text-amber-700'
  if (status === 'Inactive') return 'bg-red-100 text-red-700'
  return 'bg-red-100 text-red-700'
}

function getInitials(name) {
  if (!name) return '--'
  const chunks = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (chunks.length === 0) return '--'
  if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase()
  return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase()
}

function getAvatarColor(name) {
  const palette = [
    'bg-emerald-100 text-emerald-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-yellow-100 text-yellow-700',
    'bg-pink-100 text-pink-700',
  ]

  if (!name) return palette[0]
  const sum = String(name)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)
  return palette[sum % palette.length]
}

function Employees() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadStaff = async () => {
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

        const response = await apiGet('/api/staff', token, { signal: controller.signal })
        if (isActive) {
          setRows(Array.isArray(response) ? response : [])
        }
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setRows([])
        setError(err.message || 'Failed to load staff members')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadStaff()

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
      [row.name, row.role, row.department, row.email, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query, rows])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Staff</h1>
          <p className="mt-1 text-base text-gray-500">Manage employees, shifts, and attendance</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          Add Employee
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
          placeholder="Search staff..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm md:col-span-2 xl:col-span-3">
            Loading staff members...
          </div>
        ) : (
          filteredRows.map((row) => (
          <article key={row._id || row.email || row.name} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold ${getAvatarColor(row.name)}`}
              >
                {getInitials(row.name)}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-gray-900">{row.name}</h2>
                <p className="text-sm text-gray-500">{row.role || 'Staff'}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <Mail size={15} />
                {row.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} />
                {row.phone || 'Not available'}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{row.department}</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{row.role || 'Team Member'}</span>
              <span className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                {row.status}
              </span>
            </div>
          </article>
        ))
        )}
      </div>

      {!loading && filteredRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No staff members found for this search.
        </div>
      ) : null}
    </section>
  )
}

export default Employees
