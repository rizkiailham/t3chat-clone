<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <div class="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
        <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {{ status }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        {{ message }}
      </p>
      
      <!-- Error state -->
      <div v-if="error" class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md">
        <div class="flex items-start">
          <ExclamationCircleIcon class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
          <div class="text-sm text-red-800 dark:text-red-200">
            {{ error }}
          </div>
        </div>
        <button
          @click="redirectToLogin"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'

const router = useRouter()
const authStore = useAuthStore()

const status = ref('Completing sign in...')
const message = ref('Please wait while we set up your account.')
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    console.log('🔐 Auth callback started via Axios...')

    status.value = 'Processing authentication...'
    message.value = 'Setting up your account...'

    // Handle auth callback using Axios service
    const user = await authStore.handleAuthCallback()

    if (user) {
      console.log('✅ User setup complete via Axios:', user.email)
      status.value = 'Success!'
      message.value = 'Redirecting to your dashboard...'

      // Initialize auth store with the new user
      await authStore.initializeAuth()

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      throw new Error('Failed to authenticate user')
    }
  } catch (err: any) {
    console.error('❌ Auth callback error:', err)
    error.value = err.message || 'Authentication failed'
    status.value = 'Authentication Failed'
    message.value = 'There was a problem signing you in. Please try again.'
  }
})

function redirectToLogin() {
  router.push('/login')
}
</script>
