import { Download, Eye } from 'lucide-react'

const PAYROLL_KPIS = [
  { label: 'Total Payroll', value: '₹1,43,000', valueClass: 'text-gray-900' },
  { label: 'Paid', value: '₹76,500', valueClass: 'text-emerald-600' },
  { label: 'Pending', value: '₹52,200', valueClass: 'text-amber-600' },
]

const PAYROLL_ROWS = [
  {
    employee: 'Vikram Singh',
    role: 'Production Lead',
    baseSalary: 35000,
    deductions: 3500,
    netPay: 31500,
    status: 'Paid',
  },
  {
    employee: 'Anita Desai',
    role: 'Quality Inspector',
    baseSalary: 28000,
    deductions: 2800,
    netPay: 25200,
    status: 'Paid',
  },
  {
    employee: 'Ravi Kumar',
    role: 'Warehouse Manager',
    baseSalary: 32000,
    deductions: 3200,
    netPay: 28800,
    status: 'Pending',
  },
  {
    employee: 'Sunita Patel',
    role: 'Machine Operator',
    baseSalary: 22000,
    deductions: 2200,
    netPay: 19800,
    status: 'Paid',
  },
  {
    employee: 'Arun Mehta',
    role: 'Packing Supervisor',
    baseSalary: 26000,
    deductions: 2600,
    netPay: 23400,
    status: 'Pending',
  },
]

function getStatusClasses(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-700'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function Payroll() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">Payroll</h1>
        <p className="mt-1 text-base text-gray-500">Manage employee salaries, deductions, and payslips</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PAYROLL_KPIS.map((kpi) => (
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
            {PAYROLL_ROWS.map((row) => (
              <tr key={row.employee} className="border-b border-gray-100 last:border-b-0">
                <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.employee}</td>
                <td className="px-6 py-5 text-sm text-gray-500">{row.role}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-900">₹{row.baseSalary.toLocaleString('en-IN')}</td>
                <td className="px-6 py-5 text-sm font-medium text-red-500">₹{row.deductions.toLocaleString('en-IN')}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-900">₹{row.netPay.toLocaleString('en-IN')}</td>

                <td className="px-6 py-5">
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                    {row.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`View ${row.employee}`}
                      className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Download payslip for ${row.employee}`}
                      className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Download size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Payroll
