import { useMemo, useState } from 'react'
import { Mail, Phone, Plus, Search } from 'lucide-react'

const STAFF_ROWS = [
  {
    id: 'EMP-001',
    name: 'Vikram Singh',
    initials: 'VS',
    role: 'Production Lead',
    email: 'vikram@vsafoods.com',
    phone: '+91 98765 43210',
    department: 'Production',
    shift: 'Morning Shift',
    status: 'Active',
    avatarColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'EMP-002',
    name: 'Anita Desai',
    initials: 'AD',
    role: 'Quality Inspector',
    email: 'anita@vsafoods.com',
    phone: '+91 98765 43211',
    department: 'Quality',
    shift: 'Morning Shift',
    status: 'Active',
    avatarColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'EMP-003',
    name: 'Ravi Kumar',
    initials: 'RK',
    role: 'Warehouse Manager',
    email: 'ravi@vsafoods.com',
    phone: '+91 98765 43212',
    department: 'Inventory',
    shift: 'Evening Shift',
    status: 'Active',
    avatarColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'EMP-004',
    name: 'Sunita Patel',
    initials: 'SP',
    role: 'Machine Operator',
    email: 'sunita@vsafoods.com',
    phone: '+91 98765 43213',
    department: 'Production',
    shift: 'Morning Shift',
    status: 'On Leave',
    avatarColor: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'EMP-005',
    name: 'Arun Mehta',
    initials: 'AM',
    role: 'Packing Supervisor',
    email: 'arun@vsafoods.com',
    phone: '+91 98765 43214',
    department: 'Packaging',
    shift: 'Night Shift',
    status: 'Active',
    avatarColor: 'bg-yellow-100 text-yellow-700',
  },
  {
    id: 'EMP-006',
    name: 'Meera Joshi',
    initials: 'MJ',
    role: 'Lab Technician',
    email: 'meera@vsafoods.com',
    phone: '+91 98765 43215',
    department: 'Quality',
    shift: 'Morning Shift',
    status: 'Active',
    avatarColor: 'bg-pink-100 text-pink-700',
  },
]

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-green-100 text-green-700'
  if (status === 'On Leave') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function Employees() {
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return STAFF_ROWS
    }

    return STAFF_ROWS.filter((row) =>
      [row.name, row.role, row.department, row.email, row.phone].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Staff</h1>
          <p className="mt-1 text-base text-gray-500">Manage employees, shifts, and attendance</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          Add Employee
        </button>
      </header>

      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search staff..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRows.map((row) => (
          <article key={row.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold ${row.avatarColor}`}
              >
                {row.initials}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-gray-900">{row.name}</h2>
                <p className="text-sm text-gray-500">{row.role}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <Mail size={15} />
                {row.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} />
                {row.phone}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{row.department}</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{row.shift}</span>
              <span className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                {row.status}
              </span>
            </div>
          </article>
        ))}
      </div>

      {filteredRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No staff members found for this search.
        </div>
      ) : null}
    </section>
  )
}

export default Employees
