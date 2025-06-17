<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
        <CpuChipIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">AI Model Selection</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 truncate">Choose your preferred AI provider and model</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Provider Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          AI Provider
        </label>
        <select
          v-model="selectedProvider"
          @change="onProviderChange"
          class="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-base sm:text-sm touch-manipulation"
        >
          <option value="">Select provider...</option>
          <option
            v-for="provider in availableProviders"
            :key="provider.id"
            :value="provider.id"
          >
            {{ provider.name }}
          </option>
        </select>
      </div>

      <!-- Model Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Model
        </label>
        <select
          v-model="selectedModel"
          @change="onModelChange"
          :disabled="!selectedProvider || !currentProviderModels.length"
          class="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm touch-manipulation"
        >
          <option value="">Select model...</option>
          <option
            v-for="model in currentProviderModels"
            :key="model.id"
            :value="model.id"
          >
            {{ model.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Model Description -->
    <div v-if="selectedModelInfo" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
      <div class="flex items-start space-x-2">
        <InformationCircleIcon class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <p class="text-sm font-medium text-blue-900 dark:text-blue-100">{{ selectedModelInfo.name }}</p>
          <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">{{ selectedModelInfo.description }}</p>
          <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Context: {{ formatContextLength(selectedModelInfo.context_length) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Current Selection Display -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
      <div class="flex items-center space-x-2 flex-wrap">
        <span class="text-sm text-gray-600 dark:text-gray-400">Active Model:</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          {{ guestChatStore.currentModel.provider }}
        </span>
        <span class="text-sm text-gray-700 dark:text-gray-300 truncate">
          {{ guestChatStore.currentModel.name }}
        </span>
      </div>

      <!-- Test Guest Chat Button -->
      <button
        @click="testGuestChat"
        class="w-full sm:w-auto px-4 py-2.5 sm:px-3 sm:py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 touch-manipulation"
        title="Test chat with current model"
      >
        <span>🧪</span>
        <span>Test Chat</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CpuChipIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { useGuestChatStore } from '../../stores/guest-chat'
import type { LLMProvider } from '../../types'

const guestChatStore = useGuestChatStore()

// Define emits
const emit = defineEmits<{
  'test-message': [message: string]
}>()

const selectedProvider = ref('')
const selectedModel = ref('')
const availableProviders = ref<LLMProvider[]>([])

const currentProviderModels = computed(() => {
  const provider = availableProviders.value.find(p => p.id === selectedProvider.value)
  return provider?.models || []
})

const selectedModelInfo = computed(() => {
  return currentProviderModels.value.find(m => m.id === selectedModel.value)
})

onMounted(() => {
  // Load available providers
  availableProviders.value = guestChatStore.getAvailableProviders()
  
  // Set current selection
  selectedProvider.value = guestChatStore.currentModel.provider
  selectedModel.value = guestChatStore.currentModel.name
  
  console.log('🎭 Guest model selector mounted:', {
    providers: availableProviders.value.length,
    currentModel: guestChatStore.currentModel
  })
})

function onProviderChange() {
  // Reset model when provider changes
  selectedModel.value = ''

  // Auto-select first model if available and apply immediately
  if (currentProviderModels.value.length > 0) {
    selectedModel.value = currentProviderModels.value[0].id
    applyChanges()
  }
}

function onModelChange() {
  // Apply model change immediately when user selects
  if (selectedProvider.value && selectedModel.value) {
    applyChanges()
  }
}

function applyChanges() {
  if (selectedProvider.value && selectedModel.value) {
    guestChatStore.setModel(selectedProvider.value, selectedModel.value)
    console.log('🎭 Guest model updated:', selectedProvider.value, selectedModel.value)
  }
}

function testGuestChat() {
  console.log('🧪 Testing guest chat with current model:', guestChatStore.currentModel)

  // Send a test message directly (same API as authenticated users)
  const testMessage = `Hello! This is a test message using ${guestChatStore.currentModel.provider} ${guestChatStore.currentModel.name}. Please respond to confirm the connection is working.`

  // Emit event to parent to send the test message
  emit('test-message', testMessage)
}

function formatContextLength(length: number): string {
  if (length >= 1000000) {
    return `${(length / 1000000).toFixed(1)}M tokens`
  } else if (length >= 1000) {
    return `${(length / 1000).toFixed(0)}K tokens`
  }
  return `${length} tokens`
}
</script>
