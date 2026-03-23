import React from 'react'
import {
  Clock3,
  Plus,
  IndianRupee,
  ShoppingCart,
  Factory,
  TriangleAlert,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useAuth } from '../context/useAuth'

const SALES_DATA = [
  { name: 'Jan', value: 42000 },
  { name: 'Feb', value: 38000 },
  { name: 'Mar', value: 55000 },
  { name: 'Apr', value: 47000 },
  { name: 'May', value: 62000 },
  { name: 'Jun', value: 58000 },
]

const PRODUCTION_DATA = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 145 },
  { name: 'Wed', value: 133 },
  { name: 'Thu', value: 159 },
  { name: 'Fri', value: 142 },
  { name: 'Sat', value: 95 },
]

const RECENT_ORDERS = [
  {
    id: 'ORD-2024-001',
    client: 'FreshMart Stores',
    status: 'Processing',
    amount: '₹45,200',
    statusClass: 'bg-[#f9f2dd] text-[#c79200]',
  },
  {
    id: 'ORD-2024-002',
    client: "Nature's Best Co.",
    status: 'Shipped',
    amount: '₹32,800',
    statusClass: 'bg-[#e6f2fe] text-[#2f7dd8]',
  },
  {
    id: 'ORD-2024-003',
    client: 'Green Valley Foods',
    status: 'Pending',
    amount: '₹67,500',
    statusClass: 'bg-[#fdeee6] text-[#e67c47]',
  },
  {
    id: 'ORD-2024-004',
    client: 'Organic Hub',
    status: 'Delivered',
    amount: '₹28,900',
    statusClass: 'bg-[#e8f6ef] text-[#39a978]',
  },
]

const INVENTORY_DATA = [
  { name: 'Cold Pressed Oils', value: 35, color: '#3ca976' },
  { name: 'Essential Oils', value: 25, color: '#3f7fc3' },
  { name: 'Raw Materials', value: 20, color: '#c39d21' },
  { name: 'Packaging', value: 20, color: '#8f63b2' },
]

const KPI_ITEMS = [
  {
    title: 'Total Revenue',
    value: '₹3,02,000',
    subtitle: '+12.5% from last month',
    subtitleClass: 'text-emerald-600',
    Icon: IndianRupee,
    iconWrap: 'bg-emerald-50 text-emerald-500',
  },
  {
    title: 'Active Orders',
    value: '48',
    subtitle: '+8 new today',
    subtitleClass: 'text-emerald-600',
    Icon: ShoppingCart,
    iconWrap: 'bg-blue-50 text-blue-500',
  },
  {
    title: 'Production Batches',
    value: '12',
    subtitle: '3 in progress',
    subtitleClass: 'text-slate-500',
    Icon: Factory,
    iconWrap: 'bg-purple-50 text-purple-500',
  },
  {
    title: 'Low Stock Items',
    value: '7',
    subtitle: 'Needs attention',
    subtitleClass: 'text-rose-500',
    Icon: TriangleAlert,
    iconWrap: 'bg-orange-50 text-orange-500',
  },
]

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-7 animate-fade-in">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Welcome back, {user?.name?.split(' ')[0] || 'Raj'} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-base font-medium text-slate-500">Here's what's happening with your business today.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            <Clock3 size={20} />
            View Schedule
          </button>
          <button className="inline-flex items-center gap-3 rounded-2xl bg-[#3fa874] px-5 py-2.5 text-lg font-semibold text-white transition-colors hover:bg-[#348f62]">
            <Plus size={20} />
            Quick Action
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        {KPI_ITEMS.map((item) => (
          <article key={item.title} className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-medium text-slate-500">{item.title}</p>
                <p className="mt-1 text-[34px] leading-none font-bold text-slate-800">{item.value}</p>
                <p className={`mt-2 text-base font-medium ${item.subtitleClass}`}>{item.subtitle}</p>
              </div>
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconWrap}`}>
                <item.Icon size={24} />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
        <article className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-3xl leading-none font-semibold text-slate-800">Monthly Sales</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_DATA}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={false}
                  domain={[0, 80000]}
                  ticks={[0, 20000, 40000, 60000, 80000]}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" fill="#43a979" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-3xl leading-none font-semibold text-slate-800">Production Output</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRODUCTION_DATA}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={false}
                  domain={[0, 160]}
                  ticks={[0, 40, 80, 120, 160]}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(value) => [value, 'Units']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3f7fc3"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3f7fc3' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.95fr_1fr] gap-5">
        <article className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl leading-none font-semibold text-slate-800">Recent Orders</h2>
            <button className="text-xl leading-none font-medium text-[#34a56f] transition-colors hover:text-[#2a8a5c]">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 text-left text-xl font-medium text-slate-500">Order ID</th>
                  <th className="py-3 text-left text-xl font-medium text-slate-500">Client</th>
                  <th className="py-3 text-left text-xl font-medium text-slate-500">Status</th>
                  <th className="py-3 text-right text-xl font-medium text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="border-b border-slate-200 last:border-b-0">
                    <td className="py-3 pr-4 text-[22px] font-medium text-slate-800">{order.id}</td>
                    <td className="py-3 pr-4 text-[22px] font-medium text-slate-800">{order.client}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-lg font-medium leading-none ${order.statusClass}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[22px] font-medium text-slate-800">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="vsa-card rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-3xl leading-none font-semibold text-slate-800">Inventory Breakdown</h2>

          <div className="mx-auto h-[260px] w-[260px] max-w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INVENTORY_DATA}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="88%"
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                  stroke="#ffffff"
                  strokeWidth={4}
                >
                  {INVENTORY_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-2.5">
            {INVENTORY_DATA.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <span className="text-lg font-medium text-slate-700">{entry.name}</span>
                </div>
                <span className="text-lg font-medium text-slate-700">{entry.value}%</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

export default Dashboard
