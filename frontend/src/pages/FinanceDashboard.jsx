import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock3,
  IndianRupee,
  Plus,
  ShoppingCart,
  Wallet,
  X,
} from 'lucide-react'
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
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient from '../services/apiClient'

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function normalizeMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function toShortMonthLabel(label) {
  const parts = String(label || '').trim().split(' ')
  if (parts.length === 2 && parts[0].length >= 3) {
    return `${parts[0].slice(0, 3)} ${parts[1]}`
  }
  return String(label || '')
}

const QUICK_ACTIONS = [
  {
    id: 'create-order',
    icon: '📦',
    label: 'Create New Order',
    checklist: ['Choose client account', 'Add line items and quantities', 'Review totals and taxes'],
  },
  {
    id: 'start-production',
    icon: '🏭',
    label: 'Start Production Batch',
    checklist: ['Assign batch and line', 'Confirm raw material readiness', 'Capture planned completion date'],
  },
  {
    id: 'generate-invoice',
    icon: '💰',
    label: 'Generate Invoice',
    checklist: ['Select client and order reference', 'Validate billing amount', 'Set payment status and due date'],
  },
  {
    id: 'create-purchase-order',
    icon: '🛒',
    label: 'Create Purchase Order',
    checklist: ['Select supplier', 'Add requested materials', 'Confirm expected delivery window'],
  },
  {
    id: 'add-staff-member',
    icon: '👤',
    label: 'Add Staff Member',
    checklist: ['Enter profile information', 'Set role and department', 'Confirm active status'],
  },
]

