import { Mail, MessageSquare, Plus, Search, Send, Star } from 'lucide-react'

const CLIENT_ROWS = [
  {
    company: 'FreshMart Stores',
    contact: 'Ramesh Gupta',
    email: 'ramesh@freshmart.in',
    orders: 24,
    lastOrder: '2024-03-01',
    rating: 4.8,
  },
  {
    company: "Nature's Best Co.",
    contact: 'Lakshmi Iyer',
    email: 'lakshmi@naturesbest.in',
    orders: 18,
    lastOrder: '2024-03-03',
    rating: 4.5,
  },
  {
    company: 'Green Valley Foods',
    contact: 'Suresh Menon',
    email: 'suresh@greenvalley.in',
    orders: 32,
    lastOrder: '2024-03-05',
    rating: 4.9,
  },
  {
    company: 'Organic Hub',
    contact: 'Nita Shah',
    email: 'nita@organichub.in',
    orders: 12,
    lastOrder: '2024-03-07',
    rating: 4.3,
  },
  {
    company: 'HealthyLife Markets',
    contact: 'Ajay Verma',
    email: 'ajay@healthylife.in',
    orders: 8,
    lastOrder: '2024-03-09',
    rating: 4.6,
  },
]

function Marketing() {
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

      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          placeholder="Search clients..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {CLIENT_ROWS.map((row) => (
          <article key={row.company} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{row.company}</h2>
                <p className="text-sm text-gray-500">{row.contact}</p>
              </div>

              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {row.rating}
              </span>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <Mail size={15} />
                {row.email}
              </p>
              <p className="mt-2">
                {row.orders} total orders <span className="text-gray-300">·</span> Last: {row.lastOrder}
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
        ))}
      </div>
    </section>
  )
}

export default Marketing
