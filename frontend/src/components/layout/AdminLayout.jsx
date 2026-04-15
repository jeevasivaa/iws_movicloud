import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  Command,
  CreditCard,
  Factory,
  Leaf,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package2,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Wallet,
  Warehouse,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'

function getInitials(name) {
  if (!name) return 'NA'
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'NA'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const sidebarItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, hint: 'Overview' },
  { label: 'Products', path: '/products', icon: Package2, hint: 'Catalog' },
  { label: 'Suppliers', path: '/suppliers', icon: Truck, hint: 'Partners' },
  { label: 'Staff', path: '/employees', icon: Users, hint: 'People' },
  { label: 'Billing', path: '/billing', icon: CreditCard, hint: 'Revenue' },
  { label: 'Payroll', path: '/payroll', icon: Wallet, hint: 'Payouts' },
  { label: 'Production', path: '/production-control', icon: Factory, hint: 'Operations' },
  { label: 'Orders', path: '/orders', icon: ShoppingCart, hint: 'Fulfillment' },
  { label: 'Inventory', path: '/inventory', icon: Warehouse, hint: 'Stock' },
  { label: 'Reports', path: '/executive-analytics', icon: BarChart3, hint: 'Insights' },
  { label: 'Marketing', path: '/marketing', icon: Megaphone, hint: 'Campaigns' },
  { label: 'Notifications', path: '/notifications', icon: Bell, hint: 'Alerts', badge: '5' },
  { label: 'Settings', path: '/settings', icon: Settings, hint: 'Preferences' },
]

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      }).format(new Date()),
    [],
  )

  useEffect(() => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.scrollTo(0, 0)
    }

    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="admin-theme h-screen text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="flex h-full">
        <div
          className={`fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[18.5rem] flex-col border-r border-emerald-200/25 bg-[linear-gradient(180deg,rgba(4,120,87,0.96)_0%,rgba(6,95,70,0.94)_46%,rgba(5,46,22,0.94)_100%)] text-white shadow-[0_28px_80px_-36px_rgba(4,120,87,0.95)] backdrop-blur-xl transition-transform duration-300 ease-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="border-b border-emerald-100/15 px-5 pb-5 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/30">
                  <Leaf className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-white">VSA Foods</p>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-100/75">Admin Studio</p>
                </div>
              </div>

              <button
                className="rounded-xl p-2 text-emerald-100/75 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                type="button"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 px-3 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/70">Control Center</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 text-white/90">
                  <Sparkles className="h-4 w-4 text-amber-200" />
                  <span className="font-semibold">All systems steady</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-200/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                  Live
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
            <div className="mb-4 flex items-center justify-between px-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/75">Navigation</p>
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/80">
                <Command className="h-3 w-3" />
                Shortcuts
              </span>
            </div>

            <nav className="space-y-1.5">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `admin-slide-in group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-white/16 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.34)]'
                        : 'text-emerald-50/80 hover:bg-white/10 hover:text-white'
                      }`
                    }
                    onClick={() => setMobileOpen(false)}
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset transition-all ${isActive
                            ? 'bg-white/20 text-white ring-white/35'
                            : 'bg-white/8 text-emerald-100 ring-transparent group-hover:bg-white/16 group-hover:text-white'
                          }`}
                        >
                          <Icon size={16} strokeWidth={isActive ? 2.3 : 2} />
                        </span>

                        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                          <span className="min-w-0">
                            <span className="block truncate font-semibold tracking-tight">{item.label}</span>
                            <span className={`block truncate text-[11px] ${isActive ? 'text-emerald-100/85' : 'text-emerald-100/60'}`}>
                              {item.hint}
                            </span>
                          </span>

                          {item.badge ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1.5 text-[10px] font-bold text-emerald-950">
                              {item.badge}
                            </span>
                          ) : null}
                        </span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div className="border-t border-emerald-100/15 p-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-sm font-bold text-white ring-1 ring-inset ring-white/35">
                    {getInitials(user?.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{user?.name || 'User'}</p>
                    <p className="truncate text-xs text-emerald-100/75">{user?.email || 'No email'}</p>
                  </div>
                </div>

                <button
                  className="rounded-xl p-2 text-emerald-100 transition-colors hover:bg-white/15 hover:text-white"
                  onClick={handleLogout}
                  type="button"
                  title="Logout"
                >
                  <LogOut size={17} />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200/15 bg-emerald-950/25 px-2.5 py-2 text-[11px] font-semibold text-emerald-100/80">
                <Activity className="h-3.5 w-3.5 text-emerald-200" />
                <span>Workspace synced · 2 min ago</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="relative flex w-full flex-1 flex-col lg:pl-[18.5rem]">
          <header className="admin-fade-up sticky top-0 z-20 border-b border-emerald-100/70 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                  type="button"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu size={20} />
                </button>

                <div className="relative hidden w-80 max-w-full md:block lg:w-96">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    placeholder="Search clients, invoices, stocks..."
                    className="h-11 w-full rounded-2xl border border-emerald-100 bg-white/85 px-4 pl-11 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <button
                  className="rounded-xl border border-emerald-100 bg-white/80 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
                  type="button"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-xs font-semibold text-emerald-800 lg:flex">
                  <CalendarDays className="h-4 w-4" />
                  <span>{todayLabel}</span>
                </div>

                <button
                  className="relative rounded-xl border border-emerald-100 bg-white/80 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  type="button"
                  onClick={() => navigate('/notifications')}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute right-[7px] top-[7px] h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
                  <p className="text-xs font-medium text-slate-500">{user?.role || 'Role'}</p>
                </div>

                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-[0_10px_18px_-12px_rgba(5,150,105,0.9)]">
                  {getInitials(user?.name)}
                </div>
              </div>
            </div>
          </header>

          <div id="main-content" className="relative flex-1 overflow-y-auto">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 right-[-100px] h-72 w-72 rounded-full bg-emerald-200/55 blur-3xl" />
              <div className="absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
              <div className="absolute bottom-[-140px] right-[18%] h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />
            </div>

            <main className="relative z-10 mx-auto w-full max-w-[1700px] p-4 sm:p-6 lg:p-8">
              <div className="admin-surface">
                {children ?? <Outlet />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
