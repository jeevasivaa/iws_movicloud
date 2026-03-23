import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpDown, Package2, Plus, Search } from 'lucide-react'

const KPI_CARDS = [
  {
    title: 'Total Items',
    value: 6,
    icon: Package2,
    iconClasses: 'text-emerald-600',
  },
  {
    title: 'Low Stock Items',
    value: 2,
    icon: AlertTriangle,
    iconClasses: 'text-amber-600',
  },
  {
    title: 'Critical Items',
    value: 1,
    icon: AlertTriangle,
    iconClasses: 'text-red-600',
  },
]

const INVENTORY_ROWS = [
  {
    item: 'Raw Coconut',
    type: 'Raw Material',
    warehouse: 'WH-A',
    stock: 2500,
    capacity: 5000,
    unit: 'kg',
    expiry: '2026-06-15',
    status: 'Adequate',
  },
  {
    item: 'Sesame Seeds',
    type: 'Raw Material',
    warehouse: 'WH-A',
    stock: 800,
    capacity: 3000,
    unit: 'kg',
    expiry: '2026-05-20',
    status: 'Low',
  },
  {
    item: 'Coconut Oil 500ml',
    type: 'Finished Product',
    warehouse: 'WH-B',
    stock: 320,
    capacity: 1000,
    unit: 'bottles',
    expiry: '2027-03-01',
    status: 'Low',
  },
  {
    item: 'Glass Bottles 500ml',
    type: 'Packaging',
    warehouse: 'WH-C',
    stock: 150,
    capacity: 2000,
    unit: 'pcs',
    expiry: 'N/A',
    status: 'Critical',
  },
]

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
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return INVENTORY_ROWS
    }

    return INVENTORY_ROWS.filter((row) =>
      [row.item, row.type, row.warehouse, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query])

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon

          return (
            <article key={card.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="mt-1 text-4xl font-semibold text-gray-900">{card.value}</p>
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
            {filteredRows.map((row) => {
              const progress = Math.min(100, Math.round((row.stock / row.capacity) * 100))

              return (
                <tr key={`${row.item}-${row.warehouse}`} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.item}</td>

                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {row.type}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-700">{row.warehouse}</td>

                  <td className="px-6 py-5">
                    <div className="w-56">
                      <p className="text-sm text-gray-900">
                        {row.stock.toLocaleString('en-IN')} {row.unit} / {row.capacity.toLocaleString('en-IN')}
                      </p>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full ${getProgressBarClasses(row.status)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-500">{row.expiry}</td>

                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusPillClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No inventory items found for this search.</div>
        ) : null}
      </div>
    </section>
  )
}

export default Inventory
