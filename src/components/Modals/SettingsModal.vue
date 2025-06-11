<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Settings
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
        <div class="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="p-6 space-y-6">
            <!-- Theme Settings -->
            <div>
              <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
                Appearance
              </h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <div class="grid grid-cols-3 gap-3">
                    <button
                      v-for="theme in themes"
                      :key="theme.value"
                      @click="settingsStore.setTheme(theme.value)"
                      class="p-3 border rounded-lg text-sm font-medium transition-colors"
                      :class="settingsStore.settings.theme === theme.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
                    >
                      <component :is="theme.icon" class="w-5 h-5 mx-auto mb-1" />
                      {{ theme.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Default Model Settings -->
            <div>
              <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
                Default Model
              </h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provider
                  </label>
                  <select
                    :value="settingsStore.settings.defaultProvider"
                    @change="onProviderChange"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option
                      v-for="provider in settingsStore.providers"
                      :key="provider.id"
                      :value="provider.id"
                    >
                      {{ provider.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model
                  </label>
                  <select
                    :value="settingsStore.settings.defaultModel"
                    @change="onModelChange"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
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
            </div>

            <!-- Chat Settings -->
            <div>
              <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
                Chat Settings
              </h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature: {{ settingsStore.settings.temperature }}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    :value="settingsStore.settings.temperature"
                    @input="onTemperatureChange"
                    class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  >
                  <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Focused</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="32000"
                    :value="settingsStore.settings.maxTokens"
                    @input="onMaxTokensChange"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    System Prompt
                  </label>
                  <textarea
                    :value="settingsStore.settings.systemPrompt"
                    @input="onSystemPromptChange"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter a system prompt to guide the AI's behavior..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div class="flex justify-between">
            <button
              @click="resetSettings"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  XMarkIcon, 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from '@heroicons/vue/24/outline'
import { useSettingsStore } from '../../stores/settings'

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()
const settingsStore = useSettingsStore()

const themes = [
  { value: 'light' as const, label: 'Light', icon: SunIcon },
  { value: 'dark' as const, label: 'Dark', icon: MoonIcon },
  { value: 'system' as const, label: 'System', icon: ComputerDesktopIcon }
]

const currentProviderModels = computed(() => {
  const provider = settingsStore.providers.find(p => p.id === settingsStore.settings.defaultProvider)
  return provider?.models || []
})

function onProviderChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const providerId = target.value
  const provider = settingsStore.providers.find(p => p.id === providerId)
  
  if (provider && provider.models.length > 0) {
    settingsStore.setDefaultModel(providerId, provider.models[0].id)
  }
}

function onModelChange(event: Event) {
  const target = event.target as HTMLSelectElement
  settingsStore.setDefaultModel(settingsStore.settings.defaultProvider, target.value)
}

function onTemperatureChange(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setTemperature(parseFloat(target.value))
}

function onMaxTokensChange(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setMaxTokens(parseInt(target.value))
}

function onSystemPromptChange(event: Event) {
  const target = event.target as HTMLTextAreaElement
  settingsStore.setSystemPrompt(target.value)
}

function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    settingsStore.resetSettings()
  }
}
</script>
