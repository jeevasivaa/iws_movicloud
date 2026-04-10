import { Bell, LogOut, Menu, Search, User, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { ROLE_LABELS } from '../../constants/roles'

function Header({ onToggleSidebar }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <>
      <header className="fixed top-0 right-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:pl-64 lg:pr-10 transition-all duration-300">
        <div className="flex items-center gap-4">
          <button
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden transition-all active:scale-95 border border-slate-200"
            onClick={onToggleSidebar}
            type="button"
          >
            <Menu size={18} strokeWidth={2.5} />
          </button>

          <div className="relative hidden sm:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
            </div>
            <input
              className="w-72 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none"
              placeholder="Search dashboard..."
              type="search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mr-2">
            <Zap size={14} className="text-emerald-600 fill-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">System Active</span>
          </div>

          <button
            className="group relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-50 hover:text-teal-600 transition-all duration-300 active:scale-95 border border-transparent hover:border-slate-200"
            type="button"
            onClick={() => navigate('/notifications')}
            title="Notifications"
          >
            <Bell size={20} strokeWidth={2} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-black text-slate-900 tracking-tight leading-none mb-1">{user?.name}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">{ROLE_LABELS[user?.role]}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-emerald-700 border border-slate-200 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 shadow-sm overflow-hidden relative">
              <User size={20} strokeWidth={2} />
            </div>
          </div>

          <button
            className="ml-2 hidden rounded-xl p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 active:scale-95 border border-transparent hover:border-red-100 lg:inline-flex"
            type="button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} strokeWidth={2} />
          </button>
        </div>
      </header>

      <nav className="fixed bottom-0 right-0 z-30 flex h-16 w-full items-center border-t border-slate-200 bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
          type="button"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} strokeWidth={2.2} />
          Logout
        </button>
      </nav>
    </>
  )
}

export default Header