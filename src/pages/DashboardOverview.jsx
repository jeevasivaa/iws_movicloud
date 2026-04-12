import { useState } from 'react'
import { Link } from 'react-router-dom'

function DashboardOverview() {
  const [aiQuery, setAiQuery] = useState('')

  /* Chart bar data for dynamic rendering */
  const chartBars = [
    { height: '40%', color: 'bg-teal-200 hover:bg-teal-400' },
    { height: '55%', color: 'bg-teal-300 hover:bg-teal-400' },
    { height: '75%', color: 'bg-teal-400 hover:bg-teal-500' },
    { height: '60%', color: 'bg-teal-500 hover:bg-teal-600' },
    { height: '45%', color: 'bg-teal-200 hover:bg-teal-400' },
    { height: '85%', color: 'bg-teal-400 hover:bg-teal-500' },
    { height: '95%', color: 'bg-teal-600 hover:bg-teal-700' },
    { height: '70%', color: 'bg-teal-500 hover:bg-teal-600' },
  ]

  const chartLabels = ['May 01', 'May 07', 'May 14', 'May 21', 'May 28']

  const operationsStatus = [
    { label: 'Distribution Centers', status: 'Online', color: 'bg-emerald-500' },
    { label: 'Supply Chain Feed', status: 'Active', color: 'bg-emerald-500' },
    { label: 'Fleet Tracking', status: 'Latency', color: 'bg-amber-500' },
  ]

  return (
    <div className="text-sm text-slate-800" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)', minHeight: '100vh' }}>
      {/* BEGIN: Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 glass-panel border-r border-slate-200 z-50 flex flex-col">
        <div className="p-6">
          <h1 className="text-lg font-bold text-teal-700 tracking-tight">VSA Beverages</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">Intelligence System</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {/* Overview Section */}
          <Link to="/dashboard" className="sidebar-active flex items-center space-x-3 p-3 rounded-lg transition-all">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span className="font-medium">Overview</span>
          </Link>
          {/* Operations Section */}
          <Link to="/orders" className="flex items-center space-x-3 p-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span className="font-medium">Operations</span>
          </Link>
          {/* Finance Section */}
          <a className="flex items-center space-x-3 p-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-all" href="#">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span className="font-medium">Finance</span>
          </a>
          {/* Intelligence Section */}
          <Link to="/smart-dashboard" className="flex items-center space-x-3 p-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span className="font-medium">Intelligence</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">JD</div>
            <div>
              <p className="text-xs font-semibold">John Doe</p>
              <p className="text-xs text-slate-500">Executive Director</p>
            </div>
          </div>
        </div>
      </aside>
      {/* END: Sidebar Navigation */}
      {/* BEGIN: Main Content Container */}
      <main className="ml-64 p-8 min-h-screen">
        {/* BEGIN: Top Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="relative w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white bg-opacity-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-xs transition duration-150" placeholder="Search analytics, SKUs, or reports..." type="text" />
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:text-teal-600 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
            <button className="bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200">Export Report</button>
          </div>
        </header>
        {/* END: Top Header */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* BEGIN: Left Column (Main Data) */}
          <div className="flex-1 space-y-8">
            {/* BEGIN: KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Revenue Card */}
              <div className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-slate-500">Revenue (MTD)</p>
                <div className="flex items-baseline mt-2">
                  <h3 className="text-xl font-bold text-slate-900">$1.24M</h3>
                  <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">+12.5%</span>
                </div>
                <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: '75%' }}></div>
                </div>
              </div>
              {/* Orders Card */}
              <div className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-slate-500">Orders Today</p>
                <div className="flex items-baseline mt-2">
                  <h3 className="text-xl font-bold text-slate-900">3,842</h3>
                  <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">+4.2%</span>
                </div>
                <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                  <span>Avg Order: $322</span>
                  <span>Target: 4,000</span>
                </div>
              </div>
              {/* Inventory Status Card */}
              <div className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-amber-400">
                <p className="text-xs font-medium text-slate-500">Inventory Status</p>
                <div className="flex items-baseline mt-2">
                  <h3 className="text-xl font-bold text-slate-900">88.4%</h3>
                  <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Low Stock (4)</span>
                </div>
                <p className="mt-4 text-xs text-slate-400">Next restocking scheduled for tomorrow, 08:00 AM.</p>
              </div>
            </div>
            {/* END: KPI Grid */}
            {/* BEGIN: Sales Trend Chart Container */}
            <div className="glass-panel p-8 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Sales Trend Analysis</h2>
                  <p className="text-xs text-slate-500">Performance across all beverage categories (Last 30 days)</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200">Weekly</button>
                  <button className="px-3 py-1 text-xs font-semibold rounded-lg bg-teal-600 text-white">Monthly</button>
                </div>
              </div>
              {/* Mock Chart Visual */}
              <div className="relative h-64 w-full flex items-end justify-between px-2" data-purpose="chart-placeholder" id="chart-container">
                {/* Simulated bars/line graph background */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2">
                  <div className="border-b border-slate-100 w-full h-0"></div>
                  <div className="border-b border-slate-100 w-full h-0"></div>
                  <div className="border-b border-slate-100 w-full h-0"></div>
                  <div className="border-b border-slate-100 w-full h-0"></div>
                </div>
                {/* Data visual bars */}
                {chartBars.map((bar, i) => (
                  <div key={i} className={`w-10 ${bar.color} rounded-t-lg transition-all`} style={{ height: bar.height }}></div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium px-2">
                {chartLabels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>
            {/* END: Sales Trend Chart Container */}
          </div>
          {/* END: Left Column */}
          {/* BEGIN: Right Sidebar (AI Panel) */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border-teal-100 shadow-xl" data-purpose="ai-insight-panel">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-teal-500 p-2 rounded-lg">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-slate-900">AI Insight Panel</h2>
              </div>
              {/* Recommendation Card 1 */}
              <div className="bg-white bg-opacity-40 p-4 rounded-2xl mb-4 border border-white">
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Stock Optimization</p>
                <h4 className="text-xs font-semibold text-slate-800 leading-tight">Increase inventory for 'Sparkling Lemonade' by 15% before weekend.</h4>
                <p className="text-xs text-slate-500 mt-2">Predicted demand surge based on regional weather and festival schedules.</p>
                <button className="mt-3 w-full py-2 bg-teal-600 bg-opacity-10 text-teal-700 text-xs font-bold rounded-xl hover:bg-opacity-20 transition-all">Apply Recommendation</button>
              </div>
              {/* Recommendation Card 2 */}
              <div className="bg-white bg-opacity-40 p-4 rounded-2xl mb-4 border border-white">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Financial Analysis</p>
                <h4 className="text-xs font-semibold text-slate-800 leading-tight">Logistics cost anomaly detected in Sector 4.</h4>
                <p className="text-xs text-slate-500 mt-2">Current route efficiency is 12% below the quarterly benchmark.</p>
                <a className="mt-3 block text-center text-xs font-bold text-blue-600 hover:underline" href="#">View Detailed Report</a>
              </div>
              {/* Chat Input */}
              <div className="mt-8">
                <label className="text-xs font-semibold text-slate-400 mb-2 block">Ask Intelligence</label>
                <div className="relative">
                  <input
                    className="w-full text-xs p-3 pr-10 rounded-xl border border-slate-200 focus:ring-teal-500 bg-white"
                    placeholder="What's our projected Q3 margin?"
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {/* System Health Widget */}
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-xs font-bold text-slate-800 mb-4">Operations Status</h3>
              <ul className="space-y-4">
                {operationsStatus.map((item, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                      <span className="text-xs text-slate-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold">{item.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          {/* END: Right Sidebar */}
        </div>
      </main>
      {/* END: Main Content Container */}
    </div>
  )
}

export default DashboardOverview
