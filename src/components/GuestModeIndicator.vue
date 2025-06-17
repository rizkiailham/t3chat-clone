<template>
  <div class="hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
    <div class="flex items-start space-x-3">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <UserIcon class="w-6 h-6 text-amber-600 dark:text-amber-400" />
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Guest Mode
            </h3>
            <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
              🛡️ Protected guest mode - no API calls, no redirects, conversations not saved.
            </p>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="$emit('sign-in')"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800/30 hover:bg-amber-200 dark:hover:bg-amber-700/40 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowRightStartOnRectangleIcon class="w-3 h-3 mr-1" />
              Sign In
            </button>
            
            <button
              v-if="!collapsed"
              @click="collapsed = true"
              class="p-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded transition-all duration-200"
              title="Collapse"
            >
              <ChevronUpIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Expanded content -->
        <div v-if="!collapsed" class="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-700 dark:text-amber-300">
            <div class="flex items-center space-x-2">
              <CheckIcon class="w-3 h-3 text-green-600 dark:text-green-400" />
              <span>Chat with AI models</span>
            </div>
            <div class="flex items-center space-x-2">
              <CheckIcon class="w-3 h-3 text-green-600 dark:text-green-400" />
              <span>Upload images & PDFs</span>
            </div>
            <div class="flex items-center space-x-2">
              <XMarkIcon class="w-3 h-3 text-red-600 dark:text-red-400" />
              <span>Save conversation history</span>
            </div>
            <div class="flex items-center space-x-2">
              <XMarkIcon class="w-3 h-3 text-red-600 dark:text-red-400" />
              <span>Share conversations</span>
            </div>
          </div>
          
          <div class="mt-3 p-2 bg-amber-100 dark:bg-amber-800/20 rounded text-xs text-amber-700 dark:text-amber-300">
            <strong>💡 Tip:</strong> Sign in with Google to save your conversations and access them from any device.
          </div>
        </div>
        
        <!-- Collapsed state -->
        <div v-else class="mt-2">
          <button
            @click="collapsed = false"
            class="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 underline"
          >
            Show features comparison
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronUpIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

defineEmits<{
  'sign-in': []
}>()

const collapsed = ref(false)
</script>

<style scoped>
/* Add subtle animation for expand/collapse */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
