import { useCallback, useEffect, useMemo, useState } from 'react'
import { Barcode, LoaderCircle, Minus, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import apiClient, { getErrorMessage } from '../services/apiClient'
import { useAuth } from '../context/useAuth'

function StaffInventory() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [deductAmount, setDeductAmount] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const authConfig = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token],
  )

  const loadInventory = useCallback(async () => {
    if (!token) {
      setItems([])
      setError('Authentication token missing. Please sign in again.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await apiClient.get('/api/inventory', authConfig)
      setItems(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setItems([])
      setError(getErrorMessage(err, 'Failed to load inventory items'))
    } finally {
      setLoading(false)
    }
  }, [authConfig, token])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return items
    }

    return items.filter((item) =>
      [item.item_name, item.warehouse_location, item.type].join(' ').toLowerCase().includes(normalized),
    )
  }, [items, query])

  const handleQuickAdd = async (item) => {
    if (!item?._id) {
      return
    }

    try {
      await apiClient.patch(`/api/inventory/${item._id}/stock`, { delta: 1 }, authConfig)
      toast.success('Stock increased')
      loadInventory()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to increase stock'))
    }
  }

  const openDeductModal = (item) => {
    setSelectedItem(item)
    setDeductAmount('1')
  }

  const closeDeductModal = () => {
    setSelectedItem(null)
    setDeductAmount('1')
  }

  const handleDeductSubmit = async (event) => {
    event.preventDefault()
    if (!selectedItem?._id || isSubmitting) {
      return
    }

    const quantity = Number(deductAmount)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error('Enter a valid quantity')
      return
    }

    try {
      setIsSubmitting(true)
      await apiClient.patch('/api/inventory/deduct', {
        inventory_id: selectedItem._id,
        quantity,
      }, authConfig)
      toast.success('Stock deducted successfully')
      closeDeductModal()
      loadInventory()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to deduct stock'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Floor Inventory</h1>
        <p className="mt-1 text-lg font-semibold text-slate-600">Find items quickly and adjust stock from the floor.</p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
        <Barcode className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Scan Barcode or Search Item..."
          className="h-16 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-lg font-semibold text-slate-900 outline-none focus:border-emerald-300"
        />
      </div>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadInventory}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-16 text-lg font-bold text-slate-600">
          <LoaderCircle className="animate-spin" size={24} />
          Loading inventory...
        </div>
      ) : null}

      {!loading ? (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const stock = Number(item.current_stock) || 0

            return (
              <article key={item._id || item.item_name} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{item.item_name || 'Inventory Item'}</h2>
                    <p className="text-base font-semibold text-slate-600">
                      Location: {item.warehouse_location || 'Aisle 4, Rack B'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-slate-900">Current Stock: {stock.toLocaleString('en-IN')}</p>

                    <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
                      <button
                        type="button"
                        onClick={() => openDeductModal(item)}
                        disabled={stock <= 0}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-lg font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Minus size={22} />
                        -
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-lg font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        <Plus size={22} />
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-lg font-bold text-slate-600">
              No inventory items found.
            </div>
          ) : null}
        </div>
      ) : null}

      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={closeDeductModal}
        title="How many used?"
        description={selectedItem ? `${selectedItem.item_name} from ${selectedItem.warehouse_location}` : ''}
      >
        <form onSubmit={handleDeductSubmit} className="space-y-5">
          <input
            type="number"
            min="1"
            step="1"
            value={deductAmount}
            onChange={(event) => setDeductAmount(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-xl font-semibold text-slate-900 focus:border-emerald-400 focus:outline-none"
            inputMode="numeric"
            required
          />

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => setDeductAmount((current) => `${current === '0' ? '' : current}${digit}`)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-lg font-semibold text-slate-800 hover:bg-slate-50"
              >
                {digit}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeductAmount('1')}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-emerald-500 px-3 py-3 text-base font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default StaffInventory
