import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Boxes, PackageCheck, PackageX, Pencil, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const INVENTORY_TYPES = ['Raw Material', 'Finished Product', 'Packaging']
const WAREHOUSE_OPTIONS = ['WH-A', 'WH-B', 'WH-C']
const STOCK_FILTERS = ['all', 'in-stock', 'low-stock', 'out-of-stock', 'expiring-soon']

const EMPTY_STOCK_FORM = {
  item_name: '',
  type: INVENTORY_TYPES[0],
  warehouse_location: WAREHOUSE_OPTIONS[0],
  current_stock: '',
  max_capacity: '',
  expiry_date: '',
}

function deriveBackendStatus(currentStock, maxCapacity) {
  const stock = Number(currentStock) || 0
  const capacity = Number(maxCapacity) || 0

  if (capacity <= 0) {
    return stock <= 0 ? 'Critical' : 'Adequate'
  }

  const ratio = stock / capacity
  if (ratio <= 0.2) return 'Critical'
  if (ratio <= 0.5) return 'Low'
  return 'Adequate'
}

function deriveUiStatus(row) {
  const stock = Number(row.current_stock) || 0
  const capacity = Number(row.max_capacity) || 0
  const status = String(row.status || '').toLowerCase()

  const expiryDate = row.expiry_date ? new Date(row.expiry_date) : null
  const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / 86400000) : null

  if (stock <= 0 || status === 'critical') return 'Out of Stock'
  if (daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7) return 'Expiring Soon'
  if (status === 'low' || (capacity > 0 && stock <= capacity * 0.5)) return 'Low Stock'
  return 'In Stock'
}

function getStatusClasses(status) {
  if (status === 'In Stock') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Low Stock') return 'bg-amber-100 text-amber-700'
  if (status === 'Expiring Soon') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

function buildSku(itemName) {
  const token = String(itemName || 'item')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 6)
  return `RM-${token || '000000'}`
}

