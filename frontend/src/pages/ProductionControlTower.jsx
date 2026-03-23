import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Eye, Factory, Plus, Timer, Warehouse } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { apiGet, getErrorMessage } from '../services/apiClient'

function getStageClasses(stage) {
  if (stage === 'Completed') return 'bg-green-100 text-green-700'
  if (stage === 'In Progress') return 'bg-amber-100 text-amber-700'
  return 'bg-blue-100 text-blue-700'
}

function formatDate(value) {
  if (!value) return 'N/A'
  return String(value)
}

function normalizeStage(value) {
  const allowed = ['Planned', 'In Progress', 'Completed']
  return allowed.includes(value) ? value : 'Planned'
}

function ProductionControlTower() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [productsById, setProductsById] = useState(new Map())
  const [staffById, setStaffById] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [isSavingBatch, setIsSavingBatch] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [batchForm, setBatchForm] = useState({
    batch_id: '',
    product_id: '',
    quantity: '',
    stage: 'Planned',
    start_date: '',
    end_date: '',
  })
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadProduction = async () => {
      if (!token) {
        if (isActive) {
          setRows([])
          setError('Authentication token missing. Please sign in again.')
          setLoading(false)
        }
        return
      }

      try {
        if (isActive) {
          setLoading(true)
          setError('')
        }

        const [batchesResponse, productsResponse, staffResponse] = await Promise.all([
          apiGet('/api/production', token, { signal: controller.signal }),
          apiGet('/api/products', token, { signal: controller.signal }),
          apiGet('/api/staff', token, { signal: controller.signal }),
        ])

        if (!isActive) return

        const productMap = new Map(
          (Array.isArray(productsResponse) ? productsResponse : []).map((product) => [product._id, product]),
        )
        const staffMap = new Map(
          (Array.isArray(staffResponse) ? staffResponse : []).map((staffMember) => [staffMember._id, staffMember]),
        )

        setProductsById(productMap)
        setStaffById(staffMap)
        setRows(Array.isArray(batchesResponse) ? batchesResponse : [])
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setRows([])
        setProductsById(new Map())
        setStaffById(new Map())
        setError(err.message || 'Failed to load production data')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadProduction()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex])

  const kpis = useMemo(() => {
    const activeBatches = rows.length
    const inProgress = rows.filter((row) => row.stage === 'In Progress').length
    const completed = rows.filter((row) => row.stage === 'Completed').length
    const totalUnits = rows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)

    return [
      { label: 'Active Batches', value: String(activeBatches), icon: Factory, iconClass: 'text-emerald-600' },
      { label: 'In Progress', value: String(inProgress), icon: Timer, iconClass: 'text-amber-600' },
      { label: 'Completed', value: String(completed), icon: CheckCircle2, iconClass: 'text-emerald-600' },
      { label: 'Total Units', value: totalUnits.toLocaleString('en-IN'), icon: Warehouse, iconClass: 'text-blue-600' },
    ]
  }, [rows])

  const mappedRows = useMemo(
    () =>
      rows.map((row) => {
        const product = productsById.get(String(row.product_id))
        const assignedStaff = staffById.get(String(row.staff_id))
        const stage = row.stage || 'Planned'
        const progressByStage = {
          Planned: 20,
          'In Progress': 65,
          Completed: 100,
        }

        return {
          ...row,
          productName: product?.name || 'Product',
          assignedName: assignedStaff?.name || 'Not assigned',
          progress: progressByStage[stage] || 20,
        }
      }),
    [productsById, rows, staffById],
  )

  const productOptions = useMemo(
    () => Array.from(productsById.entries()).map(([id, product]) => ({ id, name: product?.name || 'Product' })),
    [productsById],
  )

  const openBatchModal = () => {
    const today = new Date().toISOString().slice(0, 10)
    setSelectedBatch(null)
    setBatchForm({
      batch_id: `BATCH-${String(rows.length + 1).padStart(3, '0')}`,
      product_id: productOptions[0]?.id || '',
      quantity: '',
      stage: 'Planned',
      start_date: today,
      end_date: today,
    })
    setIsBatchModalOpen(true)
  }

  const closeBatchModal = () => {
    setIsBatchModalOpen(false)
    setSelectedBatch(null)
  }

  const openBatchDetails = (row) => {
    setSelectedBatch(row)
  }

  const closeBatchDetails = () => {
    setSelectedBatch(null)
  }

  const handleBatchField = (field, value) => {
    setBatchForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCreateBatch = async (event) => {
    event.preventDefault()

    const quantity = Number(batchForm.quantity)
    if (!batchForm.batch_id.trim() || !batchForm.product_id || Number.isNaN(quantity) || quantity <= 0 || !batchForm.start_date || !batchForm.end_date) {
      toast.error('Please complete all required batch fields')
      return
    }

    const payload = {
      batch_id: batchForm.batch_id.trim().toUpperCase(),
      product_id: batchForm.product_id,
      quantity,
      stage: normalizeStage(batchForm.stage),
      start_date: batchForm.start_date,
      end_date: batchForm.end_date,
    }

    const batchIdPattern = /^BATCH-[A-Z0-9-]+$/
    if (!batchIdPattern.test(payload.batch_id)) {
      toast.error('Batch ID format must start with BATCH-')
      return
    }

    if (new Date(payload.end_date) < new Date(payload.start_date)) {
      toast.error('End date cannot be earlier than start date')
      return
    }

    try {
      setIsSavingBatch(true)
      await apiClient.post('/api/production', payload, authConfig)
      toast.success('Batch created successfully')
      closeBatchModal()
      setRefreshIndex((value) => value + 1)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create batch'))
    } finally {
      setIsSavingBatch(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Production</h1>
          <p className="mt-1 text-base text-gray-500">Track batches, stages, and production schedules</p>
        </div>

        <button
          type="button"
          onClick={openBatchModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          New Batch
        </button>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRefreshIndex((value) => value + 1)}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon

          return (
            <article key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <Icon size={22} className={kpi.iconClass} />
                </div>

                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-4xl font-semibold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm xl:col-span-2">
            Loading production batches...
          </div>
        ) : (
          mappedRows.map((row) => (
            <article key={row._id || row.batch_id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">{row.batch_id}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-gray-900">{row.productName}</h2>
                </div>

                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStageClasses(row.stage)}`}>
                  {row.stage}
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>{row.progress}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100">
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${row.progress}%` }} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-500">
                <p>
                  Assigned: <span className="text-gray-900">{row.assignedName}</span>
                </p>
                <p>
                  Units: <span className="text-gray-900">{(Number(row.quantity) || 0).toLocaleString('en-IN')}</span>
                </p>
                <p>
                  Started: <span className="text-gray-900">{formatDate(row.start_date)}</span>
                </p>
                <p>
                  ETA: <span className="text-gray-900">{formatDate(row.end_date)}</span>
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => openBatchDetails(row)}
                  className="inline-flex items-center gap-2 rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <Eye size={17} />
                  <span className="text-sm font-medium">View Details</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {!loading && mappedRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No production batches found.
        </div>
      ) : null}

      <Modal
        isOpen={Boolean(selectedBatch)}
        onClose={closeBatchDetails}
        title={`Batch ${selectedBatch?.batch_id || ''}`}
      >
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-gray-500">Product</p>
              <p className="mt-1 font-semibold text-gray-900">{selectedBatch?.productName || 'Product'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-gray-500">Stage</p>
              <p className="mt-1 font-semibold text-gray-900">{selectedBatch?.stage || 'Planned'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-gray-500">Quantity</p>
              <p className="mt-1 font-semibold text-gray-900">{(Number(selectedBatch?.quantity) || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-gray-500">Assigned</p>
              <p className="mt-1 font-semibold text-gray-900">{selectedBatch?.assignedName || 'Not assigned'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-gray-500">Start Date</p>
              <p className="mt-1 font-semibold text-gray-900">{formatDate(selectedBatch?.start_date)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-gray-500">End Date</p>
              <p className="mt-1 font-semibold text-gray-900">{formatDate(selectedBatch?.end_date)}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeBatchDetails}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isBatchModalOpen}
        onClose={closeBatchModal}
        title="New Batch"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="batch-id" className="text-sm font-medium text-gray-700">
              Batch ID
            </label>
            <input
              id="batch-id"
              type="text"
              value={batchForm.batch_id}
              onChange={(event) => handleBatchField('batch_id', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="batch-product" className="text-sm font-medium text-gray-700">
              Product
            </label>
            <select
              id="batch-product"
              value={batchForm.product_id}
              onChange={(event) => handleBatchField('product_id', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            >
              <option value="">Select Product</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="batch-quantity" className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                id="batch-quantity"
                type="number"
                min="1"
                step="1"
                value={batchForm.quantity}
                onChange={(event) => handleBatchField('quantity', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="batch-stage" className="text-sm font-medium text-gray-700">
                Stage
              </label>
              <select
                id="batch-stage"
                value={batchForm.stage}
                onChange={(event) => handleBatchField('stage', normalizeStage(event.target.value))}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="batch-start-date" className="text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                id="batch-start-date"
                type="date"
                value={batchForm.start_date}
                onChange={(event) => handleBatchField('start_date', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="batch-end-date" className="text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                id="batch-end-date"
                type="date"
                value={batchForm.end_date}
                onChange={(event) => handleBatchField('end_date', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={closeBatchModal}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingBatch}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              {isSavingBatch ? 'Saving...' : 'Save Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default ProductionControlTower
