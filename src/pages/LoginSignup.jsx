import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, signup } from '../services/authService'

function LoginSignup() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup({ email, password })
      }
      navigate('/dashboard')
    } catch (err) {
      console.error('Authentication failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = (e) => {
    e.preventDefault()
    setIsLogin(!isLogin)
  }

  return (
    <body className="bg-enterprise-gradient min-h-screen flex items-center justify-center p-4">
      {/* BEGIN: MainContainer */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[700px]">
        {/* BEGIN: VisualSection */}
        <section className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-blue-900 text-white">
          {/* Background Illustration Placeholder */}
          <div className="absolute inset-0 z-0 opacity-20">
            <img
              alt="Beverage Manufacturing Facility"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4NrSUf0U3N7PWAIWGty9VG9rHysJ3Cyn8ppYm8Su07VjsYdwEjvJlUXGIW_7SCPHO7aef2RKhxhNPpDWlvCGD-5w_0z4hVlDNjzgnaCxmhx3TQ32zatgYN6-lOWN59qSJo4yuLOkqJJR41SQ4rPC4QU3a7YZaeCAELxjNm0mpYdaE11GOABs5OWfp8R6MlUidnMbPepqqg0C0jEdIqtDtMlSljTtDUAAhyLxEJBZWRwILBkNq9oUnGzvscf4lai211ficSgLrO1U"
            />
          </div>
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-blue-800/40 z-10"></div>
          {/* Content */}
          <div className="relative z-20">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.283a2 2 0 01-1.186.12l-2.085-.417a2 2 0 00-1.25.122l-1.013.483a2 2 0 01-1.046.135L3 16.297V4a2 2 0 012-2h11a2 2 0 012 2v12.297c0 .839-.51 1.53-1.026 1.87z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight">VSA Beverages</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-6">
              Intelligent Warehouse <br />Solutions (IWS)
            </h1>
            <p className="text-blue-100 text-lg max-w-md">
              Streamlining beverage production and distribution through enterprise-grade data management and real-time logistics tracking.
            </p>
          </div>
          <div className="relative z-20">
            <div className="flex items-center gap-4 text-sm text-blue-200">
              <span>© 2023 VSA Beverages Inc.</span>
              <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
              <a className="hover:underline" href="#">Privacy Policy</a>
            </div>
          </div>
        </section>
        {/* END: VisualSection */}
        {/* BEGIN: FormSection */}
        <section className="flex flex-col justify-center items-center p-8 lg:p-16 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo (Visible only on small screens) */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-8 h-8 brand-primary rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.283a2 2 0 01-1.186.12l-2.085-.417a2 2 0 00-1.25.122l-1.013.483a2 2 0 01-1.046.135L3 16.297V4a2 2 0 012-2h11a2 2 0 012 2v12.297c0 .839-.51 1.53-1.026 1.87z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">VSA Beverages</span>
            </div>
            <div className="text-center lg:text-left mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-500">
                {isLogin
                  ? 'Enter your credentials to access the IWS dashboard.'
                  : 'Start managing your beverage logistics today.'}
              </p>
            </div>
            {/* Social Login */}
            <div className="space-y-4 mb-8">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200" type="button">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.64l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Sign in with Google
              </button>
            </div>
            <div className="relative flex items-center gap-4 mb-8">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            {/* Login Form */}
            <form className="space-y-6" id="loginForm" onSubmit={handleSubmit}>
              <div data-purpose="form-field-group">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">Email Address</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div data-purpose="form-field-group">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700" htmlFor="password">Password</label>
                  <a className="text-xs font-bold text-blue-700 hover:text-blue-800" href="#">Forgot password?</a>
                </div>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="ml-2 block text-sm text-gray-600" htmlFor="remember-me">
                  Keep me signed in
                </label>
              </div>
              <button
                className="w-full brand-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                type="submit"
                disabled={loading}
              >
                {isLogin ? 'Sign In to Dashboard' : 'Register for IWS'}
              </button>
            </form>
            <p className="mt-10 text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <a className="font-bold text-blue-700 hover:text-blue-800" href="#" onClick={toggleMode}>
                {isLogin ? 'Create enterprise account' : 'Sign in to existing account'}
              </a>
            </p>
          </div>
        </section>
        {/* END: FormSection */}
      </main>
      {/* END: MainContainer */}
    </body>
  )
}

export default LoginSignup
