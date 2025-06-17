<template>
  <div class="w-full space-y-4">
    <!-- Progress Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <!-- Animated Icon -->
        <div class="relative">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <!-- Pulse Ring -->
          <div class="absolute inset-0 w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-20"></div>
        </div>

        <!-- Status Text -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">
            {{ statusText }}
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Processing your file...
          </p>
        </div>
      </div>

      <!-- Percentage -->
      <div class="text-right">
        <div class="text-lg font-bold text-gray-900 dark:text-white">
          {{ Math.round(progress) }}%
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Complete
        </div>
      </div>
    </div>

    <!-- Modern Progress Bar -->
    <div class="relative">
      <!-- Background Track -->
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <!-- Progress Fill with Gradient -->
        <div
          class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-500 ease-out relative"
          :style="{ width: `${progress}%` }"
        >
          <!-- Animated Shimmer Effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>

      <!-- Progress Indicator Dot -->
      <div
        class="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-full shadow-lg transition-all duration-500 ease-out"
        :style="{ left: `calc(${progress}% - 8px)` }"
      >
        <div class="w-2 h-2 bg-blue-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>

    <!-- Step Indicators -->
    <div v-if="showSteps" class="flex justify-between items-center">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="flex flex-col items-center space-y-2 flex-1"
      >
        <!-- Step Circle -->
        <div
          class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300"
          :class="{
            'bg-blue-500 border-blue-500 text-white': currentStep > index,
            'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-400 animate-pulse': currentStep === index,
            'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400': currentStep < index
          }"
        >
          <!-- Checkmark for completed steps -->
          <svg v-if="currentStep > index" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <!-- Step number for current/future steps -->
          <span v-else class="text-xs font-medium">{{ index + 1 }}</span>
        </div>

        <!-- Step Label -->
        <span
          class="text-xs font-medium text-center transition-colors duration-300"
          :class="{
            'text-blue-600 dark:text-blue-400': currentStep >= index,
            'text-gray-500 dark:text-gray-400': currentStep < index
          }"
        >
          {{ step }}
        </span>

        <!-- Connecting Line (except for last step) -->
        <div
          v-if="index < steps.length - 1"
          class="absolute top-4 h-0.5 transition-colors duration-300"
          :class="{
            'bg-blue-500': currentStep > index,
            'bg-gray-300 dark:bg-gray-600': currentStep <= index
          }"
          :style="{
            left: `${(100 / steps.length) * (index + 0.5)}%`,
            width: `${100 / steps.length}%`,
            transform: 'translateX(-50%)'
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  progress: number // 0-100
  statusText?: string
  showSteps?: boolean
  steps?: string[]
  currentStep?: number
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  statusText: 'Processing...',
  showSteps: false,
  steps: () => ['Upload', 'Process', 'Complete'],
  currentStep: 0
})

// Ensure progress is between 0 and 100
const progress = computed(() => {
  return Math.max(0, Math.min(100, props.progress))
})
</script>

<style scoped>
/* Custom animations */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}

.animate-pulse-ring {
  animation: pulse-ring 2s ease-out infinite;
}

/* Smooth transitions */
.progress-transition {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
