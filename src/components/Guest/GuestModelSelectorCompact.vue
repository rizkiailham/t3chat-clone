<template>
  <div class="flex items-center space-x-2">
    <!-- Provider Dropdown -->
    <div class="relative">
      <select
        v-model="selectedProvider"
        @change="onProviderChange"
        class="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
      >
        <option
          v-for="provider in availableProviders"
          :key="provider.id"
          :value="provider.id"
        >
          {{ provider.name }}
        </option>
      </select>
      <ChevronDownIcon class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>

    <!-- Model Dropdown -->
    <div class="relative">
      <select
        v-model="selectedModel"
        @change="onModelChange"
        :disabled="!selectedProvider || !currentProviderModels.length"
        class="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option
          v-for="model in currentProviderModels"
          :key="model.id"
          :value="model.id"
        >
          {{ model.name }}
        </option>
      </select>
      <ChevronDownIcon class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>

    <!-- Apply Button (only show if changes) -->
    <button
      v-if="hasChanges"
      @click="applyChanges"
      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
      title="Apply model changes"
    >
      <CheckIcon class="w-4 h-4" />
      <span class="hidden sm:inline">Apply</span>
    </button>

    <!-- Current Model Indicator (when no changes) -->
    <div v-else class="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
      <span class="hidden sm:inline">Current:</span>
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
        {{ guestChatStore.currentModel.provider }}
      </span>
      <span class="hidden md:inline">{{ guestChatStore.currentModel.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useGuestChatStore } from '../../stores/guest-chat'
import type { LLMProvider } from '../../types'

const guestChatStore = useGuestChatStore()

const selectedProvider = ref('')
const selectedModel = ref('')
const availableProviders = ref<LLMProvider[]>([])

const currentProviderModels = computed(() => {
  const provider = availableProviders.value.find(p => p.id === selectedProvider.value)
  return provider?.models || []
})

const hasChanges = computed(() => {
  return selectedProvider.value !== guestChatStore.currentModel.provider ||
         selectedModel.value !== guestChatStore.currentModel.name
})

onMounted(() => {
  // Load available providers
  availableProviders.value = guestChatStore.getAvailableProviders()
  
  // Set current selection
  selectedProvider.value = guestChatStore.currentModel.provider
  selectedModel.value = guestChatStore.currentModel.name
  
  console.log('🎭 Compact guest model selector mounted:', {
    providers: availableProviders.value.length,
    currentModel: guestChatStore.currentModel
  })
})

function onProviderChange() {
  // Reset model when provider changes
  selectedModel.value = ''
  
  // Auto-select first model if available
  if (currentProviderModels.value.length > 0) {
    selectedModel.value = currentProviderModels.value[0].id
  }
}

function onModelChange() {
  // Model selection handled by v-model
}

function applyChanges() {
  if (selectedProvider.value && selectedModel.value) {
    guestChatStore.setModel(selectedProvider.value, selectedModel.value)
    console.log('🎭 Guest model updated (compact):', selectedProvider.value, selectedModel.value)
  }
}
</script>
