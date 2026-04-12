import React, { useState } from 'react'
import { Plus, Download, Eye, Send, CreditCard, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
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

const BILLING_KPIS = [
  {
    id: 1,
    title: 'Total Billed',
    value: '₹2,28,700',
    change: '+8.2%',
    isPositive: true,
    Icon: CreditCard,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  {
    id: 2,
    title: 'Amount Received',
    value: '₹74,100',
    change: '+12.5%',
    isPositive: true,
    Icon: TrendingUp,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
  {
    id: 3,
    title: 'Outstanding',
    value: '₹1,54,600',
    change: '-5.3%',
    isPositive: false,
    Icon: AlertCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
]

const INVOICE_TREND = [
  { month: 'Jan', issued: 8, paid: 6, pending: 2 },
  { month: 'Feb', issued: 12, paid: 9, pending: 3 },
  { month: 'Mar', issued: 15, paid: 11, pending: 4 },
  { month: 'Apr', issued: 18, paid: 14, pending: 4 },
  { month: 'May', issued: 22, paid: 17, pending: 5 },
  { month: 'Jun', issued: 24, paid: 18, pending: 6 },
]

const PAYMENT_STATUS = [
  { status: 'Paid', count: 85, amount: 1850000, color: '#10b981' },
  { status: 'Pending', count: 28, amount: 620000, color: '#f59e0b' },
  { status: 'Overdue', count: 12, amount: 380000, color: '#ef4444' },
]


const RECENT_INVOICES = [
  {
    invoice: 'INV-2024-001',
    client: 'FreshMart Stores',
    date: '2024-03-01',
    amount: 45200,
    status: 'Paid',
  },
  {
    invoice: 'INV-2024-002',
    client: "Nature's Best Co.",
    date: '2024-03-05',
    amount: 32800,
    status: 'Pending',
  },
  {
    invoice: 'INV-2024-003',
    client: 'Green Valley Foods',
    date: '2024-03-08',
    amount: 67500,
    status: 'Overdue',
  },
  {
    invoice: 'INV-2024-004',
    client: 'Organic Hub',
    date: '2024-03-10',
    amount: 28900,
    status: 'Paid',
  },
]

function getStatusClasses(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-700 border-green-200'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

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

function Billing() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    clientName: '',
    amount: '',
    description: '',
  })

  const handleCreateInvoice = () => {
    setShowInvoiceModal(true)
  }

  const handleSubmitInvoice = () => {
    if (!invoiceData.clientName || !invoiceData.amount) {
      alert('Please fill in all required fields')
      return
    }
    alert(`Invoice created for ${invoiceData.clientName} - ₹${invoiceData.amount}`)
    setInvoiceData({ clientName: '', amount: '', description: '' })
    setShowInvoiceModal(false)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="mt-2 text-gray-600">Generate invoices, track payments, and manage billing</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleCreateInvoice}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {BILLING_KPIS.map((card) => (
          <KPICard key={card.id} card={card} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoice Trend */}
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Invoice Trend</h2>
            <p className="text-sm text-gray-600">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={INVOICE_TREND}>
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
              <Bar dataKey="issued" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="paid" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Payment Status</h2>
          </div>
          <div className="space-y-4">
            {PAYMENT_STATUS.map((item) => (
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

      {/* Recent Invoices */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Invoice</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_INVOICES.map((invoice) => (
                <tr key={invoice.invoice} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoice}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{invoice.client}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{invoice.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{invoice.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium border ${getStatusClasses(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Create Invoice</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name</label>
                <input
                  type="text"
                  value={invoiceData.clientName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={invoiceData.amount}
                  onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={invoiceData.description}
                  onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInvoice}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Billing
