import { Bell, LogOut, Menu, Search, User } from 'lucide-react'
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
    <header className="fixed top-0 right-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-100 bg-white/70 px-4 backdrop-blur-md lg:pl-[17rem] lg:pr-8">
      <div className="flex items-center gap-4">
        <button
          className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden transition-all active:scale-95"
          onClick={onToggleSidebar}
          type="button"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="relative hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
          </div>
          <input
            className="w-80 rounded-xl border-none bg-slate-100/50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
            placeholder="Search operational data..."
            type="search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="group relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all duration-300 active:scale-95">
          <Bell size={20} strokeWidth={2.5} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-100 mx-1 hidden sm:block" />

        <button
          className="group rounded-xl p-2.5 text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-all duration-300 active:scale-95"
          type="button"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{user?.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500/80">{ROLE_LABELS[user?.role]}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-blue-600 border border-slate-200 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 shadow-sm">
            <User size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
