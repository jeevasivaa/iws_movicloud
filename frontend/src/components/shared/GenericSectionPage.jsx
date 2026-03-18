function GenericSectionPage({
  title,
  subtitle,
  bullets = [],
}) {
  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {bullets.map((item) => (
          <article
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm"
          >
            {item}
          </article>
        ))}
      </div>
    </section>
  )
}

export default GenericSectionPage
