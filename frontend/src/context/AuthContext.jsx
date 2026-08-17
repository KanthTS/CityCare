import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('civicfix_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('civicfix_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(({ data }) => {
        setUser(data.user)
        localStorage.setItem('civicfix_user', JSON.stringify(data.user))
      })
      .catch(() => {
        localStorage.removeItem('civicfix_token')
        localStorage.removeItem('civicfix_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('civicfix_token', data.token)
    localStorage.setItem('civicfix_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload)
    localStorage.setItem('civicfix_token', data.token)
    localStorage.setItem('civicfix_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const updateUser = useCallback((updated) => {
    setUser(updated)
    localStorage.setItem('civicfix_user', JSON.stringify(updated))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('civicfix_token')
    localStorage.removeItem('civicfix_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
