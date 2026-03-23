import { Eye, Plus, Search, Truck } from 'lucide-react'

const ORDER_ROWS = [
  {
    orderId: 'ORD-2024-001',
    client: 'FreshMart Stores',
    date: '2024-03-01',
    items: 5,
    total: 45200,
    status: 'Processing',
  },
  {
    orderId: 'ORD-2024-002',
    client: "Nature's Best Co.",
    date: '2024-03-03',
    items: 3,
    total: 32800,
    status: 'Shipped',
  },
  {
    orderId: 'ORD-2024-003',
    client: 'Green Valley Foods',
    date: '2024-03-05',
    items: 8,
    total: 67500,
    status: 'Pending',
  },
  {
    orderId: 'ORD-2024-004',
    client: 'Organic Hub',
    date: '2024-03-07',
    items: 2,
    total: 28900,
    status: 'Delivered',
  },
  {
    orderId: 'ORD-2024-005',
    client: 'HealthyLife Markets',
    date: '2024-03-09',
    items: 6,
    total: 54300,
    status: 'Processing',
  },
  {
    orderId: 'ORD-2024-006',
    client: 'WellBeing Store',
    date: '2024-03-10',
    items: 4,
    total: 41700,
    status: 'Pending',
  },
]

function getStatusClasses(status) {
  if (status === 'Processing') return 'bg-amber-100 text-amber-700'
  if (status === 'Shipped') return 'bg-blue-100 text-blue-700'
  if (status === 'Pending') return 'bg-red-100 text-red-700'
  return 'bg-green-100 text-green-700'
}

function OrdersHub() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-base text-gray-500">Manage client orders, shipments, and delivery tracking</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          New Order
        </button>
      </header>

      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          placeholder="Search orders..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Client</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Items</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Total</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {ORDER_ROWS.map((row) => (
              <tr key={row.orderId} className="border-b border-gray-100 last:border-b-0">
                <td className="px-6 py-5 text-sm text-gray-700">{row.orderId}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.client}</td>
                <td className="px-6 py-5 text-sm text-gray-500">{row.date}</td>
                <td className="px-6 py-5 text-sm text-gray-900">{row.items}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-900">₹{row.total.toLocaleString('en-IN')}</td>

                <td className="px-6 py-5">
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                    {row.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`View ${row.orderId}`}
                      className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Track ${row.orderId}`}
                      className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Truck size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default OrdersHub
