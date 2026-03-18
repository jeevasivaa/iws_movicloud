import { useNavigate } from 'react-router-dom'

function ProductBuilderStep3() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Step 3 of 4</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Compliance & Export</h1>
      <p className="mt-1 text-sm text-slate-600">Add required certifications, destination markets, and quality constraints.</p>

      <form className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Target Region
          <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
            <option>European Union</option>
            <option>Middle East</option>
            <option>North America</option>
          </select>
        </label>
        <label className="text-sm text-slate-700">
          Certification Pack
          <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
            <option>HACCP + ISO22000</option>
            <option>Organic + HACCP</option>
          </select>
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          Additional Compliance Notes
          <textarea className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" rows="3" />
        </label>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <button className="text-sm font-semibold text-slate-500" onClick={() => navigate('/product-builder/step-2')} type="button">Back</button>
        <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => navigate('/product-builder/step-4')} type="button">Continue to Step 4</button>
      </div>
    </section>
  )
}

export default ProductBuilderStep3
