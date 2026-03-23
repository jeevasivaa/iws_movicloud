import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Eye, Factory, Plus, Timer, Warehouse } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../services/apiClient'

function getStageClasses(stage) {
  if (stage === 'Completed') return 'bg-green-100 text-green-700'
  if (stage === 'In Progress') return 'bg-amber-100 text-amber-700'
  return 'bg-blue-100 text-blue-700'
}

function formatDate(value) {
  if (!value) return 'N/A'
  return String(value)
}

function ProductionControlTower() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [productsById, setProductsById] = useState(new Map())
  const [staffById, setStaffById] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

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

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Production</h1>
          <p className="mt-1 text-base text-gray-500">Track batches, stages, and production schedules</p>
        </div>

        <button
          type="button"
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
    </section>
  )
}

export default ProductionControlTower
