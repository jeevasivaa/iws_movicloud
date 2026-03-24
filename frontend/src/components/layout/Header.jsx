import { Bell, Menu, Search } from 'lucide-react'

function Header({ onToggleSidebar }) {
  return (
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
            className="w-72 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-[#1e3a8a] focus:outline-none"
            placeholder="Search dashboard..."
            type="search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="group relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-50 hover:text-teal-600 transition-all duration-300 active:scale-95 border border-transparent hover:border-slate-200">
          <Bell size={20} strokeWidth={2} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  )
}

export default Header
