import { 
  CheckCircle2, 
  Clock, 
  ScanLine, 
  ChevronRight,
  ListChecks,
  AlertCircle,
  Zap
} from 'lucide-react'
import { useState, useEffect } from 'react'

const ACTIVE_TASK = {
  id: 'BCH-882',
  name: 'Tender Coconut Water',
  instructions: [
    { id: 1, text: 'Sanitize vat #4 with food-grade solution', completed: true },
    { id: 2, text: 'Add raw coconut water (5,000 L)', completed: false },
    { id: 3, text: 'Quality sample: Measure Brix levels', completed: false },
    { id: 4, text: 'Seal vat and start agitation (low speed)', completed: false },
  ]
}

const UP_NEXT = [
  { id: 'BCH-885', name: 'Sparkling Lemonade', time: '14:30' },
  { id: 'BCH-887', name: 'Aloe Vera Juice', time: '16:00' },
]

function StaffTaskView() {
  const [time, setTime] = useState(new Date())
  const [checklist, setChecklist] = useState(ACTIVE_TASK.instructions)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleCheck = (id) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const allCompleted = checklist.every(item => item.completed)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Tablet Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <Zap size={12} className="text-[#1e3a8a] fill-[#1e3a8a]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a8a]">Station Alpha-1</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Operator Portal</h1>
          <p className="text-slate-500 font-semibold mt-1 italic">Identity Verified: Zane Roy</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black text-slate-900 tracking-tighter">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Task Hero - High Impact */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1e3a8a] to-teal-500" />
        
        <div className="p-10 sm:p-14">
          <div className="flex items-center gap-4 mb-8">
            <span className="badge badge-info bg-[#1e3a8a] text-white border-none py-1.5 px-4 text-[11px]">
              Active Batch
            </span>
            <span className="text-slate-400 font-black tracking-widest text-xs">#{ACTIVE_TASK.id}</span>
          </div>

          <h2 className="text-5xl font-black text-slate-900 mb-12 leading-tight tracking-tight">
            {ACTIVE_TASK.name}
          </h2>

          <div className="space-y-4 mb-14">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
              <ListChecks className="w-4 h-4 text-[#1e3a8a]" />
              Standard Operating Procedure
            </h3>
            {checklist.map((item) => (
              <button 
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full flex items-center gap-6 p-8 rounded-xl border-2 transition-all text-left group ${
                  item.completed 
                    ? 'bg-teal-50/30 border-teal-100 shadow-inner' 
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                  item.completed 
                    ? 'bg-teal-500 border-teal-500 text-white rotate-0' 
                    : 'bg-white border-slate-200 text-transparent -rotate-90 group-hover:rotate-0 group-hover:border-blue-300'
                }`}>
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <span className={`text-2xl font-bold transition-all ${item.completed ? 'text-teal-900 line-through opacity-40' : 'text-slate-700'}`}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>

          {/* Swipe-to-confirm visual design button */}
          <div className="relative">
            {!allCompleted && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest animate-pulse">
                <AlertCircle size={12} />
                Complete all steps to unlock
              </div>
            )}
            <button 
              disabled={!allCompleted}
              className={`w-full py-10 rounded-xl text-2xl font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group shadow-2xl ${
                allCompleted 
                  ? 'bg-[#1e3a8a] text-white hover:bg-[#172554] shadow-blue-900/40 active:scale-[0.98]' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                {allCompleted ? 'Swipe to Finalize Batch' : 'Locked'}
                {allCompleted && <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />}
              </div>
              {allCompleted && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Up Next - Horizontal Scroll */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <Clock className="w-6 h-6 text-[#1e3a8a]" />
          Queue Pipeline
        </h3>
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
          {UP_NEXT.map((task) => (
            <div key={task.id} className="min-w-[320px] bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex-shrink-0 group hover:border-[#1e3a8a] transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{task.id}</span>
                <span className="badge badge-info">{task.time}</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-[#1e3a8a] transition-colors">{task.name}</h4>
              <div className="flex items-center text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest">
                Review Details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button - Tablet Optimized */}
      <button className="fixed bottom-10 right-10 w-24 h-24 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95 group z-50 border border-white/10">
        <ScanLine className="w-10 h-10 group-hover:scale-110 transition-transform" />
      </button>

      {/* Safety Banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex items-center gap-6 shadow-sm">
        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
          <AlertCircle size={28} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Safety Protocol: Active</h4>
          <p className="text-sm font-semibold text-amber-800/80">
            Maintain standard PPE requirements. Batch #BCH-882 involves pressurized vessel operations.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StaffTaskView
