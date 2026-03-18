import { AlertTriangle, Boxes, Download, Plus } from 'lucide-react'

const tabs = ['Overview', 'Raw Materials', 'Finished Goods', 'Vendors']

const kpis = [
  { id: 'stock-value', title: 'Total Stock Value', value: 'INR 4.92M', note: '+5.8% vs last week' },
  { id: 'items', title: 'Tracked Items', value: '286', note: '14 added this month' },
  { id: 'critical', title: 'Critical Alerts', value: '3', note: 'Immediate reorder needed' },
]

const inventoryRows = [
  {
    id: 'RM-014',
    item: 'Bottle Caps 28mm',
    category: 'Packaging',
    stock: 18000,
    threshold: 25000,
    health: 15,
    healthColor: 'bg-red-500',
    status: 'DEPLETED',
    statusClass: 'bg-red-100 text-red-700',
    action: 'REORDER',
  },
  {
    id: 'RM-002',
    item: 'Tender Coconuts Grade A',
    category: 'Raw Material',
    stock: 14200,
    threshold: 9000,
    health: 85,
    healthColor: 'bg-emerald-500',
    status: 'IN STOCK',
    statusClass: 'bg-emerald-100 text-emerald-700',
    action: '-',
  },
  {
    id: 'FG-092',
    item: 'TCW 500ml (Case)',
    category: 'Finished Goods',
    stock: 8900,
    threshold: 7500,
    health: 35,
    healthColor: 'bg-orange-500',
    status: 'REORDERED',
    statusClass: 'bg-orange-100 text-orange-700',
    action: 'TRACK',
  },
]

function SupplyChainLogisticsMap() {
  return (
    <section className="space-y-6 bg-slate-50">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Warehouse Inventory</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">VSA Beverages central inventory command</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition hover:shadow-md">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition hover:shadow-md">
            <Plus className="h-4 w-4" />
            Add New Item
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
              index === 0
                ? 'bg-blue-50 text-[#1e3a8a] ring-1 ring-blue-200'
                : 'border border-slate-200 bg-white text-slate-600 hover:shadow-sm'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <article className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Critical Alert</p>
              <p className="mt-1 text-sm font-semibold text-red-800">Bottle Caps have dropped below minimum threshold. Production line interruption risk in 6 hours.</p>
            </div>
          </div>
          <button className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:shadow-md">
            Auto-Reorder
          </button>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <article key={kpi.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{kpi.title}</p>
              <Boxes className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{kpi.value}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">{kpi.note}</p>
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Stock Ledger</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-4 py-3">Item ID</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Threshold</th>
                <th className="px-4 py-3">Inventory Health</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryRows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm font-black text-slate-900">{row.id}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-800">{row.item}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-600">{row.category}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.stock.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.threshold.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="w-36">
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${row.healthColor}`} style={{ width: `${row.health}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{row.health}%</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      className={`text-xs font-black uppercase tracking-widest ${
                        row.action === 'REORDER' ? 'text-[#1e3a8a]' : 'text-slate-500'
                      }`}
                    >
                      {row.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

export default SupplyChainLogisticsMap
