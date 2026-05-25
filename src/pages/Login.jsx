import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import useStore from '../store/useStore.js'

export default function Login() {
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [isSignup, setIsSignup]       = useState(false)
  const setUser = useStore((s) => s.setUser)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (isSignup && !name.trim()) {
      toast.error('Name is required')
      return
    }

    setIsLoading(true)
    try {
      const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login'
      const body     = isSignup ? { name: name.trim(), email, password } : { email, password }

      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!data.success) {
        toast.error(data.error || 'Authentication failed')
        return
      }

      if (data.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`)
        return
      }

      const { user, token } = data.data
      setUser({ ...user, token })
      toast.success(`Welcome${isSignup ? '' : ' back'}, ${user.name || user.email.split('@')[0]}!`)

      if (isSignup) {
        navigate('/onboarding')
      } else {
        try {
          const statusRes = await fetch('/api/user/onboarding/status', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const statusData = await statusRes.json()
          navigate(statusData.data?.needsOnboarding ? '/onboarding' : '/dashboard')
        } catch {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      toast.error('Connection error. Is the backend running?')
      console.error('[Login]', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">TS</span>
            </div>
            <span className="font-bold text-white text-2xl tracking-tight">
              Trend<span className="gradient-text">Spy</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isSignup ? 'Start hunting winning products today' : "Pakistan's #1 product hunting tool"}
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-gray-400">Password</label>
                {!isSignup && (
                  <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {isSignup && (
                <p className="text-xs text-gray-600 mt-1">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <FiArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/5 text-center">
            <button
              onClick={() => { setIsSignup(!isSignup); setName('') }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isSignup ? (
                <>Already have an account? <span className="text-primary-400">Sign in</span></>
              ) : (
                <>Don't have an account? <span className="text-primary-400">Sign up free</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
