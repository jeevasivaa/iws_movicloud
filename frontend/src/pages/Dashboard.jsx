import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Clock3,
  Plus,
  IndianRupee,
  ShoppingCart,
  Factory,
  TriangleAlert,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

const COLORS = ['#3ca976', '#3f7fc3', '#c39d21', '#8f63b2']

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function getOrderStatusClass(status) {
  if (status === 'Processing') return 'bg-[#f9f2dd] text-[#c79200]'
  if (status === 'Shipped') return 'bg-[#e6f2fe] text-[#2f7dd8]'
  if (status === 'Pending') return 'bg-[#fdeee6] text-[#e67c47]'
  return 'bg-[#e8f6ef] text-[#39a978]'
}

function Dashboard() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_orders: 0,
    active_staff: 0,
    low_stock_alerts: 0,
    low_stock_threshold: 100,
  })
  const [orders, setOrders] = useState([])
  const [salesData, setSalesData] = useState([])
  const [productionData, setProductionData] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false)

  const loadClientsMap = useCallback(async (signal) => {
    try {
      const clientsResponse = await apiGet('/api/marketing', token, { signal })
      return new Map(
        (Array.isArray(clientsResponse) ? clientsResponse : []).map((client) => [client._id, client.company_name]),
      )
    } catch {
      return new Map()
    }
  }, [token])

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadDashboard = async () => {
      if (!token) {
        if (isActive) {
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

        const [
          dashboardSummaryResponse,
          ordersResponse,
          salesReportResponse,
          productionEfficiencyResponse,
          inventoryResponse,
          clientsMap,
        ] = await Promise.all([
          apiGet('/api/dashboard/summary', token, { signal: controller.signal }),
          apiGet('/api/orders', token, { signal: controller.signal }),
          apiGet('/api/reports/sales', token, { signal: controller.signal }),
          apiGet('/api/reports/production-efficiency', token, { signal: controller.signal }),
          apiGet('/api/inventory', token, { signal: controller.signal }),
          loadClientsMap(controller.signal),
        ])

        if (!isActive) return

        const orderRows = Array.isArray(ordersResponse) ? ordersResponse : []
        const inventoryRows = Array.isArray(inventoryResponse) ? inventoryResponse : []
        const salesRows = Array.isArray(salesReportResponse) ? salesReportResponse : []
        const productionRows = Array.isArray(productionEfficiencyResponse) ? productionEfficiencyResponse : []

        setSummary({
          total_revenue: Number(dashboardSummaryResponse?.total_revenue) || 0,
          total_orders: Number(dashboardSummaryResponse?.total_orders) || 0,
          active_staff: Number(dashboardSummaryResponse?.active_staff) || 0,
          low_stock_alerts: Number(dashboardSummaryResponse?.low_stock_alerts) || 0,
          low_stock_threshold: Number(dashboardSummaryResponse?.low_stock_threshold) || 100,
        })

        setOrders(
          orderRows.map((order) => ({
            ...order,
            client_name: clientsMap.get(String(order.client_id)) || order.client_name || 'Client',
          })),
        )

        setSalesData(
          salesRows.map((row) => ({
            name: row.month,
            value: Number(row.sales) || 0,
          })),
        )

        setProductionData(
          productionRows.map((row) => ({
            name: row.month,
            value: Number(row.efficiency) || 0,
          })),
        )

        const groupedInventory = inventoryRows.reduce((accumulator, row) => {
          const key = row.type || 'Other'
          accumulator[key] = (accumulator[key] || 0) + 1
          return accumulator
        }, {})

        const totalInventoryItems = Object.values(groupedInventory).reduce((sum, count) => sum + count, 0)
        const pieRows = Object.entries(groupedInventory).map(([name, count], index) => ({
          name,
          value: totalInventoryItems > 0 ? Math.round((count / totalInventoryItems) * 100) : 0,
          color: COLORS[index % COLORS.length],
        }))

        setInventoryData(pieRows)
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setSummary({ total_revenue: 0, total_orders: 0, active_staff: 0, low_stock_alerts: 0, low_stock_threshold: 100 })
        setOrders([])
        setSalesData([])
        setProductionData([])
        setInventoryData([])
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex, loadClientsMap])

  const kpiItems = useMemo(
    () => [
      {
        title: 'Total Revenue',
        value: formatCurrency(summary.total_revenue),
        subtitle: `${summary.total_orders} orders tracked`,
        subtitleClass: 'text-emerald-600',
        Icon: IndianRupee,
        iconWrap: 'bg-emerald-50 text-emerald-500',
      },
      {
        title: 'Active Orders',
        value: String(summary.total_orders),
        subtitle: `${orders.filter((order) => order.status === 'Processing').length} processing`,
        subtitleClass: 'text-emerald-600',
        Icon: ShoppingCart,
        iconWrap: 'bg-blue-50 text-blue-500',
      },
      {
        title: 'Active Staff',
        value: String(summary.active_staff),
        subtitle: 'Operational staff members',
        subtitleClass: 'text-slate-500',
        Icon: Factory,
        iconWrap: 'bg-purple-50 text-purple-500',
      },
      {
        title: 'Low Stock Items',
        value: String(summary.low_stock_alerts),
        subtitle: `Threshold ≤ ${Number(summary.low_stock_threshold || 0).toLocaleString('en-IN')} units`,
        subtitleClass: 'text-rose-500',
        Icon: TriangleAlert,
        iconWrap: 'bg-orange-50 text-orange-500',
      },
    ],
    [orders, summary.active_staff, summary.low_stock_alerts, summary.low_stock_threshold, summary.total_orders, summary.total_revenue],
  )

  const quickActions = [
    { label: 'New Product', path: '/products', message: 'Opening Products' },
    { label: 'Create Invoice', path: '/billing', message: 'Opening Billing' },
    { label: 'Add Stock', path: '/inventory', message: 'Opening Inventory' },
    { label: 'Update Orders', path: '/orders', message: 'Opening Orders' },
  ]

  const handleQuickActionNavigate = (action) => {
    setIsQuickActionModalOpen(false)
    navigate(action.path)
    toast.success(action.message)
  }

  const recentOrders = useMemo(
    () =>
      orders
        .slice(0, 5)
        .map((order) => ({
          id: order.order_id,
          client: order.client_name || 'Client',
          status: order.status,
          amount: formatCurrency(order.total_amount),
          statusClass: getOrderStatusClass(order.status),
        })),
    [orders],
  )

  const maxSales = useMemo(() => {
    if (salesData.length === 0) return 0
    return salesData.reduce((maxValue, item) => {
      const value = Number(item.value) || 0
      return Math.max(maxValue, value)
    }, 0)
  }, [salesData])

  const maxProduction = useMemo(() => {
    if (productionData.length === 0) return 0
    return productionData.reduce((maxValue, item) => {
      const value = Number(item.value) || 0
      return Math.max(maxValue, value)
    }, 0)
  }, [productionData])

  return (
    <div className="space-y-7 animate-fade-in">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Welcome back, {user?.name?.split(' ')[0] || 'Raj'} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-base font-medium text-slate-500">Here's what's happening with your business today.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Clock3 size={20} />
            View Schedule
          </button>
          <button
            type="button"
            onClick={() => setIsQuickActionModalOpen(true)}
            className="inline-flex items-center gap-3 rounded-2xl bg-[#3fa874] px-5 py-2.5 text-lg font-semibold text-white transition-colors hover:bg-[#348f62]"
          >
            <Plus size={20} />
            Quick Action
          </button>
        </div>
      </section>

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

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <article key={item.title} className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-medium text-slate-500">{item.title}</p>
                <p className="mt-1 text-[34px] leading-none font-bold text-slate-800">{item.value}</p>
                <p className={`mt-2 text-base font-medium ${item.subtitleClass}`}>{item.subtitle}</p>
              </div>
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconWrap}`}>
                <item.Icon size={24} />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
        <article className="vsa-card min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-3xl leading-none font-semibold text-slate-800">Monthly Sales</h2>
          <div className="h-[300px] w-full min-w-0">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading sales chart...</div>
            ) : salesData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No sales data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={salesData}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: '#94a3b8' }}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={{ stroke: '#94a3b8' }}
                    tickLine={false}
                    domain={[0, maxSales > 0 ? Math.ceil(maxSales / 10000) * 10000 : 100000]}
                    tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="value" fill="#43a979" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="vsa-card min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-3xl leading-none font-semibold text-slate-800">Production Efficiency</h2>
          <div className="h-[300px] w-full min-w-0">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading production chart...</div>
            ) : productionData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No production data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={productionData}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: '#94a3b8' }}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={{ stroke: '#94a3b8' }}
                    tickLine={false}
                    domain={[0, maxProduction > 0 ? Math.max(100, Math.ceil(maxProduction / 10) * 10) : 100]}
                    tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                  />
                  <Tooltip
                    formatter={(value) => [value, 'Efficiency %']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3f7fc3"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#3f7fc3' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.95fr_1fr] gap-5">
        <article className="vsa-card min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl leading-none font-semibold text-slate-800">Recent Orders</h2>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="text-xl leading-none font-medium text-[#34a56f] transition-colors hover:text-[#2a8a5c]"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 text-left text-xl font-medium text-slate-500">Order ID</th>
                  <th className="py-3 text-left text-xl font-medium text-slate-500">Client</th>
                  <th className="py-3 text-left text-xl font-medium text-slate-500">Status</th>
                  <th className="py-3 text-right text-xl font-medium text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-8 text-center text-sm text-gray-500" colSpan={4}>
                      Loading recent orders...
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-sm text-gray-500" colSpan={4}>
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-200 last:border-b-0">
                      <td className="py-3 pr-4 text-[22px] font-medium text-slate-800">{order.id}</td>
                      <td className="py-3 pr-4 text-[22px] font-medium text-slate-800">{order.client}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-lg font-medium leading-none ${order.statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[22px] font-medium text-slate-800">{order.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="vsa-card min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-3xl leading-none font-semibold text-slate-800">Inventory Breakdown</h2>

          <div className="mx-auto h-[260px] w-full max-w-[260px] min-w-0">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading inventory chart...</div>
            ) : inventoryData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No inventory data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="88%"
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    stroke="#ffffff"
                    strokeWidth={4}
                  >
                    {inventoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <ul className="space-y-2.5">
            {inventoryData.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <span className="text-lg font-medium text-slate-700">{entry.name}</span>
                </div>
                <span className="text-lg font-medium text-slate-700">{entry.value}%</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Today's Schedule"
      >
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm text-gray-500">09:00 AM</p>
            <p className="mt-1 font-medium text-gray-900">Production stand-up with operations team</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm text-gray-500">11:30 AM</p>
            <p className="mt-1 font-medium text-gray-900">Warehouse stock review and approvals</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm text-gray-500">03:00 PM</p>
            <p className="mt-1 font-medium text-gray-900">Supplier coordination call</p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsScheduleModalOpen(false)
                navigate('/production-control')
                toast.success('Opening Production Control')
              }}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Open Schedule Board
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isQuickActionModalOpen}
        onClose={() => setIsQuickActionModalOpen(false)}
        title="Quick Actions"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleQuickActionNavigate(action)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default Dashboard
