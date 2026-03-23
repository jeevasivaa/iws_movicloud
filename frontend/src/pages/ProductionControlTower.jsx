import { CheckCircle2, Eye, Factory, Plus, Timer, Warehouse } from 'lucide-react'

const PRODUCTION_KPIS = [
  { label: 'Active Batches', value: '4', icon: Factory, iconClass: 'text-emerald-600' },
  { label: 'In Progress', value: '3', icon: Timer, iconClass: 'text-amber-600' },
  { label: 'Completed Today', value: '1', icon: CheckCircle2, iconClass: 'text-emerald-600' },
  { label: 'Total Units', value: '1,450', icon: Warehouse, iconClass: 'text-blue-600' },
]

const BATCH_ROWS = [
  {
    batchId: 'BATCH-001',
    product: 'Cold Pressed Coconut Oil',
    stage: 'Bottling',
    progress: 75,
    assigned: 'Vikram Singh',
    units: 500,
    started: '2024-03-01',
    eta: '2024-03-04',
  },
  {
    batchId: 'BATCH-002',
    product: 'Virgin Sesame Oil',
    stage: 'Extraction',
    progress: 40,
    assigned: 'Sunita Patel',
    units: 300,
    started: '2024-03-02',
    eta: '2024-03-06',
  },
  {
    batchId: 'BATCH-003',
    product: 'Organic Groundnut Oil',
    stage: 'Packaging',
    progress: 90,
    assigned: 'Arun Mehta',
    units: 450,
    started: '2024-02-28',
    eta: '2024-03-03',
  },
  {
    batchId: 'BATCH-004',
    product: 'Premium Castor Oil',
    stage: 'Raw Material Prep',
    progress: 15,
    assigned: 'Vikram Singh',
    units: 200,
    started: '2024-03-05',
    eta: '2024-03-10',
  },
]

function getStageClasses(stage) {
  if (stage === 'Bottling') return 'bg-blue-100 text-blue-700'
  if (stage === 'Extraction') return 'bg-amber-100 text-amber-700'
  if (stage === 'Packaging') return 'bg-green-100 text-green-700'
  return 'bg-red-100 text-red-700'
}

function ProductionControlTower() {
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PRODUCTION_KPIS.map((kpi) => {
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
        {BATCH_ROWS.map((row) => (
          <article key={row.batchId} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{row.batchId}</p>
                <h2 className="mt-1 text-2xl font-semibold text-gray-900">{row.product}</h2>
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
                Assigned: <span className="text-gray-900">{row.assigned}</span>
              </p>
              <p>
                Units: <span className="text-gray-900">{row.units}</span>
              </p>
              <p>
                Started: <span className="text-gray-900">{row.started}</span>
              </p>
              <p>
                ETA: <span className="text-gray-900">{row.eta}</span>
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
        ))}
      </div>
    </section>
  )
}

export default ProductionControlTower
