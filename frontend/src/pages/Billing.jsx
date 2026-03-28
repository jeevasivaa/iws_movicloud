import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Eye, Plus, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const STATUS_OPTIONS = ['Paid', 'Pending', 'Overdue']

const EMPTY_INVOICE_FORM = {
  invoice_number: '',
  client_id: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  status: STATUS_OPTIONS[1],
  items: '',
}

function getStatusClasses(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-700'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function getDetailStatusClasses(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-800 border-green-200'
  if (status === 'Pending') return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

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

function downloadTextFile(fileName, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}

function sanitizeFileName(value, fallback) {
  const normalized = String(value || fallback).trim()
  const cleaned = normalized.replace(/[^a-zA-Z0-9-_]+/g, '_')
  return cleaned || fallback
}

function buildInvoiceText(invoice, clientName) {
  return [
    'Invoice Summary',
    `Invoice: ${invoice?.invoice_number || 'N/A'}`,
    `Client: ${clientName || 'N/A'}`,
    `Date: ${invoice?.date || 'N/A'}`,
    `Amount: ${formatCurrency(invoice?.amount)}`,
    `Status: ${invoice?.status || 'N/A'}`,
  ].join('\n')
}

function Billing() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [summary, setSummary] = useState({ total_billed: 0, total_received: 0, total_outstanding: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceForm, setInvoiceForm] = useState(EMPTY_INVOICE_FORM)
  const [isCreating, setIsCreating] = useState(false)

  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchBilling = useCallback(
    async (signal) => {
      if (!token) {
        setInvoices([])
        setClients([])
        setSummary({ total_billed: 0, total_received: 0, total_outstanding: 0 })
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const [invoiceResponse, summaryResponse, clientsResponse] = await Promise.all([
          apiClient.get('/api/billing', { ...authConfig, signal }),
          apiClient.get('/api/billing/summary', { ...authConfig, signal }),
          apiClient.get('/api/marketing', { ...authConfig, signal }),
        ])

        setInvoices(Array.isArray(invoiceResponse.data) ? invoiceResponse.data : [])
        setSummary({
          total_billed: Number(summaryResponse?.data?.total_billed) || 0,
          total_received: Number(summaryResponse?.data?.total_received) || 0,
          total_outstanding: Number(summaryResponse?.data?.total_outstanding) || 0,
        })
        setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data : [])
      } catch (err) {
        if (signal?.aborted) {
          return
        }

        setInvoices([])
        setClients([])
        setSummary({ total_billed: 0, total_received: 0, total_outstanding: 0 })
        setError(getErrorMessage(err, 'Failed to load billing data'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchBilling(controller.signal)
    return () => controller.abort()
  }, [fetchBilling])

  const clientsById = useMemo(() => new Map(clients.map((client) => [String(client._id), client])), [clients])

  const mappedInvoices = useMemo(
    () =>
      invoices.map((invoice) => ({
        ...invoice,
        clientName: clientsById.get(String(invoice.client_id))?.company_name || invoice.client_name || 'Client',
      })),
    [clientsById, invoices],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return mappedInvoices
    }

    return mappedInvoices.filter((row) =>
      [row.invoice_number, row.clientName, row.date, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [mappedInvoices, query])

  const billingKpis = useMemo(
    () => [
      { label: 'Total Billed', value: formatCurrency(summary.total_billed), valueClass: 'text-gray-900' },
      { label: 'Received', value: formatCurrency(summary.total_received), valueClass: 'text-emerald-600' },
      { label: 'Outstanding', value: formatCurrency(summary.total_outstanding), valueClass: 'text-red-500' },
    ],
    [summary.total_billed, summary.total_outstanding, summary.total_received],
  )

  const openCreateModal = () => {
    const year = new Date().getFullYear()
    const nextNumber = String(mappedInvoices.length + 1).padStart(3, '0')
    setInvoiceForm({
      ...EMPTY_INVOICE_FORM,
      invoice_number: `INV-${year}-${nextNumber}`,
      client_id: clients[0]?._id || '',
    })
    setIsCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setInvoiceForm(EMPTY_INVOICE_FORM)
  }

  const openViewModal = (invoice) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }

  const closeViewModal = () => {
    setSelectedInvoice(null)
    setIsViewModalOpen(false)
  }

  const handleFormField = (field, value) => {
    setInvoiceForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCreateInvoice = async (event) => {
    event.preventDefault()

    const payload = {
      invoice_number: invoiceForm.invoice_number.trim().toUpperCase(),
      client_id: invoiceForm.client_id,
      date: invoiceForm.date,
      amount: Number(invoiceForm.amount),
      status: invoiceForm.status,
      items: invoiceForm.items
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((description) => ({ description })),
    }

    if (!payload.invoice_number || !payload.client_id || !payload.date || Number.isNaN(payload.amount) || payload.amount <= 0) {
      toast.error('Please fill all required invoice fields')
      return
    }

    try {
      setIsCreating(true)
      await apiClient.post('/api/billing', payload, authConfig)
      toast.success('Invoice created successfully')
      closeCreateModal()
      fetchBilling()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create invoice'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleDownloadInvoice = (invoice) => {
    const clientName = invoice?.clientName || 'Client'
    const fileName = `${sanitizeFileName(invoice?.invoice_number, 'invoice')}_${sanitizeFileName(clientName, 'client')}.txt`
    const content = buildInvoiceText(invoice, clientName)
    downloadTextFile(fileName, content)
    toast.success(`Downloaded ${invoice?.invoice_number || 'invoice'}`)
  }

  const handleSendInvoice = (invoice) => {
    const clientName = invoice?.clientName || 'Client'
    const subject = encodeURIComponent(`Invoice ${invoice?.invoice_number || ''}`)
    const body = encodeURIComponent(
      [
        `Hello ${clientName},`,
        '',
        `Please find invoice ${invoice?.invoice_number || ''} for ${formatCurrency(invoice?.amount)} dated ${invoice?.date || '-'}.`,
        '',
        'Regards,',
        'VSA Foods Finance Team',
      ].join('\n'),
    )

    window.location.href = `mailto:?subject=${subject}&body=${body}`
    toast.success(`Opened email draft for ${invoice?.invoice_number || 'invoice'}`)
  }

  const selectedClientName = selectedInvoice
    ? clientsById.get(String(selectedInvoice.client_id))?.company_name || selectedInvoice.clientName || 'Client'
    : 'Client'

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Billing</h1>
          <p className="mt-1 text-base text-gray-500">Generate invoices, track payments, and manage billing</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          Create Invoice
        </button>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchBilling()}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {billingKpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`mt-2 text-5xl font-semibold ${kpi.valueClass}`}>{kpi.value}</p>
          </article>
        ))}
      </div>

      <div className="relative w-full max-w-xl">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search invoices..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Invoice</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Client</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={6}>
                  Loading invoices...
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row._id || row.invoice_number} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-5 text-sm text-gray-700">{row.invoice_number}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.clientName}</td>
                  <td className="px-6 py-5 text-sm text-gray-500">{formatDate(row.date)}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{formatCurrency(row.amount)}</td>

                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`View ${row.invoice_number}`}
                        onClick={() => openViewModal(row)}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        aria-label={`Download ${row.invoice_number}`}
                        onClick={() => handleDownloadInvoice(row)}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Download size={17} />
                      </button>

                      <button
                        type="button"
                        aria-label={`Send ${row.invoice_number}`}
                        onClick={() => handleSendInvoice(row)}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Send size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No invoices found for this search.</div>
        ) : null}
      </div>

      <Modal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title={`Invoice · ${selectedInvoice?.invoice_number || ''}`}
        description="Review invoice details and client mapping."
      >
        <div className="space-y-5">
          <div className="modal-panel bg-gradient-to-r from-slate-50 to-emerald-50/50">
            <p className="text-sm text-slate-600">Client</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{selectedClientName}</p>
          </div>

          <div className="modal-data-grid">
            <div className="modal-data-item">
              <p className="modal-data-label">Invoice Number</p>
              <p className="modal-data-value">{selectedInvoice?.invoice_number || '-'}</p>
            </div>
            <div className="modal-data-item">
              <p className="modal-data-label">Date</p>
              <p className="modal-data-value">{formatDate(selectedInvoice?.date)}</p>
            </div>
            <div className="modal-data-item">
              <p className="modal-data-label">Amount</p>
              <p className="modal-data-value">{formatCurrency(selectedInvoice?.amount)}</p>
            </div>
            <div className="modal-data-item">
              <p className="modal-data-label">Status</p>
              <div className="mt-1">
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getDetailStatusClasses(selectedInvoice?.status)}`}>
                  {selectedInvoice?.status || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closeViewModal} className="modal-btn-secondary">
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Create Invoice"
        description="Capture billing details and issue an invoice."
      >
        <form onSubmit={handleCreateInvoice} className="space-y-5">
          <div className="modal-shell space-y-4">
            <div className="space-y-2">
              <label htmlFor="invoice-number" className="modal-label">
                Invoice Number
              </label>
              <input
                id="invoice-number"
                type="text"
                value={invoiceForm.invoice_number}
                onChange={(event) => handleFormField('invoice_number', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="invoice-client" className="modal-label">
                  Client
                </label>
                <select
                  id="invoice-client"
                  value={invoiceForm.client_id}
                  onChange={(event) => handleFormField('client_id', event.target.value)}
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
                <label htmlFor="invoice-date" className="modal-label">
                  Date
                </label>
                <input
                  id="invoice-date"
                  type="date"
                  value={invoiceForm.date}
                  onChange={(event) => handleFormField('date', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="invoice-amount" className="modal-label">
                  Amount (₹)
                </label>
                <input
                  id="invoice-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(event) => handleFormField('amount', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="invoice-status" className="modal-label">
                  Status
                </label>
                <select
                  id="invoice-status"
                  value={invoiceForm.status}
                  onChange={(event) => handleFormField('status', event.target.value)}
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

            <div className="space-y-2">
              <label htmlFor="invoice-items" className="modal-label">
                Line Items (one per line)
              </label>
              <textarea
                id="invoice-items"
                rows={5}
                value={invoiceForm.items}
                onChange={(event) => handleFormField('items', event.target.value)}
                className="modal-input"
                placeholder="Cold Pressed Coconut Oil x 10\nVirgin Sesame Oil x 4"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closeCreateModal} className="modal-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isCreating} className="modal-btn-primary">
              {isCreating ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default Billing
