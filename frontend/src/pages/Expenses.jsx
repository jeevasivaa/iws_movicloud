import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, SquarePen, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const CATEGORIES = ['Raw Materials', 'Utilities', 'Logistics', 'Maintenance', 'Operations', 'Compliance']
const STATUS_OPTIONS = ['Paid', 'Pending']

const EMPTY_EXPENSE_FORM = {
  date: new Date().toISOString().slice(0, 10),
  category: CATEGORIES[0],
  description: '',
  amount: '',
  status: STATUS_OPTIONS[0],
}

const DEFAULT_MOCK_ROWS = [
  {
    date: '2026-03-02',
    category: 'Raw Materials',
    description: 'Coconut procurement from Pollachi suppliers',
    amount: 62000,
    status: 'Paid',
  },
  {
    date: '2026-03-07',
    category: 'Utilities',
    description: 'Plant electricity and water charges',
    amount: 24500,
    status: 'Pending',
  },
  {
    date: '2026-03-12',
    category: 'Logistics',
    description: 'Outbound distribution for Kerala and Tamil Nadu routes',
    amount: 31800,
    status: 'Paid',
  },
  {
    date: '2026-03-18',
    category: 'Maintenance',
    description: 'Cold press machine service and belt replacement',
    amount: 26700,
    status: 'Pending',
  },
]

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return String(value)
  }

  return parsed.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function getCategoryPillClasses(category) {
  if (category === 'Raw Materials') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (category === 'Utilities') return 'bg-blue-50 text-blue-700 border-blue-200'
  if (category === 'Logistics') return 'bg-cyan-50 text-cyan-700 border-cyan-200'
  if (category === 'Maintenance') return 'bg-violet-50 text-violet-700 border-violet-200'
  if (category === 'Operations') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

function getStatusPillClasses(status) {
  if (status === 'Paid') return 'bg-emerald-100 text-emerald-700'
  return 'bg-amber-100 text-amber-700'
}

function Expenses() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({
    total_expenses: 145000,
    pending_payables: 42000,
    largest_category: 'Raw Materials',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const visibleRows = useMemo(() => {
    if (user?.role === ROLES.ADMIN) return EXPENSE_ROWS
    if (user?.role === ROLES.MANAGER) return EXPENSE_ROWS.filter((row) => row.owner === 'Operations')
    if (user?.role === ROLES.FINANCE) return EXPENSE_ROWS
    return []
  }, [user?.role])

  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const seedDefaultData = useCallback(async () => {
    for (const row of DEFAULT_MOCK_ROWS) {
      try {
        await apiClient.post('/api/expenses', row, authConfig)
      } catch {
        // Ignore duplicate or transient insert errors for seed fallback.
      }
    }
  }, [authConfig])

  const fetchExpenses = useCallback(
    async (signal) => {
      if (!token) {
        setRows([])
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        let [rowsResponse, summaryResponse] = await Promise.all([
          apiClient.get('/api/expenses', { ...authConfig, signal }),
          apiClient.get('/api/expenses/summary', { ...authConfig, signal }),
        ])

        const receivedRows = Array.isArray(rowsResponse.data) ? rowsResponse.data : []
        if (receivedRows.length === 0) {
          await seedDefaultData()
          ;[rowsResponse, summaryResponse] = await Promise.all([
            apiClient.get('/api/expenses', { ...authConfig, signal }),
            apiClient.get('/api/expenses/summary', { ...authConfig, signal }),
          ])
        }

        setRows(Array.isArray(rowsResponse.data) ? rowsResponse.data : [])
        setSummary({
          total_expenses: Number(summaryResponse?.data?.total_expenses) || 145000,
          pending_payables: Number(summaryResponse?.data?.pending_payables) || 42000,
          largest_category: summaryResponse?.data?.largest_category || 'Raw Materials',
        })
      } catch (err) {
        if (signal?.aborted) {
          return
        }

        setRows([])
        setSummary({
          total_expenses: 145000,
          pending_payables: 42000,
          largest_category: 'Raw Materials',
        })
        setError(getErrorMessage(err, 'Failed to load expenses data'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, seedDefaultData, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchExpenses(controller.signal)
    return () => controller.abort()
  }, [fetchExpenses])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return rows
    }

    return rows.filter((row) =>
      [row.date, row.category, row.description, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query, rows])

  const kpis = useMemo(
    () => [
      {
        label: 'Total Expenses This Month',
        value: formatCurrency(summary.total_expenses || 145000),
        valueClass: 'text-gray-900',
      },
      {
        label: 'Pending Payables',
        value: formatCurrency(summary.pending_payables || 42000),
        valueClass: 'text-amber-600',
      },
      {
        label: 'Largest Category',
        value: summary.largest_category || 'Raw Materials',
        valueClass: 'text-emerald-700',
      },
    ],
    [summary],
  )

  const openAddModal = () => {
    setExpenseForm(EMPTY_EXPENSE_FORM)
    setIsAddModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setExpenseForm(EMPTY_EXPENSE_FORM)
  }

  const openEditModal = (expense) => {
    setSelectedExpense(expense)
    setExpenseForm({
      date: expense.date || new Date().toISOString().slice(0, 10),
      category: expense.category || CATEGORIES[0],
      description: expense.description || '',
      amount: String(expense.amount || ''),
      status: expense.status || STATUS_OPTIONS[0],
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setSelectedExpense(null)
    setIsEditModalOpen(false)
    setExpenseForm(EMPTY_EXPENSE_FORM)
  }

  const handleFormField = (field, value) => {
    setExpenseForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const createExpense = async (event) => {
    event.preventDefault()

    const payload = {
      date: expenseForm.date,
      category: expenseForm.category,
      description: expenseForm.description.trim(),
      amount: Number(expenseForm.amount),
      status: expenseForm.status,
    }

    if (!payload.date || !payload.category || !payload.description || Number.isNaN(payload.amount) || payload.amount <= 0) {
      toast.error('Please fill all required expense fields')
      return
    }

    try {
      setIsSaving(true)
      await apiClient.post('/api/expenses', payload, authConfig)
      toast.success('Expense added successfully')
      closeAddModal()
      fetchExpenses()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add expense'))
    } finally {
      setIsSaving(false)
    }
  }

  const updateExpense = async (event) => {
    event.preventDefault()
    if (!selectedExpense?._id) {
      return
    }

    const payload = {
      date: expenseForm.date,
      category: expenseForm.category,
      description: expenseForm.description.trim(),
      amount: Number(expenseForm.amount),
      status: expenseForm.status,
    }

    if (!payload.date || !payload.category || !payload.description || Number.isNaN(payload.amount) || payload.amount <= 0) {
      toast.error('Please fill all required expense fields')
      return
    }

    try {
      setIsSaving(true)
      await apiClient.put(`/api/expenses/${selectedExpense._id}`, payload, authConfig)
      toast.success('Expense updated successfully')
      closeEditModal()
      fetchExpenses()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update expense'))
    } finally {
      setIsSaving(false)
    }
  }

  const deleteExpense = async (expense) => {
    if (!expense?._id) {
      return
    }

    try {
      setIsDeletingId(expense._id)
      await apiClient.delete(`/api/expenses/${expense._id}`, authConfig)
      toast.success('Expense deleted')
      fetchExpenses()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete expense'))
    } finally {
      setIsDeletingId('')
    }
  }

  const renderExpenseForm = (submitHandler, submitLabel) => (
    <form onSubmit={submitHandler} className="space-y-5">
      <div className="modal-shell space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="expense-date" className="modal-label">
              Date
            </label>
            <input
              id="expense-date"
              type="date"
              value={expenseForm.date}
              onChange={(event) => handleFormField('date', event.target.value)}
              className="modal-input"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="expense-category" className="modal-label">
              Category
            </label>
            <select
              id="expense-category"
              value={expenseForm.category}
              onChange={(event) => handleFormField('category', event.target.value)}
              className="modal-input"
              required
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="expense-description" className="modal-label">
            Description
          </label>
          <input
            id="expense-description"
            type="text"
            value={expenseForm.description}
            onChange={(event) => handleFormField('description', event.target.value)}
            className="modal-input"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="expense-amount" className="modal-label">
              Amount (₹)
            </label>
            <input
              id="expense-amount"
              type="number"
              min="0"
              step="0.01"
              value={expenseForm.amount}
              onChange={(event) => handleFormField('amount', event.target.value)}
              className="modal-input"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="expense-status" className="modal-label">
              Status
            </label>
            <select
              id="expense-status"
              value={expenseForm.status}
              onChange={(event) => handleFormField('status', event.target.value)}
              className="modal-input"
              required
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          onClick={isEditModalOpen ? closeEditModal : closeAddModal}
          className="modal-btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={isSaving} className="modal-btn-primary">
          {isSaving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Expenses</h1>
          <p className="mt-1 text-base text-gray-500">Track operational costs, payables, and finance outflow</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          Add Expense
        </button>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchExpenses()}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`mt-2 text-4xl font-semibold ${kpi.valueClass}`}>{kpi.value}</p>
          </article>
        ))}
      </div>

      <div className="relative w-full max-w-xl">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search expenses..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Category</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Description</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={6}>
                  Loading expenses...
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row._id || `${row.date}-${row.description}`} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-5 text-sm text-gray-600">{formatDate(row.date)}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getCategoryPillClasses(row.category)}`}>
                      {row.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.description}</td>
                  <td className="px-6 py-5 text-sm font-semibold text-gray-900">{formatCurrency(row.amount)}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusPillClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        aria-label={`Edit ${row.description}`}
                      >
                        <SquarePen size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteExpense(row)}
                        disabled={isDeletingId === row._id}
                        className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Delete ${row.description}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No expenses found for this search.</div>
        ) : null}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Add Expense"
        description="Capture a new operational expense entry."
      >
        {renderExpenseForm(createExpense, 'Save Expense')}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Expense"
        description="Update this expense entry."
      >
        {renderExpenseForm(updateExpense, 'Update Expense')}
      </Modal>
    </section>
  )
}

export default Expenses
