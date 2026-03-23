import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bell, Box, CheckCircle2, Clock3, Factory } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet, apiPut } from '../services/apiClient'

function getIconConfig(type) {
  if (type === 'alert') return { Icon: AlertTriangle, iconWrap: 'bg-red-100', iconColor: 'text-red-500' }
  if (type === 'info') return { Icon: Factory, iconWrap: 'bg-blue-100', iconColor: 'text-blue-600' }
  if (type === 'success') return { Icon: CheckCircle2, iconWrap: 'bg-emerald-100', iconColor: 'text-emerald-600' }
  if (type === 'warning') return { Icon: Clock3, iconWrap: 'bg-amber-100', iconColor: 'text-amber-600' }
  return { Icon: Box, iconWrap: 'bg-gray-100', iconColor: 'text-gray-600' }
}

function formatRelativeTimestamp(value) {
  if (!value) return 'Just now'
  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) return 'Just now'

  const diffMs = Date.now() - timestamp.getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000))
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function Notifications() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadNotifications = async () => {
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

        const response = await apiGet('/api/notifications', token, { signal: controller.signal })
        if (isActive) {
          setRows(Array.isArray(response) ? response : [])
        }
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setRows([])
        setError(err.message || 'Failed to load notifications')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadNotifications()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex])

  const mappedRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        ...getIconConfig(row.type),
        time: formatRelativeTimestamp(row.timestamp),
        highlighted: !row.is_read,
      })),
    [rows],
  )

  const handleMarkAllRead = async () => {
    if (!token) {
      setError('Authentication token missing. Please sign in again.')
      return
    }

    try {
      setMarkingRead(true)
      setError('')
      await apiPut('/api/notifications/mark-all-read', {}, token)
      setRefreshIndex((value) => value + 1)
    } catch (err) {
      setError(err.message || 'Failed to mark notifications as read')
    } finally {
      setMarkingRead(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Notifications</h1>
          <p className="mt-1 text-base text-gray-500">Stay updated with alerts, approvals, and system events</p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingRead}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Bell size={16} />
          {markingRead ? 'Updating...' : 'Mark All Read'}
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

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
            Loading notifications...
          </div>
        ) : (
          mappedRows.map((row) => {
            const Icon = row.Icon

            return (
              <article
                key={row._id || row.title}
                className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${row.highlighted ? 'border-l-4 border-l-emerald-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl p-3 ${row.iconWrap}`}>
                      <Icon size={24} className={row.iconColor} />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{row.title}</h2>
                      <p className="mt-1 text-sm text-gray-500">{row.message}</p>
                    </div>
                  </div>

                  <span className="text-sm text-gray-500">{row.time}</span>
                </div>
              </article>
            )
          })
        )}
      </div>

      {!loading && mappedRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No notifications found.
        </div>
      ) : null}
    </section>
  )
}

export default Notifications
