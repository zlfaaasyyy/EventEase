// import { createContext, useContext, useState, useEffect } from 'react'
// import { authAPI } from '../services/api'

// const AuthContext = createContext(null)

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     try {
//       const stored = localStorage.getItem('user')
//       return stored ? JSON.parse(stored) : null
//     } catch {
//       return null
//     }
//   })
//   const [loading, setLoading] = useState(false)

//   const login = async (email, password) => {
//     setLoading(true)
//     try {
//       const res = await authAPI.login({ email, password })
//       const { access_token, user: userData } = res.data
//       localStorage.setItem('token', access_token)
//       localStorage.setItem('user', JSON.stringify(userData))
//       setUser(userData)
//       return { success: true, user: userData }
//     } catch (err) {
//       return { success: false, error: err.response?.data?.detail || 'Login failed' }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const register = async (data) => {
//     setLoading(true)
//     try {
//       const res = await authAPI.register(data)
//       return { success: true, data: res.data }
//     } catch (err) {
//       return { success: false, error: err.response?.data?.detail || 'Registration failed' }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const logout = () => {
//     localStorage.removeItem('token')
//     localStorage.removeItem('user')
//     setUser(null)
//   }

//   const isAdmin = user?.role === 'admin'
//   const isOrganizer = user?.role === 'organizer'
//   const isUser = user?.role === 'user'

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isOrganizer, isUser }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext)
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider')
//   return ctx
// }

import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

// FastAPI returns `detail` as a plain string for most errors (400/401/403),
// but as an array of validation objects for 422 (Pydantic) errors.
// This normalizes both shapes into a single safe string so React never
// tries to render an object/array directly as a child.
function extractErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail

  if (!detail) return fallback

  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return detail
      .map((d) => d.msg || JSON.stringify(d))
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
      const { access_token, user: userData } = res.data
      localStorage.setItem('token', access_token)
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