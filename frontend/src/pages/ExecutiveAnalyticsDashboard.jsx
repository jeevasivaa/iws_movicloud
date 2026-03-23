import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, LineChart } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

const FALLBACK_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

function ExecutiveAnalyticsDashboard() {
  const { token } = useAuth()
  const [salesData, setSalesData] = useState([])
  const [efficiencyData, setEfficiencyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadReports = async () => {
      if (!token) {
        if (isActive) {
          setSalesData([])
          setEfficiencyData([])
          setError('Authentication token missing. Please sign in again.')
          setLoading(false)
        }
        return
      }

      try {
        if (isActive) {
          setLoading(true)
          setError('')
        }

        const [salesResponse, efficiencyResponse] = await Promise.all([
          apiGet('/api/reports/sales', token, { signal: controller.signal }),
          apiGet('/api/reports/production-efficiency', token, { signal: controller.signal }),
        ])

        if (!isActive) return

        setSalesData(Array.isArray(salesResponse) ? salesResponse : [])
        setEfficiencyData(Array.isArray(efficiencyResponse) ? efficiencyResponse : [])
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setSalesData([])
        setEfficiencyData([])
        setError(err.message || 'Failed to load reports')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadReports()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex])

  const monthLabels = useMemo(() => {
    if (salesData.length > 0) {
      return salesData.map((row) => row.month)
    }
    if (efficiencyData.length > 0) {
      return efficiencyData.map((row) => row.month)
    }
    return FALLBACK_MONTHS
  }, [efficiencyData, salesData])

  const salesBars = useMemo(() => {
    if (salesData.length > 0) {
      return salesData.map((row) => Number(row.sales) || 0)
    }
    return []
  }, [salesData])

  const efficiencyLine = useMemo(() => {
    if (efficiencyData.length > 0) {
      return efficiencyData.map((row) => Number(row.efficiency) || 0)
    }
    return []
  }, [efficiencyData])

  const reportCards = [
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

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRefreshIndex((value) => value + 1)}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Sales Report</h2>
          </div>

          <div className="h-80 rounded-lg border border-gray-100 p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading sales report...</div>
            ) : salesBars.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No sales data available.</div>
            ) : (
              <div className="flex h-full items-end gap-3">
                {salesBars.map((value, index) => {
                  const peak = Math.max(...salesBars, 1)
                  const height = Math.max(12, Math.round((value / peak) * 100))
                  return (
                    <div key={`${monthLabels[index]}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t-md bg-emerald-500" style={{ height: `${height}%` }} />
                      <span className="text-xs text-gray-500">{monthLabels[index]}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <LineChart size={18} className="text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Production Efficiency</h2>
          </div>

          <div className="h-80 rounded-lg border border-gray-100 p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading efficiency report...</div>
            ) : efficiencyLine.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No efficiency data available.</div>
            ) : (
              <>
                <svg viewBox="0 0 500 220" className="h-full w-full" role="img" aria-label="Production efficiency line chart">
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    points={efficiencyLine
                      .map((value, index) => `${40 + index * 80},${210 - (Math.min(100, value) - 50) * 3}`)
                      .join(' ')}
                  />
                  {efficiencyLine.map((value, index) => (
                    <circle
                      key={`${monthLabels[index]}-${index}`}
                      cx={40 + index * 80}
                      cy={210 - (Math.min(100, value) - 50) * 3}
                      r="5"
                      fill="#3b82f6"
                    />
                  ))}
                </svg>

                <div className="mt-3 flex justify-between px-2 text-xs text-gray-500">
                  {monthLabels.map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {reportCards.map((card) => (
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
