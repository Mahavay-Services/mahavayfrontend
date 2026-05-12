import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/profile')
      setUser(response.data.data)
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, accessToken, refreshToken } = response.data.data
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)
      
      toast.success(`Welcome back, ${user.full_name}!`)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await api.post('/auth/logout', { refreshToken })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      navigate('/login')
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const hasRole = (...roles) => {
    return roles.includes(user?.role)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
