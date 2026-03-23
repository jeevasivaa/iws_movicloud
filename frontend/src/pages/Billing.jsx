import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Eye, Plus, Send, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const EMPTY_ITEM = { item_name: '', quantity: '', unit_price: '' }

function getStatusClasses(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-700'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function generateInvoiceNumber() {
  const now = new Date()
  const dateToken = now.toISOString().slice(0, 10).replace(/-/g, '')
  const randomToken = Math.floor(Math.random() * 900 + 100)
  return `INV-${dateToken}-${randomToken}`
}

function normalizeInvoiceItems(items) {
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const quantity = Number(item.qty ?? item.quantity) || 0
    const unitPrice = Number(item.unit_price ?? item.unitPrice) || 0
    const lineTotal = Number(item.line_total) || quantity * unitPrice

    return {
      key: `${item.description || item.item_name || 'line'}-${index}`,
      description: item.description || item.item_name || `Line Item ${index + 1}`,
      quantity,
      unitPrice,
      lineTotal,
    }
  })
}

function buildInvoiceText(invoice, clientName) {
  const invoiceItems = normalizeInvoiceItems(invoice?.items)
  const lines = [
    `Invoice Number: ${invoice?.invoice_number || 'N/A'}`,
    `Client: ${clientName || 'Client'}`,
    `Date: ${invoice?.date || 'N/A'}`,
    `Status: ${invoice?.status || 'Pending'}`,
    `Amount: ${formatCurrency(invoice?.amount)}`,
    '',
    'Line Items',
  ]

  if (invoiceItems.length === 0) {
    lines.push('No line items available')
  } else {
    invoiceItems.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.description} | Qty: ${item.quantity} | Unit: ${formatCurrency(item.unitPrice)} | Total: ${formatCurrency(item.lineTotal)}`,
      )
    })
  }

  return lines.join('\n')
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

function Billing() {
  const { token } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [kpis, setKpis] = useState({
    total_billed: 0,
    total_received: 0,
    total_outstanding: 0,
  })
  const [clients, setClients] = useState([])
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({
    client_id: '',
    date: new Date().toISOString().slice(0, 10),
    items: [{ ...EMPTY_ITEM }],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [error, setError] = useState('')
  const viewedInvoiceItems = useMemo(() => normalizeInvoiceItems(viewingInvoice?.items), [viewingInvoice])
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchBillingData = useCallback(
    async (signal) => {
      if (!token) {
        setInvoices([])
        setClients([])
        setKpis({ total_billed: 0, total_received: 0, total_outstanding: 0 })
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')

        const [summaryResponse, invoicesResponse, clientsResponse] = await Promise.all([
          apiClient.get('/api/billing/summary', { ...authConfig, signal }),
          apiClient.get('/api/billing', { ...authConfig, signal }),
          apiClient.get('/api/marketing', { ...authConfig, signal }),
        ])

        const nextClients = Array.isArray(clientsResponse.data) ? clientsResponse.data : []

        setKpis({
          total_billed: Number(summaryResponse.data?.total_billed) || 0,
          total_received: Number(summaryResponse.data?.total_received) || 0,
          total_outstanding: Number(summaryResponse.data?.total_outstanding) || 0,
        })
        setInvoices(Array.isArray(invoicesResponse.data) ? invoicesResponse.data : [])
        setClients(nextClients)

        setInvoiceForm((current) => ({
          ...current,
          client_id: current.client_id || nextClients[0]?._id || '',
        }))
      } catch (err) {
        if (signal?.aborted) {
          return
        }
        setInvoices([])
        setClients([])
        setKpis({ total_billed: 0, total_received: 0, total_outstanding: 0 })
        setError(getErrorMessage(err, 'Failed to load billing data'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchBillingData(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchBillingData])

  const clientsById = useMemo(
    () => new Map(clients.map((client) => [String(client._id), client])),
    [clients],
  )

  const billingKpis = useMemo(
    () => [
      { label: 'Total Billed', value: formatCurrency(kpis.total_billed), valueClass: 'text-gray-900' },
      { label: 'Received', value: formatCurrency(kpis.total_received), valueClass: 'text-emerald-600' },
      { label: 'Outstanding', value: formatCurrency(kpis.total_outstanding), valueClass: 'text-red-500' },
    ],
    [kpis.total_billed, kpis.total_received, kpis.total_outstanding],
  )

  const mappedRows = useMemo(
    () =>
      invoices.map((row) => ({
        ...row,
        clientName: clientsById.get(String(row.client_id))?.company_name || row.client_name || 'Client',
      })),
    [clientsById, invoices],
  )

  const lineItems = useMemo(
    () =>
      invoiceForm.items.map((item) => {
        const quantity = Number(item.quantity) || 0
        const unitPrice = Number(item.unit_price) || 0
        const lineTotal = quantity * unitPrice
        return {
          ...item,
          quantity,
          unitPrice,
          lineTotal,
        }
      }),
    [invoiceForm.items],
  )

  const subtotal = useMemo(
    () => lineItems.reduce((total, item) => total + item.lineTotal, 0),
    [lineItems],
  )
  const cgst = Number((subtotal * 0.09).toFixed(2))
  const sgst = Number((subtotal * 0.09).toFixed(2))
  const grandTotal = Number((subtotal + cgst + sgst).toFixed(2))

  const openInvoiceModal = () => {
    setInvoiceForm({
      client_id: clients[0]?._id || '',
      date: new Date().toISOString().slice(0, 10),
      items: [{ ...EMPTY_ITEM }],
    })
    setIsInvoiceModalOpen(true)
  }

  const closeInvoiceModal = () => {
    setIsInvoiceModalOpen(false)
    setInvoiceForm((current) => ({
      client_id: current.client_id || clients[0]?._id || '',
      date: new Date().toISOString().slice(0, 10),
      items: [{ ...EMPTY_ITEM }],
    }))
  }

  const closeInvoicePreview = () => {
    setViewingInvoice(null)
  }

  const handleTopLevelField = (field, value) => {
    setInvoiceForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleItemField = (index, field, value) => {
    setInvoiceForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }))
  }

  const handleAddLineItem = () => {
    setInvoiceForm((current) => ({
      ...current,
      items: [...current.items, { ...EMPTY_ITEM }],
    }))
  }

  const handleRemoveLineItem = (index) => {
    setInvoiceForm((current) => {
      if (current.items.length === 1) {
        return current
      }

      return {
        ...current,
        items: current.items.filter((_, itemIndex) => itemIndex !== index),
      }
    })
  }

  const handleCreateInvoice = async (event) => {
    event.preventDefault()

    const preparedItems = invoiceForm.items
      .map((item) => {
        const quantity = Number(item.quantity)
        const unitPrice = Number(item.unit_price)
        const description = item.item_name.trim()

        return {
          description,
          qty: Number.isFinite(quantity) ? quantity : 0,
          unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
          line_total: Number.isFinite(quantity) && Number.isFinite(unitPrice) ? quantity * unitPrice : 0,
        }
      })
      .filter((item) => item.description && item.qty > 0 && item.unit_price > 0)

    if (!invoiceForm.client_id || !invoiceForm.date || preparedItems.length === 0) {
      toast.error('Please select a client, invoice date, and at least one valid line item')
      return
    }

    const payload = {
      invoice_number: generateInvoiceNumber(),
      client_id: invoiceForm.client_id,
      date: invoiceForm.date,
      amount: grandTotal,
      status: 'Pending',
      items: preparedItems,
    }

    try {
      setIsSaving(true)
      await apiClient.post('/api/billing', payload, authConfig)
      toast.success('Invoice generated successfully')
      closeInvoiceModal()
      fetchBillingData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to generate invoice'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice)
  }

  const handleDownloadInvoice = (invoice) => {
    const fileName = `${sanitizeFileName(invoice?.invoice_number, 'invoice')}.txt`
    const fileContent = buildInvoiceText(invoice, invoice?.clientName)
    downloadTextFile(fileName, fileContent)
    toast.success(`Downloaded ${invoice?.invoice_number || 'invoice'}`)
  }

  const handleSendInvoice = (invoice) => {
    const client = clientsById.get(String(invoice?.client_id))
    if (!client?.email) {
      toast.error('Client email is unavailable for this invoice')
      return
    }

    const subject = encodeURIComponent(`Invoice ${invoice.invoice_number || ''}`)
    const body = encodeURIComponent(
      [
        `Hello ${client.contact_person || 'Team'},`,
        '',
        `Please find invoice ${invoice.invoice_number || ''} for ${formatCurrency(invoice.amount)} dated ${invoice.date || ''}.`,
        '',
        'Regards,',
        'VSA Foods Billing Team',
      ].join('\n'),
    )

    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`
    toast.success(`Opened email draft for ${client.company_name || 'client'}`)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Billing</h1>
          <p className="mt-1 text-base text-gray-500">Generate invoices, track payments, and manage billing</p>
        </div>

        <button
          type="button"
          onClick={openInvoiceModal}
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
            onClick={() => fetchBillingData()}
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

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left">
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
              mappedRows.map((row) => (
                <tr key={row._id || row.invoice_number} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-6 py-5 text-sm text-gray-700">{row.invoice_number}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">{row.clientName}</td>
                  <td className="px-6 py-5 text-sm text-gray-500">{row.date}</td>
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
                        onClick={() => handleViewInvoice(row)}
                        aria-label={`View ${row.invoice_number}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(row)}
                        aria-label={`Download ${row.invoice_number}`}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Download size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendInvoice(row)}
                        aria-label={`Send ${row.invoice_number}`}
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

        {!isLoading && mappedRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No invoices found.</div>
        ) : null}
      </div>

      <Modal
        isOpen={Boolean(viewingInvoice)}
        onClose={closeInvoicePreview}
        title={`Invoice ${viewingInvoice?.invoice_number || ''}`}
        description="Review invoice details before sharing or download."
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="modal-data-grid">
            <div className="modal-data-item">
              <p className="modal-data-label">Client</p>
              <p className="modal-data-value">{viewingInvoice?.clientName || 'Client'}</p>
            </div>
            <div className="modal-data-item">
              <p className="modal-data-label">Date</p>
              <p className="modal-data-value">{viewingInvoice?.date || 'N/A'}</p>
            </div>
            <div className="modal-data-item">
              <p className="modal-data-label">Status</p>
              <p className="modal-data-value">{viewingInvoice?.status || 'Pending'}</p>
            </div>
            <div className="modal-data-item">
              <p className="modal-data-label">Amount</p>
              <p className="modal-data-value">{formatCurrency(viewingInvoice?.amount)}</p>
            </div>
          </div>

          <div className="modal-shell p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Line Items</p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{viewedInvoiceItems.length} entries</p>
            </div>
            <div className="max-h-72 overflow-auto">
              {viewedInvoiceItems.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">No line items available.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Description</th>
                      <th className="px-4 py-2 font-medium">Qty</th>
                      <th className="px-4 py-2 font-medium">Unit Price</th>
                      <th className="px-4 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewedInvoiceItems.map((item) => (
                      <tr key={item.key} className="border-t border-slate-100">
                        <td className="px-4 py-2 text-slate-900">{item.description}</td>
                        <td className="px-4 py-2 text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-2 text-slate-700">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 font-medium text-slate-900">{formatCurrency(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={closeInvoicePreview}
              className="modal-btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={closeInvoiceModal}
        title="Create Invoice"
        description="Build an invoice with line items and tax totals."
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="invoice-client" className="modal-label">
                Client Details
              </label>
              <select
                id="invoice-client"
                value={invoiceForm.client_id}
                onChange={(event) => handleTopLevelField('client_id', event.target.value)}
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
                Invoice Date
              </label>
              <input
                id="invoice-date"
                type="date"
                value={invoiceForm.date}
                onChange={(event) => handleTopLevelField('date', event.target.value)}
                className="modal-input"
                required
              />
            </div>
          </div>

          <div className="modal-shell space-y-3">
            <div className="hidden grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
              <span className="col-span-5">Item Name</span>
              <span className="col-span-2">Quantity</span>
              <span className="col-span-2">Unit Price</span>
              <span className="col-span-2">Row Total</span>
              <span className="col-span-1 text-right">&nbsp;</span>
            </div>

            {lineItems.map((item, index) => (
              <div
                key={`line-item-${index}`}
                className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-12"
              >
                <input
                  type="text"
                  value={invoiceForm.items[index]?.item_name || ''}
                  onChange={(event) => handleItemField(index, 'item_name', event.target.value)}
                  placeholder="Enter item"
                  className="modal-input sm:col-span-5"
                />

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={invoiceForm.items[index]?.quantity || ''}
                  onChange={(event) => handleItemField(index, 'quantity', event.target.value)}
                  className="modal-input sm:col-span-2"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceForm.items[index]?.unit_price || ''}
                  onChange={(event) => handleItemField(index, 'unit_price', event.target.value)}
                  className="modal-input sm:col-span-2"
                />

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 sm:col-span-2 sm:block sm:pt-2.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:hidden">Row Total</span>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </div>

                <div className="flex items-center justify-end sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(index)}
                    className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    disabled={invoiceForm.items.length === 1}
                    aria-label="Remove line item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddLineItem}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <Plus size={14} />
              Add Line Item
            </button>
          </div>

          <div className="modal-panel bg-gradient-to-r from-slate-50 to-emerald-50/50">
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>CGST (9%)</span>
                <span className="font-medium text-slate-900">{formatCurrency(cgst)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SGST (9%)</span>
                <span className="font-medium text-slate-900">{formatCurrency(sgst)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-base font-semibold text-slate-900">Grand Total</span>
                <span className="text-base font-semibold text-slate-900">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={closeInvoiceModal}
              className="modal-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || clients.length === 0}
              className="modal-btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save & Generate Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default Billing
