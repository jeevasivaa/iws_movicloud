import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Factory, Eye, EyeOff } from 'lucide-react';

const AuthFlow = () => {
  const [view, setView] = useState('login'); // 'login' or 'onboarding'
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, this would perform authentication
    setView('onboarding');
  };

  const handleOnboardingNext = (e) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const renderSteps = () => {
    const steps = ['Company', 'Settings', 'Inventory', 'Review'];
    return (
      <div className="flex items-center justify-between mb-12 w-full max-w-md mx-auto">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step > i + 1
                    ? 'bg-green-500 text-white'
                    : step === i + 1
                    ? 'bg-[#1e3a8a] text-white ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > i + 1 ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              <span className={`absolute -bottom-7 text-[10px] font-bold uppercase tracking-wider ${
                step === i + 1 ? 'text-[#1e3a8a]' : 'text-slate-400'
              }`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 bg-slate-100 relative">
                <div 
                  className="absolute inset-0 bg-green-500 transition-all duration-500"
                  style={{ width: step > i + 1 ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-900">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a8a] relative overflow-hidden flex-col justify-between p-16">
        {/* Abstract Factory Pattern Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-white p-2 rounded-lg">
              <Factory className="text-[#1e3a8a] h-8 w-8" />
            </div>
            <span className="text-white text-2xl font-black tracking-tight">VSA BEVERAGES</span>
          </div>
          
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Intelligent Warehouse <br />
            <span className="text-blue-400 font-black">Solutions (IWS)</span>
          </h1>
          <p className="text-blue-100 text-xl max-w-lg leading-relaxed font-medium">
            The next generation of beverage manufacturing & logistics management. 
            Streamlining every drop from production to the final customer.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-8">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-12 w-12 rounded-full border-4 border-[#1e3a8a] bg-slate-200 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
              </div>
            ))}
          </div>
          <p className="text-blue-200 text-sm font-semibold italic">
            Joined by 500+ global beverage brands
          </p>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto">
          {view === 'login' ? (
            <div className="animate-in fade-in duration-700">
              <h2 className="text-4xl font-black text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500 mb-10 font-medium">Please enter your details to sign in.</p>
              
              <button className="w-full flex items-center justify-center space-x-3 py-3 px-4 border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-all mb-8 font-bold text-slate-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.64l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </button>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="alex@vsabeverages.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#1e3a8a] focus:outline-none transition-all bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#1e3a8a] focus:outline-none transition-all bg-slate-50/50"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded border-2 border-slate-200 text-[#1e3a8a] focus:ring-[#1e3a8a]" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Keep me signed in</span>
                  </label>
                  <button type="button" className="text-sm font-bold text-[#1e3a8a] hover:underline">Forgot password?</button>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:bg-[#1e40af] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Sign In to Dashboard
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-500">
              {renderSteps()}
              
              <div className="mt-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Company Information</h2>
                <p className="text-slate-500 mb-8 font-medium">Let's set up your business profile.</p>

                <form onSubmit={handleOnboardingNext} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                      <input 
                        type="text" 
                        placeholder="VSA Beverages Pvt Ltd"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#1e3a8a] focus:outline-none transition-all bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">GST Number</label>
                      <input 
                        type="text" 
                        placeholder="22AAAAA0000A1Z5"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#1e3a8a] focus:outline-none transition-all bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Industry Type</label>
                      <select className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#1e3a8a] focus:outline-none transition-all bg-slate-50/50 appearance-none">
                        <option>Beverage Manufacturing</option>
                        <option>Logistics & Supply Chain</option>
                        <option>Retail Distribution</option>
                        <option>Raw Material Supplier</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Registered Address</label>
                      <textarea 
                        rows="3"
                        placeholder="123 Industrial Estate, Sector 5..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#1e3a8a] focus:outline-none transition-all bg-slate-50/50 resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setView('login')}
                      className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
                    >
                      Back to Login
                    </button>
                    <button 
                      type="submit" 
                      className="bg-[#1e3a8a] text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 shadow-xl shadow-blue-900/20 hover:bg-[#1e40af] transition-all transform hover:-translate-y-0.5"
                    >
                      <span>Continue to Step 2</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-12 text-center lg:text-left">
          <p className="text-slate-400 text-sm font-medium">
            © 2026 VSA Beverages IWS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
