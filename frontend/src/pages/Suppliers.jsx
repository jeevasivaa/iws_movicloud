import { useMemo, useState } from 'react'
import { Edit, Plus, Search, Star, Truck } from 'lucide-react'

const SUPPLIER_ROWS = [
  {
    id: 'SUP-001',
    name: 'AgroFresh Farms',
    state: 'Tamil Nadu',
    category: 'Coconut',
    rating: 4.8,
    orders: 156,
    status: 'Active',
  },
  {
    id: 'SUP-002',
    name: 'Golden Seeds Corp',
    state: 'Gujarat',
    category: 'Groundnut',
    rating: 4.5,
    orders: 98,
    status: 'Active',
  },
  {
    id: 'SUP-003',
    name: "Nature's Harvest",
    state: 'Rajasthan',
    category: 'Sesame',
    rating: 4.2,
    orders: 72,
    status: 'Active',
  },
  {
    id: 'SUP-004',
    name: 'PackRight Solutions',
    state: 'Maharashtra',
    category: 'Packaging',
    rating: 4.6,
    orders: 45,
    status: 'Under Review',
  },
  {
    id: 'SUP-005',
    name: 'PureSeed Traders',
    state: 'Karnataka',
    category: 'Flaxseed',
    rating: 3.9,
    orders: 34,
    status: 'Inactive',
  },
]

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-green-100 text-green-700'
  if (status === 'Under Review') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function Suppliers() {
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return SUPPLIER_ROWS
    }

    return SUPPLIER_ROWS.filter((row) =>
      [row.name, row.state, row.category, row.status, row.id].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query])

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
        {filteredRows.map((row) => (
          <article key={row.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                  <Truck size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{row.name}</h2>
                  <p className="text-sm text-gray-500">{row.state}</p>
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
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{row.category}</span>

              <span className="inline-flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {row.rating.toFixed(1)}
              </span>

              <span>{row.orders} orders</span>
            </div>

            <div className="mt-4">
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                {row.status}
              </span>
            </div>
          </article>
        ))}
      </div>

      {filteredRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No suppliers found for this search.
        </div>
      ) : null}
    </section>
  )
}

export default Suppliers
