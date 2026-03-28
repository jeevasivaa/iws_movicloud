import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser, logout } from '../services/authService'

const DEFAULT_STAFF_USER = {
  name: 'Amit Patel',
  email: 'staff@vsafoods.com',
}

const STAFF_CONFIG = {
  panelLabel: 'Staff Panel',
  subtitle: "Here's what's happening with your business today.",
  menu: [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid_view', path: '/dashboard', active: true },
    { key: 'products', label: 'Products', icon: 'deployed_code', path: '/product-builder' },
    { key: 'production', label: 'Production', icon: 'query_stats' },
    { key: 'orders', label: 'Orders', icon: 'shopping_cart', path: '/orders' },
    { key: 'inventory', label: 'Inventory', icon: 'inventory' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications_none' },
  ],
  actions: {
    secondary: 'View Schedule',
    primary: 'Quick Action',
  },
  metrics: [
    {
      title: 'Total Revenue',
      value: '₹3,02,000',
      subtitle: '+12.5% from last month',
      tone: 'positive',
      icon: 'trending_up',
      iconBg: '#e6f4eb',
      iconColor: '#3aa56f',
    },
    {
      title: 'Active Orders',
      value: '48',
      subtitle: '+8 new today',
      tone: 'positive',
      icon: 'shopping_cart',
      iconBg: '#e8f0fb',
      iconColor: '#4b86c7',
    },
    {
      title: 'Production Batches',
      value: '12',
      subtitle: '3 in progress',
      tone: 'neutral',
      icon: 'factory',
      iconBg: '#efe5f7',
      iconColor: '#a36ec8',
    },
    {
      title: 'Low Stock Items',
      value: '7',
      subtitle: 'Needs attention',
      tone: 'alert',
      icon: 'warning',
      iconBg: '#f8e9dd',
      iconColor: '#d27b42',
    },
  ],
  charts: {
    sales: {
      title: 'Monthly Sales',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [42000, 38000, 55000, 47000, 62000, 58000],
      ticks: [0, 20000, 40000, 60000, 80000],
      max: 80000,
      color: '#42a877',
    },
    output: {
      title: 'Production Output',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      values: [120, 145, 132, 158, 142, 95],
      ticks: [0, 40, 80, 120, 160],
      max: 160,
      color: '#3d7fc5',
    },
  },
}

const toneStyles = {
  positive: 'text-[#2f9d68]',
  neutral: 'text-[#8c95a4]',
  alert: 'text-[#e0584b]',
}

const getInitials = (name = '') => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return initials || 'AP'
}

