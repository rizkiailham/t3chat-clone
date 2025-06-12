import { supabase } from './supabase'
import { axiosAuthService } from './axios-auth.service'
import type { User } from '../types'

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
    return supabase.auth.onAuthStateChange(callback)
  }

  // Refresh session using Axios
  async refreshSession() {
    try {
      console.log('🔍 Refreshing session via Axios...')
      return await axiosAuthService.refreshSession()
    } catch (error) {
      console.error('Error refreshing session:', error)
      throw error
    }
  }
}
