import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { LLMService } from '../services/llm.service'
import type { Message, FileAttachment, ChatMessage } from '../types'

const llmService = new LLMService()

export const useGuestChatStore = defineStore('guest-chat', () => {
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const streaming = ref(false)
  const error = ref<string | null>(null)
  // Default to Google Gemini for better guest experience
  const currentModel = ref({ provider: 'google', name: 'gemini-2.0-flash' })

  const currentMessages = computed(() => messages.value)
  const hasMessages = computed(() => messages.value.length > 0)

  function clearError() {
    error.value = null
  }

  function clearMessages() {
    messages.value = []
    error.value = null
  }

  function setModel(provider: string, model: string) {
    currentModel.value = { provider, name: model }
    console.log('🎭 Guest mode: Model changed to', provider, model)

    // Always refresh localStorage with new model preference
    refreshGuestModelInStorage()
  }

  function refreshGuestModelInStorage() {
    try {
      // Remove old preference first to ensure fresh state
      localStorage.removeItem('guest-chat-model')

      // Set new preference
      localStorage.setItem('guest-chat-model', JSON.stringify(currentModel.value))
      console.log('🔄 Guest mode: localStorage refreshed with model:', currentModel.value)
    } catch (error) {
      console.warn('Failed to refresh guest model preference in localStorage:', error)
    }
  }

  function initializeGuestMode() {
    console.log('🎭 Guest mode: Initializing...')

    // Always start fresh - clear any existing guest data
    clearMessages()
    clearError()

    // Ensure we start with Gemini as default
    resetToDefaultModel()

    console.log('✅ Guest mode: Initialized with Gemini default')
  }

  function loadGuestModelPreference() {
    try {
      const saved = localStorage.getItem('guest-chat-model')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Validate that the saved model is still available
        const providers = getAvailableProviders()
        const savedProvider = providers.find(p => p.id === parsed.provider)
        const savedModel = savedProvider?.models.find(m => m.id === parsed.name)

        if (savedProvider && savedModel) {
          currentModel.value = parsed
          console.log('🎭 Guest mode: Loaded saved model preference', parsed)
        } else {
          console.log('🎭 Guest mode: Saved model no longer available, using default Gemini')
          resetToDefaultModel()
        }
      } else {
        console.log('🎭 Guest mode: No saved preference, using default Gemini')
        resetToDefaultModel()
      }
    } catch (error) {
      console.warn('Failed to load guest model preference:', error)
      resetToDefaultModel()
    }
  }

  function resetToDefaultModel() {
    // Always default to Gemini 2.0 Flash for best guest experience
    currentModel.value = { provider: 'google', name: 'gemini-2.0-flash' }
    console.log('🎭 Guest mode: Reset to default Gemini model')

    // Save the default to localStorage
    try {
      localStorage.setItem('guest-chat-model', JSON.stringify(currentModel.value))
    } catch (error) {
      console.warn('Failed to save default guest model preference:', error)
    }
  }

  function getAvailableProviders() {
    // Return hardcoded providers for guest mode to avoid import issues
    return [
      {
        id: 'google',
        name: 'Google Gemini',
        requiresApiKey: false,
        models: [
          {
            id: 'gemini-2.0-flash',
            name: 'Gemini 2.0 Flash',
            description: 'Latest Gemini model with enhanced capabilities and speed',
            context_length: 1048576
          },
          {
            id: 'gemini-1.5-pro',
            name: 'Gemini 1.5 Pro',
            description: 'Advanced reasoning and multimodal understanding',
            context_length: 2097152
          }
        ]
      },
      {
        id: 'openai',
        name: 'OpenAI',
        requiresApiKey: false,
        models: [
          {
            id: 'gpt-4o',
            name: 'GPT-4o',
            description: 'Most advanced GPT-4 model with enhanced capabilities',
            context_length: 128000
          },
          {
            id: 'gpt-4o-mini',
            name: 'GPT-4o Mini',
            description: 'Efficient and fast GPT-4 model for quick responses',
            context_length: 128000
          },
          {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            description: 'Fast and efficient model for general conversations',
            context_length: 16385
          }
        ]
      }
    ]
  }

  async function sendMessage(content: string, files?: FileAttachment[], stream = true) {
    console.log('🎭 Guest chat store: sendMessage called with:', {
      content: content?.substring(0, 50) + '...',
      hasFiles: !!files?.length,
      stream,
      currentModel: currentModel.value
    })

    if (!content.trim()) {
      console.warn('🎭 Guest mode: Empty content')
      error.value = 'Please enter a message'
      return
    }

    try {
      streaming.value = stream
      error.value = null

      console.log('🎭 Guest mode: Sending message:', {
        content,
        stream,
        model: currentModel.value.name,
        provider: currentModel.value.provider,
        fileCount: files?.length || 0
      })

      console.log('🔍 Guest mode: LLM Service call parameters:', {
        provider: currentModel.value.provider,
        model: currentModel.value.name,
        messageCount: messages.value.length,
        stream,
        hasFiles: !!files?.length
      })

      // Add user message
      const userMessage: Message = {
        id: `guest-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversation_id: 'guest-conversation',
        role: 'user',
        content,
        created_at: new Date().toISOString(),
        metadata: files && files.length > 0 ? { 
          files: files.length,
          attachments: files.map(file => ({
            name: file.file.name,
            type: file.type,
            size: file.file.size,
            base64: file.base64,
            content: file.content
          }))
        } : undefined
      }

      messages.value.push(userMessage)

      // Prepare messages for LLM
      const llmMessages: ChatMessage[] = messages.value.map(m => ({
        role: m.role,
        content: m.content,
        files: m.id === userMessage.id ? files : undefined // Only add files to the current message
      }))

      // Add assistant message placeholder
      const assistantMessage: Message = {
        id: `guest-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversation_id: 'guest-conversation',
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      }

      messages.value.push(assistantMessage)

      if (stream) {
        // Stream response with fallback (same as authenticated mode)
        let fullContent = ''
        let hasContent = false
        let streamError: any = null

        try {
          console.log('🎭 Guest mode: Starting streaming...')
          const messageGenerator = llmService.streamMessage({
            messages: llmMessages,
            model: currentModel.value.name,
            provider: currentModel.value.provider,
            stream: true,
            files
          })

          for await (const chunk of messageGenerator) {
            fullContent += chunk
            hasContent = true
            // Update the last message (assistant message)
            const lastMessage = messages.value[messages.value.length - 1]
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = fullContent
            }
          }
          console.log('✅ Guest mode: Streaming completed successfully')
        } catch (err) {
          console.log('❌ Guest mode: Streaming failed, trying non-streaming fallback...', err)
          streamError = err
          hasContent = false
        }

        // Fallback to non-streaming if streaming failed or no content
        if (!hasContent || !fullContent.trim()) {
          console.log('🔄 Guest mode: Using non-streaming fallback...')
          try {
            const response = await llmService.sendMessage({
              messages: llmMessages,
              model: currentModel.value.name,
              provider: currentModel.value.provider,
              stream: false,
              files
            })

            fullContent = response.choices[0].message.content
            const lastMessage = messages.value[messages.value.length - 1]
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = fullContent
              lastMessage.metadata = {
                model: response.model,
                tokens: response.usage?.total_tokens,
                finish_reason: response.choices[0].finish_reason
              }
            }
            console.log('✅ Guest mode: Non-streaming fallback completed successfully')
          } catch (fallbackError) {
            console.error('❌ Guest mode: Both streaming and fallback failed:', fallbackError)
            throw streamError || fallbackError
          }
        }
      } else {
        // Non-stream response
        console.log('🎭 Guest mode: Using non-streaming response...')
        const response = await llmService.sendMessage({
          messages: llmMessages,
          model: currentModel.value.name,
          provider: currentModel.value.provider,
          stream: false,
          files
        })

        // Update the assistant message
        const lastMessage = messages.value[messages.value.length - 1]
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = response.choices[0].message.content
          lastMessage.metadata = {
            model: response.model,
            tokens: response.usage?.total_tokens,
            finish_reason: response.choices[0].finish_reason
          }
        }
        console.log('✅ Guest mode: Non-streaming response completed successfully')
      }

    } catch (err: any) {
      console.error('❌ Guest mode: Error sending message:', err)

      // Enhanced error handling similar to authenticated mode
      let errorMessage = err.message || 'Failed to send message'

      // Show user-friendly error messages
      if (err.message?.includes('API key not configured')) {
        errorMessage = 'Please configure your API key in the .env file'
      } else if (err.message?.includes('401')) {
        errorMessage = 'Invalid API key. Please check your configuration.'
      } else if (err.message?.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
      } else if (err.message?.includes('insufficient_quota')) {
        errorMessage = 'API quota exceeded. Please check your billing.'
      } else if (err.message?.includes('Google API error')) {
        errorMessage = 'Google/Gemini service temporarily unavailable. Please try again.'
      } else if (err.message?.includes('OpenAI API error')) {
        errorMessage = 'OpenAI service temporarily unavailable. Please try again.'
      }

      error.value = errorMessage

      // Remove the failed assistant message
      if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'assistant' && !messages.value[messages.value.length - 1].content) {
        messages.value.pop()
      }
    } finally {
      streaming.value = false
    }
  }

  async function regenerateMessage(messageId: string) {
    try {
      const messageIndex = messages.value.findIndex(m => m.id === messageId)
      if (messageIndex === -1) return

      // Find the user message that prompted this assistant message
      let userMessageIndex = messageIndex - 1
      while (userMessageIndex >= 0 && messages.value[userMessageIndex].role !== 'user') {
        userMessageIndex--
      }

      if (userMessageIndex < 0) return

      const userMessage = messages.value[userMessageIndex]
      
      // Remove all messages after the user message
      messages.value = messages.value.slice(0, userMessageIndex + 1)

      // Get files from user message metadata if any
      const files = userMessage.metadata?.attachments?.map(att => ({
        file: new File([], att.name, { type: att.type === 'image' ? 'image/*' : 'application/pdf' }),
        type: att.type,
        base64: att.base64,
        content: att.content
      })) as FileAttachment[] | undefined

      // Resend the message
      await sendMessage(userMessage.content, files)
    } catch (err: any) {
      console.error('❌ Guest mode: Error regenerating message:', err)
      error.value = err.message || 'Failed to regenerate message'
    }
  }

  return {
    // State
    messages,
    loading,
    streaming,
    error,
    currentModel,

    // Getters
    currentMessages,
    hasMessages,

    // Actions
    sendMessage,
    regenerateMessage,
    clearError,
    clearMessages,
    setModel,
    loadGuestModelPreference,
    getAvailableProviders,
    initializeGuestMode,
    refreshGuestModelInStorage,
    resetToDefaultModel
  }
})
