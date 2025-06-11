<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Start New Chat
            </h3>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <form @submit.prevent="createChat" class="p-6 space-y-4">
          <!-- Chat Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chat Title
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="Enter a title for your chat..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
          </div>

          <!-- Provider Selection -->
          <div>
            <label for="provider" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Provider
            </label>
            <select
              id="provider"
              v-model="form.provider"
              @change="onProviderChange"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select a provider...</option>
              <option
                v-for="provider in settingsStore.providers"
                :key="provider.id"
                :value="provider.id"
              >
                {{ provider.name }}
              </option>
            </select>
          </div>

          <!-- Model Selection -->
          <div v-if="selectedProvider">
            <label for="model" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <select
              id="model"
              v-model="form.model"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select a model...</option>
              <option
                v-for="model in selectedProvider.models"
                :key="model.id"
                :value="model.id"
              >
                {{ model.name }}
                <span v-if="model.description" class="text-gray-500">
                  - {{ model.description }}
                </span>
              </option>
            </select>

            <!-- Model info -->
            <div v-if="selectedModel" class="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                <p v-if="selectedModel.description" class="mb-1">
                  {{ selectedModel.description }}
                </p>
                <p class="text-xs">
                  Context length: {{ selectedModel.context_length.toLocaleString() }} tokens
                </p>
              </div>
            </div>
          </div>

          <!-- API Key Warning -->
          <div v-if="selectedProvider?.requiresApiKey" class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div class="flex items-start">
              <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
              <div class="text-sm text-yellow-800 dark:text-yellow-200">
                <p class="font-medium">API Key Required</p>
                <p class="mt-1">
                  This provider requires an API key. Make sure you have configured your 
                  {{ selectedProvider.name }} API key in the environment variables.
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!canCreate"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useSettingsStore } from '../../stores/settings'

interface Emits {
  (e: 'close'): void
  (e: 'create', data: { title: string; provider: string; model: string }): void
}

const emit = defineEmits<Emits>()
const settingsStore = useSettingsStore()

const form = ref({
  title: '',
  provider: '',
  model: ''
})

const selectedProvider = computed(() => {
  return settingsStore.providers.find(p => p.id === form.value.provider)
})

const selectedModel = computed(() => {
  return selectedProvider.value?.models.find(m => m.id === form.value.model)
})

const canCreate = computed(() => {
  return form.value.title.trim() && form.value.provider && form.value.model
})

onMounted(() => {
  // Set default values from settings
  form.value.provider = settingsStore.settings.defaultProvider
  form.value.model = settingsStore.settings.defaultModel
  
  // Generate a default title
  const now = new Date()
  form.value.title = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
})

function onProviderChange() {
  // Reset model when provider changes
  form.value.model = ''
  
  // Auto-select first model if available
  if (selectedProvider.value?.models.length) {
    form.value.model = selectedProvider.value.models[0].id
  }
}

function createChat() {
  if (!canCreate.value) return
  
  emit('create', {
    title: form.value.title.trim(),
    provider: form.value.provider,
    model: form.value.model
  })
}
</script>
