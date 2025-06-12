import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { LLMService } from '../services/llm.service'
import type { AppSettings, LLMProvider, SettingsState } from '../types'

const llmService = new LLMService()

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({
    theme: 'system',
    defaultModel: 'gemini-2.0-flash',
    defaultProvider: 'google',
    temperature: 0.7,
    maxTokens: 4000,
    systemPrompt: 'You are a helpful AI assistant.'
  })
  
  const providers = ref<LLMProvider[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentTheme = computed(() => {
    if (settings.value.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return settings.value.theme
  })

  const defaultProvider = computed(() => 
    providers.value.find(p => p.id === settings.value.defaultProvider)
  )

  const defaultModel = computed(() => 
    defaultProvider.value?.models.find(m => m.id === settings.value.defaultModel)
  )

  function loadProviders() {
    try {
      loading.value = true
      error.value = null
      providers.value = llmService.getProviders()
    } catch (err: any) {
      error.value = err.message || 'Failed to load providers'
    } finally {
      loading.value = false
    }
  }

  function updateSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()
  }

  function setTheme(theme: 'light' | 'dark' | 'system') {
    settings.value.theme = theme
    applyTheme()
    saveSettings()
  }

  function setDefaultModel(providerId: string, modelId: string) {
    settings.value.defaultProvider = providerId
    settings.value.defaultModel = modelId
    saveSettings()
  }

  function setTemperature(temperature: number) {
    settings.value.temperature = Math.max(0, Math.min(2, temperature))
    saveSettings()
  }

  function setMaxTokens(maxTokens: number) {
    settings.value.maxTokens = Math.max(1, Math.min(32000, maxTokens))
    saveSettings()
  }

  function setSystemPrompt(systemPrompt: string) {
    settings.value.systemPrompt = systemPrompt
    saveSettings()
  }

  function applyTheme() {
    const theme = currentTheme.value
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem('t3chat-settings', JSON.stringify(settings.value))
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem('t3chat-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        settings.value = { ...settings.value, ...parsed }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  function resetSettings() {
    settings.value = {
      theme: 'system',
      defaultModel: 'gpt-4o-mini',
      defaultProvider: 'openai',
      temperature: 0.7,
      maxTokens: 4000,
      systemPrompt: 'You are a helpful AI assistant.'
    }
    applyTheme()
    saveSettings()
  }

  function initializeSettings() {
    console.log('Initializing settings...')
    loadSettings()
    loadProviders()
    applyTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', applyTheme)

    console.log('Settings initialized:', settings.value)
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    settings,
    providers,
    loading,
    error,
    
    // Getters
    currentTheme,
    defaultProvider,
    defaultModel,
    
    // Actions
    loadProviders,
    updateSettings,
    setTheme,
    setDefaultModel,
    setTemperature,
    setMaxTokens,
    setSystemPrompt,
    applyTheme,
    saveSettings,
    loadSettings,
    resetSettings,
    initializeSettings,
    clearError
  }
})
