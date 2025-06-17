import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthService } from '../services/auth.service'
import type { User } from '../types'

const authService = new AuthService()

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<any | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isGuestMode = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const canUseApp = computed(() => isAuthenticated.value || isGuestMode.value)

  async function signInWithGoogle() {
    try {
      loading.value = true
      error.value = null
      await authService.signInWithGoogle()
    } catch (err: any) {
      error.value = err.message || 'Failed to sign in'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    try {
      loading.value = true
      error.value = null

      // If in guest mode, just clear local state
      if (isGuestMode.value) {
        console.log('🎭 Signing out from guest mode')
        disableGuestMode()
      } else {
        await authService.signOut()
      }

      user.value = null
      session.value = null
      isGuestMode.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to sign out'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function enableGuestMode() {
    console.log('🎭 Enabling guest mode')
    console.log('🎭 Current state before enabling guest mode:', {
      isAuthenticated: isAuthenticated.value,
      isGuestMode: isGuestMode.value,
      hasUser: !!user.value,
      hasSession: !!session.value
    })

    // Clear auth state
    isGuestMode.value = true
    user.value = null
    session.value = null
    error.value = null

    // Initialize guest chat store with fresh state
    try {
      const { useGuestChatStore } = await import('./guest-chat')
      const guestChatStore = useGuestChatStore()
      guestChatStore.initializeGuestMode()
    } catch (importError) {
      console.warn('⚠️ Could not initialize guest chat store:', importError)
    }

    console.log('🎭 Guest mode enabled successfully')
    console.log('🎭 New state after enabling guest mode:', {
      isAuthenticated: isAuthenticated.value,
      isGuestMode: isGuestMode.value,
      canUseApp: canUseApp.value
    })
  }

  function disableGuestMode() {
    console.log('🎭 Disabling guest mode')
    isGuestMode.value = false
  }

  async function getCurrentUser() {
    try {
      // Don't make API calls if in guest mode
      if (isGuestMode.value) {
        console.log('🎭 In guest mode, skipping getCurrentUser API call')
        return null
      }

      loading.value = true
      error.value = null
      const currentUser = await authService.getCurrentUser()
      user.value = currentUser
      return currentUser
    } catch (err: any) {
      error.value = err.message || 'Failed to get current user'
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function getSession() {
    try {
      // Don't make API calls if in guest mode
      if (isGuestMode.value) {
        console.log('🎭 In guest mode, skipping getSession API call')
        return null
      }

      const currentSession = await authService.getSession()
      session.value = currentSession
      return currentSession
    } catch (err: any) {
      error.value = err.message || 'Failed to get session'
      session.value = null
      return null
    }
  }

  async function initializeAuth() {
    try {
      console.log('🔐 Initializing authentication...')

      // Don't initialize auth if already in guest mode
      if (isGuestMode.value) {
        console.log('🎭 Already in guest mode, skipping auth initialization')
        return
      }

      // Get initial session first
      const currentSession = await getSession()

      if (currentSession) {
        console.log('✅ Found existing session')
        await getCurrentUser()
      } else {
        console.log('❌ No existing session found')
      }

      // Then listen to auth state changes
      authService.onAuthStateChange(async (event, newSession) => {
        // Don't handle auth state changes if in guest mode
        if (isGuestMode.value) {
          console.log('🎭 In guest mode, ignoring auth state change:', event)
          return
        }

        console.log('🔐 Auth state change:', event, !!newSession)
        session.value = newSession

        if (event === 'SIGNED_IN' && newSession) {
          console.log('✅ User signed in')
          await getCurrentUser()
        } else if (event === 'SIGNED_OUT') {
          console.log('❌ User signed out')
          user.value = null
          session.value = null
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          console.log('🔄 Token refreshed')
          await getCurrentUser()
        }
      })

      console.log('✅ Authentication initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize auth:', error)
    }
  }

  // Enhanced method to refresh authentication state with retry logic
  async function refreshAuth(skipChatRefresh: boolean = false) {
    try {
      console.log('🔄 Refreshing authentication state...', { skipChatRefresh })

      // Don't refresh auth if in guest mode
      if (isGuestMode.value) {
        console.log('🎭 In guest mode, skipping auth refresh')
        return
      }

      // First try to refresh the session
      try {
        await authService.refreshSession()
        console.log('✅ Session refreshed')

        // Notify chat store about token refresh without triggering full refresh
        if (skipChatRefresh) {
          try {
            const { useChatStore } = await import('./chat')
            const chatStore = useChatStore()
            chatStore.handleTokenRefresh()
          } catch (importError) {
            console.log('⚠️ Could not notify chat store about token refresh:', importError)
          }
        }
      } catch (sessionError) {
        console.log('⚠️ Session refresh failed:', sessionError)
      }

      // Then get current session
      const currentSession = await getSession()
      if (currentSession) {
        // Try to get current user with retry logic
        const currentUser = await getCurrentUser()
        if (currentUser) {
          console.log('✅ Authentication refreshed successfully')
        } else {
          console.log('⚠️ Session exists but user not found')
          user.value = null
          session.value = null
        }
      } else {
        console.log('❌ No session found during refresh')
        user.value = null
        session.value = null
      }
    } catch (error) {
      console.error('❌ Failed to refresh auth:', error)
      user.value = null
      session.value = null
    }
  }

  // Lightweight token refresh that doesn't trigger chat state refresh
  async function refreshTokenOnly() {
    try {
      // Don't make API calls if in guest mode
      if (isGuestMode.value) {
        console.log('🎭 In guest mode, skipping token refresh API call')
        return
      }

      console.log('🔑 Refreshing token only...')
      await authService.refreshSession()

      // Notify chat store about token refresh
      try {
        const { useChatStore } = await import('./chat')
        const chatStore = useChatStore()
        chatStore.handleTokenRefresh()
      } catch (importError) {
        console.log('⚠️ Could not notify chat store about token refresh:', importError)
      }

      console.log('✅ Token refreshed successfully')
    } catch (error) {
      console.error('❌ Failed to refresh token:', error)
      throw error
    }
  }

  function clearError() {
    error.value = null
  }

  // Handle auth callback
  async function handleAuthCallback(): Promise<User | null> {
    try {
      console.log('🔍 Handling auth callback...')
      return await authService.handleAuthCallback()
    } catch (error) {
      console.error('❌ Failed to handle auth callback:', error)
      return null
    }
  }

  return {
    // State
    user,
    session,
    loading,
    error,
    isGuestMode,

    // Getters
    isAuthenticated,
    canUseApp,

    // Actions
    signInWithGoogle,
    signOut,
    getCurrentUser,
    getSession,
    initializeAuth,
    refreshAuth,
    refreshTokenOnly,
    handleAuthCallback,
    clearError,
    enableGuestMode,
    disableGuestMode
  }
})
