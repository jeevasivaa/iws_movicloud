import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Auto-scroll to top on route change
  useEffect(() => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) mainContent.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-900">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      
      <div className="lg:pl-64 transition-all duration-300">
        <Header onToggleSidebar={() => setMobileOpen((prev) => !prev)} />
        
        <main 
          id="main-content"
          className="h-screen overflow-y-auto pt-20 custom-scrollbar"
        >
          <div className="mx-auto max-w-[1600px] px-6 py-10 md:px-10 lg:py-12">
            <div className="page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
