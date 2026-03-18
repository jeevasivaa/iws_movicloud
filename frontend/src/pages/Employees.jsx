import { useMemo, useState } from 'react'
import { Filter, Search, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'

const EMPLOYEES = [
  { id: 'EMP-001', name: 'Anika Das', department: 'Production', role: 'Line Supervisor', access: 'Operations', salaryBand: 'B2', manager: 'Alex Thompson' },
  { id: 'EMP-002', name: 'Ravi Menon', department: 'Quality', role: 'QA Analyst', access: 'Operations', salaryBand: 'B1', manager: 'Alex Thompson' },
  { id: 'EMP-003', name: 'Nisha Patel', department: 'Finance', role: 'Accountant', access: 'Finance', salaryBand: 'C1', manager: 'Liam Carter' },
  { id: 'EMP-004', name: 'Zane Roy', department: 'Finance', role: 'Payroll Specialist', access: 'Finance', salaryBand: 'C1', manager: 'Liam Carter' },
  { id: 'EMP-005', name: 'Maya George', department: 'Warehouse', role: 'Inventory Lead', access: 'Operations', salaryBand: 'B2', manager: 'Alex Thompson' },
  { id: 'EMP-006', name: 'Kiran Rao', department: 'Admin', role: 'System Coordinator', access: 'Admin', salaryBand: 'C2', manager: 'Priya Nair' },
]

function Employees() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')

  const scopedRows = useMemo(() => {
    const base = EMPLOYEES.filter((row) => {
      if (user?.role === ROLES.ADMIN) return true
      if (user?.role === ROLES.OPERATIONS) return row.access !== 'Finance'
      if (user?.role === ROLES.FINANCE) return row.access === 'Finance' || row.department === 'Admin'
      return false
    })

    return base.filter((row) => {
      const matchesQuery = [row.name, row.id, row.role].join(' ').toLowerCase().includes(query.toLowerCase())
      const matchesDepartment = departmentFilter === 'All' || row.department === departmentFilter
      return matchesQuery && matchesDepartment
    })
  }, [departmentFilter, query, user?.role])

  const departments = ['All', ...new Set(EMPLOYEES.map((row) => row.department))]

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Employees</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Staff roster with role-based access levels and reporting ownership.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visible Staff</p>
            <p className="mt-1 text-xl font-black text-slate-900">{scopedRows.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Access Tracks</p>
            <p className="mt-1 text-xl font-black text-slate-900">3</p>
          </div>
        </div>
      </header>

      <div className="bento-card overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/40 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search employee ID, name, role"
                className="w-full rounded-xl border-none bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="relative w-full max-w-[220px]">
              <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border-none bg-white py-2.5 pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-100"
              >
                {departments.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Employee</th>
                <th className="px-8 py-5">Department</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Access Level</th>
                <th className="px-8 py-5">Band</th>
                <th className="px-8 py-5">Reporting To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {scopedRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900">{row.name}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{row.id}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.department}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.role}</td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {row.access}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{row.salaryBand}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-600">{row.manager}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {scopedRows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-8 py-10 text-sm font-semibold text-slate-500">
            <Users className="h-4 w-4" />
            No employees found for the selected filters.
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Employees
