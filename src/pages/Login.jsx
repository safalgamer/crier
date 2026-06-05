import { useState } from 'react'
import { supabase } from '../supabase'
import '../styles/Login.css'

const CrierLogo = ({ size = 72 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lgold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e8c070" />
        <stop offset="100%" stopColor="#c8a55a" />
      </linearGradient>
      <linearGradient id="lcyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00d4ff" />
        <stop offset="100%" stopColor="#0099cc" />
      </linearGradient>
    </defs>
    <path d="M 148,58 A 62,62 0 1,0 148,142" fill="none" stroke="url(#lgold)" strokeWidth="16" strokeLinecap="square" />
    <path d="M 155,88 Q 163,94 155,100 Q 147,106 155,112" fill="none" stroke="url(#lcyan)" strokeWidth="4" strokeLinecap="round" />
    <path d="M 163,80 Q 176,90 163,100 Q 150,110 163,120" fill="none" stroke="url(#lcyan)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    <path d="M 171,72 Q 188,86 171,100 Q 154,114 171,128" fill="none" stroke="url(#lcyan)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <circle cx="152" cy="100" r="5" fill="#00d4ff" opacity="0.9" />
  </svg>
)

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Failed to sign in')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo"><CrierLogo size={72} /></div>
          <h1>CRIER</h1>
          <p className="login-subtitle">Announce to your Discord servers — without the bot tag.</p>
        </div>

        <div className="login-content">
          <button
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {error && (
            <div className="login-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="login-footer">
            <p>Free forever · No setup required</p>
            <p>Used by server admins and SMP owners</p>
          </div>
        </div>
      </div>
    </div>
  )
}

