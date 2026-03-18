import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  Factory,
  FileSignature,
  FileText,
  Handshake,
  LayoutDashboard,
  Package2,
  Receipt,
  Settings,
  Sparkles,
  Truck,
  Users,
  Wallet,
  Warehouse,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { getNavigationForRole } from '../../constants/navigation'
import { ROLE_LABELS } from '../../constants/roles'
import { useAuth } from '../../context/useAuth'

const iconMap = {
  BarChart3,
  ClipboardList,
  CreditCard,
  Factory,
  FileSignature,
  FileText,
  Handshake,
  LayoutDashboard,
  Package2,
  Receipt,
  Settings,
  Sparkles,
  Truck,
  Users,
  Wallet,
  Warehouse,
}

function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth()
  console.log('Sidebar rendering for user:', user)
  const visibleNavigationGroups = getNavigationForRole(user?.role)
  console.log('visibleNavigationGroups:', visibleNavigationGroups)

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#0f172a] text-slate-300 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl shadow-blue-900/40' : '-translate-x-full'
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center gap-3 border-b border-slate-800/50 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
            <span className="text-xl font-black text-white">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-white">VSA BEVERAGES</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400">IWS Platform</span>
              <ShieldCheck size={8} className="text-blue-400" />
            </div>
          </div>
          <button
            className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white lg:hidden transition-all"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-5rem)] overflow-y-auto px-4 py-8 custom-scrollbar">
          {visibleNavigationGroups.map((group) => (
            <div key={group.group} className="mb-10">
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500/60 mb-4">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon]

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-300 ${isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="transition-all duration-300">
                              {Icon ? <Icon size={18} strokeWidth={isActive ? 2.5 : 2} /> : null}
                            </div>
                            <span className="tracking-wide">{item.label}</span>
                          </div>
                          <ChevronRight
                            size={14}
                            className={`transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                              }`}
                          />
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Sidebar Footer/Help */}
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 border border-slate-800/80 shadow-inner">
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-blue-400">{ROLE_LABELS[user?.role]}</p>
            <p className="text-[11px] font-bold text-slate-400 leading-relaxed mb-4">
              Authorized personnel access only. Secure operational terminal.
            </p>
            <button className="w-full rounded-xl bg-blue-600/10 py-3 text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-95 shadow-lg shadow-blue-600/5">
              Contact Expert
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
