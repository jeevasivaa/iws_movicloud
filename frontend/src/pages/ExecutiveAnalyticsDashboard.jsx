import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Download, FileSpreadsheet } from 'lucide-react'
import { jsPDF } from 'jspdf'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `INR ${amount.toLocaleString('en-IN')}`
}

function formatDateLabel(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString().slice(0, 10)
}

function ExecutiveAnalyticsDashboard() {
  const { token } = useAuth()
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = `${today.slice(0, 8)}01`

  const [startDate, setStartDate] = useState(monthStart)
  const [endDate, setEndDate] = useState(today)
  const [salesRows, setSalesRows] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchReportData = useCallback(
    async (signal) => {
      if (!token) {
        setError('Authentication token missing. Please sign in again.')
        setSalesRows([])
        setOrders([])
        setProducts([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const [salesResponse, ordersResponse, productsResponse] = await Promise.all([
          apiClient.get('/api/reports/sales', { ...authConfig, signal }),
          apiClient.get('/api/orders', { ...authConfig, signal }),
          apiClient.get('/api/products', { ...authConfig, signal }),
        ])

        const nextSales = Array.isArray(salesResponse.data) ? salesResponse.data : []
        const nextOrders = Array.isArray(ordersResponse.data) ? ordersResponse.data : []
        const nextProducts = Array.isArray(productsResponse.data) ? productsResponse.data : []

        setSalesRows(nextSales)
        setOrders(nextOrders)
        setProducts(nextProducts)
      } catch (err) {
        if (signal?.aborted) return
        setError(getErrorMessage(err, 'Failed to load report data'))
        setSalesRows([])
        setOrders([])
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchReportData(controller.signal)
    return () => controller.abort()
  }, [fetchReportData])

  const filteredOrders = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    return orders.filter((row) => {
      const rowDate = new Date(row.date)
      if (Number.isNaN(rowDate.getTime())) return false
      return rowDate >= start && rowDate <= end
    })
  }, [endDate, orders, startDate])

  const dailyPerformance = useMemo(() => {
    const grouped = filteredOrders.reduce((acc, row) => {
      const key = formatDateLabel(row.date)
      if (!acc[key]) {
        acc[key] = { date: key, orders: 0, sales: 0 }
      }

      acc[key].orders += 1
      acc[key].sales += Number(row.total_amount) || 0
      return acc
    }, {})

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => {
        const discounts = row.sales * 0.03
        return {
          ...row,
          discounts,
          netRevenue: row.sales - discounts,
        }
      })
  }, [filteredOrders])

  const revenueData = useMemo(
    () =>
      (salesRows || []).map((row) => ({
        month: row.month,
        value: Number(row.sales) || 0,
      })),
    [salesRows],
  )

  const pieData = useMemo(() => {
    const counts = products.reduce((acc, row) => {
      const key = row.category || 'Other'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const colors = ['#16a34a', '#0ea5e9', '#f59e0b', '#ef4444', '#64748b']
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }))
  }, [products])

  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, row) => sum + (Number(row.total_amount) || 0), 0)
    const totalOrders = filteredOrders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const topCategory = pieData.length
      ? [...pieData].sort((a, b) => b.value - a.value)[0]?.name || 'N/A'
      : 'N/A'

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topCategory,
    }
  }, [filteredOrders, pieData])

  const downloadTextFile = (filename, content, mimeType = 'text/plain;charset=utf-8;') => {
    const blob = new Blob([content], { type: mimeType })
    const link = document.createElement('a')
    const objectUrl = URL.createObjectURL(blob)
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  }

  const handleExportExcel = () => {
    const rows = [
      ['Date', 'Orders', 'Sales', 'Discounts', 'Net Revenue'],
      ...dailyPerformance.map((row) => [
        row.date,
        row.orders,
        row.sales.toFixed(2),
        row.discounts.toFixed(2),
        row.netRevenue.toFixed(2),
      ]),
    ]

    const csv = rows
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    downloadTextFile('reports-export.xls', csv, 'application/vnd.ms-excel;charset=utf-8;')
  }

  const handleExportPdf = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    let y = 50

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text('VSA Foods - Reports Dashboard', 40, y)
    y += 20

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.text(`Date Range: ${startDate} to ${endDate}`, 40, y)
    y += 20
    pdf.text(`Total Revenue: ${formatCurrency(metrics.totalRevenue)}`, 40, y)
    y += 16
    pdf.text(`Total Orders: ${metrics.totalOrders}`, 40, y)
    y += 16
    pdf.text(`Avg Order Value: ${formatCurrency(metrics.avgOrderValue)}`, 40, y)
    y += 16
    pdf.text(`Top Category: ${metrics.topCategory}`, 40, y)
    y += 24

    pdf.setFont('helvetica', 'bold')
    pdf.text('Daily Performance Summary', 40, y)
    y += 20

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)

    dailyPerformance.slice(0, 20).forEach((row) => {
      if (y > 780) {
        pdf.addPage()
        y = 50
      }

      pdf.text(
        `${row.date} | Orders: ${row.orders} | Sales: ${formatCurrency(row.sales)} | Net: ${formatCurrency(row.netRevenue)}`,
        40,
        y,
      )
      y += 14
    })

    pdf.save('reports-dashboard.pdf')
  }

  const summaryCards = [
    { title: 'Total Revenue', value: formatCurrency(metrics.totalRevenue) },
    { title: 'Total Orders', value: metrics.totalOrders },
    { title: 'Avg Order Value', value: formatCurrency(metrics.avgOrderValue) },
    { title: 'Top Category', value: metrics.topCategory },
  ]

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Reports Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Analyze revenue trends and export performance insights for your team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Download size={16} />
            Download PDF
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <FileSpreadsheet size={16} />
            Export Excel
          </button>
        </div>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchReportData()}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:max-w-2xl">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
            />
          </div>

          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Revenue Over Time</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Sales Breakdown</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Daily Performance Summary</h2>
        </div>

        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Orders</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Sales</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Discounts</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Net Revenue</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={5}>
                  Loading report rows...
                </td>
              </tr>
            ) : dailyPerformance.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={5}>
                  No performance records found for the selected range.
                </td>
              </tr>
            ) : (
              dailyPerformance.map((row) => (
                <tr key={row.date} className="border-t border-slate-100">
                  <td className="px-6 py-4 text-sm text-slate-700">{row.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.orders}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(row.sales)}</td>
                  <td className="px-6 py-4 text-sm text-red-600">- {formatCurrency(row.discounts)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-emerald-700">{formatCurrency(row.netRevenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </article>
    </section>
  )
}

export default ExecutiveAnalyticsDashboard