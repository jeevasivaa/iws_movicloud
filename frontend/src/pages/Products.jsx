import { useMemo, useState } from 'react'
import { Package2, Search } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const PRODUCT_ROWS = [
  { sku: 'TCW-250', product: 'Tender Coconut Water', variant: 'Natural', packaging: '250ml Tetra Pack', category: 'Ready-to-drink', stock: 12400, status: 'Active', sensitivity: 'all' },
  { sku: 'TCW-500', product: 'Tender Coconut Water', variant: 'Lemon Mint', packaging: '500ml PET Bottle', category: 'Ready-to-drink', stock: 8900, status: 'Active', sensitivity: 'all' },
  { sku: 'CON-20L', product: 'Coconut Concentrate', variant: 'Brix 60', packaging: '20L Food-grade Drum', category: 'Concentrate', stock: 1150, status: 'Active', sensitivity: 'all' },
  { sku: 'CON-5L', product: 'Coconut Concentrate', variant: 'Brix 45', packaging: '5L Canister', category: 'Concentrate', stock: 680, status: 'Pilot', sensitivity: 'all' },
  { sku: 'PKG-GLS', product: 'Glass Packaging', variant: 'Amber 300ml', packaging: 'Returnable Glass', category: 'Packaging Material', stock: 34000, status: 'Active', sensitivity: 'operations' },
  { sku: 'PKG-CAP', product: 'Tamper Cap', variant: 'Blue', packaging: '500-count box', category: 'Packaging Material', stock: 96000, status: 'Active', sensitivity: 'operations' },
]

function Products() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const scopedRows = useMemo(() => {
    const byRole = PRODUCT_ROWS.filter((row) => {
      if (user?.role === ROLES.ADMIN) return true
      if (user?.role === ROLES.OPERATIONS) return true
      if (user?.role === ROLES.FINANCE) return row.sensitivity === 'all'
      return false
    })

    return byRole.filter((row) => [row.product, row.variant, row.sku].join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [query, user?.role])

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Products</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Catalog for Tender Coconut Water, Concentrate, and packaging types.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visible SKUs</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{scopedRows.length}</p>
        </div>
      </header>

      <div className="bento-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by SKU, product, or variant"
              className="w-full rounded-xl border-none bg-slate-100/50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">SKU</th>
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Variant</th>
                <th className="px-8 py-5">Packaging</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Stock</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {scopedRows.map((row) => (
                <tr key={row.sku} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{row.sku}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{row.product}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.variant}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.packaging}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.category}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{row.stock.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {scopedRows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-8 py-10 text-sm font-semibold text-slate-500">
            <Package2 className="h-4 w-4" />
            No product matches found.
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Products
