import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Eye, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/shared/Badge'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const ORDER_STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered']
const ORDER_FILTER_OPTIONS = ['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

function generateOrderId() {
  const year = new Date().getFullYear()
  const randomToken = Math.floor(Math.random() * 9000 + 1000)
  return `ORD-${year}-${randomToken}`
}

function getStatusTone(status) {
  if (status === 'Processing') return 'warning'
  if (status === 'Shipped') return 'info'
  if (status === 'Pending') return 'danger'
  return 'success'
}

function getModalStatusClasses(status) {
  if (status === 'Processing') return 'bg-amber-100 text-amber-800 border-amber-200'
  if (status === 'Shipped') return 'bg-blue-100 text-blue-800 border-blue-200'
  if (status === 'Pending') return 'bg-red-100 text-red-800 border-red-200'
  return 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `INR ${amount.toLocaleString('en-IN')}`
}

function OrdersHub() {
  const { token } = useAuth()
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
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
    return mappedRows.filter((row) => {
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter
      const matchesDate = !dateFilter || String(row.date || '').slice(0, 10) === dateFilter
      return matchesStatus && matchesDate
    })
  }, [dateFilter, mappedRows, statusFilter])

  const summary = useMemo(() => {
    const totalOrders = mappedRows.length
    const pendingOrders = mappedRows.filter((row) => row.status === 'Pending').length
    const completedOrders = mappedRows.filter((row) => row.status === 'Delivered').length
    const cancelledOrders = mappedRows.filter((row) => row.status === 'Cancelled').length

    return [
      { title: 'Total Orders', value: totalOrders },
      { title: 'Pending Orders', value: pendingOrders },
      { title: 'Completed Orders', value: completedOrders },
      { title: 'Cancelled Orders', value: cancelledOrders },
    ]
  }, [mappedRows])

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
          <h1 className="text-3xl font-semibold text-slate-900">Orders Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track incoming orders, fulfillment progress, and payment readiness.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateOrderModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
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
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          >
            {ORDER_FILTER_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'Status' : status}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-300"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[1080px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Items</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Total Amount</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Order Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
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
                  <td className="px-6 py-5 text-sm text-gray-900">{(Number(row.total_items) || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{formatCurrency(row.total_amount)}</td>

                  <td className="px-6 py-5">
                    <Badge tone={getStatusTone(row.status)} className="text-sm">
                      {row.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-5">
                    <Badge tone={row.status === 'Delivered' || row.status === 'Shipped' ? 'success' : 'warning'}>
                      {row.status === 'Delivered' || row.status === 'Shipped' ? 'Paid' : 'Pending'}
                    </Badge>
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
          <div className="px-6 py-10 text-center text-sm text-gray-500">No orders found for current filters.</div>
        ) : null}
      </div>

      <Modal
        isOpen={isCreateOrderModalOpen}
        onClose={closeCreateOrderModal}
        title="New Order"
        description="Create a new client order and capture shipment readiness."
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-5">
          <div className="modal-shell space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-order-id" className="modal-label">
                Order ID
              </label>
              <input
                id="new-order-id"
                type="text"
                value={orderForm.order_id}
                onChange={(event) => handleOrderField('order_id', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="new-order-client" className="modal-label">
                  Client
                </label>
                <select
                  id="new-order-client"
                  value={orderForm.client_id}
                  onChange={(event) => handleOrderField('client_id', event.target.value)}
                  className="modal-input"
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
                <label htmlFor="new-order-date" className="modal-label">
                  Date
                </label>
                <input
                  id="new-order-date"
                  type="date"
                  value={orderForm.date}
                  onChange={(event) => handleOrderField('date', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="new-order-total-items" className="modal-label">
                  Total Items
                </label>
                <input
                  id="new-order-total-items"
                  type="number"
                  min="1"
                  step="1"
                  value={orderForm.total_items}
                  onChange={(event) => handleOrderField('total_items', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="new-order-total-amount" className="modal-label">
                  Total Amount (₹)
                </label>
                <input
                  id="new-order-total-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={orderForm.total_amount}
                  onChange={(event) => handleOrderField('total_amount', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="new-order-status" className="modal-label">
                Status
              </label>
              <select
                id="new-order-status"
                value={orderForm.status}
                onChange={(event) => handleOrderField('status', event.target.value)}
                className="modal-input"
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {orderForm.status === 'Shipped' ? (
              <div className="modal-panel space-y-2">
                <label htmlFor="new-order-tracking" className="modal-label">
                  Tracking Details
                </label>
                <input
                  id="new-order-tracking"
                  type="text"
                  value={orderForm.tracking_details}
                  onChange={(event) => handleOrderField('tracking_details', event.target.value)}
                  placeholder="Tracking URL or courier reference"
                  className="modal-input"
                  required
                />
              </div>
            ) : null}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={closeCreateOrderModal}
              className="modal-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="modal-btn-primary"
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
        description="Track dispatch state and courier details for this order."
      >
        <form onSubmit={handleUpdateOrderStatus} className="space-y-5">
          <div className="modal-panel bg-gradient-to-r from-slate-50 to-white">
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

          <div className="modal-shell space-y-3">
            <div className="space-y-2">
              <label htmlFor="order-status" className="modal-label">
                Update To
              </label>
              <select
                id="order-status"
                value={statusForm.status}
                onChange={(event) => handleStatusField('status', event.target.value)}
                className="modal-input"
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
                <label htmlFor="tracking-details" className="modal-label">
                  Tracking URL / Courier Details
                </label>
                <input
                  id="tracking-details"
                  type="text"
                  value={statusForm.tracking_details}
                  onChange={(event) => handleStatusField('tracking_details', event.target.value)}
                  placeholder="https:// or courier reference"
                  className="modal-input"
                  required
                />
                <p className="text-xs text-gray-500">This detail will be saved with the order for shipment tracking.</p>
              </div>
            ) : null}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={closeStatusModal}
              className="modal-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="modal-btn-primary"
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
