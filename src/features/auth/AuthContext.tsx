import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  getCurrentUser,
  User,
} from '@/features/api'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Check auth status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    setState((s) => ({ ...s, isLoading: true }))
    try {
      const { data, error } = await getCurrentUser()
      if (data?.user && !error) {
        setState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await apiLogin(email, password)
    if (error) {
      return { error }
    }
    if (data?.user) {
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    }
    return {}
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    const { data, error } = await apiRegister(email, password, displayName)
    if (error) {
      return { error }
    }
    if (data?.user) {
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    }
    return {}
  }, [])

  const refreshUser = useCallback(async () => {
    await checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useUser(): User | null {
  const { user } = useAuth()
  return user
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}
