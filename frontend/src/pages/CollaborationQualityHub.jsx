function CollaborationQualityHub() {
  const discussions = [
    {
      title: 'Premium EU Label Variant',
      owner: 'NPD Team',
      update: 'Artwork revision 3 shared for legal review.',
    },
    {
      title: 'Mango Blend Pilot Batch',
      owner: 'R&D',
      update: 'Sensory panel score improved from 7.4 to 8.1.',
    },
  ]

  const reports = [
    {
      batch: 'BCH-2419',
      test: 'Microbial Safety',
      status: 'Passed',
      cert: 'HACCP-Ready',
    },
    {
      batch: 'BCH-2422',
      test: 'Brix & Acidity',
      status: 'Passed',
      cert: 'COA Available',
    },
    {
      batch: 'BCH-2428',
      test: 'Packaging Integrity',
      status: 'Review',
      cert: 'Re-test Triggered',
    },
  ]

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Collaboration & Quality Hub</h1>
        <p className="mt-1 text-sm text-slate-600">Coordinate NPD decisions and access batch-level quality documents.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">NPD Collaboration Stream</h2>
          <div className="mt-4 space-y-3">
            {discussions.map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">Owner: {item.owner}</p>
                <p className="mt-2 text-sm text-slate-700">{item.update}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Quality Reports & Certifications</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <th className="pb-2">Batch</th>
                  <th className="pb-2">Test</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Certificate</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((row) => (
                  <tr key={row.batch} className="border-b border-slate-100">
                    <td className="py-3 font-semibold text-slate-800">{row.batch}</td>
                    <td className="py-3 text-slate-700">{row.test}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-blue-700">{row.cert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  )
}

export default CollaborationQualityHub
