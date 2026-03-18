import { useMemo } from 'react'
import { AlertTriangle, Boxes, CheckCircle2, Warehouse } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const RAW_MATERIALS = [
  { item: 'Tender Coconuts', unit: 'Nuts', stock: 14200, reorderPoint: 9000, supplier: 'Kerala Coconut Farms' },
  { item: 'Natural Preservative', unit: 'Liters', stock: 460, reorderPoint: 300, supplier: 'BioGuard Labs' },
  { item: 'Tetra Packs 250ml', unit: 'Units', stock: 28000, reorderPoint: 20000, supplier: 'PurePack Solutions' },
  { item: 'Bottle Caps', unit: 'Units', stock: 18000, reorderPoint: 25000, supplier: 'EcoCap Industries' },
]

const FINISHED_GOODS = [
  { sku: 'TCW-250', product: 'Tender Coconut Water 250ml', onHand: 12400, allocated: 7100, available: 5300, status: 'Healthy' },
  { sku: 'TCW-500', product: 'Tender Coconut Water 500ml', onHand: 8900, allocated: 6600, available: 2300, status: 'Watch' },
  { sku: 'CON-20L', product: 'Coconut Concentrate 20L', onHand: 1150, allocated: 800, available: 350, status: 'Healthy' },
  { sku: 'CON-5L', product: 'Coconut Concentrate 5L', onHand: 680, allocated: 610, available: 70, status: 'Critical' },
]

function SupplyChainLogisticsMap() {
  const { user } = useAuth()

  const scopedRawMaterials = useMemo(() => {
    if (user?.role === ROLES.FINANCE) {
      return RAW_MATERIALS.filter((row) => row.item !== 'Tender Coconuts')
    }
    return RAW_MATERIALS
  }, [user?.role])

  const lowStockCount = scopedRawMaterials.filter((row) => row.stock <= row.reorderPoint).length

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Stock tracking for raw materials and finished goods with low-stock signals.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Raw SKUs</p>
            <p className="mt-1 text-xl font-black text-slate-900">{scopedRawMaterials.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Low Stock</p>
            <p className="mt-1 text-xl font-black text-red-600">{lowStockCount}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="bento-card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Raw Materials</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[660px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-8 py-5">Item</th>
                  <th className="px-8 py-5">Stock</th>
                  <th className="px-8 py-5">Reorder Point</th>
                  <th className="px-8 py-5">Supplier</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {scopedRawMaterials.map((row) => {
                  const low = row.stock <= row.reorderPoint
                  return (
                    <tr key={row.item} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-8 py-5 text-sm font-black text-slate-900">{row.item}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900">{row.stock.toLocaleString()} {row.unit}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.reorderPoint.toLocaleString()} {row.unit}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-slate-600">{row.supplier}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          low ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {low ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          {low ? 'Low' : 'Healthy'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="bento-card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Finished Goods</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-8 py-5">SKU</th>
                  <th className="px-8 py-5">On Hand</th>
                  <th className="px-8 py-5">Allocated</th>
                  <th className="px-8 py-5">Available</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {FINISHED_GOODS.map((row) => (
                  <tr key={row.sku} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-900">{row.sku}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{row.product}</p>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">{row.onHand.toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.allocated.toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">{row.available.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                        row.status === 'Critical' ? 'bg-red-50 text-red-700' : row.status === 'Watch' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        <Boxes className="h-3.5 w-3.5" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-900 px-6 py-5 text-white shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Inventory Alert</p>
        <p className="mt-2 text-sm font-medium text-slate-200">
          Bottle Caps dropped below reorder point. Raise PO within 6 hours to avoid filling-line interruption.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-blue-100">
          <Warehouse className="h-4 w-4" />
          Suggested Action: Auto Replenishment
        </div>
      </div>
    </section>
  )
}

export default SupplyChainLogisticsMap
