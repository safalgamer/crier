import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useStore } from './store/useStore'
import './styles/App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const setStoreUser = useStore((state) => state.setUser)

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setStoreUser(session?.user || null)
      setLoading(false)
    }

    checkSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      setStoreUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [setStoreUser])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#060809',
        color: '#d4cfc8',
        fontFamily: "'Rajdhani', sans-serif",
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-glow"></div>
      <div className="corner corner-tl"></div>
      <div className="corner corner-tr"></div>
      <div className="corner corner-bl"></div>
      <div className="corner corner-br"></div>
      {user ? <Dashboard user={user} /> : <Login />}
    </>
  )
}

