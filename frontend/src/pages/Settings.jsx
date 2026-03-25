import { useEffect, useMemo, useState } from 'react'
import { Bell, Shield } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { apiGet, apiPut } from '../services/apiClient'

const NOTIFICATION_KEYS = [
  { key: 'low_stock_alerts', label: 'Low stock alerts' },
  { key: 'production_updates', label: 'Production updates' },
  { key: 'new_order_notifications', label: 'New order notifications' },
  { key: 'payroll_reminders', label: 'Payroll reminders' },
]

function Settings() {
  const { token, user } = useAuth()
  const [settingsRows, setSettingsRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [lowStockThresholdInput, setLowStockThresholdInput] = useState('100')

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const loadSettings = async () => {
      if (!token) {
        if (isActive) {
          setSettingsRows([])
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

        const response = await apiGet('/api/settings', token, { signal: controller.signal })
        if (isActive) {
          const nextRows = Array.isArray(response) ? response : []
          setSettingsRows(nextRows)

          const lowStockThresholdRow = nextRows.find((row) => row?.key === 'low_stock_threshold')
          const lowStockThresholdValue = Number(lowStockThresholdRow?.value)
          setLowStockThresholdInput(
            Number.isFinite(lowStockThresholdValue) && lowStockThresholdValue >= 0
              ? String(Math.round(lowStockThresholdValue))
              : '100',
          )
        }
      } catch (err) {
        if (controller.signal.aborted || !isActive) return
        setSettingsRows([])
        setError(err.message || 'Failed to load settings')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadSettings()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [token, refreshIndex])

  const settingsMap = useMemo(
    () => new Map(settingsRows.map((settingRow) => [settingRow.key, settingRow.value])),
    [settingsRows],
  )

  const handleLowStockThresholdSave = async () => {
    if (!token) {
      setError('Authentication token missing. Please sign in again.')
      return
    }

    const parsed = Number(lowStockThresholdInput)
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError('Low stock threshold must be a valid non-negative number')
      return
    }

    try {
      setSaving(true)
      setError('')
      await apiPut('/api/settings', { key: 'low_stock_threshold', value: Math.round(parsed) }, token)
      setRefreshIndex((value) => value + 1)
    } catch (err) {
      setError(err.message || 'Failed to update low stock threshold')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (settingKey, currentValue) => {
    if (!token) {
      setError('Authentication token missing. Please sign in again.')
      return
    }

    try {
      setSaving(true)
      setError('')
      await apiPut('/api/settings', { key: settingKey, value: !currentValue }, token)
      setRefreshIndex((value) => value + 1)
    } catch (err) {
      setError(err.message || 'Failed to update setting')
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
              value={user?.name || 'Admin'}
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900"
            />
          </label>

          <label className="text-sm font-medium text-gray-900">
            Email
            <input
              type="text"
              value={user?.email || 'admin@vsafoods.com'}
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900"
            />
          </label>

          <label className="text-sm font-medium text-gray-900 md:col-span-1">
            Role
            <input
              type="text"
              value={user?.role || 'admin'}
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
              const isEnabled = Boolean(settingsMap.get(item.key))

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