const buildSmoothPath = (points) => {
  if (points.length < 2) {
    return ''
  }

  const path = [`M ${points[0].x} ${points[0].y}`]

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] || points[index]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = points[index + 2] || p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`)
  }

  return path.join(' ')
}

function SidebarMenuItem({ item }) {
  const baseClasses = 'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium transition-colors lg:text-[30px]'
  const activeClasses = item.active ? 'bg-[#e8f3ed] text-[#2f9d68]' : 'text-[#344054] hover:bg-[#eef2f6]'

  if (item.path) {
    return (
      <Link className={`${baseClasses} ${activeClasses}`} to={item.path}>
        <span className="material-symbols-outlined text-xl lg:text-[22px]">{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <button className={`${baseClasses} ${activeClasses}`} type="button">
      <span className="material-symbols-outlined text-xl lg:text-[22px]">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  )
}

function MetricCard({ card }) {
  return (
    <article className="rounded-2xl border border-[#e2e8ee] bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-medium text-[#4a5565] lg:text-[28px]">{card.title}</p>
          <p className="mt-2 text-3xl font-bold leading-none text-[#111827] lg:text-[46px]">{card.value}</p>
          <p className={`mt-3 text-sm font-medium lg:text-[26px] ${toneStyles[card.tone]}`}>{card.subtitle}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: card.iconBg }}>
          <span className="material-symbols-outlined text-[24px]" style={{ color: card.iconColor }}>
            {card.icon}
          </span>
        </div>
      </div>
    </article>
  )
}

function BarChartCard({ chart }) {
  const width = 820
  const height = 370
  const margin = { top: 16, right: 16, bottom: 54, left: 72 }
  const graphWidth = width - margin.left - margin.right
  const graphHeight = height - margin.top - margin.bottom
  const barGap = 16
  const barWidth = (graphWidth - barGap * (chart.values.length + 1)) / chart.values.length

  return (
    <section className="min-h-[420px] rounded-2xl border border-[#e2e8ee] bg-white p-6">
      <h3 className="text-xl font-bold text-[#121826] lg:text-[38px]">{chart.title}</h3>
      <svg className="mt-5 w-full" viewBox={`0 0 ${width} ${height}`}>
        {chart.ticks.map((tick) => {
          const y = margin.top + graphHeight - (tick / chart.max) * graphHeight
          return (
            <g key={`${chart.title}-tick-${tick}`}>
              <line x1={margin.left} x2={margin.left + graphWidth} y1={y} y2={y} stroke="#dde3eb" strokeDasharray="5 5" />
              <text fill="#8a94a3" fontSize="14" textAnchor="end" x={margin.left - 12} y={y + 5}>
                {tick}
              </text>
            </g>
          )
        })}

        {chart.labels.map((_, index) => {
          const x = margin.left + barGap + index * (barWidth + barGap) + barWidth / 2
          return (
            <line
              key={`${chart.title}-vline-${index}`}
              x1={x}
              x2={x}
              y1={margin.top}
              y2={margin.top + graphHeight}
              stroke="#dde3eb"
              strokeDasharray="5 5"
            />
          )
        })}

        <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + graphHeight} stroke="#8a94a3" strokeWidth="2" />
        <line x1={margin.left} x2={margin.left + graphWidth} y1={margin.top + graphHeight} y2={margin.top + graphHeight} stroke="#8a94a3" strokeWidth="2" />

        {chart.values.map((value, index) => {
          const barHeight = (value / chart.max) * graphHeight
          const x = margin.left + barGap + index * (barWidth + barGap)
          const y = margin.top + graphHeight - barHeight

          return (
            <g key={`${chart.title}-bar-${chart.labels[index]}`}>
              <rect fill={chart.color} height={barHeight} rx="10" width={barWidth} x={x} y={y} />
              <text fill="#7b8392" fontSize="14" textAnchor="middle" x={x + barWidth / 2} y={margin.top + graphHeight + 34}>
                {chart.labels[index]}
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}

function LineChartCard({ chart }) {
  const width = 820
  const height = 370
  const margin = { top: 16, right: 16, bottom: 54, left: 72 }
  const graphWidth = width - margin.left - margin.right
  const graphHeight = height - margin.top - margin.bottom

  const points = chart.values.map((value, index) => {
    const x = margin.left + (index / (chart.values.length - 1)) * graphWidth
    const y = margin.top + graphHeight - (value / chart.max) * graphHeight
    return { x, y }
  })

  return (
    <section className="min-h-[420px] rounded-2xl border border-[#e2e8ee] bg-white p-6">
      <h3 className="text-xl font-bold text-[#121826] lg:text-[38px]">{chart.title}</h3>
      <svg className="mt-5 w-full" viewBox={`0 0 ${width} ${height}`}>
        {chart.ticks.map((tick) => {
          const y = margin.top + graphHeight - (tick / chart.max) * graphHeight
          return (
            <g key={`${chart.title}-tick-${tick}`}>
              <line x1={margin.left} x2={margin.left + graphWidth} y1={y} y2={y} stroke="#dde3eb" strokeDasharray="5 5" />
              <text fill="#8a94a3" fontSize="14" textAnchor="end" x={margin.left - 12} y={y + 5}>
                {tick}
              </text>
            </g>
          )
        })}

        {points.map((point, index) => (
          <line
            key={`${chart.title}-vline-${chart.labels[index]}`}
            x1={point.x}
            x2={point.x}
            y1={margin.top}
            y2={margin.top + graphHeight}
            stroke="#dde3eb"
            strokeDasharray="5 5"
          />
        ))}

        <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + graphHeight} stroke="#8a94a3" strokeWidth="2" />
        <line x1={margin.left} x2={margin.left + graphWidth} y1={margin.top + graphHeight} y2={margin.top + graphHeight} stroke="#8a94a3" strokeWidth="2" />

        <path d={buildSmoothPath(points)} fill="none" stroke={chart.color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />

        {points.map((point, index) => (
          <g key={`${chart.title}-point-${chart.labels[index]}`}>
            <circle cx={point.x} cy={point.y} fill={chart.color} r="7" />
            <text fill="#7b8392" fontSize="14" textAnchor="middle" x={point.x} y={margin.top + graphHeight + 34}>
              {chart.labels[index]}
            </text>
          </g>
        ))}
      </svg>
    </section>
  )
}

function StaffDashboard() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser() || {}
  const userName = currentUser.name || DEFAULT_STAFF_USER.name
  const userEmail = currentUser.email || DEFAULT_STAFF_USER.email
  const firstName = userName.split(' ').filter(Boolean)[0] || 'Amit'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#111827]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="flex w-full flex-col border-r border-[#dfe4ea] bg-[#f7f8f8] lg:w-[340px] lg:flex-shrink-0">
          <div className="flex h-[98px] items-center gap-4 border-b border-[#dfe4ea] px-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#39a86b] text-white">
              <span className="material-symbols-outlined text-[28px]">eco</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#243049] lg:text-[35px]">VSA Foods</h1>
              <p className="text-sm text-[#7a8596] lg:text-[28px]">{STAFF_CONFIG.panelLabel}</p>
            </div>
          </div>

          <div className="px-4 pb-5 pt-8">
            <p className="text-xs font-medium uppercase tracking-wide text-[#8a94a3] lg:text-[24px]">Menu</p>
            <nav className="mt-4 space-y-2">
              {STAFF_CONFIG.menu.map((item) => (
                <SidebarMenuItem item={item} key={item.key} />
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-[#dfe4ea] px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#39a86b] text-[18px] font-medium text-white">
                  {getInitials(userName)}
                </div>
                <div>
                  <p className="text-base font-semibold text-[#263247] lg:text-[31px]">{userName}</p>
                  <p className="text-sm text-[#7a8596] lg:text-[25px]">{userEmail}</p>
                </div>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d5dbe3] text-[#677287]"
                type="button"
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b border-[#dfe4ea] bg-[#f5f6f8] px-5 py-4 lg:h-[82px] lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#d8dee7] bg-white text-[#556174]" type="button">
                  <span className="material-symbols-outlined text-[20px]">left_panel_open</span>
                </button>
                <div className="relative w-full max-w-[420px]">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#6f7988]">search</span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#ece4dc] bg-[#f1ebe4] pl-10 pr-4 text-base text-[#344054] placeholder-[#7c8696] outline-none focus:border-[#d7ccc1] lg:text-[28px]"
                    placeholder="Search anything..."
                    type="text"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-5">
                <button className="relative text-[#5f6979]" type="button">
                  <span className="material-symbols-outlined text-[24px]">notifications_none</span>
                  <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-[#e64a45]"></span>
                </button>
                <div className="text-right">
                  <p className="text-base font-semibold leading-tight text-[#1f2937] lg:text-[33px]">{userName}</p>
                  <p className="text-sm text-[#6f7988] lg:text-[27px]">Staff</p>
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:p-8">
            <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#141b2c] lg:text-[56px]">Welcome back, {firstName} 👋</h2>
                <p className="mt-2 text-base text-[#657084] lg:text-[31px]">{STAFF_CONFIG.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex h-12 items-center gap-2 rounded-2xl border border-[#d9dee5] bg-white px-6 text-base font-medium text-[#1f2937] lg:text-[29px]" type="button">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                  <span>{STAFF_CONFIG.actions.secondary}</span>
                </button>
                <button className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#39a86b] px-6 text-base font-medium text-white lg:text-[29px]" type="button">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>{STAFF_CONFIG.actions.primary}</span>
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {STAFF_CONFIG.metrics.map((card) => (
                <MetricCard card={card} key={card.title} />
              ))}
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <BarChartCard chart={STAFF_CONFIG.charts.sales} />
              <LineChartCard chart={STAFF_CONFIG.charts.output} />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StaffDashboard