function FinanceDashboard() {
  const { user } = useAuth()
  const [salesRows, setSalesRows] = useState([])
  const [cashFlowRows, setCashFlowRows] = useState([])
  const [summary, setSummary] = useState({ total_billed: 0, total_outstanding: 0 })
  const [expenseSummary, setExpenseSummary] = useState({ total_expenses: 0 })
  const [activeOrders, setActiveOrders] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showQuickActionMenu, setShowQuickActionMenu] = useState(false)
  const [activeChecklist, setActiveChecklist] = useState(null)
  const [checklistItems, setChecklistItems] = useState([])

  const fetchDashboardData = useCallback(async (signal) => {
    try {
      setIsLoading(true)
      setError('')

      const [salesResponse, cashFlowResponse, billingSummaryResponse, expenseSummaryResponse, ordersResponse] = await Promise.all([
        apiClient.get('/api/reports/sales', { signal }),
        apiClient.get('/api/reports/cash-flow', { signal }),
        apiClient.get('/api/billing/summary', { signal }),
        apiClient.get('/api/expenses/summary', { signal }),
        apiClient.get('/api/orders', { signal }),
      ])

      const normalizedSales = Array.isArray(salesResponse.data)
        ? salesResponse.data.map((row) => ({ month: toShortMonthLabel(row.month), sales: normalizeMoney(row.sales) }))
        : []

      const normalizedCashFlow = Array.isArray(cashFlowResponse.data)
        ? cashFlowResponse.data.map((row) => ({
            month: toShortMonthLabel(row.month),
            income: normalizeMoney(row.income),
            expenses: normalizeMoney(row.expenses),
          }))
        : []

      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : []
      const activeOrderCount = orders.filter((order) => ['Pending', 'Processing', 'Shipped'].includes(order.status)).length

      setSalesRows(normalizedSales)
      setCashFlowRows(normalizedCashFlow)
      setSummary({
        total_billed: normalizeMoney(billingSummaryResponse?.data?.total_billed),
        total_outstanding: normalizeMoney(billingSummaryResponse?.data?.total_outstanding),
      })
      setExpenseSummary({
        total_expenses: normalizeMoney(expenseSummaryResponse?.data?.total_expenses),
      })
      setActiveOrders(activeOrderCount)
    } catch (err) {
      if (signal?.aborted) {
        return
      }

      setError(err?.response?.data?.msg || err?.message || 'Failed to load finance dashboard')
      setSalesRows([])
      setCashFlowRows([])
      setSummary({ total_billed: 302000, total_outstanding: 76000 })
      setExpenseSummary({ total_expenses: 145000 })
      setActiveOrders(48)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchDashboardData(controller.signal)
    return () => controller.abort()
  }, [fetchDashboardData])

  const kpiItems = useMemo(
    () => [
      {
        title: 'Total Revenue',
        value: formatCurrency(summary.total_billed || 302000),
        subtitle: 'Money received and billed',
        subtitleClass: 'text-emerald-600',
        Icon: IndianRupee,
        iconWrap: 'bg-emerald-50 text-emerald-500',
      },
      {
        title: 'Active Orders',
        value: String(activeOrders || 48),
        subtitle: 'Future incoming cash',
        subtitleClass: 'text-blue-600',
        Icon: ShoppingCart,
        iconWrap: 'bg-blue-50 text-blue-500',
      },
      {
        title: 'Outstanding Payments',
        value: formatCurrency(summary.total_outstanding || 76000),
        subtitle: 'Receivables pending from clients',
        subtitleClass: 'text-red-600',
        Icon: AlertTriangle,
        iconWrap: 'bg-red-50 text-red-500',
      },
      {
        title: 'Monthly Expenses',
        value: formatCurrency(expenseSummary.total_expenses || 145000),
        subtitle: 'Current month spend',
        subtitleClass: 'text-amber-600',
        Icon: Wallet,
        iconWrap: 'bg-amber-50 text-amber-500',
      },
    ],
    [activeOrders, expenseSummary.total_expenses, summary.total_billed, summary.total_outstanding],
  )

  const handleViewSchedule = () => {
    setShowScheduleModal(true)
  }

  const handleQuickAction = () => {
    setShowQuickActionMenu(!showQuickActionMenu)
  }

  const closeChecklistModal = () => {
    setActiveChecklist(null)
    setChecklistItems([])
  }

  const handleQuickActionClick = (actionId) => {
    const action = QUICK_ACTIONS.find((entry) => entry.id === actionId)
    if (!action) {
      return
    }

    setActiveChecklist(action)
    setChecklistItems(
      action.checklist.map((label, index) => ({
        id: `${action.id}-${index}`,
        label,
        completed: false,
      })),
    )
    setShowQuickActionMenu(false)
  }

  const toggleChecklistItem = (itemId) => {
    setChecklistItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
    )
  }

  const completedChecklistItems = useMemo(
    () => checklistItems.filter((item) => item.completed).length,
    [checklistItems],
  )

  const allChecklistItemsDone = checklistItems.length > 0 && completedChecklistItems === checklistItems.length

  const handleCompleteChecklist = () => {
    if (!allChecklistItemsDone) {
      toast.error('Please complete every checklist item before finishing.')
      return
    }

    toast.success(`${activeChecklist?.label || 'Quick action'} is ready to proceed.`)
    closeChecklistModal()
  }

  const hasSalesRows = salesRows.length > 0
  const hasCashFlowRows = cashFlowRows.length > 0

  return (
    <section className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Welcome back, {user?.name?.split(' ')[0] || 'Finance'} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-base font-medium text-slate-500">Financial performance and cash-flow overview.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleViewSchedule}
            className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Clock3 size={20} />
            View Schedule
          </button>

          <div className="relative">
            <button
              onClick={handleQuickAction}
              className="inline-flex items-center gap-3 rounded-2xl bg-[#3fa874] px-5 py-2.5 text-lg font-semibold text-white transition-colors hover:bg-[#348f62]"
            >
              <Plus size={20} />
              Quick Action
            </button>

            {showQuickActionMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-10">
                <div className="p-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleQuickActionClick(action.id)}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
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
        <article className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-3xl leading-none font-semibold text-slate-800">Monthly Sales</h2>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading monthly sales...</div>
            ) : hasSalesRows ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesRows}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" axisLine={{ stroke: '#94a3b8' }} tickLine={false} tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }} />
                  <YAxis
                    axisLine={{ stroke: '#94a3b8' }}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                    tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                  />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Sales']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="sales" fill="#43a979" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No sales data available.</div>
            )}
          </div>
        </article>

        <article className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-3xl leading-none font-semibold text-slate-800">Cash Flow (Income vs. Expenses)</h2>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading cash flow...</div>
            ) : hasCashFlowRows ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowRows}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" axisLine={{ stroke: '#94a3b8' }} tickLine={false} tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }} />
                  <YAxis
                    axisLine={{ stroke: '#94a3b8' }}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                    tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                  />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a' }} />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No cash flow data available.</div>
            )}
          </div>
        </article>
      </section>

      {showQuickActionMenu && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setShowQuickActionMenu(false)}
        />
      )}

      <Modal
        isOpen={Boolean(activeChecklist)}
        onClose={closeChecklistModal}
        title={`${activeChecklist?.label || 'Quick Action'} Checklist`}
        description="Complete each step to unlock this action."
      >
        <div className="space-y-5">
          <div className="modal-shell space-y-2">
            {checklistItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklistItem(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${item.completed
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {item.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="modal-panel bg-gradient-to-r from-slate-50 to-white text-sm text-slate-600">
            {completedChecklistItems}/{checklistItems.length} checklist items completed.
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closeChecklistModal} className="modal-btn-secondary">
              Close
            </button>
            <button
              type="button"
              onClick={handleCompleteChecklist}
              disabled={!allChecklistItemsDone}
              className="modal-btn-primary"
            >
              Mark as Ready
            </button>
          </div>
        </div>
      </Modal>

      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Schedule</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="font-medium text-gray-900">Today's Finance Schedule</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li>• Vendor payout review - 11:30 AM</li>
                  <li>• Client receivables follow-up - 3:00 PM</li>
                </ul>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="font-medium text-gray-900">Upcoming Deadlines</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li>• GST filing preparation - March 28</li>
                  <li>• Payroll disbursement processing - March 30</li>
                  <li>• Monthly expense reconciliation - March 31</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default FinanceDashboard
