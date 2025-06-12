import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthService } from '../services/auth.service'
import type { User, AuthState } from '../types'

const authService = new AuthService()

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<any | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

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
      await authService.signOut()
      user.value = null
      session.value = null
    } catch (err: any) {
      error.value = err.message || 'Failed to sign out'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getCurrentUser() {
    try {
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

  // Add method to refresh authentication state
  async function refreshAuth() {
    try {
      console.log('🔄 Refreshing authentication state...')

      const currentSession = await getSession()
      if (currentSession) {
        await getCurrentUser()
        console.log('✅ Authentication refreshed successfully')
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

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    session,
    loading,
    error,

    // Getters
    isAuthenticated,

    // Actions
    signInWithGoogle,
    signOut,
    getCurrentUser,
    getSession,
    initializeAuth,
    refreshAuth,
    clearError
  }
})
