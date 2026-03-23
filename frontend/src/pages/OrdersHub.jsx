import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Eye, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const ORDER_STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered']

function generateOrderId() {
  const year = new Date().getFullYear()
  const randomToken = Math.floor(Math.random() * 9000 + 1000)
  return `ORD-${year}-${randomToken}`
}

function getStatusClasses(status) {
  if (status === 'Processing') return 'bg-amber-100 text-amber-700'
  if (status === 'Shipped') return 'bg-blue-100 text-blue-700'
  if (status === 'Pending') return 'bg-red-100 text-red-700'
  return 'bg-green-100 text-green-700'
}

function getModalStatusClasses(status) {
  if (status === 'Processing') return 'bg-amber-100 text-amber-800 border-amber-200'
  if (status === 'Shipped') return 'bg-blue-100 text-blue-800 border-blue-200'
  if (status === 'Pending') return 'bg-red-100 text-red-800 border-red-200'
  return 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function OrdersHub() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)
  const [orderForm, setOrderForm] = useState({
    order_id: generateOrderId(),
    client_id: '',
    date: new Date().toISOString().slice(0, 10),
    total_items: '',
    total_amount: '',
    status: ORDER_STATUS_OPTIONS[0],
    tracking_details: '',
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusForm, setStatusForm] = useState({
    status: ORDER_STATUS_OPTIONS[0],
    tracking_details: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchOrders = useCallback(
    async (signal) => {
      if (!token) {
        setOrders([])
        setClients([])
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const [ordersResponse, clientsResponse] = await Promise.all([
          apiClient.get('/api/orders', { ...authConfig, signal }),
          apiClient.get('/api/marketing', { ...authConfig, signal }),
        ])

        setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : [])
        setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data : [])
      } catch (err) {
        if (signal?.aborted) {
          return
        }
        setOrders([])
        setClients([])
        setError(getErrorMessage(err, 'Failed to load orders'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchOrders(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchOrders])

  const clientsById = useMemo(
    () => new Map(clients.map((client) => [String(client._id), client])),
    [clients],
  )

  const mappedRows = useMemo(
    () =>
      orders.map((row) => ({
        ...row,
        clientName: clientsById.get(String(row.client_id))?.company_name || row.client_name || 'Client',
      })),
    [clientsById, orders],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return mappedRows
    }

    return mappedRows.filter((row) =>
      [row.order_id, row.clientName, row.status, row.date].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [mappedRows, query])

  const openCreateOrderModal = () => {
    setOrderForm({
      order_id: generateOrderId(),
      client_id: clients[0]?._id || '',
      date: new Date().toISOString().slice(0, 10),
      total_items: '',
      total_amount: '',
      status: ORDER_STATUS_OPTIONS[0],
      tracking_details: '',
    })
    setIsCreateOrderModalOpen(true)
  }

  const closeCreateOrderModal = () => {
    setIsCreateOrderModalOpen(false)
  }

  const handleOrderField = (field, value) => {
    setOrderForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCreateOrder = async (event) => {
    event.preventDefault()

    const payload = {
      order_id: orderForm.order_id.trim().toUpperCase(),
      client_id: orderForm.client_id,
      date: orderForm.date,
      total_items: Number(orderForm.total_items),
      total_amount: Number(orderForm.total_amount),
      status: orderForm.status,
      tracking_details: orderForm.status === 'Shipped' ? orderForm.tracking_details.trim() : '',
    }

    if (
      !payload.order_id ||
      !payload.client_id ||
      !payload.date ||
      Number.isNaN(payload.total_items) ||
      payload.total_items <= 0 ||
      Number.isNaN(payload.total_amount) ||
      payload.total_amount <= 0 ||
      !payload.status
    ) {
      toast.error('Please fill all required order details')
      return
    }

    const orderIdPattern = /^ORD-\d{4}-\d{4}$/
    if (!orderIdPattern.test(payload.order_id)) {
      toast.error('Order ID format must be ORD-YYYY-1234')
      return
    }

    if (payload.status === 'Shipped' && !payload.tracking_details) {
      toast.error('Tracking details are required for shipped orders')
      return
    }

    try {
      setIsCreating(true)
      await apiClient.post('/api/orders', payload, authConfig)
      toast.success('Order created successfully')
      closeCreateOrderModal()
      fetchOrders()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create order'))
    } finally {
      setIsCreating(false)
    }
  }

  const openStatusModal = (order) => {
    setSelectedOrder(order)
    setStatusForm({
      status: order.status || ORDER_STATUS_OPTIONS[0],
      tracking_details: order.tracking_details || order.tracking_url || '',
    })
    setIsOrderModalOpen(true)
  }

  const closeStatusModal = () => {
    setIsOrderModalOpen(false)
    setSelectedOrder(null)
    setStatusForm({
      status: ORDER_STATUS_OPTIONS[0],
      tracking_details: '',
    })
  }

  const handleStatusField = (field, value) => {
    setStatusForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleUpdateOrderStatus = async (event) => {
    event.preventDefault()

    if (!selectedOrder?._id || !statusForm.status) {
      toast.error('Unable to update order status')
      return
    }

    const payload = {
      status: statusForm.status,
    }

    if (statusForm.status === 'Shipped') {
      if (!statusForm.tracking_details.trim()) {
        toast.error('Tracking URL / Courier details are required for shipped orders')
        return
      }
      payload.tracking_details = statusForm.tracking_details.trim()
    } else {
      payload.tracking_details = ''
    }

    try {
      setIsUpdating(true)
      await apiClient.put(`/api/orders/${selectedOrder._id}`, payload, authConfig)
      toast.success('Order status updated successfully')
      closeStatusModal()
      fetchOrders()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update order status'))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-base text-gray-500">Manage client orders, shipments, and delivery tracking</p>
        </div>

        <button
          type="button"
          onClick={openCreateOrderModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          New Order
        </button>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchOrders()}
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
          placeholder="Search orders..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Client</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Items</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Total</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={7}>
                  Loading orders...
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row._id || row.order_id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-5 text-sm text-gray-700">{row.order_id}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.clientName}</td>
                  <td className="px-6 py-5 text-sm text-gray-500">{row.date}</td>
                  <td className="px-6 py-5 text-sm text-gray-900">{(Number(row.total_items) || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{formatCurrency(row.total_amount)}</td>

                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openStatusModal(row)}
                        aria-label={`View ${row.order_id}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => openStatusModal(row)}
                        aria-label={`Edit ${row.order_id}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Edit size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No orders found for this search.</div>
        ) : null}
      </div>

      <Modal
        isOpen={isCreateOrderModalOpen}
        onClose={closeCreateOrderModal}
        title="New Order"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-order-id" className="text-sm font-medium text-gray-700">
              Order ID
            </label>
            <input
              id="new-order-id"
              type="text"
              value={orderForm.order_id}
              onChange={(event) => handleOrderField('order_id', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="new-order-client" className="text-sm font-medium text-gray-700">
                Client
              </label>
              <select
                id="new-order-client"
                value={orderForm.client_id}
                onChange={(event) => handleOrderField('client_id', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="new-order-date" className="text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                id="new-order-date"
                type="date"
                value={orderForm.date}
                onChange={(event) => handleOrderField('date', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="new-order-total-items" className="text-sm font-medium text-gray-700">
                Total Items
              </label>
              <input
                id="new-order-total-items"
                type="number"
                min="1"
                step="1"
                value={orderForm.total_items}
                onChange={(event) => handleOrderField('total_items', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-order-total-amount" className="text-sm font-medium text-gray-700">
                Total Amount (₹)
              </label>
              <input
                id="new-order-total-amount"
                type="number"
                min="0"
                step="0.01"
                value={orderForm.total_amount}
                onChange={(event) => handleOrderField('total_amount', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="new-order-status" className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="new-order-status"
              value={orderForm.status}
              onChange={(event) => handleOrderField('status', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {orderForm.status === 'Shipped' ? (
            <div className="space-y-2">
              <label htmlFor="new-order-tracking" className="text-sm font-medium text-gray-700">
                Tracking Details
              </label>
              <input
                id="new-order-tracking"
                type="text"
                value={orderForm.tracking_details}
                onChange={(event) => handleOrderField('tracking_details', event.target.value)}
                placeholder="Tracking URL or courier reference"
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={closeCreateOrderModal}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Saving...' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isOrderModalOpen}
        onClose={closeStatusModal}
        title="Update Order Status"
      >
        <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="mt-1 font-semibold text-gray-900">{selectedOrder?.order_id || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Client</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {selectedOrder?.clientName || selectedOrder?.client_name || 'Client'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Current Status</span>
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getModalStatusClasses(selectedOrder?.status)}`}
              >
                {selectedOrder?.status || 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="order-status" className="text-sm font-medium text-gray-700">
              Update To
            </label>
            <select
              id="order-status"
              value={statusForm.status}
              onChange={(event) => handleStatusField('status', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className="pt-1">
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getModalStatusClasses(statusForm.status)}`}>
                New: {statusForm.status}
              </span>
            </div>
          </div>

          {statusForm.status === 'Shipped' ? (
            <div className="space-y-2">
              <label htmlFor="tracking-details" className="text-sm font-medium text-gray-700">
                Tracking URL / Courier Details
              </label>
              <input
                id="tracking-details"
                type="text"
                value={statusForm.tracking_details}
                onChange={(event) => handleStatusField('tracking_details', event.target.value)}
                placeholder="https:// or courier reference"
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
              <p className="text-xs text-gray-500">This detail will be saved with the order for shipment tracking.</p>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={closeStatusModal}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default OrdersHub
