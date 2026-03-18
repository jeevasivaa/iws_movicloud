import { useMemo, useState } from 'react'
import { Factory, Eye, EyeOff, LogIn, ShieldCheck, Cpu, Database, Activity } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ROLE_LOGIN_OPTIONS } from '../services/authService'
import { HOME_BY_ROLE } from '../constants/roles'

function AuthFlow() {
  const navigate = useNavigate()
  const { isAuthenticated, user, login, loginAsMockUser } = useAuth()

  const [role, setRole] = useState(ROLE_LOGIN_OPTIONS[0].role)
  const [email, setEmail] = useState(ROLE_LOGIN_OPTIONS[0].defaultEmail)
  const [password, setPassword] = useState('Password@123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedRole = useMemo(
    () => ROLE_LOGIN_OPTIONS.find((option) => option.role === role),
    [role],
  )

  const homeRoute = user ? HOME_BY_ROLE[user.role] || '/dashboard' : '/auth'

  if (isAuthenticated) {
    return <Navigate to={homeRoute} replace />
  }

  const handleRoleChange = (nextRole) => {
    setRole(nextRole)
    const roleOption = ROLE_LOGIN_OPTIONS.find((option) => option.role === nextRole)
    if (roleOption) {
      setEmail(roleOption.defaultEmail)
    }
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ name: selectedRole.label, email, role }, 'mock-token')
      navigate(HOME_BY_ROLE[role] || '/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans text-slate-900 bg-[#f8fafc]">
      {/* Left Panel: Hero & Info */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#0f172a] relative overflow-hidden flex-col justify-between p-20">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-large" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-large)" />
          </svg>
        </div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-16">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-2xl shadow-xl shadow-blue-500/20">
              <Factory className="text-white h-7 w-7" />
            </div>
            <div>
              <span className="text-white text-2xl font-black tracking-tight block leading-none">VSA BEVERAGES</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Intelligent Systems</span>
            </div>
          </div>

          <h1 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tight">
            The Next Generation of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Industrial Warehouse Management
            </span>
          </h1>
          <p className="text-slate-400 text-xl max-w-xl leading-relaxed font-medium mb-12">
            A unified operations cockpit integrating real-time production, inventory intelligence, and financial oversight.
          </p>

          <div className="grid grid-cols-2 gap-6 max-w-lg">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Activity size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Real-time Telemetry</p>
                <p className="text-slate-500 text-xs mt-1">Live production line monitoring</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Cpu size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">AI Insights</p>
                <p className="text-slate-500 text-xs mt-1">Predictive stock & maintenance</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 glass-card !bg-white/5 !border-white/10 p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">Quick-Access Demo Portals</p>
            <ShieldCheck size={14} className="text-blue-400/50" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ROLE_LOGIN_OPTIONS.map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => loginAsMockUser(option.role)}
                className="group bg-white/5 hover:bg-blue-600 text-white p-4 rounded-2xl border border-white/5 hover:border-blue-500 transition-all duration-300 text-center shadow-lg hover:shadow-blue-600/20 active:scale-95"
              >
                <div className="mb-2 flex justify-center text-blue-400 group-hover:text-white transition-colors">
                  {option.role === 'admin' ? <ShieldCheck size={20} /> : <Database size={20} />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">{option.role}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center px-8 lg:px-24 py-12 relative">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Secure Login</h2>
            <p className="text-slate-500 font-bold leading-relaxed">
              Welcome back. Enter your operational credentials to access the IWS terminal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-3">Access Level</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_LOGIN_OPTIONS.map((option) => (
                  <button
                    key={option.role}
                    type="button"
                    onClick={() => handleRoleChange(option.role)}
                    className={`rounded-2xl border-2 px-4 py-3 text-left transition-all duration-300 ${
                      role === option.role
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-widest ${role === option.role ? 'text-blue-600' : 'text-slate-400'}`}>
                      {option.role}
                    </p>
                    <p className={`text-sm font-bold mt-0.5 ${role === option.role ? 'text-slate-900' : 'text-slate-600'}`}>
                      {option.label.split('(')[0]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">Corporate Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole?.defaultEmail}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">Security Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2.5} /> : <Eye className="h-5 w-5" strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Remember this terminal</span>
              </label>
              <button type="button" className="text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">Reset Access</button>
            </div>

            {error ? (
              <div className="flex items-center gap-3 rounded-2xl border-2 border-red-100 bg-red-50/50 px-4 py-3 text-sm font-bold text-red-700">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-5 text-lg"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <LogIn className="h-5 w-5" strokeWidth={3} />
                  Authorize Access
                </div>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
              VSA BEVERAGES IWS • SECURITY NODE 0822-X
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthFlow
