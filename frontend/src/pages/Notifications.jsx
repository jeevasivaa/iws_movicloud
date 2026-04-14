import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bell, CheckCircle2, CircleAlert, Info, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const TAB_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'orders', label: 'Orders' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'system', label: 'System' },
]

const FALLBACK_ROWS = [
  {
    _id: 'fallback-1',
    title: 'Low Stock Alert: Basmati Rice',
    message: 'Inventory is critically low. Automated reorder threshold reached.',
    type: 'alert',
    is_read: false,
    timestamp: new Date().toISOString(),
  },
  {
    _id: 'fallback-2',
    title: 'Large Order Received',
    message: 'New order requires immediate approval.',
    type: 'success',
    is_read: false,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
]

function formatTime(value) {
  if (!value) return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'

  const diff = Date.now() - date.getTime()
  const mins = Math.max(1, Math.floor(diff / 60000))
  if (mins < 60) return `${mins} min ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function deriveCategory(row) {
  const text = `${row.title || ''} ${row.message || ''}`.toLowerCase()
  if (text.includes('order') || text.includes('invoice')) return 'orders'
  if (text.includes('stock') || text.includes('inventory') || text.includes('reorder')) return 'inventory'
  return 'system'
}

function getActionLabel(category) {
  if (category === 'inventory') return 'Reorder Now'
  if (category === 'orders') return 'View Order'
  return 'Review Request'
}

function getTone(type) {
  if (type === 'alert') {
    return {
      icon: AlertTriangle,
      iconWrap: 'bg-red-100',
      iconColor: 'text-red-600',
      badge: 'bg-red-100 text-red-700',
      label: 'Critical',
    }
  }

  if (type === 'success') {
    return {
      icon: CheckCircle2,
      iconWrap: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700',
      label: 'Success',
    }
  }

  if (type === 'warning') {
    return {
      icon: CircleAlert,
      iconWrap: 'bg-amber-100',
      iconColor: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-700',
      label: 'Warning',
    }
  }

  return {
    icon: Info,
    iconWrap: 'bg-blue-100',
    iconColor: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Info',
  }
}

function Notifications() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarking, setIsMarking] = useState(false)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchNotifications = useCallback(
    async (signal) => {
      if (!token) {
        setNotifications(FALLBACK_ROWS)
        setIsLoading(false)
        setError('')
        return
      }

      try {
        setIsLoading(true)
        setError('')
        const response = await apiClient.get('/api/notifications', { ...authConfig, signal })
        const rows = Array.isArray(response.data) ? response.data : []
        setNotifications(rows.length > 0 ? rows : FALLBACK_ROWS)
      } catch (err) {
        if (signal?.aborted) return
        setNotifications(FALLBACK_ROWS)
        setError(getErrorMessage(err, 'Failed to load notifications'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchNotifications(controller.signal)
    return () => controller.abort()
  }, [fetchNotifications])

  const rowsWithCategory = useMemo(
    () =>
      notifications.map((row) => ({
        ...row,
        category: deriveCategory(row),
      })),
    [notifications],
  )

  const filteredRows = useMemo(
    () => rowsWithCategory.filter((row) => activeTab === 'all' || row.category === activeTab),
    [activeTab, rowsWithCategory],
  )

  const kpis = useMemo(() => {
    const totalUnread = rowsWithCategory.filter((row) => !row.is_read).length
    const criticalAlerts = rowsWithCategory.filter((row) => row.type === 'alert').length
    const systemUpdates = rowsWithCategory.filter((row) => row.category === 'system').length

    return [
      {
        title: 'Total Unread',
        value: totalUnread,
        icon: Bell,
        iconWrap: 'bg-emerald-100 text-emerald-700',
      },
      {
        title: 'Critical Alerts',
        value: criticalAlerts,
        icon: AlertTriangle,
        iconWrap: 'bg-red-100 text-red-700',
      },
      {
        title: 'System Updates',
        value: systemUpdates,
        icon: Info,
        iconWrap: 'bg-blue-100 text-blue-700',
      },
    ]
  }, [rowsWithCategory])

  const handleMarkAllRead = async () => {
    try {
      setIsMarking(true)
      if (token) {
        await apiClient.put('/api/notifications/mark-all-read', {}, authConfig)
      }

      setNotifications((current) =>
        current.map((row) => ({
          ...row,
          is_read: true,
        })),
      )

      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to mark notifications as read'))
    } finally {
      setIsMarking(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review critical alerts and operational updates across your modules.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={isMarking}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Bell size={16} />
          {isMarking ? 'Marking...' : 'Mark all as read'}
        </button>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchNotifications()}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((card) => {
          const Icon = card.icon
          return (
            <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
                </div>
                <span className={`rounded-xl p-2.5 ${card.iconWrap}`}>
                  <Icon size={18} />
                </span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-medium text-slate-500">{filteredRows.length} alerts</span>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            Loading notifications...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            No notifications found in this tab.
          </div>
        ) : (
          filteredRows.map((row) => {
            const tone = getTone(row.type)
            const Icon = tone.icon
            const actionLabel = getActionLabel(row.category)

            return (
              <article key={row._id || `${row.title}-${row.timestamp}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className={`rounded-xl p-2.5 ${tone.iconWrap}`}>
                      <Icon size={18} className={tone.iconColor} />
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">{row.title || 'Notification'}</h2>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tone.badge}`}>
                          {tone.label}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">{row.message || 'No message available.'}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatTime(row.timestamp)}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                  >
                    <ShoppingCart size={14} />
                    {actionLabel}
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}

export default Notifications
