<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <ChatBubbleLeftRightIcon class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          T3 Chat Clone
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Chat with multiple AI models in one place
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Sign in to continue to your conversations
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-start">
            <ExclamationCircleIcon class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div class="text-sm text-red-800 dark:text-red-200">
              {{ authStore.error }}
            </div>
          </div>
        </div>

        <!-- Google Sign In Button -->
        <button
          @click="handleGoogleSignIn"
          :disabled="authStore.loading"
          class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!authStore.loading" class="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <div v-else class="w-5 h-5 mr-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          {{ authStore.loading ? 'Signing in...' : 'Continue with Google' }}
        </button>

        <!-- Features -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
            What you'll get:
          </h3>
          <div class="space-y-3">
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              Chat with multiple AI models (GPT-4, Claude, etc.)
            </div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              Sync conversations across devices
            </div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              Real-time streaming responses
            </div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              Dark mode and customizable settings
            </div>
          </div>
        </div>

        <!-- Privacy Notice -->
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            By signing in, you agree to our privacy policy. We only store your basic profile information and chat history.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Built for the T3 Chat Cloneathon
        </p>
        <div class="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
          <a href="#" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="#" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Terms of Service
          </a>
          <span>•</span>
          <a href="https://github.com" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  // Redirect if already authenticated
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

async function handleGoogleSignIn() {
  try {
    authStore.clearError()
    await authStore.signInWithGoogle()
    // The redirect will be handled by the auth callback
  } catch (error) {
    console.error('Sign in failed:', error)
  }
}
</script>
