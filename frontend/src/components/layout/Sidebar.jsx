import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  DollarSign,
  Factory,
  LayoutDashboard,
  Package2,
  Settings,
  Sparkles,
  Truck,
  TrendingUp,
  Users,
  Wallet,
  Warehouse,
  X,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react'
import { getNavigationForRole } from '../../constants/navigation'
import { useAuth } from '../../context/useAuth'
import { ROLE_LABELS } from '../../constants/roles'

const iconMap = {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  DollarSign,
  Factory,
  LayoutDashboard,
  Package2,
  Settings,
  Sparkles,
  Truck,
  TrendingUp,
  Users,
  Wallet,
  Warehouse,
}

function Sidebar({ mobileOpen, onClose, userRole }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const effectiveRole = userRole || user?.role
  const visibleNavigationGroups = getNavigationForRole(effectiveRole)

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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a] shadow-sm">
            <span className="text-xl font-black text-white">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-[#1e3a8a]">VSA FOODS</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">IWS Platform</span>
              <ShieldCheck size={8} className="text-teal-600" />
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
        <nav className="h-[calc(100vh-12rem)] overflow-y-auto px-0 py-8 custom-scrollbar">
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
                          ? 'bg-teal-50 text-teal-700 border-teal-600'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`transition-colors duration-200 ${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
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

        {/* User Profile Section at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#1e3a8a] border border-slate-200 shadow-sm">
              <User size={18} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.05em] text-slate-400 truncate">{ROLE_LABELS[user?.role]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all hover:border-red-200"
            type="button"
          >
            <LogOut size={14} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
