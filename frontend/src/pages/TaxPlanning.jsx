import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Download,
  Plus,
  Edit2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const TAX_SUMMARY = [
  {
    id: 1,
    name: 'Income Tax',
    amount: 185000,
    rate: '18%',
    status: 'Pending',
    dueDate: '2024-06-30',
    statusColor: 'bg-yellow-100 text-yellow-700',
  },
  {
    id: 2,
    name: 'GST',
    amount: 125000,
    rate: '5-18%',
    status: 'Paid',
    dueDate: '2024-05-20',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    id: 3,
    name: 'TDS',
    amount: 45000,
    rate: '10%',
    status: 'Pending',
    dueDate: '2024-07-10',
    statusColor: 'bg-yellow-100 text-yellow-700',
  },
  {
    id: 4,
    name: 'Property Tax',
    amount: 28000,
    rate: 'Fixed',
    status: 'Paid',
    dueDate: '2024-03-15',
    statusColor: 'bg-green-100 text-green-700',
  },
]

const TAX_BREAKDOWN = [
  { month: 'Jan', income: 450000, tax: 81000, expense: 110000 },
  { month: 'Feb', income: 520000, tax: 93600, expense: 130000 },
  { month: 'Mar', income: 680000, tax: 122400, expense: 170000 },
  { month: 'Apr', income: 750000, tax: 135000, expense: 190000 },
  { month: 'May', income: 890000, tax: 160200, expense: 220000 },
  { month: 'Jun', income: 1245000, tax: 224100, expense: 300000 },
]

const TAX_OPTIMIZATIONS = [
  {
    id: 1,
    title: 'Section 80C Investment',
    description: 'Invest in approved schemes for tax deduction',
    potential: '₹1,50,000',
    status: 'Available',
    statusColor: 'text-emerald-600',
  },
  {
    id: 2,
    title: 'Medical Insurance',
    description: 'Health insurance premium deduction under Section 80D',
    potential: '₹50,000',
    status: 'Available',
    statusColor: 'text-emerald-600',
  },
  {
    id: 3,
    title: 'Education Loan Interest',
    description: 'Interest on education loan deduction under Section 80E',
    potential: '₹75,000',
    status: 'In Progress',
    statusColor: 'text-blue-600',
  },
  {
    id: 4,
    title: 'Charitable Donations',
    description: 'Deduction under Section 80G & 80GG',
    potential: '₹40,000',
    status: 'Available',
    statusColor: 'text-emerald-600',
  },
]

const DEADLINES = [
  { task: 'Q1 GST Return', date: '2024-04-20', daysLeft: 8, priority: 'high' },
  { task: 'Q2 Income Tax TDS', date: '2024-06-07', daysLeft: 26, priority: 'medium' },
  { task: 'Half-yearly TCS Report', date: '2024-08-10', daysLeft: 59, priority: 'low' },
  { task: 'Annual Income Tax Filing', date: '2024-12-31', daysLeft: 264, priority: 'low' },
]

function getPriorityColor(priority) {
  if (priority === 'high') return 'bg-red-100 text-red-700'
  if (priority === 'medium') return 'bg-yellow-100 text-yellow-700'
  return 'bg-blue-100 text-blue-700'
}

function TaxPlanning() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Planning</h1>
          <p className="mt-2 text-gray-600">Manage taxes and optimize deductions</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Tax Entry
        </button>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {TAX_SUMMARY.map((tax) => (
          <div key={tax.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{tax.name}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">₹{(tax.amount / 100000).toFixed(2)}L</p>
                <p className="mt-1 text-xs text-gray-500">Rate: {tax.rate}</p>
              </div>
              <span className={`rounded px-3 py-1 text-xs font-medium ${tax.statusColor}`}>
                {tax.status}
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-600">Due: {tax.dueDate}</p>
          </div>
        ))}
      </div>

      {/* Tax vs Income & Expense */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Income vs Tax vs Expense</h2>
          <p className="text-sm text-gray-600">Monthly comparison</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={TAX_BREAKDOWN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="tax" fill="#ef4444" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tax Optimization Opportunities */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-gray-900">Tax Optimization Opportunities</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TAX_OPTIMIZATIONS.map((opt) => (
            <div
              key={opt.id}
              className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{opt.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{opt.description}</p>
                  <p className={`mt-3 font-bold ${opt.statusColor}`}>{opt.potential}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${opt.statusColor}`}>
                  {opt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-gray-900">Important Deadlines</h2>
        <div className="space-y-3">
          {DEADLINES.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3 flex-1">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{item.task}</p>
                  <p className="text-sm text-gray-600">{item.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityColor(item.priority)}`}>
                  {item.daysLeft} days
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Efficiency Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-gray-600">Total Tax Paid YTD</p>
          <p className="mt-2 text-2xl font-bold text-green-600">₹7,96,300</p>
          <p className="mt-1 text-xs text-gray-600">as of today</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-gray-600">Effective Tax Rate</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">18.0%</p>
          <p className="mt-1 text-xs text-gray-600">optimized</p>
        </div>
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm font-medium text-gray-600">Potential Savings</p>
          <p className="mt-2 text-2xl font-bold text-purple-600">₹2,65,000</p>
          <p className="mt-1 text-xs text-gray-600">with optimization</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-medium text-gray-600">Compliance Score</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">92%</p>
          <p className="mt-1 text-xs text-gray-600">excellent</p>
        </div>
      </div>
    </div>
  )
}

export default TaxPlanning
