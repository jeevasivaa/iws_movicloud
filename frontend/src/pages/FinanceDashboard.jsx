import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Wallet,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

const FINANCE_KPI_DATA = [
  {
    id: 1,
    title: 'Total Revenue',
    value: '₹12,45,000',
    change: '+15.8%',
    isPositive: true,
    Icon: TrendingUp,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
  {
    id: 2,
    title: 'Outstanding Invoices',
    value: '₹3,85,000',
    change: '-8.2%',
    isPositive: false,
    Icon: AlertCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  {
    id: 3,
    title: 'Total Expenses',
    value: '₹6,75,000',
    change: '+5.3%',
    isPositive: false,
    Icon: TrendingDown,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  {
    id: 4,
    title: 'Net Profit',
    value: '₹5,70,000',
    change: '+22.4%',
    isPositive: true,
    Icon: DollarSign,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
]

const REVENUE_TREND = [
  { month: 'Jan', revenue: 450000, expenses: 280000, profit: 170000 },
  { month: 'Feb', revenue: 520000, expenses: 315000, profit: 205000 },
  { month: 'Mar', revenue: 680000, expenses: 380000, profit: 300000 },
  { month: 'Apr', revenue: 750000, expenses: 420000, profit: 330000 },
  { month: 'May', revenue: 890000, expenses: 450000, profit: 440000 },
  { month: 'Jun', revenue: 1245000, expenses: 675000, profit: 570000 },
]

const CASH_FLOW = [
  { week: 'Week 1', inflow: 250000, outflow: 180000 },
  { week: 'Week 2', inflow: 320000, outflow: 210000 },
  { week: 'Week 3', inflow: 280000, outflow: 195000 },
  { week: 'Week 4', inflow: 395000, outflow: 290000 },
]

const INVOICE_SUMMARY = [
  { status: 'Paid', count: 28, amount: 8750000, color: '#10b981' },
  { status: 'Pending', count: 12, amount: 2450000, color: '#f59e0b' },
  { status: 'Overdue', count: 5, amount: 850000, color: '#ef4444' },
]

const EXPENSE_CATEGORIES = [
  { category: 'Salaries', amount: 350000, percentage: 52 },
  { category: 'Materials', amount: 185000, percentage: 27 },
  { category: 'Utilities', amount: 98000, percentage: 14 },
  { category: 'Other', amount: 42000, percentage: 7 },
]

function KPICard({ card }) {
  const { Icon, bgColor, textColor, title, value, change, isPositive } = card
  return (
    <div className={`rounded-lg border ${card.borderColor} ${bgColor} p-6 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${textColor}`}>{value}</p>
          <div className="mt-3 flex items-center gap-1">
            {isPositive ? (
              <>
                <ArrowUpRight className={`h-4 w-4 ${textColor}`} />
                <span className={`text-sm font-medium ${textColor}`}>{change}</span>
              </>
            ) : (
              <>
                <ArrowDownLeft className={`h-4 w-4 ${textColor}`} />
                <span className={`text-sm font-medium ${textColor}`}>{change}</span>
              </>
            )}
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        </div>
        <div className={`rounded-full ${bgColor} p-3`}>
          <Icon className={`h-6 w-6 ${textColor}`} />
        </div>
      </div>
    </div>
  )
}

function FinanceDashboard() {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Optional: Fetch real finance data from backend
    // const fetchFinanceData = async () => {
    //   try {
    //     const response = await apiGet('/api/dashboard/finance', token)
    //   } catch (error) {
    //     console.error('Error fetching finance data:', error)
    //   }
    // }
    // fetchFinanceData()
  }, [token])

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="mt-2 text-gray-600">Track your financial performance and metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {FINANCE_KPI_DATA.map((card) => (
          <KPICard key={card.id} card={card} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend - Full Width */}
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue vs Expenses vs Profit</h2>
            <p className="text-sm text-gray-600">Last 6 months trend</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={REVENUE_TREND}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorExpenses)"
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Invoice Status</h2>
          </div>
          <div className="space-y-4">
            {INVOICE_SUMMARY.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-600">{item.status}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{item.count}</p>
                  <p className="text-xs text-gray-500">₹{(item.amount / 100000).toFixed(1)}L</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cash Flow & Expenses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cash Flow */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Weekly Cash Flow</h2>
            <p className="text-sm text-gray-600">Inflow vs Outflow</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={CASH_FLOW}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="inflow" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="outflow" fill="#ef4444" radius={[8, 8, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Expense Breakdown</h2>
            <p className="text-sm text-gray-600">By category</p>
          </div>
          <div className="space-y-4">
            {EXPENSE_CATEGORIES.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm font-bold text-gray-900">₹{(item.amount / 100000).toFixed(2)}L</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: '#3b82f6',
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{item.percentage}% of total</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <button className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-all hover:bg-blue-50">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Create Invoice</p>
              <p className="text-xs text-gray-600">New invoice</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-all hover:bg-emerald-50">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Process Payroll</p>
              <p className="text-xs text-gray-600">Monthly payroll</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-all hover:bg-purple-50">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">View Reports</p>
              <p className="text-xs text-gray-600">Financial reports</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-all hover:bg-orange-50">
            <PieChartIcon className="h-5 w-5 text-orange-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">View Analytics</p>
              <p className="text-xs text-gray-600">Detailed analysis</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FinanceDashboard
