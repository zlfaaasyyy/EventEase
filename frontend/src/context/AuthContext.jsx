import { createContext, useContext, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

function extractErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : ''
        return field ? `${field}: ${d.msg}` : (d.msg || JSON.stringify(d))
      })
      .join(', ')
  }
  return fallback
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      const data = res.data

      // Backend return: { access_token, token_type, user: { id, name, email, role, status } }
      const token = data.access_token
      if (!token) {
        return { success: false, error: 'Token tidak ditemukan.' }
      }

      // Normalize user object — backend pakai "id", kita pakai keduanya
      const rawUser = data.user || {}
      const userData = {
        ...rawUser,
        user_id: rawUser.id || rawUser.user_id,  // support keduanya
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }

    } catch (err) {
      return { success: false, error: extractErrorMessage(err, 'Login failed') }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.register(data)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, 'Registration failed') }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isOrganizer = user?.role === 'organizer'
  const isUser = user?.role === 'user'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isOrganizer, isUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}