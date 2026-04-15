import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, Shield } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ROLE_LABELS } from '../constants/roles'
import apiClient, { getErrorMessage } from '../services/apiClient'

const NOTIFICATION_KEYS = [
  { key: 'low_stock_alerts', label: 'Low stock alerts' },
  { key: 'production_updates', label: 'Production updates' },
  { key: 'new_order_notifications', label: 'New order notifications' },
  { key: 'payroll_reminders', label: 'Payroll reminders' },
]

function toBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true
    if (normalized === 'false' || normalized === '0' || normalized === 'no') return false
  }
  return false
}

function parseThreshold(value, fallback = 100) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return Math.max(0, Math.round(parsed))
}

function Settings() {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [settingsMap, setSettingsMap] = useState(new Map())
  const [lowStockThresholdInput, setLowStockThresholdInput] = useState('100')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const loadSettings = useCallback(
    async (signal) => {
      if (!token) {
        setSettingsMap(new Map())
        setError('Authentication token missing. Please sign in again.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await apiClient.get('/api/settings', { ...authConfig, signal })
        const rows = Array.isArray(response.data) ? response.data : []
        const nextMap = new Map(
          rows
            .filter((row) => row && typeof row.key === 'string' && row.key.trim())
            .map((row) => [String(row.key).trim(), row.value]),
        )

        setSettingsMap(nextMap)
        setLowStockThresholdInput(String(parseThreshold(nextMap.get('low_stock_threshold'))))
      } catch (err) {
        if (signal?.aborted) return
        setSettingsMap(new Map())
        setError(getErrorMessage(err, 'Failed to load settings'))
      } finally {
        setLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadSettings(controller.signal)
    return () => controller.abort()
  }, [loadSettings, refreshIndex])

  const handleToggle = async (key, isEnabled) => {
    if (!token) {
      setError('Authentication token missing. Please sign in again.')
      return
    }

    const nextValue = !isEnabled

    try {
      setSaving(true)
      setError('')
      await apiClient.put('/api/settings', { key, value: nextValue }, authConfig)
      setSettingsMap((current) => {
        const next = new Map(current)
        next.set(key, nextValue)
        return next
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update notification setting'))
    } finally {
      setSaving(false)
    }
  }

  const handleLowStockThresholdSave = async () => {
    if (!token) {
      setError('Authentication token missing. Please sign in again.')
      return
    }

    const threshold = parseThreshold(lowStockThresholdInput, Number.NaN)
    if (!Number.isFinite(Number(lowStockThresholdInput)) || threshold < 0) {
      setError('Threshold must be a non-negative number')
      return
    }

    try {
      setSaving(true)
      setError('')
      await apiClient.put('/api/settings', { key: 'low_stock_threshold', value: threshold }, authConfig)
      setSettingsMap((current) => {
        const next = new Map(current)
        next.set('low_stock_threshold', threshold)
        return next
      })
      setLowStockThresholdInput(String(threshold))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save low stock threshold'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-base text-gray-500">Manage system configurations and preferences</p>
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

      <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Shield size={18} className="text-emerald-500" />
          <h2 className="text-2xl font-semibold text-gray-900">Account Settings</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-900">
            Full Name
            <input
              type="text"
              value={user?.name || 'Not available'}
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900"
            />
          </label>

          <label className="text-sm font-medium text-gray-900">
            Email
            <input
              type="text"
              value={user?.email || 'Not available'}
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900"
            />
          </label>

          <label className="text-sm font-medium text-gray-900 md:col-span-1">
            Role
            <input
              type="text"
              value={ROLE_LABELS[user?.role] || user?.role || 'Not available'}
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-500"
            />
          </label>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
          <h3 className="text-base font-semibold text-emerald-900">Inventory Low Stock Threshold</h3>
          <p className="mt-1 text-sm text-emerald-800">
            Admin can control when items are counted as low stock in dashboards and inventory KPIs.
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="w-full text-sm font-medium text-gray-900 sm:max-w-xs">
              Threshold Count
              <input
                type="number"
                min="0"
                step="1"
                value={lowStockThresholdInput}
                onChange={(event) => setLowStockThresholdInput(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-gray-900 focus:border-emerald-400 focus:outline-none"
              />
            </label>

            <button
              type="button"
              disabled={saving}
              onClick={handleLowStockThresholdSave}
              className="h-11 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save Threshold'}
            </button>
          </div>
        </div>
      </article>

      <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Bell size={18} className="text-blue-500" />
          <h2 className="text-2xl font-semibold text-gray-900">Notification Preferences</h2>
        </div>

        {loading ? (
          <div className="py-6 text-sm text-gray-500">Loading settings...</div>
        ) : (
          <div className="space-y-4">
            {NOTIFICATION_KEYS.map((item) => {
              const isEnabled = toBoolean(settingsMap.get(item.key))

              return (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <p className="text-xl text-gray-900">{item.label}</p>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleToggle(item.key, isEnabled)}
                    className={`relative h-8 w-14 rounded-full transition-colors ${isEnabled ? 'bg-emerald-500' : 'bg-gray-300'} ${saving ? 'cursor-not-allowed opacity-70' : ''}`}
                    aria-label={`${item.label} ${isEnabled ? 'enabled' : 'disabled'}`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${isEnabled ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </article>
    </section>
  )
}

export default Settings
