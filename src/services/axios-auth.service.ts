import axios from 'axios'
import type { User } from '../types'

// Axios-based authentication service that bypasses Supabase client
export class AxiosAuthService {
  private baseURL: string
  private apiKey: string
  private authURL: string
  private userCache: User | null = null
  private sessionCache: any = null
  private cacheTimestamp: number = 0
  private readonly CACHE_DURATION = 30000 // 30 seconds

  constructor() {
    this.baseURL = import.meta.env.VITE_SUPABASE_URL
    this.apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    this.authURL = `${this.baseURL}/auth/v1`
    
    console.log('🔧 AxiosAuthService initialized')
  }

  // Get current session using direct Supabase Auth API
  async getSession(): Promise<any> {
    try {
      console.log('🔍 Getting session via Axios...')
      
      // Check cache first
      if (this.sessionCache && this.isCacheValid()) {
        console.log('✅ Using cached session')
        return this.sessionCache
      }

      const response = await axios.get(`${this.authURL}/user`, {
        headers: {
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.getStoredToken()}`
        },
        timeout: 10000
      })

      if (response.data) {
        this.sessionCache = {
          access_token: this.getStoredToken(),
          user: response.data
        }
        this.cacheTimestamp = Date.now()
        console.log('✅ Session retrieved via Axios')
        return this.sessionCache
      }

      return null
    } catch (error: any) {
      console.error('❌ Failed to get session via Axios:', error.message)
      
      // Try to refresh token if 401
      if (error.response?.status === 401) {
        return await this.refreshSession()
      }
      
      return null
    }
  }

  // Refresh session using direct API
  async refreshSession(): Promise<any> {
    try {
      console.log('🔄 Refreshing session via Axios...')
      
      const refreshToken = this.getStoredRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post(`${this.authURL}/token?grant_type=refresh_token`, {
        refresh_token: refreshToken
      }, {
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      if (response.data.access_token) {
        // Store new tokens
        this.storeTokens(response.data.access_token, response.data.refresh_token)
        
        this.sessionCache = response.data
        this.cacheTimestamp = Date.now()
        
        console.log('✅ Session refreshed via Axios')
        return response.data
      }

      throw new Error('No access token in refresh response')
    } catch (error: any) {
      console.error('❌ Failed to refresh session via Axios:', error.message)
      this.clearCache()
      this.clearStoredTokens()
      return null
    }
  }

  // Get current user with Axios
  async getCurrentUser(forceRefresh = false): Promise<User | null> {
    try {
      // Check cache first
      if (!forceRefresh && this.userCache && this.isCacheValid()) {
        console.log('✅ Using cached user data')
        return this.userCache
      }

      console.log('🔍 Getting current user via Axios...')
      
      // Get session first
      const session = await this.getSession()
      if (!session) {
        console.log('❌ No session available')
        return null
      }

      // Get user profile from our database
      const userResponse = await axios.get(`${this.baseURL}/rest/v1/users`, {
        headers: {
          'apikey': this.apiKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        params: {
          'id': `eq.${session.user.id}`,
          'select': '*'
        },
        timeout: 10000
      })

      if (userResponse.data && userResponse.data.length > 0) {
        const user = userResponse.data[0]
        this.userCache = user
        this.cacheTimestamp = Date.now()
        console.log('✅ User retrieved via Axios:', user.email)
        return user
      }

      // If user doesn't exist, create them
      console.log('⚠️ User not found in database, creating...')
      return await this.createUser(session.user)

    } catch (error: any) {
      console.error('❌ Failed to get current user via Axios:', error.message)
      
      // Try refresh on auth error
      if (error.response?.status === 401) {
        const refreshed = await this.refreshSession()
        if (refreshed) {
          return await this.getCurrentUser(true)
        }
      }
      
      return null
    }
  }

  // Create user in database
  async createUser(authUser: any): Promise<User> {
    try {
      console.log('🔍 Creating user via Axios...')
      
      const session = await this.getSession()
      if (!session) {
        throw new Error('No session available for user creation')
      }

      const newUser = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        avatar_url: authUser.user_metadata?.avatar_url || null,
      }

      const response = await axios.post(`${this.baseURL}/rest/v1/users`, newUser, {
        headers: {
          'apikey': this.apiKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        timeout: 10000
      })

      const createdUser = Array.isArray(response.data) ? response.data[0] : response.data
      this.userCache = createdUser
      this.cacheTimestamp = Date.now()
      
      console.log('✅ User created via Axios:', createdUser.email)
      return createdUser

    } catch (error: any) {
      console.error('❌ Failed to create user via Axios:', error.message)
      throw error
    }
  }

  // Sign in with Google (redirect to Supabase OAuth)
  async signInWithGoogle(): Promise<void> {
    const redirectURL = `${window.location.origin}/auth/callback`
    const authURL = `${this.authURL}/authorize?provider=google&redirect_to=${encodeURIComponent(redirectURL)}`
    
    console.log('🔍 Redirecting to Google OAuth via Axios auth URL')
    window.location.href = authURL
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      console.log('🔍 Signing out via Axios...')
      
      const token = this.getStoredToken()
      if (token) {
        await axios.post(`${this.authURL}/logout`, {}, {
          headers: {
            'apikey': this.apiKey,
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        })
      }

      this.clearCache()
      this.clearStoredTokens()
      
      console.log('✅ Signed out successfully')
    } catch (error: any) {
      console.error('❌ Sign out error:', error.message)
      // Clear local state anyway
      this.clearCache()
      this.clearStoredTokens()
    }
  }

  // Handle OAuth callback
  async handleAuthCallback(): Promise<User | null> {
    try {
      console.log('🔍 Handling auth callback via Axios...')
      
      // Extract tokens from URL
      const urlParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      
      const accessToken = hashParams.get('access_token') || urlParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token')
      
      if (accessToken && refreshToken) {
        console.log('✅ Tokens found in URL')
        
        // Store tokens
        this.storeTokens(accessToken, refreshToken)
        
        // Get user
        const user = await this.getCurrentUser(true)
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname)
        
        return user
      }

      throw new Error('No tokens found in callback URL')
    } catch (error: any) {
      console.error('❌ Auth callback error:', error.message)
      return null
    }
  }

  // Token management
  private getStoredToken(): string | null {
    return localStorage.getItem('supabase.auth.token')
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('supabase.auth.refresh_token')
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('supabase.auth.token', accessToken)
    localStorage.setItem('supabase.auth.refresh_token', refreshToken)
  }

  private clearStoredTokens(): void {
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('supabase.auth.refresh_token')
  }

  // Cache management
  private isCacheValid(): boolean {
    return this.cacheTimestamp > 0 && 
           (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION
  }

  private clearCache(): void {
    this.userCache = null
    this.sessionCache = null
    this.cacheTimestamp = 0
  }

  // Get access token for other services
  async getAccessToken(): Promise<string | null> {
    const session = await this.getSession()
    return session?.access_token || null
  }
}

// Create singleton instance
export const axiosAuthService = new AxiosAuthService()
