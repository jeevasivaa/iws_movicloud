import { useCallback, useEffect, useMemo, useState } from 'react'
import { MoreHorizontal, Search, UserCheck, UserMinus, UserPlus, Users } from 'lucide-react'
import Badge from '../components/shared/Badge'
import Card, { CardBody } from '../components/shared/Card'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/shared/Table'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const ROLE_FILTER_OPTIONS = ['all', 'admin', 'manager', 'staff', 'finance']
const STALLS = ['Main Square Stall', 'South Avenue Cart', 'Central Kitchen', 'North Plaza Counter']
const SHIFTS = ['06:00 - 14:00', '10:00 - 18:00', '14:00 - 22:00', 'Flexible']

function getInitials(name) {
  if (!name) return '--'

  const chunks = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (chunks.length === 0) return '--'
  if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase()
  return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase()
}

function getStatusTone(status) {
  if (status === 'Active') return 'success'
  if (status === 'On Leave') return 'warning'
  if (status === 'Inactive') return 'neutral'
  return 'danger'
}

function StaffDashboard() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchStaff = useCallback(
    async (signal) => {
      if (!token) {
        setStaff([])
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')
        const response = await apiClient.get('/api/staff', { ...authConfig, signal })
        setStaff(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        if (signal?.aborted) return
        setStaff([])
        setError(getErrorMessage(err, 'Failed to load staff dashboard'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchStaff(controller.signal)
    return () => controller.abort()
  }, [fetchStaff])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return staff.filter((row) => {
      const matchesRole = roleFilter === 'all' || String(row.role || '').toLowerCase() === roleFilter
      const matchesQuery =
        !normalizedQuery ||
        [row.name, row.email, row.role, row.department, row.status].join(' ').toLowerCase().includes(normalizedQuery)

      return matchesRole && matchesQuery
    })
  }, [query, roleFilter, staff])

  const summaryCards = useMemo(() => {
    const totalStaff = staff.length
    const activeOnShift = staff.filter((row) => row.status === 'Active').length
    const onLeave = staff.filter((row) => row.status === 'On Leave').length
    const pendingOnboarding = staff.filter((row) => row.status === 'Inactive').length

    return [
      {
        title: 'Total Staff',
        value: totalStaff,
        Icon: Users,
        iconWrap: 'bg-emerald-100 text-emerald-700',
      },
      {
        title: 'Active on Shift',
        value: activeOnShift,
        Icon: UserCheck,
        iconWrap: 'bg-blue-100 text-blue-700',
      },
      {
        title: 'On Leave',
        value: onLeave,
        Icon: UserMinus,
        iconWrap: 'bg-amber-100 text-amber-700',
      },
      {
        title: 'Pending Onboarding',
        value: pendingOnboarding,
        Icon: UserPlus,
        iconWrap: 'bg-slate-100 text-slate-700',
      },
    ]
  }, [staff])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Staff Management Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor staffing coverage, shift utilization, and onboarding queue in one operational view.
        </p>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchStaff()}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.Icon

          return (
            <Card key={card.title}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                  <span className={`rounded-xl p-2.5 ${card.iconWrap}`}>
                    <Icon size={18} />
                  </span>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardBody className="grid grid-cols-1 gap-3 lg:grid-cols-[180px_1fr]">
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          >
            {ROLE_FILTER_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role === 'all' ? 'Role: All' : role[0].toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search staff, departments, roles..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
            />
          </div>
        </CardBody>
      </Card>

      <Table minWidth={1020}>
        <TableHead>
          <tr>
            <TableHeaderCell>Staff Member</TableHeaderCell>
            <TableHeaderCell>Role &amp; Department</TableHeaderCell>
            <TableHeaderCell>Assigned Stall</TableHeaderCell>
            <TableHeaderCell>Shift Timing</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </TableHead>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                Loading staff records...
              </TableCell>
            </TableRow>
          ) : filteredRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                No staff members found for current filters.
              </TableCell>
            </TableRow>
          ) : (
            filteredRows.map((row, index) => (
              <TableRow key={row._id || row.email || row.name}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                      {getInitials(row.name)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{row.name || 'Staff Member'}</p>
                      <p className="text-xs text-slate-500">STF-{String(index + 101).padStart(3, '0')}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-slate-900">{row.role || 'Staff'}</p>
                  <p className="text-xs text-slate-500">{row.department || 'Operations'}</p>
                </TableCell>
                <TableCell>{STALLS[index % STALLS.length]}</TableCell>
                <TableCell>{SHIFTS[index % SHIFTS.length]}</TableCell>
                <TableCell>
                  <Badge tone={getStatusTone(row.status)}>{row.status || 'Inactive'}</Badge>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                    aria-label={`Actions for ${row.name}`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  )
}

export default StaffDashboard
