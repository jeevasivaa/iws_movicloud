import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, Wallet, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

function getStatusClasses(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-700 border-green-200'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

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

function sanitizeFileName(value, fallback) {
  const normalized = String(value || fallback).trim()
  const cleaned = normalized.replace(/[^a-zA-Z0-9-_]+/g, '_')
  return cleaned || fallback
}

function buildPayslipText(row) {
  return [
    'Payslip',
    `Employee: ${row?.employee_name || 'N/A'}`,
    `Role: ${row?.employee_role || 'N/A'}`,
    `Month: ${row?.month || 'N/A'}`,
    `Status: ${row?.status || 'N/A'}`,
    `Base Salary: ${formatCurrency(row?.base_salary)}`,
    `Deductions: ${formatCurrency(row?.deductions)}`,
    `Net Pay: ${formatCurrency(row?.net_pay)}`,
  ].join('\n')
}

const PAYROLL_TREND = [
  { month: 'Jan', total: 450000, paid: 400000, pending: 50000 },
  { month: 'Feb', total: 520000, paid: 480000, pending: 40000 },
  { month: 'Mar', total: 680000, paid: 620000, pending: 60000 },
  { month: 'Apr', total: 750000, paid: 700000, pending: 50000 },
  { month: 'May', total: 890000, paid: 820000, pending: 70000 },
  { month: 'Jun', total: 1050000, paid: 950000, pending: 100000 },
]

function KPICard({ card }) {
  const { Icon, bgColor, textColor, title, value, change, isPositive } = card
  return (
    <div className={`admin-kpi-card rounded-lg border ${card.borderColor} ${bgColor} p-6 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="admin-muted-label text-gray-600">{title}</p>
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
        <div className={`admin-icon-chip rounded-full ${bgColor} p-3`}>
          <Icon className={`h-6 w-6 ${textColor}`} />
        </div>
      </div>
    </div>
  )
}

function Payroll() {
  const { token } = useAuth()
  const [summary, setSummary] = useState({ total_payroll: 0, paid: 0, pending: 0 })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [viewingRow, setViewingRow] = useState(null)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadPayroll = async () => {
      if (!token) {
        if (isActive) {
          setRows([])
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

        const [summaryResponse, payrollRowsResponse, staffResponse] = await Promise.all([
          apiGet('/api/payroll/summary', token, { signal: controller.signal }),
          apiGet('/api/payroll', token, { signal: controller.signal }),
          apiGet('/api/staff', token, { signal: controller.signal }),
        ])

        if (!isActive) return

        const staffMap = new Map(
          (Array.isArray(staffResponse) ? staffResponse : []).map((staffMember) => [staffMember._id, staffMember]),
        )

        const mappedRows = (Array.isArray(payrollRowsResponse) ? payrollRowsResponse : []).map((row) => {
          const staff = staffMap.get(String(row.staff_id))
          return {
            ...row,
            employee_name: staff?.name || row.employee_name || 'Staff Member',
            employee_role: staff?.role || row.employee_role || 'Employee',
          }
        })

        setRows(mappedRows)
        setSummary({
          total_payroll: Number(summaryResponse?.total_payroll) || 0,
          paid: Number(summaryResponse?.paid) || 0,
          pending: Number(summaryResponse?.pending) || 0,
        })
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setRows([])
        setSummary({ total_payroll: 0, paid: 0, pending: 0 })
        setError(err.message || 'Failed to load payroll data')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadPayroll()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex])

  const payrollKpis = useMemo(
    () => [
      {
        id: 1,
        title: 'Total Payroll',
        value: formatCurrency(summary.total_payroll),
        change: '+5.2%',
        isPositive: true,
        Icon: Wallet,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200',
      },
      {
        id: 2,
        title: 'Amount Paid',
        value: formatCurrency(summary.paid),
        change: '+8.1%',
        isPositive: true,
        Icon: TrendingUp,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
      },
      {
        id: 3,
        title: 'Pending',
        value: formatCurrency(summary.pending),
        change: '-2.3%',
        isPositive: false,
        Icon: AlertCircle,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-200',
      },
    ],
    [summary.pending, summary.paid, summary.total_payroll],
  )

  const closePayslipModal = () => {
    setViewingRow(null)
  }

  const handleViewPayslip = (row) => {
    setViewingRow(row)
  }

  const handleDownloadPayslip = (row) => {
    const fileName = `${sanitizeFileName(row?.employee_name, 'employee')}_${sanitizeFileName(row?.month, 'payslip')}.txt`
    downloadTextFile(fileName, buildPayslipText(row))
    toast.success(`Downloaded payslip for ${row?.employee_name || 'employee'}`)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="mt-2 text-gray-600">Manage employee salaries, deductions, and payslips</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Error Message */}
      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {payrollKpis.map((card) => (
          <KPICard key={card.id} card={card} />
        ))}
      </div>

      {/* Payroll Trend Chart */}
      <div className="admin-chart-card rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="admin-section-title">Payroll Trend</h2>
          <p className="text-sm text-gray-600">Last 6 months</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={PAYROLL_TREND}>
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
            <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="paid" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payroll Table */}
      <div className="admin-widget-card rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="admin-section-title">Payroll Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Base Salary</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-gray-500" colSpan={7}>
                    Loading payroll records...
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id || `${row.staff_id}-${row.month}`}>
                    <td className="font-medium text-gray-900">{row.employee_name}</td>
                    <td>{row.employee_role}</td>
                    <td className="font-medium text-gray-900">{formatCurrency(row.base_salary)}</td>
                    <td className="font-medium text-red-600">{formatCurrency(row.deductions)}</td>
                    <td className="font-medium text-gray-900">{formatCurrency(row.net_pay)}</td>
                    <td>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium border ${getStatusClasses(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewPayslip(row)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View payslip"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPayslip(row)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download payslip"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-500">No payroll records found.</div>
          ) : null}
        </div>
      </div>

      {/* Payslip Modal */}
      <Modal
        isOpen={Boolean(viewingRow)}
        onClose={closePayslipModal}
        title={`Payslip · ${viewingRow?.employee_name || ''}`}
        description="Review salary breakup and payout status."
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Employee</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{viewingRow?.employee_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Role</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{viewingRow?.employee_role || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Month</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{viewingRow?.month || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Status</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{viewingRow?.status || 'N/A'}</p>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-emerald-50 p-4">
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Base Salary</span>
                <span className="font-medium text-gray-900">{formatCurrency(viewingRow?.base_salary)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Deductions</span>
                <span className="font-medium text-red-600">{formatCurrency(viewingRow?.deductions)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-900">Net Pay</span>
                <span className="font-semibold text-gray-900">{formatCurrency(viewingRow?.net_pay)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={closePayslipModal}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Payroll
