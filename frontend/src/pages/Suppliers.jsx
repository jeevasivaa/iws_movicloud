import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Plus, Search, Star, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const STATUS_OPTIONS = ['Active', 'Under Review', 'Inactive']

const EMPTY_SUPPLIER_FORM = {
  name: '',
  location: '',
  category_supplied: '',
  rating: '',
  total_orders: '',
  status: STATUS_OPTIONS[0],
}

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-green-100 text-green-700'
  if (status === 'Under Review') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function Suppliers() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
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

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return suppliers
    }

    return suppliers.filter((row) =>
      [row.name, row.location, row.category_supplied, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query, suppliers])

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
      status: supplier.status || STATUS_OPTIONS[0],
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
          <h1 className="text-3xl font-semibold text-gray-900">Suppliers</h1>
          <p className="mt-1 text-base text-gray-500">Manage your supplier directory and procurement</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          Add Supplier
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

      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search suppliers..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm md:col-span-2 xl:col-span-3">
            Loading suppliers...
          </div>
        ) : (
          filteredRows.map((row) => (
            <article key={row._id || row.name} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <Truck size={20} />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{row.name}</h2>
                    <p className="text-sm text-gray-500">{row.location}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEditModal(row)}
                  className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  aria-label={`Edit ${row.name}`}
                >
                  <Edit size={17} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{row.category_supplied}</span>

                <span className="inline-flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {(Number(row.rating) || 0).toFixed(1)}
                </span>

                <span>{(Number(row.total_orders) || 0).toLocaleString('en-IN')} orders</span>
              </div>

              <div className="mt-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                  {row.status}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      {!isLoading && filteredRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No suppliers found for this search.
        </div>
      ) : null}

      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title={modalTitle}>
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="supplier-name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="supplier-name"
              type="text"
              value={supplierForm.name}
              onChange={(event) => handleSupplierField('name', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="supplier-location" className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="supplier-location"
              type="text"
              value={supplierForm.location}
              onChange={(event) => handleSupplierField('location', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="supplier-category" className="text-sm font-medium text-gray-700">
              Category Supplied
            </label>
            <input
              id="supplier-category"
              type="text"
              value={supplierForm.category_supplied}
              onChange={(event) => handleSupplierField('category_supplied', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="supplier-rating" className="text-sm font-medium text-gray-700">
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
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="supplier-orders" className="text-sm font-medium text-gray-700">
                Total Orders
              </label>
              <input
                id="supplier-orders"
                type="number"
                min="0"
                step="1"
                value={supplierForm.total_orders}
                onChange={(event) => handleSupplierField('total_orders', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="supplier-status" className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="supplier-status"
              value={supplierForm.status}
              onChange={(event) => handleSupplierField('status', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={closeAddModal}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
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
