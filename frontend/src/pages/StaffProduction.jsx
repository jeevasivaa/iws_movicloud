import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, LoaderCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import apiClient, { getErrorMessage } from '../services/apiClient'
import { useAuth } from '../context/useAuth'

const STAGE_ORDER = ['Planned', 'In Progress', 'Completed']

function clampProgress(value) {
  const next = Number(value)
  if (Number.isNaN(next)) {
    return 0
  }
  return Math.max(0, Math.min(100, Math.round(next)))
}

function getProgressFromStage(stage) {
  if (stage === 'Completed') return 100
  if (stage === 'In Progress') return 45
  return 20
}

function getNextStage(stage) {
  const currentIndex = STAGE_ORDER.indexOf(stage)
  if (currentIndex === -1 || currentIndex === STAGE_ORDER.length - 1) {
    return null
  }
  return STAGE_ORDER[currentIndex + 1]
}

function StaffProduction() {
  const { token } = useAuth()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [issueSeverity, setIssueSeverity] = useState('high')
  const [issueText, setIssueText] = useState('')
  const [isReporting, setIsReporting] = useState(false)

  const authConfig = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token],
  )

  const loadBatches = useCallback(async () => {
    if (!token) {
      setBatches([])
      setLoading(false)
      setError('Authentication token missing. Please sign in again.')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await apiClient.get('/api/production/my-batches', authConfig)
      setBatches(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load assigned batches'))
      setBatches([])
    } finally {
      setLoading(false)
    }
  }, [authConfig, token])

  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  const { activeBatch, queueBatches } = useMemo(() => {
    const sorted = [...batches].sort((a, b) => {
      const aDate = Date.parse(a.start_date || '') || Number.MAX_SAFE_INTEGER
      const bDate = Date.parse(b.start_date || '') || Number.MAX_SAFE_INTEGER
      return aDate - bDate
    })

    const current =
      sorted.find((row) => row.stage === 'In Progress') ||
      sorted.find((row) => row.stage === 'Planned') ||
      sorted[0] ||
      null

    const queue = sorted.filter((row) => row._id !== current?._id)
    return {
      activeBatch: current,
      queueBatches: queue,
    }
  }, [batches])

  const activeProgress = useMemo(() => {
    if (!activeBatch) return 0

    if (typeof activeBatch.progress === 'number') {
      return clampProgress(activeBatch.progress)
    }

    return getProgressFromStage(activeBatch.stage)
  }, [activeBatch])

  const handleMarkStageComplete = async () => {
    if (!activeBatch?._id || isCompleting) {
      return
    }

    const nextStage = getNextStage(activeBatch.stage)
    if (!nextStage) {
      toast.success('Batch is already completed')
      return
    }

    try {
      setIsCompleting(true)
      await apiClient.patch(`/api/production/${activeBatch._id}/advance-stage`, {}, authConfig)
      toast.success(`Batch moved to ${nextStage}`)
      loadBatches()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to complete current stage'))
    } finally {
      setIsCompleting(false)
    }
  }

  const openIssueModal = () => {
    setIssueSeverity('high')
    setIssueText('')
    setIsIssueModalOpen(true)
  }

  const closeIssueModal = () => {
    setIsIssueModalOpen(false)
    setIssueSeverity('high')
    setIssueText('')
  }

  const handleReportIssue = async (event) => {
    event.preventDefault()
    if (!activeBatch?._id || isReporting) {
      return
    }

    const issue = issueText.trim()
    if (!issue) {
      toast.error('Please enter issue details before halting')
      return
    }

    try {
      setIsReporting(true)
      await apiClient.patch(`/api/production/${activeBatch._id}/report-issue`, {
        issue,
        severity: issueSeverity,
      }, authConfig)
      toast.success('Issue reported and batch halted')
      closeIssueModal()
      loadBatches()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to report issue'))
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">Production Execution</h1>
        <p className="mt-1 text-lg font-semibold text-slate-600">Assigned batches and floor actions for this shift.</p>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadBatches}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 font-black text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-16 text-lg font-bold text-slate-600">
          <LoaderCircle className="animate-spin" size={24} />
          Loading assigned batches...
        </div>
      ) : null}

      {!loading && !activeBatch ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-lg font-bold text-slate-600">
          No assigned batches available for this shift.
        </div>
      ) : null}

      {!loading && activeBatch ? (
        <article className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">Active Batch</p>
              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                Batch #{activeBatch.batch_id || 'TCW-882'}: {activeBatch.product_name || 'Tender Coconut Water'}
              </h2>
              <p className="text-base font-bold text-slate-600">Stage: {activeBatch.stage || 'In Progress'}</p>
            </div>

            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
              {activeProgress}% Complete
            </span>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-base font-bold text-slate-700">
              <span>Progress</span>
              <span>{activeProgress}%</span>
            </div>
            <div className="h-5 w-full rounded-full bg-emerald-100">
              <div
                className="h-5 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${activeProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={openIssueModal}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-xl font-black text-white transition-colors hover:bg-red-700"
            >
              <AlertTriangle size={22} />
              Report Issue / Halt
            </button>

            <button
              type="button"
              onClick={handleMarkStageComplete}
              disabled={isCompleting}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 text-xl font-black text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCompleting ? <LoaderCircle className="animate-spin" size={22} /> : <CheckCircle2 size={22} />}
              {isCompleting ? 'Updating...' : 'Mark Stage Complete'}
            </button>
          </div>
        </article>
      ) : null}

      {!loading ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-2xl font-black text-slate-900">Next in Line</h3>

          {queueBatches.length === 0 ? (
            <p className="text-lg font-semibold text-slate-600">No upcoming batches in queue.</p>
          ) : (
            <div className="space-y-2">
              {queueBatches.map((batch) => (
                <div
                  key={batch._id || batch.batch_id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4"
                >
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      #{batch.batch_id || 'Batch'} - {batch.product_name || 'Product'}
                    </p>
                    <p className="text-base font-semibold text-slate-600">Stage: {batch.stage || 'Planned'}</p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
                    {getProgressFromStage(batch.stage)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <Modal
        isOpen={isIssueModalOpen}
        onClose={closeIssueModal}
        title="Report Issue / Halt Batch"
        description={activeBatch ? `Batch #${activeBatch.batch_id || ''}` : ''}
      >
        <form onSubmit={handleReportIssue} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="staff-issue-severity" className="text-sm font-black uppercase tracking-[0.08em] text-slate-600">
              Severity
            </label>
            <select
              id="staff-issue-severity"
              value={issueSeverity}
              onChange={(event) => setIssueSeverity(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-lg font-bold text-slate-900 focus:border-red-300 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="staff-issue-details" className="text-sm font-black uppercase tracking-[0.08em] text-slate-600">
              What happened?
            </label>
            <textarea
              id="staff-issue-details"
              value={issueText}
              onChange={(event) => setIssueText(event.target.value)}
              rows={4}
              placeholder="Describe the issue (machine fault, leakage, safety stop, etc.)"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-lg font-semibold text-slate-900 focus:border-red-300 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={closeIssueModal}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-black text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReporting}
              className="rounded-xl bg-red-600 px-4 py-3 text-lg font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isReporting ? 'Reporting...' : 'Report & Halt'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default StaffProduction
