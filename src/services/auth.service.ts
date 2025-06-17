import { supabase } from './supabase'
import { axiosAuthService } from './axios-auth.service'
import type { User } from '../types'

// Helper function to check if in guest mode
function isInGuestMode(): boolean {
  try {
    // Import the auth store to check guest mode
    const { useAuthStore } = require('../stores/auth')
    const authStore = useAuthStore()
    return authStore.isGuestMode
  } catch {
    return false
  }
}

export class AuthService {
  // Sign in with Google using Axios
  async signInWithGoogle() {
    try {
      console.log('🔍 Signing in with Google via Axios...')
      await axiosAuthService.signInWithGoogle()
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  // Sign out using Axios
  async signOut() {
    try {
      console.log('🔍 Signing out via Axios...')
      await axiosAuthService.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Get current session using Axios
  async getSession() {
    try {
      if (isInGuestMode()) {
        console.log('🎭 In guest mode, skipping getSession API call')
        return null
      }
      console.log('🔍 Getting session via Axios...')
      return await axiosAuthService.getSession()
    } catch (error) {
      console.error('Error getting session:', error)
      throw error
    }
  }

  // Get current user using Axios
  async getCurrentUser(forceRefresh = false): Promise<User | null> {
    try {
      if (isInGuestMode()) {
        console.log('🎭 In guest mode, skipping getCurrentUser API call')
        return null
      }
      console.log('🔍 Getting current user via Axios...')
      return await axiosAuthService.getCurrentUser(forceRefresh)
    } catch (error) {
      console.error('❌ Error getting current user:', error)
      return null
    }
  }

  // Handle auth callback using Axios
  async handleAuthCallback(): Promise<User | null> {
    try {
      console.log('🔍 Handling auth callback via Axios...')
      return await axiosAuthService.handleAuthCallback()
    } catch (error) {
      console.error('❌ Error handling auth callback:', error)
      return null
    }
  }

  // Listen to auth state changes (still using Supabase for real-time events)
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      // Don't trigger callback if in guest mode
      if (isInGuestMode()) {
        console.log('🎭 In guest mode, ignoring auth state change:', event)
        return
      }
      callback(event, session)
    })
  }

  // Refresh session using Axios
  async refreshSession() {
    try {
      if (isInGuestMode()) {
        console.log('🎭 In guest mode, skipping refreshSession API call')
        return null
      }
      console.log('🔍 Refreshing session via Axios...')
      return await axiosAuthService.refreshSession()
    } catch (error) {
      console.error('Error refreshing session:', error)
      throw error
    }
  }
}
