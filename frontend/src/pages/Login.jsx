import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, CheckCircle, Loader2 } from 'lucide-react'
import { login } from '../services/api'
import { saveAuth, isAuthenticated } from '../utils/auth'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated()) navigate('/feed')
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password')
      return
    }
    setLoading(true)
    try {
      const response = await login(username, password)
      if (response.success) {
        saveAuth(response.token, response.user)
        navigate('/feed')
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">FactLens</h1>
          <p className="text-gray-600 text-sm">Automated Fact Checker for Vernacular News</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-scale-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome back</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username or Email</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                placeholder="Enter your username" disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="Enter your password" disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-xs text-purple-800 text-center">
              <span className="font-semibold">Prototype Notice:</span> Any non-empty username and password will work for this demo.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {[
              'Automated fact-checking with AI-powered verification',
              'Real-time detection of misinformation and outdated claims',
              'Multilingual support for vernacular news content'
            ].map((text, i) => (
              <div key={i} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Capstone Project — Automated Fact Checker
        </p>
      </div>
    </div>
  )
}

export default Login
