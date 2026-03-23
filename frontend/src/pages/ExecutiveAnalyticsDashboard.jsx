import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Download,
  Layers,
  LineChart,
  RefreshCcw,
  TrendingUp,
} from 'lucide-react'
import {
  Area,
  AreaChart,
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
import toast from 'react-hot-toast'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const FALLBACK_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const TREND_COLORS = ['#1f9d6b', '#2a8dbf', '#db8b2b']

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatNumber(value) {
  return (Number(value) || 0).toLocaleString('en-IN')
}

function formatPercent(value) {
  return `${(Number(value) || 0).toFixed(1)}%`
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

function escapeCsvCell(value) {
  const normalized = String(value ?? '')
  if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replace(/"/g, '""')}"`
  }
  return normalized
}

function downloadCsvFile(fileName, headers, rows) {
  const csvRows = [
    headers.map((header) => escapeCsvCell(header)).join(','),
    ...rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(',')),
  ]

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}

function ExecutiveAnalyticsDashboard() {
  const { token } = useAuth()
  const [salesData, setSalesData] = useState([])
  const [efficiencyData, setEfficiencyData] = useState([])
  const [inventoryRows, setInventoryRows] = useState([])
  const [supplierRows, setSupplierRows] = useState([])
  const [payrollRows, setPayrollRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const loadReports = useCallback(
    async (signal) => {
      if (!token) {
        setSalesData([])
        setEfficiencyData([])
        setInventoryRows([])
        setSupplierRows([])
        setPayrollRows([])
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const [
          salesResponse,
          efficiencyResponse,
          inventoryResponse,
          suppliersResponse,
          payrollResponse,
        ] = await Promise.all([
          apiClient.get('/api/reports/sales', { ...authConfig, signal }),
          apiClient.get('/api/reports/production-efficiency', { ...authConfig, signal }),
          apiClient.get('/api/inventory', { ...authConfig, signal }),
          apiClient.get('/api/suppliers', { ...authConfig, signal }),
          apiClient.get('/api/payroll', { ...authConfig, signal }),
        ])

        setSalesData(Array.isArray(salesResponse.data) ? salesResponse.data : [])
        setEfficiencyData(Array.isArray(efficiencyResponse.data) ? efficiencyResponse.data : [])
        setInventoryRows(Array.isArray(inventoryResponse.data) ? inventoryResponse.data : [])
        setSupplierRows(Array.isArray(suppliersResponse.data) ? suppliersResponse.data : [])
        setPayrollRows(Array.isArray(payrollResponse.data) ? payrollResponse.data : [])
      } catch (err) {
        if (signal?.aborted) {
          return
        }
        setSalesData([])
        setEfficiencyData([])
        setInventoryRows([])
        setSupplierRows([])
        setPayrollRows([])
        setError(getErrorMessage(err, 'Failed to load reports'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadReports(controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadReports])

  const monthLabels = useMemo(() => {
    if (salesData.length > 0) {
      return salesData.map((row) => row.month)
    }
    if (efficiencyData.length > 0) {
      return efficiencyData.map((row) => row.month)
    }
    return FALLBACK_MONTHS
  }, [efficiencyData, salesData])

  const salesChartData = useMemo(
    () =>
      monthLabels.map((month, index) => ({
        month,
        sales: Number(salesData[index]?.sales) || 0,
      })),
    [monthLabels, salesData],
  )

  const efficiencyChartData = useMemo(
    () =>
      monthLabels.map((month, index) => ({
        month,
        efficiency: Number(efficiencyData[index]?.efficiency) || 0,
      })),
    [efficiencyData, monthLabels],
  )

  const inventorySummary = useMemo(() => {
    const totalsByStatus = inventoryRows.reduce(
      (accumulator, row) => {
        const status = row.status || 'Unknown'
        accumulator.total += 1
        accumulator.byStatus[status] = (accumulator.byStatus[status] || 0) + 1
        return accumulator
      },
      { total: 0, byStatus: {} },
    )

    const chartRows = Object.entries(totalsByStatus.byStatus).map(([status, count], index) => ({
      name: status,
      value: count,
      color: TREND_COLORS[index % TREND_COLORS.length],
    }))

    return {
      totalItems: totalsByStatus.total,
      chartRows,
      criticalCount: totalsByStatus.byStatus.Critical || 0,
      lowCount: totalsByStatus.byStatus.Low || 0,
    }
  }, [inventoryRows])

  const supplierSummary = useMemo(() => {
    if (supplierRows.length === 0) {
      return {
        averageRating: 0,
        activeSuppliers: 0,
        totalOrders: 0,
      }
    }

    const totalRating = supplierRows.reduce((sum, supplier) => sum + (Number(supplier.rating) || 0), 0)
    const totalOrders = supplierRows.reduce((sum, supplier) => sum + (Number(supplier.total_orders) || 0), 0)

    return {
      averageRating: totalRating / supplierRows.length,
      activeSuppliers: supplierRows.filter((supplier) => supplier.status === 'Active').length,
      totalOrders,
    }
  }, [supplierRows])

  const payrollSummary = useMemo(() => {
    if (payrollRows.length === 0) {
      return {
        netPay: 0,
        deductions: 0,
        paidCount: 0,
      }
    }

    return payrollRows.reduce(
      (summary, row) => ({
        netPay: summary.netPay + (Number(row.net_pay) || 0),
        deductions: summary.deductions + (Number(row.deductions) || 0),
        paidCount: summary.paidCount + (row.status === 'Paid' ? 1 : 0),
      }),
      {
        netPay: 0,
        deductions: 0,
        paidCount: 0,
      },
    )
  }, [payrollRows])

  const topSalesMonth = useMemo(() => {
    if (salesChartData.length === 0) {
      return null
    }

    return salesChartData.reduce((highest, current) => (current.sales > highest.sales ? current : highest), salesChartData[0])
  }, [salesChartData])

  const avgEfficiency = useMemo(() => {
    if (efficiencyChartData.length === 0) {
      return 0
    }

    const total = efficiencyChartData.reduce((sum, row) => sum + (Number(row.efficiency) || 0), 0)
    return total / efficiencyChartData.length
  }, [efficiencyChartData])

  const infoCards = useMemo(
    () => [
      {
        title: 'Top Sales Month',
        value: topSalesMonth ? topSalesMonth.month : 'N/A',
        note: topSalesMonth ? formatCurrency(topSalesMonth.sales) : 'No data',
        icon: TrendingUp,
        iconClass: 'text-emerald-600',
      },
      {
        title: 'Avg Efficiency',
        value: formatPercent(avgEfficiency),
        note: `${efficiencyChartData.length} months analyzed`,
        icon: Activity,
        iconClass: 'text-blue-600',
      },
      {
        title: 'Low/Critical Stock',
        value: `${inventorySummary.lowCount + inventorySummary.criticalCount}`,
        note: `${inventorySummary.lowCount} low · ${inventorySummary.criticalCount} critical`,
        icon: AlertTriangle,
        iconClass: 'text-amber-600',
      },
      {
        title: 'Active Suppliers',
        value: formatNumber(supplierSummary.activeSuppliers),
        note: `Avg rating ${supplierSummary.averageRating.toFixed(1)}`,
        icon: Layers,
        iconClass: 'text-cyan-600',
      },
    ],
    [
      avgEfficiency,
      efficiencyChartData.length,
      inventorySummary.criticalCount,
      inventorySummary.lowCount,
      supplierSummary.activeSuppliers,
      supplierSummary.averageRating,
      topSalesMonth,
    ],
  )

  const exportCards = [
    {
      title: 'Inventory Report',
      subtitle: 'Stock levels, movement logs, expiry tracking',
      meta: `${formatNumber(inventorySummary.totalItems)} tracked items`,
      key: 'inventory',
    },
    {
      title: 'Supplier Performance',
      subtitle: 'Ratings, delivery times, and order volume',
      meta: `${formatNumber(supplierSummary.totalOrders)} cumulative orders`,
      key: 'suppliers',
    },
    {
      title: 'Payroll Summary',
      subtitle: 'Salary disbursements and deductions',
      meta: `${formatCurrency(payrollSummary.netPay)} net disbursed`,
      key: 'payroll',
    },
  ]

  const handleExportAll = () => {
    const lines = [
      'Executive Reports Snapshot',
      `Generated At: ${new Date().toISOString()}`,
      '',
      `Top Sales Month: ${topSalesMonth ? `${topSalesMonth.month} (${formatCurrency(topSalesMonth.sales)})` : 'N/A'}`,
      `Average Efficiency: ${formatPercent(avgEfficiency)}`,
      `Inventory Total Items: ${formatNumber(inventorySummary.totalItems)}`,
      `Inventory Low: ${formatNumber(inventorySummary.lowCount)}`,
      `Inventory Critical: ${formatNumber(inventorySummary.criticalCount)}`,
      `Active Suppliers: ${formatNumber(supplierSummary.activeSuppliers)}`,
      `Supplier Total Orders: ${formatNumber(supplierSummary.totalOrders)}`,
      `Payroll Net Pay: ${formatCurrency(payrollSummary.netPay)}`,
      `Payroll Deductions: ${formatCurrency(payrollSummary.deductions)}`,
      `Payroll Paid Records: ${formatNumber(payrollSummary.paidCount)} / ${formatNumber(payrollRows.length)}`,
    ]

    downloadTextFile('executive_reports_snapshot.txt', lines.join('\n'))
    toast.success('Exported reports snapshot')
  }

  const handleExportAllCsv = () => {
    const rows = [
      ['top_sales_month', topSalesMonth ? topSalesMonth.month : 'N/A'],
      ['top_sales_value', topSalesMonth ? Number(topSalesMonth.sales || 0) : 0],
      ['avg_efficiency_percent', Number(avgEfficiency.toFixed(1))],
      ['inventory_total_items', inventorySummary.totalItems],
      ['inventory_low_count', inventorySummary.lowCount],
      ['inventory_critical_count', inventorySummary.criticalCount],
      ['active_suppliers', supplierSummary.activeSuppliers],
      ['supplier_total_orders', supplierSummary.totalOrders],
      ['supplier_avg_rating', Number(supplierSummary.averageRating.toFixed(1))],
      ['payroll_net_pay', Number(payrollSummary.netPay.toFixed(2))],
      ['payroll_deductions', Number(payrollSummary.deductions.toFixed(2))],
      ['payroll_paid_records', payrollSummary.paidCount],
      ['payroll_total_records', payrollRows.length],
      ['generated_at', new Date().toISOString()],
    ]

    downloadCsvFile('executive_reports_snapshot.csv', ['metric', 'value'], rows)
    toast.success('Exported reports snapshot (CSV)')
  }

  const handleExportCard = (card) => {
    if (card.key === 'inventory') {
      const headers = ['item_name', 'type', 'warehouse_location', 'current_stock', 'max_capacity', 'status', 'expiry_date']
      const rows = inventoryRows.map((row) => [
        row.item_name,
        row.type,
        row.warehouse_location,
        Number(row.current_stock) || 0,
        Number(row.max_capacity) || 0,
        row.status,
        row.expiry_date || '',
      ])

      downloadCsvFile('inventory_report.csv', headers, rows)
      toast.success('Exported Inventory Report (CSV)')
      return
    }

    if (card.key === 'suppliers') {
      const headers = ['name', 'location', 'category_supplied', 'rating', 'total_orders', 'status']
      const rows = supplierRows.map((row) => [
        row.name,
        row.location,
        row.category_supplied,
        Number(row.rating) || 0,
        Number(row.total_orders) || 0,
        row.status,
      ])

      downloadCsvFile('supplier_performance.csv', headers, rows)
      toast.success('Exported Supplier Performance (CSV)')
      return
    }

    if (card.key === 'payroll') {
      const headers = ['staff_id', 'month', 'base_salary', 'deductions', 'net_pay', 'status']
      const rows = payrollRows.map((row) => [
        row.staff_id,
        row.month,
        Number(row.base_salary) || 0,
        Number(row.deductions) || 0,
        Number(row.net_pay) || 0,
        row.status,
      ])

      downloadCsvFile('payroll_summary.csv', headers, rows)
      toast.success('Exported Payroll Summary (CSV)')
      return
    }

    const lines = [
      card.title,
      card.subtitle,
      card.meta,
      `Generated At: ${new Date().toISOString()}`,
    ]

    const fileName = `${card.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'report'}.txt`
    downloadTextFile(fileName, lines.join('\n'))
    toast.success(`Exported ${card.title}`)
  }

  return (
    <section className="space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
            <p className="mt-1 text-base text-gray-600">Visual intelligence for sales, operations, procurement, and payroll.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadReports()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RefreshCcw size={16} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleExportAll}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              <Download size={17} />
              Export TXT
            </button>
            <button
              type="button"
              onClick={handleExportAllCsv}
              className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadReports()}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {infoCards.map((card) => {
          const Icon = card.icon

          return (
            <article key={card.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{card.value}</p>
                  <p className="mt-2 text-sm text-gray-500">{card.note}</p>
                </div>

                <span className="inline-flex rounded-lg bg-gray-50 p-2.5">
                  <Icon size={18} className={card.iconClass} />
                </span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">Sales Report</h2>
          </div>

          <div className="h-80">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading sales report...</div>
            ) : salesChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No sales data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Sales']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="#1f9d6b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <LineChart size={18} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Production Efficiency</h2>
          </div>

          <div className="h-80">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading efficiency report...</div>
            ) : efficiencyChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No efficiency data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={efficiencyChartData}>
                  <defs>
                    <linearGradient id="efficiencyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2a8dbf" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2a8dbf" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [formatPercent(value), 'Efficiency']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#2a8dbf"
                    strokeWidth={3}
                    fill="url(#efficiencyFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Layers size={18} className="text-cyan-600" />
            <h2 className="text-xl font-semibold text-gray-900">Inventory Status Mix</h2>
          </div>

          <div className="h-72">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading inventory mix...</div>
            ) : inventorySummary.chartRows.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No inventory status data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventorySummary.chartRows}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="50%"
                    outerRadius="75%"
                    paddingAngle={2}
                  >
                    {inventorySummary.chartRows.map((row) => (
                      <Cell key={row.name} fill={row.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [formatNumber(value), name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-4">
            {inventorySummary.chartRows.map((row) => (
              <div key={row.name} className="inline-flex items-center gap-2 text-sm text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                {row.name}: {formatNumber(row.value)}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Payroll Snapshot</h2>
          <p className="mt-1 text-sm text-gray-500">Latest disbursement status from finance records.</p>

          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-gray-500">Net Pay</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(payrollSummary.netPay)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-gray-500">Deductions</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(payrollSummary.deductions)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-gray-500">Paid Records</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatNumber(payrollSummary.paidCount)} / {formatNumber(payrollRows.length)}
              </p>
            </div>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {exportCards.map((card) => (
          <article key={card.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{card.subtitle}</p>
            <p className="mt-3 text-sm font-medium text-gray-700">{card.meta}</p>

            <button
              type="button"
              onClick={() => handleExportCard(card)}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download size={16} />
              Export CSV
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ExecutiveAnalyticsDashboard
