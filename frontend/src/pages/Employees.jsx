import { useCallback, useEffect, useMemo, useState } from 'react'
import { MoreHorizontal, Plus, Search, UserCheck, UserMinus, UserPlus, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const ROLE_OPTIONS = ['all', 'admin', 'manager', 'staff', 'finance']
const STATUS_OPTIONS = ['all', 'Active', 'On Leave', 'Inactive']
const STALLS = ['Main Square Stall', 'South Avenue Cart', 'Central Kitchen', 'North Plaza Counter']
const SHIFTS = ['06:00 - 14:00', '10:00 - 18:00', '14:00 - 22:00', 'Flexible']

const EMPTY_STAFF_FORM = {
  name: '',
  email: '',
  role: 'staff',
  department: '',
  status: 'Active',
}

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-emerald-100 text-emerald-700'
  if (status === 'On Leave') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-600'
}

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

function Employees() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF_FORM)
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
        setError(getErrorMessage(err, 'Failed to load staff members'))
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
      const rowStatus = String(row.status || '')
      const rowRole = String(row.role || '')
      const matchesStatus = statusFilter === 'all' || rowStatus === statusFilter
      const matchesRole = roleFilter === 'all' || rowRole.toLowerCase() === roleFilter.toLowerCase()
      const matchesQuery =
        !normalizedQuery ||
        [row.name, row.email, row.role, row.department, row.status].join(' ').toLowerCase().includes(normalizedQuery)

      return matchesStatus && matchesRole && matchesQuery
    })
  }, [query, roleFilter, staff, statusFilter])

  const stats = useMemo(() => {
    const totalStaff = staff.length
    const activeOnShift = staff.filter((row) => row.status === 'Active').length
    const onLeave = staff.filter((row) => row.status === 'On Leave').length
    const pendingOnboarding = staff.filter((row) => row.status === 'Inactive').length

    return [
      { title: 'Total Staff', value: totalStaff, icon: Users, iconWrap: 'bg-emerald-100 text-emerald-700' },
      { title: 'Active on Shift', value: activeOnShift, icon: UserCheck, iconWrap: 'bg-blue-100 text-blue-700' },
      { title: 'On Leave', value: onLeave, icon: UserMinus, iconWrap: 'bg-amber-100 text-amber-700' },
      { title: 'Pending Onboarding', value: pendingOnboarding, icon: UserPlus, iconWrap: 'bg-slate-100 text-slate-700' },
    ]
  }, [staff])

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setStaffForm(EMPTY_STAFF_FORM)
  }

  const handleStaffField = (field, value) => {
    setStaffForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCreateStaff = async (event) => {
    event.preventDefault()

    const payload = {
      name: staffForm.name.trim(),
      email: staffForm.email.trim().toLowerCase(),
      role: staffForm.role,
      department: staffForm.department.trim(),
      status: staffForm.status,
    }

    if (!payload.name || !payload.email || !payload.role || !payload.department || !payload.status) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setIsSaving(true)
      await apiClient.post('/api/staff', payload, authConfig)
      toast.success('Staff member added successfully')
      closeAddModal()
      fetchStaff()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add staff member'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Staff Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track staffing capacity, shifts, and role assignments across your outlets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <Plus size={16} />
          Register New Staff
        </button>
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
        {stats.map((card) => {
          const Icon = card.icon
          return (
            <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
                </div>
                <span className={`rounded-xl p-2.5 ${card.iconWrap}`}>
                  <Icon size={18} />
                </span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[180px_180px_1fr]">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'Status: All' : status}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          >
            {ROLE_OPTIONS.map((role) => (
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
              placeholder="Search staff, roles, departments..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-emerald-300"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1020px] text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Role / Department</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Location / Assigned Stall</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Shift Timing</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={6}>
                  Loading staff records...
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={6}>
                  No staff members found for current filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr key={row._id || row.email || row.name} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                        {getInitials(row.name)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-500">STF-{String(index + 101).padStart(3, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{row.role || 'Staff'}</p>
                    <p className="text-xs text-slate-500">{row.department || 'Operations'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{STALLS[index % STALLS.length]}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{SHIFTS[index % SHIFTS.length]}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(row.status)}`}>
                      {row.status || 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                      aria-label={`Actions for ${row.name}`}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Register New Staff"
        description="Create a staff profile with role and department assignment."
      >
        <form onSubmit={handleCreateStaff} className="space-y-5">
          <div className="modal-shell space-y-4">
            <div className="space-y-2">
              <label htmlFor="staff-name" className="modal-label">
                Full Name
              </label>
              <input
                id="staff-name"
                type="text"
                value={staffForm.name}
                onChange={(event) => handleStaffField('name', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="staff-email" className="modal-label">
                Email Address
              </label>
              <input
                id="staff-email"
                type="email"
                value={staffForm.email}
                onChange={(event) => handleStaffField('email', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="staff-role" className="modal-label">
                  Role
                </label>
                <select
                  id="staff-role"
                  value={staffForm.role}
                  onChange={(event) => handleStaffField('role', event.target.value)}
                  className="modal-input"
                >
                  {ROLE_OPTIONS.filter((role) => role !== 'all').map((role) => (
                    <option key={role} value={role}>
                      {role[0].toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="staff-status" className="modal-label">
                  Status
                </label>
                <select
                  id="staff-status"
                  value={staffForm.status}
                  onChange={(event) => handleStaffField('status', event.target.value)}
                  className="modal-input"
                >
                  {STATUS_OPTIONS.filter((status) => status !== 'all').map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="staff-department" className="modal-label">
                Department
              </label>
              <input
                id="staff-department"
                type="text"
                value={staffForm.department}
                onChange={(event) => handleStaffField('department', event.target.value)}
                className="modal-input"
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closeAddModal} className="modal-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="modal-btn-primary">
              {isSaving ? 'Saving...' : 'Save Staff'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default Employees
