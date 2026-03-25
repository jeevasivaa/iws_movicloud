import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpDown, Minus, Package2, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const INVENTORY_TYPES = ['Raw Material', 'Finished Product', 'Packaging']
const WAREHOUSE_OPTIONS = ['WH-A', 'WH-B', 'WH-C']

const EMPTY_STOCK_FORM = {
  item_name: '',
  type: INVENTORY_TYPES[0],
  warehouse_location: WAREHOUSE_OPTIONS[0],
  current_stock: '',
  max_capacity: '',
  expiry_date: '',
}

function getStatusPillClasses(status) {
  if (status === 'Adequate') return 'bg-green-100 text-green-700'
  if (status === 'Low') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function getProgressBarClasses(status) {
  if (status === 'Adequate') return 'bg-green-500'
  if (status === 'Low') return 'bg-amber-500'
  return 'bg-red-500'
}

function deriveInventoryStatus(currentStock, maxCapacity) {
  const stock = Number(currentStock) || 0
  const capacity = Number(maxCapacity) || 0

  if (capacity <= 0) {
    return stock <= 0 ? 'Critical' : 'Adequate'
  }

  const fillRatio = stock / capacity
  if (fillRatio <= 0.2) return 'Critical'
  if (fillRatio <= 0.5) return 'Low'
  return 'Adequate'
}

function formatMovementTime(value) {
  if (!value) {
    return 'Just now'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Just now'
  }

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000))

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function normalizeInventoryRow(row) {
  const currentStock = Number(row.current_stock) || 0
  const maxCapacity = Number(row.max_capacity) || 0
  return {
    ...row,
    current_stock: currentStock,
    max_capacity: maxCapacity,
    status: row.status || deriveInventoryStatus(currentStock, maxCapacity),
  }
}

