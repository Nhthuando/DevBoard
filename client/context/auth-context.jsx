import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth-storage'
import { getMe, login as loginRequest, register as registerRequest } from '@/services/authService'

const AuthContext = createContext(null)

async function requestCurrentUser() {
  const response = await getMe()
  return response?.user || null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getAccessToken()

    if (!token) {
      setUser(null)
      setIsLoading(false)
      return null
    }

    try {
      const currentUser = await requestCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch (error) {
      clearAccessToken()
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser().catch(() => {
      // refreshUser already reset state/token when failed.
    })
  }, [refreshUser])

  const login = useCallback(async (payload) => {
    setIsLoading(true)

    try {
      const response = await loginRequest(payload)

      if (!response?.token) {
        throw new Error('Khong nhan duoc token tu server')
      }

      setAccessToken(response.token)
      const currentUser = await requestCurrentUser()
      setUser(currentUser)

      return { response, user: currentUser }
    } catch (error) {
      clearAccessToken()
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    return registerRequest(payload)
  }, [])

  const logout = useCallback(() => {
    clearAccessToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth phai duoc su dung ben trong AuthProvider')
  }

  return context
}
