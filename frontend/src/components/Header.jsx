import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, LogOut, Sun, Moon } from 'lucide-react'
import { getUser, logout } from '../utils/auth'
import { logoutAPI } from '../services/api'
import { useTheme } from '../utils/theme.jsx'

function Header() {
  const navigate = useNavigate()
  const user = getUser()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { darkMode, toggleTheme } = useTheme()

  const handleLogout = async () => {
    try { await logoutAPI() } catch (e) { console.error(e) }
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 shadow-sm transition-colors duration-300"
  style={{ backgroundColor: darkMode ? '#3b0764' : 'white', borderBottom: darkMode ? '1px solid #581c87' : '1px solid #e5e7eb' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">FactLens</h1>
              <p className="text-xs mt-0.5" style={{ color: darkMode ? '#d8b4fe' : '#6b7280' }}>Verify before you share</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <img
                  src={user?.avatar_url || "https://ui-avatars.com/api/?name=User&background=9333ea&color=fff"}
                  alt={user?.username || 'User'}
                  className="w-8 h-8 rounded-full ring-2 ring-purple-200"
                />
                <span className="text-sm font-medium hidden sm:block" style={{ color: darkMode ? '#e9d5ff' : '#374151' }}>
  {user?.username || 'User'}
</span>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header