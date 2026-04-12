import React, { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts'

const FORECAST_DATA = [
  { month: 'Jul', actual: 1245000, forecast: 1280000, best: 1350000, worst: 1150000 },
  { month: 'Aug', actual: null, forecast: 1380000, best: 1480000, worst: 1250000 },
  { month: 'Sep', actual: null, forecast: 1450000, best: 1580000, worst: 1300000 },
  { month: 'Oct', actual: null, forecast: 1520000, best: 1680000, worst: 1350000 },
  { month: 'Nov', actual: null, forecast: 1600000, best: 1750000, worst: 1400000 },
  { month: 'Dec', actual: null, forecast: 1750000, best: 1900000, worst: 1500000 },
]

const CASH_PROJECTIONS = [
  { month: 'Jul', opening: 1200000, inflow: 1245000, outflow: 850000, closing: 1595000 },
  { month: 'Aug', opening: 1595000, inflow: 1380000, outflow: 920000, closing: 2055000 },
  { month: 'Sep', opening: 2055000, inflow: 1450000, outflow: 980000, closing: 2525000 },
  { month: 'Oct', opening: 2525000, inflow: 1520000, outflow: 1050000, closing: 2995000 },
  { month: 'Nov', opening: 2995000, inflow: 1600000, outflow: 1120000, closing: 3475000 },
  { month: 'Dec', opening: 3475000, inflow: 1750000, outflow: 1200000, closing: 4025000 },
]

const SCENARIOS = [
  {
    name: 'Optimistic',
    description: 'High growth, good collection',
    impact: '+18.5%',
    color: '#10b981',
  },
  {
    name: 'Base Case',
    description: 'Normal operations',
    impact: '+12.3%',
    color: '#3b82f6',
  },
  {
    name: 'Pessimistic',
    description: 'Lower sales, delays',
    impact: '+2.1%',
    color: '#ef4444',
  },
]

function CashFlowForecasting() {
  const [selectedScenario, setSelectedScenario] = useState('Base Case')

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Flow Forecasting</h1>
          <p className="mt-2 text-gray-600">6-month projection with scenario analysis</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.name}
            onClick={() => setSelectedScenario(scenario.name)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedScenario === scenario.name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="font-semibold text-gray-900">{scenario.name}</p>
            <p className="text-sm text-gray-600">{scenario.description}</p>
            <p className="mt-2 text-lg font-bold" style={{ color: scenario.color }}>
              {scenario.impact}
            </p>
          </button>
        ))}
      </div>

      {/* Revenue Forecast */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Revenue Forecast</h2>
          <p className="text-sm text-gray-600">Actual vs Projected vs Best/Worst Case</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={FORECAST_DATA}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Area
              type="monotone"
              dataKey="best"
              stroke="none"
              fillOpacity={0.1}
              fill="#10b981"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="worst"
              stroke="none"
              fillOpacity={0.1}
              fill="#ef4444"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorActual)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cash Position Projection */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Cash Position Projection</h2>
            <p className="text-sm text-gray-600">Opening to Closing Balance</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={CASH_PROJECTIONS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="closing"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="opening"
                stroke="#9ca3af"
                strokeDasharray="5 5"
                strokeWidth={1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Projections Table */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Monthly Breakdown</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {CASH_PROJECTIONS.map((item) => (
              <div key={item.month} className="flex items-center justify-between border-b pb-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.month}</p>
                  <div className="mt-1 flex gap-4 text-xs text-gray-600">
                    <span>In: ₹{(item.inflow / 100000).toFixed(1)}L</span>
                    <span>Out: ₹{(item.outflow / 100000).toFixed(1)}L</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{(item.closing / 100000).toFixed(2)}L</p>
                  <p className="text-xs text-emerald-600">
                    +₹{((item.closing - item.opening) / 100000).toFixed(2)}L
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-gray-900">Risk Indicators</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">Low Cash Buffer</p>
                <p className="text-sm text-yellow-700">Sep projection below threshold</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Strong Growth</p>
                <p className="text-sm text-green-700">Consistent positive trend</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Expense Control</p>
                <p className="text-sm text-blue-700">Operating costs stable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CashFlowForecasting
