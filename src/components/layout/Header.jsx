import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-secondary-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <button
          onClick={onMenuClick}
          className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 lg:flex-none" />

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {user?.full_name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-secondary-900">{user?.full_name}</p>
                <p className="text-xs text-secondary-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-secondary-400 hidden md:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-secondary-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-secondary-100">
                  <p className="text-sm font-medium text-secondary-900">{user?.full_name}</p>
                  <p className="text-xs text-secondary-500">{user?.email}</p>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                
                <div className="border-t border-secondary-100 mt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      logout()
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
