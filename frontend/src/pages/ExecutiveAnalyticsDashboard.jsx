import { BarChart3, Download, LineChart } from 'lucide-react'

const SALES_BARS = [420000, 380000, 550000, 470000, 620000, 580000]
const EFFICIENCY_LINE = [82, 78, 88, 85, 91, 87]

const REPORT_CARDS = [
  {
    title: 'Inventory Report',
    subtitle: 'Stock levels, movement logs, expiry tracking',
  },
  {
    title: 'Supplier Performance',
    subtitle: 'Ratings, delivery times, order history',
  },
  {
    title: 'Payroll Summary',
    subtitle: 'Salary disbursements, tax deductions',
  },
]

function ExecutiveAnalyticsDashboard() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-1 text-base text-gray-500">Generate and export business reports</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Download size={17} />
          Export All
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Sales Report</h2>
          </div>

          <div className="h-80 rounded-lg border border-gray-100 p-4">
            <div className="flex h-full items-end gap-3">
              {SALES_BARS.map((value, index) => {
                const height = Math.max(12, Math.round((value / 650000) * 100))
                return (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-md bg-emerald-500" style={{ height: `${height}%` }} />
                    <span className="text-xs text-gray-500">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <LineChart size={18} className="text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Production Efficiency</h2>
          </div>

          <div className="h-80 rounded-lg border border-gray-100 p-4">
            <svg viewBox="0 0 500 220" className="h-full w-full" role="img" aria-label="Production efficiency line chart">
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points={EFFICIENCY_LINE.map((value, index) => `${40 + index * 80},${210 - (value - 60) * 4}`).join(' ')}
              />
              {EFFICIENCY_LINE.map((value, index) => (
                <circle key={index} cx={40 + index * 80} cy={210 - (value - 60) * 4} r="5" fill="#3b82f6" />
              ))}
            </svg>

            <div className="mt-3 flex justify-between px-2 text-xs text-gray-500">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {REPORT_CARDS.map((card) => (
          <article key={card.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">{card.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{card.subtitle}</p>

            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download size={16} />
              Export PDF
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ExecutiveAnalyticsDashboard
