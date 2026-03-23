import { useEffect, useMemo, useState } from 'react'
import { Download, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

function getStatusClasses(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-700'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
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
      { label: 'Total Payroll', value: formatCurrency(summary.total_payroll), valueClass: 'text-gray-900' },
      { label: 'Paid', value: formatCurrency(summary.paid), valueClass: 'text-emerald-600' },
      { label: 'Pending', value: formatCurrency(summary.pending), valueClass: 'text-amber-600' },
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
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">Payroll</h1>
        <p className="mt-1 text-base text-gray-500">Manage employee salaries, deductions, and payslips</p>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {payrollKpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`mt-2 text-5xl font-semibold ${kpi.valueClass}`}>{kpi.value}</p>
          </article>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Employee</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Role</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Base Salary</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Deductions</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Net Pay</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={7}>
                  Loading payroll records...
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id || `${row.staff_id}-${row.month}`} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.employee_name}</td>
                  <td className="px-6 py-5 text-sm text-gray-500">{row.employee_role}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{formatCurrency(row.base_salary)}</td>
                  <td className="px-6 py-5 text-sm font-medium text-red-500">{formatCurrency(row.deductions)}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{formatCurrency(row.net_pay)}</td>

                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewPayslip(row)}
                        aria-label={`View ${row.employee_name}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPayslip(row)}
                        aria-label={`Download payslip for ${row.employee_name}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Download size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && rows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No payroll records found.</div>
        ) : null}
      </div>

      <Modal
        isOpen={Boolean(viewingRow)}
        onClose={closePayslipModal}
        title={`Payslip · ${viewingRow?.employee_name || ''}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="text-gray-500">Employee</p>
              <p className="mt-1 font-semibold text-gray-900">{viewingRow?.employee_name || 'N/A'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="text-gray-500">Role</p>
              <p className="mt-1 font-semibold text-gray-900">{viewingRow?.employee_role || 'N/A'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="text-gray-500">Month</p>
              <p className="mt-1 font-semibold text-gray-900">{viewingRow?.month || 'N/A'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="text-gray-500">Status</p>
              <p className="mt-1 font-semibold text-gray-900">{viewingRow?.status || 'N/A'}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Base Salary</span>
                <span className="font-medium text-gray-900">{formatCurrency(viewingRow?.base_salary)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Deductions</span>
                <span className="font-medium text-red-500">{formatCurrency(viewingRow?.deductions)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-900">Net Pay</span>
                <span className="font-semibold text-gray-900">{formatCurrency(viewingRow?.net_pay)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={closePayslipModal}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

export default Payroll
