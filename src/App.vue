<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  // Initialize authentication
  authStore.initializeAuth()

  // Initialize settings
  settingsStore.initializeSettings()
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
