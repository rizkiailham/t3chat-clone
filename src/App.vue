<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// Global browser state handlers
let visibilityChangeHandler: (() => void) | null = null
let beforeUnloadHandler: (() => void) | null = null

onMounted(() => {
  console.log('🚀 App mounted - initializing global state management')

  // Initialize authentication
  authStore.initializeAuth()

  // Initialize settings
  settingsStore.initializeSettings()

  // Add global visibility change handler
  visibilityChangeHandler = () => {
    console.log('👁️ Global visibility changed:', document.visibilityState)
    if (document.visibilityState === 'visible') {
      if (authStore.isGuestMode) {
        console.log('🎭 App became visible but in guest mode, skipping auth refresh')
      } else if (authStore.isAuthenticated) {
        console.log('🔄 App became visible and user authenticated, light auth refresh...')
        // Light refresh auth state when app becomes visible (no chat refresh)
        authStore.refreshTokenOnly().catch(console.error)
      } else {
        console.log('🔄 App became visible but user not authenticated, skipping auth refresh')
      }
    }
  }

  // Add beforeunload handler to save state
  beforeUnloadHandler = () => {
    console.log('💾 App unloading, saving state...')
    // Settings are automatically saved via localStorage
  }

  // Add event listeners
  document.addEventListener('visibilitychange', visibilityChangeHandler)
  window.addEventListener('beforeunload', beforeUnloadHandler)

  console.log('✅ Global event listeners added')
})

onUnmounted(() => {
  console.log('🧹 App unmounting, cleaning up global event listeners')

  // Remove event listeners
  if (visibilityChangeHandler) {
    document.removeEventListener('visibilitychange', visibilityChangeHandler)
  }
  if (beforeUnloadHandler) {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
  }
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
    <RouterView />
  </div>
</template>

<style>
html {
  font-family: 'Inter', system-ui, sans-serif;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
