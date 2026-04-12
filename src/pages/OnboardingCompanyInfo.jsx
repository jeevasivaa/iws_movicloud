import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function OnboardingCompanyInfo() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    companyName: '',
    gstNumber: '',
    industryType: '',
    address: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Placeholder: In production, this would save and advance the wizard
    console.log('Form Step 1 Submitted:', formData)
    // Navigate to dashboard after onboarding
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8" style={{ backgroundColor: '#f8fafc', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* BEGIN: OnboardingContainer */}
      <main className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden wizard-card" data-purpose="onboarding-wizard">
        {/* BEGIN: WizardHeader */}
        <header className="bg-brand text-white p-8" style={{ backgroundColor: '#1e3a8a' }}>
          <h1 className="text-2xl font-bold">VSA Beverages - IWS</h1>
          <p className="text-blue-100 text-sm mt-1">Setup your account to get started with our inventory systems.</p>
        </header>
        {/* END: WizardHeader */}
        {/* BEGIN: ProgressStepper */}
        <nav className="px-8 py-6 border-b border-gray-100" data-purpose="progress-stepper">
          <div className="flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 w-1/4 h-0.5 -translate-y-1/2 z-0" style={{ backgroundColor: '#1e3a8a' }}></div>
            {/* Step 1: Active */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 text-white rounded-full flex items-center justify-center font-bold ring-4 ring-white shadow-md" style={{ backgroundColor: '#1e3a8a' }}>1</div>
              <span className="text-xs font-semibold mt-2" style={{ color: '#1e3a8a' }}>Company</span>
            </div>
            {/* Step 2: Pending */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold ring-4 ring-white">2</div>
              <span className="text-xs font-medium mt-2 text-gray-400">Settings</span>
            </div>
            {/* Step 3: Pending */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold ring-4 ring-white">3</div>
              <span className="text-xs font-medium mt-2 text-gray-400">Inventory</span>
            </div>
            {/* Step 4: Pending */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold ring-4 ring-white">4</div>
              <span className="text-xs font-medium mt-2 text-gray-400">Review</span>
            </div>
          </div>
        </nav>
        {/* END: ProgressStepper */}
        {/* BEGIN: FormSection */}
        <section className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Company Information</h2>
            <p className="text-gray-500 text-sm">Please provide the legal details of your organization.</p>
          </div>
          <form className="space-y-5" data-purpose="company-info-form" id="onboarding-step-1" onSubmit={handleSubmit}>
            {/* Row 1: Company Name & GST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="company-name">Company Name</label>
                <input
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
                  id="company-name"
                  name="companyName"
                  placeholder="VSA Beverages Pvt Ltd"
                  required
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="gst-number">GST Number</label>
                <input
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900 uppercase"
                  id="gst-number"
                  name="gstNumber"
                  placeholder="22AAAAA0000A1Z5"
                  required
                  type="text"
                  value={formData.gstNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* Row 2: Industry Type */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="industry-type">Industry Type</label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
                id="industry-type"
                name="industryType"
                required
                value={formData.industryType}
                onChange={handleChange}
              >
                <option value="">Select Industry</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="distribution">Distribution</option>
                <option value="retail">Retail</option>
                <option value="logistics">Logistics</option>
                <option value="beverages">Beverage Production</option>
              </select>
            </div>
            {/* Row 3: Address */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="address">Registered Address</label>
              <textarea
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
                id="address"
                name="address"
                placeholder="Enter your complete business address..."
                required
                rows="3"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
            {/* Form Actions */}
            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
              <button className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors" disabled type="button">
                Back
              </button>
              <button className="text-white px-8 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-700/20 transition-all flex items-center gap-2" type="submit" style={{ backgroundColor: '#1e3a8a' }}>
                Continue to Step 2
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
            </div>
          </form>
        </section>
        {/* END: FormSection */}
        {/* BEGIN: FooterBranding */}
        <footer className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-xs text-gray-400">© 2023 VSA Beverages - Intelligent Warehouse Systems. All rights reserved.</p>
        </footer>
        {/* END: FooterBranding */}
      </main>
      {/* END: OnboardingContainer */}
    </div>
  )
}

export default OnboardingCompanyInfo
