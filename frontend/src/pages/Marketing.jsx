import { useCallback, useEffect, useMemo, useState } from 'react'
import { Mail, MessageSquare, Plus, Search, Send, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const EMPTY_CLIENT_FORM = {
  company_name: '',
  contact_person: '',
  email: '',
  total_orders: '',
  last_order_date: new Date().toISOString().slice(0, 10),
  rating: '',
}

function Marketing() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT_FORM)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchClients = useCallback(
    async (signal) => {
      if (!token) {
        setClients([])
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const response = await apiClient.get('/api/marketing', { ...authConfig, signal })
        setClients(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        if (signal?.aborted) {
          return
        }
        setClients([])
        setError(getErrorMessage(err, 'Failed to load client data'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchClients(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchClients])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return clients
    }

    return clients.filter((row) =>
      [row.company_name, row.contact_person, row.email, row.last_order_date].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query, clients])

  const openAddModal = () => {
    setClientForm(EMPTY_CLIENT_FORM)
    setIsAddModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setClientForm(EMPTY_CLIENT_FORM)
  }

  const handleClientField = (field, value) => {
    setClientForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCreateClient = async (event) => {
    event.preventDefault()

    const payload = {
      company_name: clientForm.company_name.trim(),
      contact_person: clientForm.contact_person.trim(),
      email: clientForm.email.trim().toLowerCase(),
      total_orders: Number(clientForm.total_orders),
      last_order_date: clientForm.last_order_date,
      rating: Number(clientForm.rating),
    }

    if (
      !payload.company_name ||
      !payload.contact_person ||
      !payload.email ||
      Number.isNaN(payload.total_orders) ||
      !payload.last_order_date ||
      Number.isNaN(payload.rating)
    ) {
      toast.error('Please fill all required client fields')
      return
    }

    try {
      setIsSaving(true)
      await apiClient.post('/api/marketing', payload, authConfig)
      toast.success('Client added successfully')
      closeAddModal()
      fetchClients()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add client'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Marketing & Clients</h1>
          <p className="mt-1 text-base text-gray-500">Manage client relationships, feedback, and promotions</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => toast('Campaign sending workflow is not configured yet.')}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Send size={16} />
            Send Campaign
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <Plus size={16} />
            Add Client
          </button>
        </div>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchClients()}
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
          placeholder="Search clients..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm xl:col-span-3">
            Loading clients...
          </div>
        ) : (
          filteredRows.map((row) => (
            <article key={row._id || row.email} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{row.company_name}</h2>
                  <p className="text-sm text-gray-500">{row.contact_person}</p>
                </div>

                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {(Number(row.rating) || 0).toFixed(1)}
                </span>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p className="flex items-center gap-2">
                  <Mail size={15} />
                  {row.email}
                </p>
                <p className="mt-2">
                  {(Number(row.total_orders) || 0).toLocaleString('en-IN')} total orders
                  <span className="text-gray-300"> · </span>
                  Last: {row.last_order_date}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!row.email) {
                      toast.error('Client email is unavailable')
                      return
                    }
                    const subject = encodeURIComponent(`Regarding your account at VSA Foods`)
                    const body = encodeURIComponent(`Hello ${row.contact_person || 'Team'},\n\n`)
                    window.location.href = `mailto:${row.email}?subject=${subject}&body=${body}`
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Mail size={16} />
                  Email
                </button>

                <button
                  type="button"
                  onClick={() => toast(`Feedback flow for ${row.company_name} is not wired yet.`)}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <MessageSquare size={16} />
                  Feedback
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {!isLoading && filteredRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No clients found for this search.
        </div>
      ) : null}

      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add Client">
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="client-company-name" className="text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              id="client-company-name"
              type="text"
              value={clientForm.company_name}
              onChange={(event) => handleClientField('company_name', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="client-contact-person" className="text-sm font-medium text-gray-700">
              Contact Person
            </label>
            <input
              id="client-contact-person"
              type="text"
              value={clientForm.contact_person}
              onChange={(event) => handleClientField('contact_person', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="client-email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="client-email"
              type="email"
              value={clientForm.email}
              onChange={(event) => handleClientField('email', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="client-total-orders" className="text-sm font-medium text-gray-700">
                Total Orders
              </label>
              <input
                id="client-total-orders"
                type="number"
                min="0"
                step="1"
                value={clientForm.total_orders}
                onChange={(event) => handleClientField('total_orders', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="client-rating" className="text-sm font-medium text-gray-700">
                Rating
              </label>
              <input
                id="client-rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={clientForm.rating}
                onChange={(event) => handleClientField('rating', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="client-last-order-date" className="text-sm font-medium text-gray-700">
              Last Order Date
            </label>
            <input
              id="client-last-order-date"
              type="date"
              value={clientForm.last_order_date}
              onChange={(event) => handleClientField('last_order_date', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
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
              {isSaving ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default Marketing
