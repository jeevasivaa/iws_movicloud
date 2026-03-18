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
  const visibleNavigationGroups = getNavigationForRole(user?.role)

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#0f172a] text-slate-300 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800/50 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
              <span className="text-lg font-black text-white">V</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white">VSA BEVERAGES</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-500/80">IWS Platform</span>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white lg:hidden transition-colors"
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
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500/60 mb-4">
                {group.group}
              </p>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon]

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-600/10 text-blue-400 shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className={`transition-colors duration-300 ${
                          /* isActive handled by parent class */ ''
                        }`}>
                          {Icon ? <Icon size={18} strokeWidth={2.5} /> : null}
                        </div>
                        <span className="tracking-wide">{item.label}</span>
                      </div>
                      <ChevronRight 
                        size={14} 
                        className={`transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${
                          /* isActive handled by parent class */ ''
                        }`} 
                      />
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Sidebar Footer/Help */}
          <div className="mt-4 rounded-2xl bg-slate-800/40 p-5 border border-slate-800/60">
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-blue-400/80">{ROLE_LABELS[user?.role]}</p>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed mb-3">
              Need assistance with industrial operations?
            </p>
            <button className="w-full rounded-xl bg-slate-700 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-600 transition-colors">
              Contact Expert
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