function Inventory() {
  const { token } = useAuth()
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [stockForm, setStockForm] = useState(EMPTY_STOCK_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchInventoryData = useCallback(
    async (signal) => {
      if (!token) {
        setInventory([])
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')
        const response = await apiClient.get('/api/inventory', { ...authConfig, signal })
        setInventory(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        if (signal?.aborted) return
        setInventory([])
        setError(getErrorMessage(err, 'Failed to load inventory data'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchInventoryData(controller.signal)
    return () => controller.abort()
  }, [fetchInventoryData])

  const stats = useMemo(() => {
    const enriched = inventory.map((row) => ({
      ...row,
      uiStatus: deriveUiStatus(row),
    }))

    return [
      {
        title: 'Total Items',
        value: enriched.length,
        icon: Boxes,
        iconWrap: 'bg-emerald-100 text-emerald-700',
      },
      {
        title: 'Low Stock',
        value: enriched.filter((row) => row.uiStatus === 'Low Stock').length,
        icon: AlertTriangle,
        iconWrap: 'bg-amber-100 text-amber-700',
      },
      {
        title: 'Out of Stock',
        value: enriched.filter((row) => row.uiStatus === 'Out of Stock').length,
        icon: PackageX,
        iconWrap: 'bg-red-100 text-red-700',
      },
      {
        title: 'Expiring Soon',
        value: enriched.filter((row) => row.uiStatus === 'Expiring Soon').length,
        icon: PackageCheck,
        iconWrap: 'bg-yellow-100 text-yellow-700',
      },
    ]
  }, [inventory])

  const filteredRows = useMemo(() => {
    return inventory.filter((row) => {
      const rowType = row.type || ''
      const uiStatus = deriveUiStatus(row)
      const normalizedStatus = uiStatus.toLowerCase().replace(/\s+/g, '-')

      const matchesType = typeFilter === 'all' || rowType === typeFilter
      const matchesStatus = stockFilter === 'all' || normalizedStatus === stockFilter
      return matchesType && matchesStatus
    })
  }, [inventory, stockFilter, typeFilter])

  const openCreateModal = () => {
    setEditingItem(null)
    setStockForm(EMPTY_STOCK_FORM)
    setIsStockModalOpen(true)
  }

  const openEditModal = (row) => {
    setEditingItem(row)
    setStockForm({
      item_name: row.item_name || '',
      type: row.type || INVENTORY_TYPES[0],
      warehouse_location: row.warehouse_location || WAREHOUSE_OPTIONS[0],
      current_stock: row.current_stock ?? '',
      max_capacity: row.max_capacity ?? '',
      expiry_date: row.expiry_date || '',
    })
    setIsStockModalOpen(true)
  }

  const closeStockModal = () => {
    setIsStockModalOpen(false)
    setEditingItem(null)
    setStockForm(EMPTY_STOCK_FORM)
  }

  const handleStockFormField = (field, value) => {
    setStockForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSaveStock = async (event) => {
    event.preventDefault()

    const currentStock = Number(stockForm.current_stock)
    const maxCapacity = Number(stockForm.max_capacity)

    if (
      !stockForm.item_name.trim() ||
      !stockForm.type ||
      !stockForm.warehouse_location ||
      Number.isNaN(currentStock) ||
      Number.isNaN(maxCapacity)
    ) {
      toast.error('Please complete all required stock details')
      return
    }

    const payload = {
      item_name: stockForm.item_name.trim(),
      type: stockForm.type,
      warehouse_location: stockForm.warehouse_location,
      current_stock: currentStock,
      max_capacity: maxCapacity,
      expiry_date: stockForm.expiry_date || null,
      status: deriveBackendStatus(currentStock, maxCapacity),
    }

    try {
      setIsSaving(true)

      if (editingItem?._id) {
        await apiClient.put(`/api/inventory/${editingItem._id}`, payload, authConfig)
        toast.success('Stock updated successfully')
      } else {
        await apiClient.post('/api/inventory', payload, authConfig)
        toast.success('Stock entry added successfully')
      }

      closeStockModal()
      fetchInventoryData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save stock'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor stock health, replenishment risk, and expiry windows in one view.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <Plus size={16} />
          Update Stock
        </button>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchInventoryData()}
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          >
            <option value="all">All Categories</option>
            {INVENTORY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          >
            {STOCK_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option === 'all'
                  ? 'Stock Status'
                  : option
                      .split('-')
                      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                      .join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Material Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">SKU Code</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Current Stock</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Minimum Required</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={6}>
                  Loading inventory...
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={6}>
                  No inventory items found for current filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const uiStatus = deriveUiStatus(row)
                const minRequired = Math.max(1, Math.round((Number(row.max_capacity) || 0) * 0.3))

                return (
                  <tr key={row._id || row.item_name} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{row.item_name}</p>
                      <p className="text-xs text-slate-500">{row.type}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{buildSku(row.item_name)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{Number(row.current_stock || 0)} units</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{minRequired} units</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(uiStatus)}`}>
                        {uiStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label={`Edit ${row.item_name}`}
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isStockModalOpen}
        onClose={closeStockModal}
        title={editingItem ? 'Update Stock Entry' : 'Create Stock Entry'}
        description="Maintain item stock, warehouse assignment, and expiry tracking."
      >
        <form onSubmit={handleSaveStock} className="space-y-5">
          <div className="modal-shell space-y-4">
            <div className="space-y-2">
              <label htmlFor="inventory-item-name" className="modal-label">
                Material Name
              </label>
              <input
                id="inventory-item-name"
                type="text"
                value={stockForm.item_name}
                onChange={(event) => handleStockFormField('item_name', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="inventory-type" className="modal-label">
                  Category
                </label>
                <select
                  id="inventory-type"
                  value={stockForm.type}
                  onChange={(event) => handleStockFormField('type', event.target.value)}
                  className="modal-input"
                >
                  {INVENTORY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="warehouse-location" className="modal-label">
                  Warehouse Location
                </label>
                <select
                  id="warehouse-location"
                  value={stockForm.warehouse_location}
                  onChange={(event) => handleStockFormField('warehouse_location', event.target.value)}
                  className="modal-input"
                >
                  {WAREHOUSE_OPTIONS.map((warehouse) => (
                    <option key={warehouse} value={warehouse}>
                      {warehouse}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="current-stock-level" className="modal-label">
                  Current Stock
                </label>
                <input
                  id="current-stock-level"
                  type="number"
                  min="0"
                  step="1"
                  value={stockForm.current_stock}
                  onChange={(event) => handleStockFormField('current_stock', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="max-capacity" className="modal-label">
                  Max Capacity
                </label>
                <input
                  id="max-capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={stockForm.max_capacity}
                  onChange={(event) => handleStockFormField('max_capacity', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="inventory-expiry-date" className="modal-label">
                Expiry Date
              </label>
              <input
                id="inventory-expiry-date"
                type="date"
                value={stockForm.expiry_date}
                onChange={(event) => handleStockFormField('expiry_date', event.target.value)}
                className="modal-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closeStockModal} className="modal-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="modal-btn-primary">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default Inventory
