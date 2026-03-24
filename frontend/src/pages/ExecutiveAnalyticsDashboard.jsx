import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, LineChart as LineChartIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function downloadTextFile(fileName, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}

function toDateValue(label) {
  const [monthToken = '', yearToken = ''] = String(label || '').split(' ')
  const monthMap = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  }

  const month = monthMap[monthToken]
  const parsedYear = Number(yearToken)
  if (month === undefined || Number.isNaN(parsedYear)) {
    return 0
  }

  const year = parsedYear < 100 ? 2000 + parsedYear : parsedYear
  return new Date(year, month, 1).getTime()
}

function ExecutiveAnalyticsDashboard() {
  const { token } = useAuth()
  const [salesData, setSalesData] = useState([])
  const [efficiencyData, setEfficiencyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  const loadReports = useCallback(async (signal) => {
    if (!token) {
      setSalesData([])
      setEfficiencyData([])
      setError('Authentication token missing. Please sign in again.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const [salesResponse, efficiencyResponse] = await Promise.all([
        apiGet('/api/reports/sales', token, { signal }),
        apiGet('/api/reports/production-efficiency', token, { signal }),
      ])

      const normalizedSales = Array.isArray(salesResponse)
        ? salesResponse
            .map((row) => ({
              month: String(row.month || ''),
              sales: Number(row.sales) || 0,
            }))
            .sort((a, b) => toDateValue(a.month) - toDateValue(b.month))
        : []

      const normalizedEfficiency = Array.isArray(efficiencyResponse)
        ? efficiencyResponse
            .map((row) => ({
              month: String(row.month || ''),
              efficiency: Number(row.efficiency) || 0,
            }))
            .sort((a, b) => toDateValue(a.month) - toDateValue(b.month))
        : []

      setSalesData(normalizedSales)
      setEfficiencyData(normalizedEfficiency)
    } catch (err) {
      if (signal?.aborted) {
        return
      }

      setSalesData([])
      setEfficiencyData([])
      setError(err?.message || 'Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const controller = new AbortController()
    loadReports(controller.signal)
    return () => controller.abort()
  }, [loadReports, refreshIndex])

  const salesTotal = useMemo(
    () => salesData.reduce((total, row) => total + (Number(row.sales) || 0), 0),
    [salesData],
  )

  const averageEfficiency = useMemo(() => {
    if (!efficiencyData.length) {
      return 0
    }

    const total = efficiencyData.reduce((sum, row) => sum + (Number(row.efficiency) || 0), 0)
    return Math.round((total / efficiencyData.length) * 10) / 10
  }, [efficiencyData])

  const hasSalesData = salesData.length > 0
  const hasEfficiencyData = efficiencyData.length > 0

  const exportAllAsText = () => {
    const salesSection = salesData.length
      ? salesData.map((row) => `${row.month}: ${formatCurrency(row.sales)}`).join('\n')
      : 'No sales data available.'

    const efficiencySection = efficiencyData.length
      ? efficiencyData.map((row) => `${row.month}: ${row.efficiency}%`).join('\n')
      : 'No efficiency data available.'

    const content = [
      'Executive Reports Summary',
      `Total Sales: ${formatCurrency(salesTotal)}`,
      `Average Production Efficiency: ${averageEfficiency}%`,
      '',
      '[Sales by Month]',
      salesSection,
      '',
      '[Production Efficiency by Month]',
      efficiencySection,
    ].join('\n')

    downloadTextFile('executive_reports_summary.txt', content)
    toast.success('Reports exported successfully')
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-1 text-base text-gray-500">Generate and export business reports</p>
        </div>

        <button
          type="button"
          onClick={exportAllAsText}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Sales (Visible Range)</p>
          <p className="mt-2 text-4xl font-semibold text-gray-900">{formatCurrency(salesTotal)}</p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Average Production Efficiency</p>
          <p className="mt-2 text-4xl font-semibold text-emerald-600">{averageEfficiency}%</p>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Sales Report</h2>
          </div>

          <div className="h-80 rounded-lg border border-gray-100 p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading sales graph...</div>
            ) : hasSalesData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Sales']} />
                  <Legend />
                  <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No sales data available.</div>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <LineChartIcon size={18} className="text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Production Efficiency</h2>
          </div>

          <div className="h-80 rounded-lg border border-gray-100 p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading efficiency graph...</div>
            ) : hasEfficiencyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={efficiencyData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `${Number(value)}%`}
                  />
                  <Tooltip formatter={(value) => [`${Number(value)}%`, 'Efficiency']} />
                  <Legend />
                  <Line type="monotone" dataKey="efficiency" name="Efficiency" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No efficiency data available.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

export default ExecutiveAnalyticsDashboard
