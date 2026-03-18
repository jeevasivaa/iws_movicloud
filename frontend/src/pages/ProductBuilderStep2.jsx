import { useNavigate } from 'react-router-dom'

function ProductBuilderStep2() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Step 2 of 4</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Branding & Labeling</h1>
      <p className="mt-1 text-sm text-slate-600">Configure private-label details and market positioning assets.</p>

      <form className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Brand Name
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="CocoPure" />
        </label>
        <label className="text-sm text-slate-700">
          Label Language
          <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
            <option>English</option>
            <option>English + Arabic</option>
            <option>English + French</option>
          </select>
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          Packaging Notes
          <textarea className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" rows="3" />
        </label>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <button className="text-sm font-semibold text-slate-500" onClick={() => navigate('/product-builder/step-1')} type="button">Back</button>
        <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => navigate('/product-builder/step-3')} type="button">Continue to Step 3</button>
      </div>
    </section>
  )
}

export default ProductBuilderStep2
