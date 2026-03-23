import { useMemo, useState } from 'react'
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  ShieldCheck, 
  Activity, 
  AlertCircle, 
  Clock,
  CheckCircle2,
  Users,
  Zap
} from 'lucide-react'

const USERS = [
  { id: '1', name: 'Priya Nair', email: 'admin@vsabeverages.com', role: 'Admin', lastActive: '2 mins ago', status: 'Active', avatar: 'PN' },
  { id: '2', name: 'James Wilson', email: 'manager@vsabeverages.com', role: 'Manager', lastActive: '1 hour ago', status: 'Active', avatar: 'JW' },
  { id: '3', name: 'Sarah Chen', email: 'finance@vsabeverages.com', role: 'Finance', lastActive: '3 hours ago', status: 'Offline', avatar: 'SC' },
  { id: '4', name: 'Zane Roy', email: 'staff@vsabeverages.com', role: 'Staff', lastActive: '5 mins ago', status: 'Active', avatar: 'ZR' },
  { id: '5', name: 'Maya George', email: 'maya@vsabeverages.com', role: 'Staff', lastActive: 'Yesterday', status: 'Offline', avatar: 'MG' },
]

const AUDIT_LOGS = [
  { id: 1, action: 'Finance generated Invoice #102', time: '12:45 PM' },
  { id: 2, action: 'Manager updated inventory', time: '11:20 AM' },
  { id: 3, action: 'Admin changed system settings', time: '09:15 AM' },
  { id: 4, action: 'Staff #ZR started production batch', time: '08:30 AM' },
]

function Employees() {
  const [query, setQuery] = useState('')

  const filteredUsers = useMemo(() => {
    return USERS.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) || 
      user.email.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-50 text-purple-700 border-purple-100'
      case 'Manager': return 'badge-info'
      case 'Finance': return 'badge-success'
      case 'Staff': return 'badge-warning'
      default: return ''
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access & Security</h1>
        <p className="text-sm font-semibold text-slate-500">System-wide user control and authentication logs.</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: '1,284', icon: Users, color: 'text-[#1e3a8a]' },
          { label: 'Uptime', value: '99.99%', icon: Activity, color: 'text-teal-600' },
          { label: 'Requests', value: '3', icon: Clock, color: 'text-amber-600' },
          { label: 'Alerts', value: '0', icon: AlertCircle, color: 'text-slate-400' },
        ].map((kpi, i) => (
          <div key={i} className="vsa-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <kpi.icon className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Section: User Management Table */}
        <div className="flex-1 vsa-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
            <h2 className="text-lg font-black text-slate-900">User Directory</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 focus:border-[#1e3a8a] outline-none w-64 transition-all"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button className="btn-primary py-2 px-4 text-xs">
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Identity</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[11px] font-black text-[#1e3a8a] border border-slate-200">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none mb-1">{user.name}</p>
                          <p className="text-[11px] font-semibold text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{user.lastActive}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-teal-500' : 'bg-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-600">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: System Audit Log */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="vsa-card p-6 bg-white">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Security Audit
            </h3>
            
            <div className="space-y-6">
              {AUDIT_LOGS.map((log) => (
                <div key={log.id} className="relative pl-5 pb-6 last:pb-0">
                  <div className="absolute left-[2px] top-1.5 bottom-0 w-[1px] bg-slate-100 last:hidden" />
                  <div className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-slate-300" />
                  
                  <p className="text-[11px] font-bold text-slate-900 leading-relaxed">
                    {log.action}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                    {log.time}
                  </p>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
              Full Logs
            </button>
          </div>

          <div className="bg-[#0f172a] p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-teal-400 fill-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">Encryption Active</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-4 leading-relaxed">
              All administrative actions are cryptographically signed and immutable.
            </p>
            <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
              <CheckCircle2 className="w-3 h-3" />
              Secure Protocol V4.2
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Employees
