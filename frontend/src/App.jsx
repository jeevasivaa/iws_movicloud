import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRouter from './routes/AppRouter'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2800,
            style: {
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              color: '#111827',
            },
          }}
        />
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
