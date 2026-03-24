import React, { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Circle,
  Plus,
  IndianRupee,
  ShoppingCart,
  Factory,
  TriangleAlert,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
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
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'

const SALES_DATA = [
  { name: 'Jan', value: 42000 },
  { name: 'Feb', value: 38000 },
  { name: 'Mar', value: 55000 },
  { name: 'Apr', value: 47000 },
  { name: 'May', value: 62000 },
  { name: 'Jun', value: 58000 },
]

const PRODUCTION_DATA = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 145 },
  { name: 'Wed', value: 133 },
  { name: 'Thu', value: 159 },
  { name: 'Fri', value: 142 },
  { name: 'Sat', value: 95 },
]

const RECENT_ORDERS = [
  {
    id: 'ORD-2024-001',
    client: 'FreshMart Stores',
    status: 'Processing',
    amount: '₹45,200',
    statusClass: 'bg-[#f9f2dd] text-[#c79200]',
  },
  {
    id: 'ORD-2024-002',
    client: "Nature's Best Co.",
    status: 'Shipped',
    amount: '₹32,800',
    statusClass: 'bg-[#e6f2fe] text-[#2f7dd8]',
  },
  {
    id: 'ORD-2024-003',
    client: 'Green Valley Foods',
    status: 'Pending',
    amount: '₹67,500',
    statusClass: 'bg-[#fdeee6] text-[#e67c47]',
  },
  {
    id: 'ORD-2024-004',
    client: 'Organic Hub',
    status: 'Delivered',
    amount: '₹28,900',
    statusClass: 'bg-[#e8f6ef] text-[#39a978]',
  },
]

const INVENTORY_DATA = [
  { name: 'Cold Pressed Oils', value: 35, color: '#3ca976' },
  { name: 'Essential Oils', value: 25, color: '#3f7fc3' },
  { name: 'Raw Materials', value: 20, color: '#c39d21' },
  { name: 'Packaging', value: 20, color: '#8f63b2' },
]

const KPI_ITEMS = [
  {
    title: 'Total Revenue',
    value: '₹3,02,000',
    subtitle: '+12.5% from last month',
    subtitleClass: 'text-emerald-600',
    Icon: IndianRupee,
    iconWrap: 'bg-emerald-50 text-emerald-500',
  },
  {
    title: 'Active Orders',
    value: '48',
    subtitle: '+8 new today',
    subtitleClass: 'text-emerald-600',
    Icon: ShoppingCart,
    iconWrap: 'bg-blue-50 text-blue-500',
  },
  {
    title: 'Production Batches',
    value: '12',
    subtitle: '3 in progress',
    subtitleClass: 'text-slate-500',
    Icon: Factory,
    iconWrap: 'bg-purple-50 text-purple-500',
  },
  {
    title: 'Low Stock Items',
    value: '7',
    subtitle: 'Needs attention',
    subtitleClass: 'text-rose-500',
    Icon: TriangleAlert,
    iconWrap: 'bg-orange-50 text-orange-500',
  },
]

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

const Dashboard = () => {
  const { user } = useAuth()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showQuickActionMenu, setShowQuickActionMenu] = useState(false)
  const [activeChecklist, setActiveChecklist] = useState(null)
  const [checklistItems, setChecklistItems] = useState([])

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
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        {KPI_ITEMS.map((item) => (
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_DATA}>
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
                  domain={[0, 80000]}
                  ticks={[0, 20000, 40000, 60000, 80000]}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" fill="#43a979" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-3xl leading-none font-semibold text-slate-800">Production Output</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRODUCTION_DATA}>
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
                  domain={[0, 160]}
                  ticks={[0, 40, 80, 120, 160]}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(value) => [value, 'Units']}
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
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.95fr_1fr] gap-5">
        <article className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl leading-none font-semibold text-slate-800">Recent Orders</h2>
            <button className="text-xl leading-none font-medium text-[#34a56f] transition-colors hover:text-[#2a8a5c]">
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
                {RECENT_ORDERS.map((order) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-3xl leading-none font-semibold text-slate-800">Inventory Breakdown</h2>

          <div className="mx-auto h-[260px] w-[260px] max-w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INVENTORY_DATA}
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
                  {INVENTORY_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-2.5">
            {INVENTORY_DATA.map((entry) => (
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

      {/* Close menu when clicking outside */}
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

      {/* Schedule Modal */}
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
                <p className="font-medium text-gray-900">Today's Schedule</p>
                <p className="mt-2 text-sm text-gray-600">No scheduled tasks for today</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="font-medium text-gray-900">Upcoming Events</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li>• Production Batch BATCH-003 completion - Tomorrow 2:00 PM</li>
                  <li>• Supplier meeting with AgroFresh Farms - March 26</li>
                  <li>• Payroll processing deadline - March 30</li>
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
    </div>
  )
}

export default Dashboard
