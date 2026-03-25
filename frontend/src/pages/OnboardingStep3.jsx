import { useNavigate } from 'react-router-dom'

function OnboardingStep3() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Step 3 of 4</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Inventory Defaults</h1>
      <p className="mt-1 text-sm text-slate-600">Set baseline stock policies and reorder thresholds.</p>

      <form className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Safety Stock (Days)
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="14" type="number" />
        </label>

        <label className="text-sm text-slate-700">
          Reorder Alert Buffer (%)
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="20" type="number" />
        </label>

        <label className="text-sm text-slate-700 md:col-span-2">
          Default Warehouse Notes
          <textarea className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" rows="3" />
        </label>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <button className="text-sm font-semibold text-slate-500" onClick={() => navigate('/onboarding/step-2')} type="button">Back</button>
        <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => navigate('/onboarding/step-4')} type="button">Continue to Step 4</button>
      </div>
    </section>
  )
}

export default OnboardingStep3
