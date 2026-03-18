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
    <header className="fixed top-0 right-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-xl lg:pl-[17rem] lg:pr-10 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden transition-all active:scale-95 border border-slate-200/50"
          onClick={onToggleSidebar}
          type="button"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="relative hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
          </div>
          <input
            className="w-80 rounded-2xl border-none bg-slate-100/80 py-2.5 pl-11 pr-4 text-sm font-bold text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:outline-none"
            placeholder="Search operational data..."
            type="search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mr-2">
          <Zap size={14} className="text-blue-600 fill-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">System Live</span>
        </div>

        <button className="group relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all duration-300 active:scale-95 border border-transparent hover:border-slate-200/50">
          <Bell size={20} strokeWidth={2.5} />
          <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1.5">{user?.name}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600/90">{ROLE_LABELS[user?.role]}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-blue-600 border-2 border-slate-50 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 shadow-sm overflow-hidden relative">
            <User size={22} strokeWidth={2.5} />
          </div>
        </div>

        <button
          className="ml-2 rounded-xl p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 active:scale-95 border border-transparent hover:border-red-100"
          type="button"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  )
}

export default Header
