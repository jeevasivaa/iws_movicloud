import { Link } from 'react-router-dom'

function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-white">
      <h1 className="text-4xl font-bold mb-4">403 - Unauthorized</h1>
      <p className="text-slate-400 mb-8">You do not have permission to access this page.</p>
      <Link
        to="/dashboard"
        className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}

export default Unauthorized
