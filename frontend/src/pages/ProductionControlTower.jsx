import React from 'react'
import { 
  Factory, 
  Users, 
  Package, 
  Play, 
  Search, 
  Clock, 
  ChevronRight,
  MoreVertical,
  CheckCircle2
} from 'lucide-react'

const SUMMARY_KPIS = [
  { label: 'Active batches', value: '12', icon: Factory, color: 'text-blue-600' },
  { label: 'Completed Today', value: '8', icon: CheckCircle2, color: 'text-teal-600' },
  { label: 'Total Units', value: '14,280', icon: Package, color: 'text-[#1e3a8a]' },
]

const KANBAN_COLUMNS = [
  {
    id: 'queued',
    title: 'Queued',
    batches: [
      { id: 'BCH-882', name: 'Tender Coconut Water', stage: 'Extraction', progress: 0, staff: 'Zane Roy', avatar: 'ZR', units: '5,000', eta: 'Mar 24' },
      { id: 'BCH-885', name: 'Sparkling Lemonade', stage: 'Packaging', progress: 0, staff: 'Maya George', avatar: 'MG', units: '2,500', eta: 'Mar 24' },
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    batches: [
      { id: 'BCH-879', name: 'Aloe Vera Juice', stage: 'Bottling', progress: 65, staff: 'Priya Nair', avatar: 'PN', units: '3,000', eta: 'Mar 23' },
      { id: 'BCH-880', name: 'Guava Nectar', stage: 'Extraction', progress: 40, staff: 'James Wilson', avatar: 'JW', units: '4,500', eta: 'Mar 23' },
    ]
  },
  {
    id: 'dispatch',
    title: 'Ready for Dispatch',
    batches: [
      { id: 'BCH-875', name: 'Mango Pulp', stage: 'Packaging', progress: 100, staff: 'Sarah Chen', avatar: 'SC', units: '10,000', eta: 'Completed' },
    ]
  }
]

const BatchCard = ({ batch }) => {
  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Bottling': return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'Extraction': return 'bg-teal-50 text-teal-700 border-teal-100'
      case 'Packaging': return 'bg-amber-50 text-amber-700 border-amber-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  return (
    <div className="vsa-card p-6 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-500 group cursor-pointer border-slate-200/60 bg-white">
      <div className="flex justify-between items-start mb-5">
        <div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">#{batch.id}</span>
          <h4 className="text-[15px] font-black text-slate-700 leading-tight group-hover:text-[#1e3a8a] transition-colors">
            {batch.name}
          </h4>
        </div>
        <button className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="mb-6">
        <span className={`badge ${getStageBadge(batch.stage)} text-[10px] py-1 px-3`}>
          {batch.stage}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2.5 mb-7">
        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-400">
          <span>Batch Progress</span>
          <span className={batch.progress === 100 ? 'text-teal-600' : 'text-[#1e3a8a]'}>{batch.progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(30,58,138,0.2)] ${
              batch.progress === 100 ? 'bg-teal-500' : 'bg-[#1e3a8a]'
            }`} 
            style={{ width: `${batch.progress}%` }} 
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-[#1e3a8a] shadow-sm">
            {batch.avatar}
          </div>
          <span className="text-[12px] font-bold text-slate-500">{batch.staff}</span>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-black text-slate-700 leading-none mb-1">{batch.units} Units</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{batch.eta}</p>
        </div>
      </div>
    </div>
  )
}

function ProductionControlTower() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Production Tower</h1>
          <p className="text-slate-500 font-semibold mt-2">Operational command for manufacturing and quality control.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter active batches..."
              className="pl-11 pr-5 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 focus:border-[#1e3a8a] outline-none w-72 transition-all shadow-sm"
            />
          </div>
          <button className="btn-primary py-3 px-8 text-[11px] uppercase tracking-widest shadow-md">
            <Play className="w-4 h-4 fill-current mr-2" />
            Launch Batch
          </button>
        </div>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SUMMARY_KPIS.map((kpi, i) => (
          <div key={i} className="vsa-card p-7 flex items-center gap-6 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center ${kpi.color} shadow-inner`}>
              <kpi.icon size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{kpi.label}</p>
              <h3 className="text-3xl font-black text-slate-800">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {KANBAN_COLUMNS.map((column) => (
          <div key={column.id} className="space-y-6">
            <div className="flex items-center justify-between px-3 mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shadow-lg ${
                  column.id === 'in-progress' ? 'bg-[#1e3a8a] shadow-blue-200' : 
                  column.id === 'dispatch' ? 'bg-teal-500 shadow-teal-200' : 'bg-slate-300 shadow-slate-100'
                }`} />
                <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">
                  {column.title}
                </h2>
              </div>
              <span className="bg-white text-slate-500 text-[11px] font-black px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                {column.batches.length}
              </span>
            </div>
            
            <div className="space-y-5">
              {column.batches.map((batch) => (
                <BatchCard key={batch.id} batch={batch} />
              ))}
            </div>

            {column.id === 'queued' && (
              <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-300 hover:text-[#1e3a8a] hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3 mt-6">
                <Play size={14} className="fill-current" />
                Schedule Next
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductionControlTower
