import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, LoaderCircle, PackageCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import apiClient, { getErrorMessage } from '../services/apiClient'
import { useAuth } from '../context/useAuth'

const FALLBACK_PACKING_ITEMS = [
  { id: '1', name: 'Cold Pressed Coconut Oil', quantity: 5 },
  { id: '2', name: 'Sesame Oil', quantity: 2 },
]

function normalizePackingItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return FALLBACK_PACKING_ITEMS
  }

  return items
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: String(index + 1),
          name: item,
          quantity: 1,
        }
      }

      const name = String(item?.name || item?.label || '').trim()
      const quantity = Math.max(1, Number(item?.quantity) || 1)
      if (!name) {
        return null
      }

      return {
        id: String(item?.id || index + 1),
        name,
        quantity,
      }
    })
    .filter(Boolean)
}

function StaffOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [checkedItemIds, setCheckedItemIds] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const authConfig = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token],
  )

  const loadPendingOrders = useCallback(async () => {
    if (!token) {
      setOrders([])
      setError('Authentication token missing. Please sign in again.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await apiClient.get('/api/orders?status=Processing', authConfig)
      const rows = Array.isArray(response.data) ? response.data : []
      setOrders(rows)

      if (rows.length === 0) {
        setSelectedOrderId(null)
        setCheckedItemIds([])
      } else if (!rows.some((order) => order._id === selectedOrderId)) {
        setSelectedOrderId(rows[0]._id)
        setCheckedItemIds([])
      }
    } catch (err) {
      setOrders([])
      setError(getErrorMessage(err, 'Failed to load pending shipments'))
      setSelectedOrderId(null)
      setCheckedItemIds([])
    } finally {
      setLoading(false)
    }
  }, [authConfig, selectedOrderId, token])

  useEffect(() => {
    loadPendingOrders()
  }, [loadPendingOrders])

  const selectedOrder = useMemo(
    () => orders.find((order) => order._id === selectedOrderId) || null,
    [orders, selectedOrderId],
  )

  const packingItems = useMemo(
    () => normalizePackingItems(selectedOrder?.packing_items),
    [selectedOrder?.packing_items],
  )

  const allPacked = packingItems.length > 0 && checkedItemIds.length === packingItems.length

  const selectOrder = (orderId) => {
    setSelectedOrderId(orderId)
    setCheckedItemIds([])
  }

  const togglePackedItem = (itemId) => {
    setCheckedItemIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    )
  }

  const handleMarkPacked = async () => {
    if (!selectedOrder?._id || !allPacked || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      await apiClient.patch(`/api/orders/${selectedOrder._id}/ship`, {
        tracking_details: 'Packed by floor team',
      }, authConfig)

      toast.success('Order marked as shipped')
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print()
      }
      loadPendingOrders()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to mark order as shipped'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-5 pb-20 sm:pb-4">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Order Packing / Fulfillment</h1>
        <p className="mt-1 text-lg font-semibold text-slate-600">Pending shipments ready for dock-side packing.</p>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadPendingOrders}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-16 text-lg font-bold text-slate-600">
          <LoaderCircle className="animate-spin" size={24} />
          Loading pending shipments...
        </div>
      ) : null}

      {!loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-2xl font-semibold text-slate-900">Pending Shipments</h2>

            {orders.length === 0 ? (
              <p className="text-lg font-semibold text-slate-600">No processing orders at the moment.</p>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => {
                  const isSelected = order._id === selectedOrderId

                  return (
                    <button
                      key={order._id || order.order_id}
                      type="button"
                      onClick={() => selectOrder(order._id)}
                      className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                        isSelected
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <p className="text-lg font-semibold text-slate-900">{order.order_id || 'Order'}</p>
                      <p className="text-sm font-semibold text-slate-600">
                        {Number(order.total_items || 0).toLocaleString('en-IN')} items
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </aside>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            {selectedOrder ? (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Packing View</p>
                  <h3 className="text-3xl font-semibold text-slate-900">Order #{selectedOrder.order_id || 'ORD-2024-001'}</h3>
                </div>

                <div className="space-y-3">
                  {packingItems.map((item) => {
                    const checked = checkedItemIds.includes(item.id)

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => togglePackedItem(item.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left transition-colors ${
                          checked
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-900 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                            checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'
                          }`}
                        >
                          <Check size={18} strokeWidth={3} />
                        </span>

                        <span className={`text-lg font-semibold ${checked ? 'line-through' : ''}`}>
                          {item.quantity}x {item.name}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {allPacked ? (
                  <button
                    type="button"
                    onClick={handleMarkPacked}
                    disabled={isSubmitting}
                    className="sticky bottom-2 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 py-5 text-lg font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? <LoaderCircle className="animate-spin" size={22} /> : <PackageCheck size={22} />}
                    {isSubmitting ? 'Updating...' : 'Mark as Packed & Print Label'}
                  </button>
                ) : (
                  <p className="text-base font-semibold text-slate-600">
                    Tap each packed item to complete the checklist and unlock shipment action.
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center text-lg font-semibold text-slate-600">
                Select a processing order to begin packing.
              </div>
            )}
          </section>
        </div>
      ) : null}
    </section>
  )
}

export default StaffOrders
