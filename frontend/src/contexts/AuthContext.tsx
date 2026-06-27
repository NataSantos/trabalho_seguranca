import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { fetchMe } from '@/services/api'

interface User {
  id: number
  email: string
  name: string
  two_factor_enabled?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    // Validate session via httpOnly cookie — no token in localStorage
    fetchMe()
      .then((data) => {
        setUser(data)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  function login(newUser: User) {
    setUser(newUser)
  }

  async function logout() {
    setUser(null)
    // Clear the httpOnly cookie by calling an endpoint that removes it
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
