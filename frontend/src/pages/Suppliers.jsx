import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Eye, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const STATUS_OPTIONS = ['Active', 'Under Review', 'Inactive']
const STATUS_FILTER_OPTIONS = ['all', ...STATUS_OPTIONS]

const EMPTY_SUPPLIER_FORM = {
  name: '',
  location: '',
  category_supplied: '',
  rating: '',
  total_orders: '',
  status: 'Active',
}

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-green-100 text-green-700'
  if (status === 'Under Review') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-600'
}

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `INR ${amount.toLocaleString('en-IN')}`
}

function buildContact(index) {
  const seed = String(7800000000 + index * 137)
  return `+91 ${seed.slice(0, 5)} ${seed.slice(5, 10)}`
}

function Suppliers() {
  const { token } = useAuth()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [suppliers, setSuppliers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [supplierForm, setSupplierForm] = useState(EMPTY_SUPPLIER_FORM)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchSuppliers = useCallback(
    async (signal) => {
      if (!token) {
        setSuppliers([])
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const response = await apiClient.get('/api/suppliers', { ...authConfig, signal })
        setSuppliers(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        if (signal?.aborted) {
          return
        }
        setSuppliers([])
        setError(getErrorMessage(err, 'Failed to load suppliers'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchSuppliers(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchSuppliers])

  const categoryOptions = useMemo(() => {
    const unique = [...new Set(suppliers.map((row) => row.category_supplied).filter(Boolean))]
    return ['all', ...unique]
  }, [suppliers])

  const filteredRows = useMemo(() => {
    return suppliers.filter((row) => {
      const matchesCategory = categoryFilter === 'all' || row.category_supplied === categoryFilter
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter
      return matchesCategory && matchesStatus
    })
  }, [categoryFilter, statusFilter, suppliers])

  const summary = useMemo(() => {
    const totalSuppliers = suppliers.length
    const pendingDeliveries = suppliers.filter((row) => row.status === 'Under Review').length
    const activePos = suppliers.filter((row) => Number(row.total_orders) > 0).length
    const outstandingDues = suppliers.reduce((sum, row) => sum + Number(row.total_orders || 0) * 500, 0)

    return [
      { title: 'Total Suppliers', value: totalSuppliers },
      { title: 'Pending Deliveries', value: pendingDeliveries },
      { title: 'Active POs', value: activePos },
      { title: 'Outstanding Dues', value: formatCurrency(outstandingDues) },
    ]
  }, [suppliers])

  const openAddModal = () => {
    setEditingSupplier(null)
    setSupplierForm(EMPTY_SUPPLIER_FORM)
    setIsAddModalOpen(true)
  }

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier)
    setSupplierForm({
      name: supplier.name || '',
      location: supplier.location || '',
      category_supplied: supplier.category_supplied || '',
      rating: Number(supplier.rating) || 0,
      total_orders: Number(supplier.total_orders) || 0,
      status: supplier.status || 'Active',
    })
    setIsAddModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setEditingSupplier(null)
    setSupplierForm(EMPTY_SUPPLIER_FORM)
  }

  const handleSupplierField = (field, value) => {
    setSupplierForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSaveSupplier = async (event) => {
    event.preventDefault()

    const payload = {
      name: supplierForm.name.trim(),
      location: supplierForm.location.trim(),
      category_supplied: supplierForm.category_supplied.trim(),
      rating: Number(supplierForm.rating),
      total_orders: Number(supplierForm.total_orders),
      status: supplierForm.status,
    }

    if (
      !payload.name ||
      !payload.location ||
      !payload.category_supplied ||
      Number.isNaN(payload.rating) ||
      Number.isNaN(payload.total_orders) ||
      !payload.status
    ) {
      toast.error('Please fill all required supplier fields')
      return
    }

    try {
      setIsSaving(true)
      if (editingSupplier?._id) {
        await apiClient.put(`/api/suppliers/${editingSupplier._id}`, payload, authConfig)
        toast.success('Supplier updated successfully')
      } else {
        await apiClient.post('/api/suppliers', payload, authConfig)
        toast.success('Supplier added successfully')
      }

      closeAddModal()
      fetchSuppliers()
    } catch (err) {
      toast.error(getErrorMessage(err, editingSupplier ? 'Failed to update supplier' : 'Failed to add supplier'))
    } finally {
      setIsSaving(false)
    }
  }

  const modalTitle = editingSupplier ? 'Edit Supplier' : 'Add Supplier'
  const submitLabel = isSaving ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Save Supplier'

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Suppliers Directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage sourcing partners, purchase activity, and outstanding dues.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <Plus size={16} />
          Add New Supplier
        </button>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchSuppliers()}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'Category' : option}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          >
            {STATUS_FILTER_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'Status' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Primary Contact</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Last Delivery</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={6}>
                  Loading suppliers...
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={6}>
                  No suppliers found for current filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr key={row._id || row.name} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.location}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.category_supplied}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{buildContact(index)}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {row.updated_at ? String(row.updated_at).slice(0, 10) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label={`View ${row.name}`}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label={`Edit ${row.name}`}
                      >
                        <Edit size={15} />
                      </button>
                    </div>
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
        title={modalTitle}
        description="Capture supplier profile, rating, and procurement status."
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div className="modal-shell space-y-4">
            <div className="space-y-2">
              <label htmlFor="supplier-name" className="modal-label">
                Name
              </label>
              <input
                id="supplier-name"
                type="text"
                value={supplierForm.name}
                onChange={(event) => handleSupplierField('name', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="supplier-location" className="modal-label">
                Location
              </label>
              <input
                id="supplier-location"
                type="text"
                value={supplierForm.location}
                onChange={(event) => handleSupplierField('location', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="supplier-category" className="modal-label">
                Category Supplied
              </label>
              <input
                id="supplier-category"
                type="text"
                value={supplierForm.category_supplied}
                onChange={(event) => handleSupplierField('category_supplied', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="supplier-rating" className="modal-label">
                  Rating
                </label>
                <input
                  id="supplier-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={supplierForm.rating}
                  onChange={(event) => handleSupplierField('rating', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="supplier-orders" className="modal-label">
                  Total Orders
                </label>
                <input
                  id="supplier-orders"
                  type="number"
                  min="0"
                  step="1"
                  value={supplierForm.total_orders}
                  onChange={(event) => handleSupplierField('total_orders', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="supplier-status" className="modal-label">
                Status
              </label>
              <select
                id="supplier-status"
                value={supplierForm.status}
                onChange={(event) => handleSupplierField('status', event.target.value)}
                className="modal-input"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={closeAddModal}
              className="modal-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="modal-btn-primary"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default Suppliers
