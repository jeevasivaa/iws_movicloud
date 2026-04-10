import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  ClipboardList,
  LogOut,
  LayoutDashboard,
  Package2,
  Truck,
  Warehouse,
  X,
  ShieldCheck,
} from 'lucide-react'
import { getNavigationForRole } from '../../constants/navigation'
import { useAuth } from '../../context/useAuth'

const iconMap = {
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Package2,
  Truck,
  Warehouse,
}

function Sidebar({ mobileOpen, onClose, userRole }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const effectiveRole = userRole || user?.role
  const visibleNavigationGroups = getNavigationForRole(effectiveRole)
  const displayName = user?.name || 'User'
  const displayEmail = user?.email || 'user@vsafoods.com'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U'

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-sm">
            <span className="text-xl font-black text-white">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-emerald-700">VSA FOODS</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">The Verdant Ledger</span>
              <ShieldCheck size={8} className="text-emerald-600" />
            </div>
          </div>
          <button
            className="ml-auto rounded-xl p-2 text-slate-400 hover:bg-slate-50 lg:hidden transition-all"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-0 py-8 custom-scrollbar">
          {visibleNavigationGroups.map((group) => (
            <div key={group.group} className="mb-8">
              <p className="px-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon]

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-6 py-2.5 text-[13px] font-bold transition-all duration-200 border-l-[3px] ${isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-600'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`transition-colors duration-200 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            {Icon ? <Icon size={18} strokeWidth={isActive ? 2.5 : 2} /> : null}
                          </div>
                          <span className="tracking-wide">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold tracking-tight text-slate-900">{displayName}</p>
              <p className="truncate text-sm text-slate-500">{displayEmail}</p>
            </div>

            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              type="button"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
