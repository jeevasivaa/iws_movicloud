import { AlertTriangle, Bell, Box, CheckCircle2, Clock3, Factory } from 'lucide-react'

const NOTIFICATION_ROWS = [
  {
    title: 'Low stock: Glass Bottles 500ml',
    message: 'Only 150 units remaining. Reorder recommended.',
    time: '5 min ago',
    icon: AlertTriangle,
    iconWrap: 'bg-red-100',
    iconColor: 'text-red-500',
    highlighted: true,
  },
  {
    title: 'Batch BATCH-003 nearing completion',
    message: 'Organic Groundnut Oil packaging is 90% complete.',
    time: '15 min ago',
    icon: Factory,
    iconWrap: 'bg-blue-100',
    iconColor: 'text-blue-600',
    highlighted: true,
  },
  {
    title: 'New order from Green Valley Foods',
    message: 'Order ORD-2024-003 for ₹67,500 received.',
    time: '1 hour ago',
    icon: Box,
    iconWrap: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    highlighted: true,
  },
  {
    title: 'Pending approval: Purchase Order PO-045',
    message: '₹1,25,000 for raw coconut from AgroFresh Farms.',
    time: '2 hours ago',
    icon: Clock3,
    iconWrap: 'bg-amber-100',
    iconColor: 'text-amber-600',
    highlighted: false,
  },
  {
    title: 'Payroll processed for March',
    message: '3 of 5 employees have been paid.',
    time: '3 hours ago',
    icon: CheckCircle2,
    iconWrap: 'bg-green-100',
    iconColor: 'text-green-600',
    highlighted: false,
  },
]

function Notifications() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Notifications</h1>
          <p className="mt-1 text-base text-gray-500">Stay updated with alerts, approvals, and system events</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Bell size={16} />
          Mark All Read
        </button>
      </header>

      <div className="space-y-4">
        {NOTIFICATION_ROWS.map((row) => {
          const Icon = row.icon

          return (
            <article
              key={row.title}
              className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${row.highlighted ? 'border-l-4 border-l-emerald-500' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`rounded-2xl p-3 ${row.iconWrap}`}>
                    <Icon size={24} className={row.iconColor} />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{row.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{row.message}</p>
                  </div>
                </div>

                <span className="text-sm text-gray-500">{row.time}</span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Notifications
