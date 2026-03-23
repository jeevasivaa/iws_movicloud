import { useMemo, useState } from 'react'
import { Edit, Package2, Plus, Search, Trash2 } from 'lucide-react'

const PRODUCT_ROWS = [
  {
    product: 'Cold Pressed Coconut Oil',
    sku: 'VSA-CO-001',
    category: 'Cold Pressed Oils',
    price: 450,
    stock: 320,
    status: 'Active',
  },
  {
    product: 'Virgin Sesame Oil',
    sku: 'VSA-SO-002',
    category: 'Cold Pressed Oils',
    price: 380,
    stock: 180,
    status: 'Active',
  },
  {
    product: 'Organic Groundnut Oil',
    sku: 'VSA-GO-003',
    category: 'Cold Pressed Oils',
    price: 320,
    stock: 45,
    status: 'Low Stock',
  },
  {
    product: 'Flaxseed Oil',
    sku: 'VSA-FL-004',
    category: 'Essential Oils',
    price: 620,
    stock: 0,
    status: 'Out of Stock',
  },
]

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-green-100 text-green-700'
  if (status === 'Low Stock') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function Products() {
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return PRODUCT_ROWS
    }

    return PRODUCT_ROWS.filter((row) =>
      [row.product, row.sku, row.category, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Products</h1>
          <p className="mt-1 text-base text-gray-500">Manage your product catalogue and inventory</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          Add Product
        </button>
      </header>

      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Product</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">SKU</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Category</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Price (₹)</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Stock</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.sku} className="border-b border-gray-100 last:border-b-0">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100">
                      <Package2 size={15} className="text-emerald-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{row.product}</span>
                  </div>
                </td>

                <td className="px-6 py-5 text-sm text-gray-500">{row.sku}</td>
                <td className="px-6 py-5 text-sm text-gray-900">{row.category}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-900">₹{row.price.toLocaleString('en-IN')}</td>
                <td className="px-6 py-5 text-sm text-gray-900">{row.stock.toLocaleString('en-IN')}</td>

                <td className="px-6 py-5">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(row.status)}`}>
                    {row.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      aria-label={`Edit ${row.product}`}
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      aria-label={`Delete ${row.product}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No products found for this search.</div>
        ) : null}
      </div>
    </section>
  )
}

export default Products
