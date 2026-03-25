import { useNavigate } from 'react-router-dom'

function OnboardingStep4() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Step 4 of 4</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Review & Activate</h1>
      <p className="mt-1 text-sm text-slate-600">Confirm your organization setup before entering the control center.</p>

      <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <p>Company profile, operational settings, and inventory defaults are ready.</p>
        <p>Next step will activate your workspace and redirect to dashboard overview.</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button className="text-sm font-semibold text-slate-500" onClick={() => navigate('/onboarding/step-3')} type="button">Back</button>
        <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => navigate('/dashboard')} type="button">Finish Setup</button>
      </div>
    </section>
  )
}

export default OnboardingStep4
