import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
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
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package2 },
  { label: 'Suppliers', path: '/suppliers', icon: Truck },
  { label: 'Staff', path: '/employees', icon: Users },
  { label: 'Billing', path: '/billing', icon: CreditCard },
  { label: 'Payroll', path: '/payroll', icon: Wallet },
  { label: 'Production', path: '/production-control', icon: Factory },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Inventory', path: '/inventory', icon: Warehouse },
  { label: 'Reports', path: '/executive-analytics', icon: BarChart3 },
  { label: 'Marketing', path: '/marketing', icon: Megaphone },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
]

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.scrollTo(0, 0)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="h-screen bg-white text-gray-900">
      <div className="flex h-full">
        <div
          className={`fixed inset-0 z-30 bg-gray-900/20 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex h-24 items-center justify-between border-b border-gray-200 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500">
                <Leaf className="h-5 w-5 text-white" strokeWidth={2.25} />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">VSA Foods</p>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>

            <button
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
              type="button"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
            <p className="mb-4 px-2 text-sm uppercase tracking-wide text-gray-500">Menu</p>

            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-base font-medium transition-colors ${isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          className={isActive ? 'text-emerald-800' : 'text-gray-500'}
                          strokeWidth={isActive ? 2.25 : 2}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between rounded-lg">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white">
                  {getInitials(user?.name)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email || 'No email'}</p>
                </div>
              </div>

              <button
                className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                onClick={handleLogout}
                type="button"
                title="Logout"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </aside>

        <div className="flex w-full flex-1 flex-col lg:pl-64">
          <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                type="button"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>

              <div className="relative w-full max-w-full md:w-96">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <input
                  type="search"
                  placeholder="Search anything..."
                  className="h-11 w-full rounded-lg bg-gray-100 px-4 pl-11 text-sm text-gray-900 placeholder:text-gray-500 outline-none ring-0 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="relative rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                type="button"
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
              </div>
            </div>
          </header>

          <div id="main-content" className="flex-1 overflow-y-auto bg-white">
            <main className="p-8 w-full">{children ?? <Outlet />}</main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