function Inventory() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [inventory, setInventory] = useState([])
  const [products, setProducts] = useState([])
  const [kpiCounts, setKpiCounts] = useState({ total_items: 0, low_stock_items: 0, critical_items: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [movementRows, setMovementRows] = useState([])
  const [isMovementLoading, setIsMovementLoading] = useState(false)
  const [stockForm, setStockForm] = useState(EMPTY_STOCK_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [adjustingStockId, setAdjustingStockId] = useState(null)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchInventoryData = useCallback(
    async (signal) => {
      if (!token) {
        setInventory([])
        setProducts([])
        setKpiCounts({ total_items: 0, low_stock_items: 0, critical_items: 0 })
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const [kpiResponse, inventoryResponse, productsResponse] = await Promise.all([
          apiClient.get('/api/inventory/kpis', { ...authConfig, signal }),
          apiClient.get('/api/inventory', { ...authConfig, signal }),
          apiClient.get('/api/products', { ...authConfig, signal }),
        ])

        setKpiCounts({
          total_items: Number(kpiResponse.data?.total_items) || 0,
          low_stock_items: Number(kpiResponse.data?.low_stock_items) || 0,
          critical_items: Number(kpiResponse.data?.critical_items) || 0,
        })
        setInventory(
          (Array.isArray(inventoryResponse.data) ? inventoryResponse.data : []).map((row) => normalizeInventoryRow(row)),
        )

        const nextProducts = Array.isArray(productsResponse.data) ? productsResponse.data : []
        setProducts(nextProducts)

        setStockForm((current) => ({
          ...current,
          item_name: current.item_name || nextProducts[0]?.name || '',
        }))
      } catch (err) {
        if (signal?.aborted) {
          return
        }
        setInventory([])
        setProducts([])
        setKpiCounts({ total_items: 0, low_stock_items: 0, critical_items: 0 })
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

    return () => {
      controller.abort()
    }
  }, [fetchInventoryData])

  const productNames = useMemo(
    () =>
      products
        .map((product) => product?.name)
        .filter((name) => typeof name === 'string' && name.trim()),
    [products],
  )

  const kpiCards = useMemo(
    () => [
      {
        title: 'Total Items',
        value: kpiCounts.total_items,
        icon: Package2,
        iconClasses: 'text-emerald-600',
      },
      {
        title: 'Low Stock Items',
        value: kpiCounts.low_stock_items,
        icon: AlertTriangle,
        iconClasses: 'text-amber-600',
      },
      {
        title: 'Critical Items',
        value: kpiCounts.critical_items,
        icon: AlertTriangle,
        iconClasses: 'text-red-600',
      },
    ],
    [kpiCounts.critical_items, kpiCounts.low_stock_items, kpiCounts.total_items],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return inventory
    }

    return inventory.filter((row) =>
      [row.item_name, row.type, row.warehouse_location, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [inventory, query])

  const openStockModal = () => {
    setStockForm({
      ...EMPTY_STOCK_FORM,
      item_name: productNames[0] || '',
    })
    setIsStockModalOpen(true)
  }

  const closeStockModal = () => {
    setIsStockModalOpen(false)
    setStockForm({
      ...EMPTY_STOCK_FORM,
      item_name: productNames[0] || '',
    })
  }

  const handleStockFormField = (field, value) => {
    setStockForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCreateStock = async (event) => {
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
      expiry_date: stockForm.expiry_date || new Date().toISOString().slice(0, 10),
      status: deriveInventoryStatus(currentStock, maxCapacity),
    }

    try {
      setIsSaving(true)
      await apiClient.post('/api/inventory', payload, authConfig)
      toast.success('Stock entry saved successfully')
      closeStockModal()
      fetchInventoryData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save stock entry'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickStockAdjust = async (row, delta) => {
    if (!row?._id || adjustingStockId === row._id) {
      return
    }

    setAdjustingStockId(row._id)
    try {
      await apiClient.patch(`/api/inventory/${row._id}/stock`, { delta }, authConfig)
      toast.success(delta > 0 ? 'Stock increased' : 'Stock decreased')
      fetchInventoryData()
    } catch (err) {
      const statusCode = err?.response?.status
      if (statusCode === 404 || statusCode === 405) {
        try {
          const nextStock = Math.max(0, (Number(row.current_stock) || 0) + delta)
          const nextStatus = deriveInventoryStatus(nextStock, Number(row.max_capacity) || 0)
          await apiClient.put(
            `/api/inventory/${row._id}`,
            {
              current_stock: nextStock,
              status: nextStatus,
            },
            authConfig,
          )
          toast.success(delta > 0 ? 'Stock increased' : 'Stock decreased')
          fetchInventoryData()
        } catch (fallbackError) {
          toast.error(getErrorMessage(fallbackError, 'Failed to adjust stock'))
        }
      } else {
        toast.error(getErrorMessage(err, 'Failed to adjust stock'))
      }
    } finally {
      setAdjustingStockId(null)
    }
  }

  const loadMovements = async () => {
    if (!token) {
      setMovementRows([])
      return
    }

    try {
      setIsMovementLoading(true)
      const response = await apiClient.get('/api/inventory/movements?limit=100', authConfig)
      setMovementRows(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load stock movements'))
      setMovementRows([])
    } finally {
      setIsMovementLoading(false)
    }
  }

  const openMovementModal = () => {
    setIsMovementModalOpen(true)
    loadMovements()
  }

  const closeMovementModal = () => {
    setIsMovementModalOpen(false)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Inventory</h1>
          <p className="mt-1 text-base text-gray-500">Monitor stock levels, warehouse mapping, and expiry tracking</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openMovementModal}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowUpDown size={16} />
            Stock Movement
          </button>

          <button
            type="button"
            onClick={openStockModal}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <Plus size={16} />
            Add Stock
          </button>
        </div>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpiCards.map((card) => {
          const Icon = card.icon

          return (
            <article key={card.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="mt-1 text-4xl font-semibold text-gray-900">{Number(card.value).toLocaleString('en-IN')}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <Icon className={card.iconClasses} size={22} />
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search inventory..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Item</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Type</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Warehouse</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Stock Level</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Expiry</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={6}>
                  Loading inventory...
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const stock = Number(row.current_stock) || 0
                const capacity = Number(row.max_capacity) || 0
                const progress = capacity > 0 ? Math.min(100, Math.round((stock / capacity) * 100)) : 0
                const status = row.status || deriveInventoryStatus(stock, capacity)

                return (
                  <tr key={row._id || `${row.item_name}-${row.warehouse_location}`} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.item_name}</td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {row.type}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700">{row.warehouse_location}</td>

                    <td className="px-6 py-5">
                      <div className="w-56">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-900">
                            {stock.toLocaleString('en-IN')} / {capacity.toLocaleString('en-IN')}
                          </p>
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(row, -1)}
                              disabled={adjustingStockId === row._id || stock <= 0}
                              className="h-6 w-6 rounded border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={`Decrease stock for ${row.item_name}`}
                            >
                              <Minus size={12} className="mx-auto" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(row, 1)}
                              disabled={adjustingStockId === row._id}
                              className="h-6 w-6 rounded border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={`Increase stock for ${row.item_name}`}
                            >
                              <Plus size={12} className="mx-auto" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                          <div
                            className={`h-2 rounded-full ${getProgressBarClasses(status)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-500">{row.expiry_date || 'N/A'}</td>

                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusPillClasses(status)}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {!isLoading && filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No inventory items found for this search.</div>
        ) : null}
      </div>

      <Modal
        isOpen={isMovementModalOpen}
        onClose={closeMovementModal}
        title="Stock Movement"
        description="Recent adjustments from entries and quick stock updates."
        maxWidthClass="max-w-4xl"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">Recent stock adjustments and inventory entries.</p>
            <button
              type="button"
              onClick={loadMovements}
              disabled={isMovementLoading}
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isMovementLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="modal-shell overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Warehouse</th>
                  <th className="px-4 py-3 font-medium">Change</th>
                  <th className="px-4 py-3 font-medium">Resulting Stock</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {isMovementLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                      Loading movements...
                    </td>
                  </tr>
                ) : movementRows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                      No movements found.
                    </td>
                  </tr>
                ) : (
                  movementRows.map((row) => {
                    const change = Number(row.change) || 0
                    const reason = String(row.reason || '').replace(/_/g, ' ')

                    return (
                      <tr key={row._id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-900">{row.item_name || 'Item'}</td>
                        <td className="px-4 py-3 text-gray-700">{row.warehouse_location || '-'}</td>
                        <td className={`px-4 py-3 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {change >= 0 ? `+${change}` : `${change}`}
                        </td>
                        <td className="px-4 py-3 text-gray-900">{(Number(row.resulting_stock) || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 capitalize text-gray-700">{reason || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{formatMovementTime(row.timestamp)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={closeMovementModal}
              className="modal-btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isStockModalOpen}
        onClose={closeStockModal}
        title="Add / Update Stock"
        description="Create a warehouse stock entry with capacity and expiry."
      >
        <form onSubmit={handleCreateStock} className="space-y-5">
          <div className="modal-shell space-y-4">
            <div className="space-y-2">
              <label htmlFor="inventory-item-name" className="modal-label">
                Item Name
              </label>
              <input
                id="inventory-item-name"
                type="text"
                value={stockForm.item_name}
                list="inventory-product-list"
                onChange={(event) => handleStockFormField('item_name', event.target.value)}
                placeholder="Select or enter item"
                className="modal-input"
                required
              />
              <datalist id="inventory-product-list">
                {productNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="inventory-type" className="modal-label">
                  Type
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
                  Current Stock Level
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
                Expiry Date (Optional)
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
            <button
              type="button"
              onClick={closeStockModal}
              className="modal-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="modal-btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default Inventory
