import { Circle, CircleCheckBig } from 'lucide-react'
import { useAuth } from '../context/useAuth'

const DAILY_TASKS = [
  {
    id: 1,
    title: 'Load 500kg Raw Coconut into Mixer 1',
    status: 'Pending',
  },
  {
    id: 2,
    title: 'Fulfill Order #1045 - 5 Items',
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Quality Check Batch #TCW-001',
    status: 'Pending',
  },
]

function getStatusClasses(status) {
  if (status === 'In Progress') {
    return 'bg-emerald-100 text-emerald-800'
  }
  return 'bg-amber-100 text-amber-800'
}

function StaffDashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Raj'

  return (
    <section className="space-y-5">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Good Morning, {firstName}</h1>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
          <CircleCheckBig size={18} />
          Shift Active
        </span>
      </header>

      <div className="rounded-xl bg-amber-100 p-4 text-base font-semibold text-amber-800">
        Line B is down for maintenance. Shift to Line A.
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">My Daily Tasks</h2>

        <div className="space-y-3">
          {DAILY_TASKS.map((task) => (
            <button
              key={task.id}
              type="button"
              className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="pt-1 text-slate-500">
                <Circle size={28} strokeWidth={2.3} />
              </span>

              <span className="flex flex-1 flex-col gap-3">
                <span className="text-lg font-semibold text-slate-900">{task.title}</span>
                <span className={`inline-flex w-fit rounded-full px-4 py-1 text-sm font-semibold ${getStatusClasses(task.status)}`}>
                  {task.status}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StaffDashboard
