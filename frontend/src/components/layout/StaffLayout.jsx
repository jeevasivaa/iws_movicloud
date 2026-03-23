import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ClipboardList, Factory, LayoutDashboard, LogOut, Warehouse } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

const STAFF_NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Production', path: '/production-control', icon: Factory },
  { label: 'Inventory', path: '/inventory', icon: Warehouse },
  { label: 'Orders', path: '/orders', icon: ClipboardList },
]

function StaffLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-20 items-center justify-center border-b border-slate-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-black text-white">
            V
          </div>
        </div>

        <nav className="flex flex-1 flex-col items-center gap-3 px-2 py-4">
          {STAFF_NAV_ITEMS.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive }) =>
                  `flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors ${
                    isActive
                      ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={24} strokeWidth={2.3} />
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <header className="fixed top-0 z-40 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:pl-24 lg:pr-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Staff Portal</p>
          <p className="text-xl font-black text-slate-900 sm:text-2xl">Active Shift: Raj</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base font-black text-red-700 transition-colors hover:bg-red-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <main className="px-4 pb-28 pt-24 sm:px-6 lg:pb-8 lg:pl-24 lg:pr-8">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <ul className="grid grid-cols-4">
          {STAFF_NAV_ITEMS.map((item) => {
            const Icon = item.icon

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-1 py-3 text-xs font-bold ${
                      isActive ? 'text-emerald-600' : 'text-slate-500'
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={2.4} />
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default StaffLayout
