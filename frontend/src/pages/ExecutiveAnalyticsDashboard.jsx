const cards = [
  { label: 'Revenue', value: '$4.8M', delta: '+9.4%' },
  { label: 'Gross Margin', value: '31.2%', delta: '+1.8%' },
  { label: 'Capacity Utilization', value: '84%', delta: '+6%' },
  { label: 'On-Time Delivery', value: '93%', delta: '+3.1%' },
]

const insights = [
  'Premium glass SKU mix can improve margin by 2.1 points in EU channel.',
  'Procurement hedging on coconut concentrate could reduce volatility by 14%.',
  'Secondary warehouse expansion likely required within 2 quarters at current growth.',
]

function ExecutiveAnalyticsDashboard() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Executive Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Business health KPIs with AI-driven strategic recommendations.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">{card.delta}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Strategic Trend Signal</h2>
          <div className="mt-4 h-64 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
          <h2 className="text-lg font-bold">AI Growth Insights</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {insights.map((insight) => (
              <li key={insight} className="rounded-lg bg-white/10 p-3">{insight}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}

export default ExecutiveAnalyticsDashboard
