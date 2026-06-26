import { useEffect } from 'react'
import { supabase, isSupabaseConnected } from '../lib/supabase'
import useStore from '../store/useStore'

const MOCK_PROFILES = {
  'admin@test.com': {
    id: 'mock-admin-id',
    full_name: 'Admin Usuario',
    role: 'admin',
    avatar_url: null,
  },
  'user@test.com': {
    id: 'mock-user-id',
    full_name: 'María González',
    role: 'member',
    avatar_url: null,
  },
}

export default function useAuth() {
  const { setUser, setProfile, logout } = useStore()

  useEffect(() => {
    if (!isSupabaseConnected()) {
      // Restore mock session from sessionStorage
      const saved = sessionStorage.getItem('mock_user')
      if (saved) {
        try {
          const { user, profile } = JSON.parse(saved)
          setUser(user)
          setProfile(profile)
        } catch (_) {}
      }
      return
    }

    // Real Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          logout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }

  // Mock login for when Supabase is not connected
  async function mockLogin(email, password) {
    const validCreds = {
      'admin@test.com': 'admin123',
      'user@test.com':  'user123',
    }
    if (validCreds[email] && validCreds[email] === password) {
      const mockUser = { id: MOCK_PROFILES[email].id, email }
      const mockProfile = MOCK_PROFILES[email]
      setUser(mockUser)
      setProfile(mockProfile)
      sessionStorage.setItem('mock_user', JSON.stringify({ user: mockUser, profile: mockProfile }))
      return { user: mockUser, profile: mockProfile, error: null }
    }
    return { user: null, profile: null, error: 'invalid_credentials' }
  }

  async function signIn(email, password) {
    if (!isSupabaseConnected()) {
      return mockLogin(email, password)
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { user: data?.user, error }
  }

  async function signOut() {
    if (!isSupabaseConnected()) {
      sessionStorage.removeItem('mock_user')
      logout()
      return
    }
    await supabase.auth.signOut()
    logout()
  }

  return { signIn, signOut }
}
