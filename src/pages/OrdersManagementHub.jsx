import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../services/orderService'

/**
 * Helper to draw a simple sparkline on a canvas.
 * Reproduced from the original HTML script.
 */
function drawSparkline(canvas, data, color) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'

  const step = width / (data.length - 1)
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  data.forEach((val, i) => {
    const x = i * step
    const y = height - ((val - min) / range) * (height - 4) - 2
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })

  ctx.stroke()
}

/** Individual sparkline canvas component */
function Sparkline({ data, color }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    drawSparkline(canvasRef.current, data, color)
  }, [data, color])

  return (
    <div className="sparkline-container" data-purpose="sparkline">
      <canvas ref={canvasRef} width={100} height={24}></canvas>
    </div>
  )
}

/** Status badge color mapping */
const STATUS_STYLES = {
  New: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  Processing: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  Dispatched: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
}

function OrdersManagementHub() {
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('New')
  const [statusCounts, setStatusCounts] = useState({})
  const tabs = ['New', 'Processing', 'Dispatched', 'Delivered']

  const fetchOrders = useCallback(async () => {
    const response = await getOrders()
    setOrders(response.orders)
    setStatusCounts(response.statusCounts)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased">
      {/* BEGIN: Main Dashboard Container */}
      <div className="min-h-screen flex flex-col">
        {/* BEGIN: Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30" data-purpose="main-header">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: '#0284c7' }}>
                V
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">VSA Beverages</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Integrated Warehouse System</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <input className="w-64 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all" placeholder="Search orders, invoices..." type="text" />
                <svg className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <button className="p-2 text-slate-500 hover:text-sky-600 relative">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-8 rounded-full flex items-center justify-center border" style={{ backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }}>
                <span className="text-xs font-bold" style={{ color: '#0369a1' }}>JD</span>
              </div>
            </div>
          </div>
        </header>
        {/* END: Header */}
        {/* BEGIN: Main Content Area */}
        <main className="flex-grow p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* BEGIN: Page Title & Actions */}
            <div className="flex items-center justify-between" data-purpose="page-meta">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Orders Management</h2>
                <p className="text-sm text-slate-500">Monitor and manage all beverage distributions across the network.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  Export Report
                </button>
                <Link to="/product-builder" className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 flex items-center gap-2 shadow-sm" style={{ backgroundColor: '#0284c7' }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  Create New Order
                </Link>
              </div>
            </div>
            {/* END: Page Title & Actions */}
            {/* BEGIN: Status Tabs Navigation */}
            <nav className="flex gap-1 border-b border-slate-200" data-purpose="status-filters">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 border-b-2 font-semibold text-sm flex items-center gap-2 ${
                    activeTab === tab
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 font-medium'
                  }`}
                >
                  {tab}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeTab === tab
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {statusCounts[tab] || 0}
                  </span>
                </button>
              ))}
            </nav>
            {/* END: Status Tabs Navigation */}
            {/* BEGIN: Data Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" data-purpose="table-container">
              {/* Table Header: Filters & Tools */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <select className="text-sm border-slate-200 rounded-lg focus:ring-sky-500 focus:border-sky-500 py-2 pl-3 pr-10">
                    <option>All Clients</option>
                    <option>Global Markets</option>
                    <option>Beverage Co.</option>
                  </select>
                  <select className="text-sm border-slate-200 rounded-lg focus:ring-sky-500 focus:border-sky-500 py-2 pl-3 pr-10">
                    <option>Date: Last 7 days</option>
                    <option>Date: Last 30 days</option>
                    <option>Date: Custom Range</option>
                  </select>
                </div>
                <div className="text-xs text-slate-400 italic">
                  Showing 1-{orders.length} of 80 total orders
                </div>
              </div>
              {/* The Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left" id="orders-table">
                  <thead>
                    <tr className="bg-white text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4 border-b border-slate-100">Order ID</th>
                      <th className="px-6 py-4 border-b border-slate-100">Client Name</th>
                      <th className="px-6 py-4 border-b border-slate-100">Status</th>
                      <th className="px-6 py-4 border-b border-slate-100">Distribution Timeline</th>
                      <th className="px-6 py-4 border-b border-slate-100">Amount</th>
                      <th className="px-6 py-4 border-b border-slate-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => {
                      const style = STATUS_STYLES[order.status] || STATUS_STYLES.New
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-700">{order.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-800">{order.clientName}</span>
                              <span className="text-xs text-slate-500">{order.clientLocation}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Sparkline data={order.sparklineData} color={order.sparklineColor} />
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">{order.amount}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-400 hover:text-sky-600 transition-colors">
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination Footer */}
              <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">Showing page 1 of 4</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-400 cursor-not-allowed">Previous</button>
                  <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50">Next</button>
                </div>
              </div>
            </div>
            {/* END: Data Table Container */}
          </div>
        </main>
        {/* END: Main Content Area */}
        {/* BEGIN: App Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
          © 2023 VSA Beverages - Inventory &amp; Warehouse Solutions. All rights reserved.
        </footer>
        {/* END: App Footer */}
      </div>
      {/* END: Main Dashboard Container */}
    </div>
  )
}

export default OrdersManagementHub
