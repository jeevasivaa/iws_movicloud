import { Bell, Shield } from 'lucide-react'

const NOTIFICATION_TOGGLES = [
  'Low stock alerts',
  'Production updates',
  'New order notifications',
  'Payroll reminders',
]

function Settings() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-base text-gray-500">Manage system configurations and preferences</p>
      </header>

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
              value="Raj Kumar"
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900"
            />
          </label>

          <label className="text-sm font-medium text-gray-900">
            Email
            <input
              type="text"
              value="admin@vsafoods.com"
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900"
            />
          </label>

          <label className="text-sm font-medium text-gray-900 md:col-span-1">
            Role
            <input
              type="text"
              value="Admin"
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-500"
            />
          </label>
        </div>
      </article>

      <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Bell size={18} className="text-blue-500" />
          <h2 className="text-2xl font-semibold text-gray-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {NOTIFICATION_TOGGLES.map((item) => (
            <div key={item} className="flex items-center justify-between gap-4">
              <p className="text-xl text-gray-900">{item}</p>

              <button
                type="button"
                className="relative h-8 w-14 rounded-full bg-emerald-500 transition-colors"
                aria-label={`${item} enabled`}
              >
                <span className="absolute right-1 top-1 h-6 w-6 rounded-full bg-white" />
              </button>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

export default Settings
