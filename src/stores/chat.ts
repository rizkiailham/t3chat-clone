import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { checkSupabaseConnection, refreshSupabaseSession } from '../services/supabase'
import { axiosDb } from '../services/axios-db'
import { LLMService } from '../services/llm.service'
import type { Conversation, Message, ChatMessage, FileAttachment } from '../types'
import { useAuthStore } from './auth'
import router from '../router'

const llmService = new LLMService()

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const streaming = ref(false)
  const error = ref<string | null>(null)

  // State tracking for smart refresh
  const lastRefreshTimestamp = ref<number>(0)
  const lastConversationId = ref<string | null>(null)
  const isRefreshing = ref(false)
  const REFRESH_DEBOUNCE_MS = 2000 // Prevent refreshes within 2 seconds

  const hasConversations = computed(() => conversations.value.length > 0)
  const currentMessages = computed(() => messages.value)

  async function loadConversations() {
    try {
      loading.value = true
      error.value = null
      
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      const data = await axiosDb.getConversations(authStore.user.id)
      conversations.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to load conversations'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createConversation(title: string, modelProvider: string, modelName: string) {
    try {
      loading.value = true
      error.value = null
      
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      const newConversation = {
        title,
        user_id: authStore.user.id,
        model_provider: modelProvider,
        model_name: modelName,
      }

      const conversation = await axiosDb.createConversation(newConversation)
      conversations.value.unshift(conversation)
      currentConversation.value = conversation
      messages.value = []
      
      return conversation
    } catch (err: any) {
      error.value = err.message || 'Failed to create conversation'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function selectConversation(conversation: Conversation) {
    const maxRetries = 3
    let lastError: any = null

    try {
      loading.value = true
      error.value = null

      console.log('🎯 Selecting conversation:', conversation.id, conversation.title)

      // Validate conversation object
      if (!conversation || !conversation.id) {
        throw new Error('Invalid conversation object')
      }

      // Smart refresh: Check if we're already on this conversation
      if (currentConversation.value?.id === conversation.id &&
          lastConversationId.value === conversation.id &&
          messages.value.length > 0) {
        console.log('✅ Already on this conversation with messages loaded, skipping reload')
        loading.value = false
        return
      }

      // Clear current state first
      messages.value = []
      currentConversation.value = null

      // Set new conversation
      currentConversation.value = conversation
      lastConversationId.value = conversation.id

      // Ultra-robust message loading with multiple retry strategies
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`📨 Loading messages (attempt ${attempt + 1}/${maxRetries + 1})...`)

          // Pre-load validation on retries
          if (attempt > 0) {
            console.log('🔍 Pre-load connection validation...')

            // Check auth state
            const authStore = useAuthStore()
            if (!authStore.isAuthenticated) {
              console.log('🔐 Auth lost, refreshing...')
              await authStore.refreshAuth()
              if (!authStore.isAuthenticated) {
                throw new Error('Authentication lost')
              }
            }

            // Check database connection
            const isConnected = await checkSupabaseConnection()
            if (!isConnected) {
              console.log('🔄 Database connection lost, refreshing session...')
              await refreshSupabaseSession()
            }

            // Progressive delay
            const delay = Math.min(1000 * attempt, 3000)
            console.log(`⏳ Waiting ${delay}ms before retry...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }

          // Use Axios exclusively for all database operations
          console.log('🚀 Using Axios for message loading (no Supabase client)...')
          const data = await axiosDb.getMessages(conversation.id)

          if (!data || !Array.isArray(data)) {
            throw new Error('Invalid data received from database')
          }

          console.log(`✅ Messages loaded successfully: ${data.length} messages`)
          messages.value = [...data] // Force reactivity with spread operator

          // Success - break out of retry loop
          break

        } catch (loadError: any) {
          lastError = loadError
          console.error(`❌ Message loading failed (attempt ${attempt + 1}):`, {
            message: loadError.message,
            code: loadError.code,
            status: loadError.status
          })

          // Analyze error for retry decision
          const isAuthError = loadError.message?.includes('JWT') ||
                             loadError.message?.includes('auth') ||
                             loadError.message?.includes('session') ||
                             loadError.message?.includes('expired') ||
                             loadError.code === 'PGRST301' ||
                             loadError.code === 'PGRST116' ||
                             loadError.status === 401

          const isNetworkError = loadError.message?.includes('fetch') ||
                                loadError.message?.includes('network') ||
                                loadError.message?.includes('timeout') ||
                                !loadError.status

          const isRetryable = isAuthError || isNetworkError

          console.log(`🔍 Error analysis: Auth=${isAuthError}, Network=${isNetworkError}, Retryable=${isRetryable}`)

          // If we have retries left and it's retryable
          if (attempt < maxRetries && isRetryable) {
            console.log(`🔄 Will retry message loading (${maxRetries - attempt} attempts left)`)
            continue
          }

          // No more retries or non-retryable error
          console.error(`💥 Message loading failed permanently after ${attempt + 1} attempts`)

          // Last resort: try direct Axios call with fresh token
          if (attempt === maxRetries) {
            console.log('🚨 Attempting direct Axios fallback...')
            try {
              // Force get fresh access token
              const { axiosAuthService } = await import('../services/axios-auth.service')
              const token = await axiosAuthService.getAccessToken()

              if (!token) {
                throw new Error('No access token available')
              }

              // Direct Axios call with fresh token
              const data = await axiosDb.getMessages(conversation.id)

              console.log(`✅ Direct Axios fallback successful: ${data?.length || 0} messages`)
              messages.value = [...(data || [])]
              break // Success with direct fallback

            } catch (directError) {
              console.error('❌ Direct Axios fallback failed:', directError)
              throw lastError // Throw the original error
            }
          }
        }
      }

    } catch (err: any) {
      console.error('❌ Failed to select conversation:', err)

      // Provide user-friendly error messages
      if (err.message?.includes('auth') || err.message?.includes('JWT')) {
        error.value = 'Session expired. Please refresh the page and try again.'
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        error.value = 'Network error. Please check your connection and try again.'
      } else if (err.message?.includes('timeout')) {
        error.value = 'Request timed out. Please try again.'
      } else {
        error.value = err.message || 'Failed to load conversation'
      }

      // Reset state on error
      currentConversation.value = null
      messages.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateConversationTitle(id: string, title: string) {
    try {
      const updatedConversation = await axiosDb.updateConversation(id, { title })
      const index = conversations.value.findIndex(c => c.id === id)
      if (index !== -1) {
        conversations.value[index] = updatedConversation
      }
      if (currentConversation.value?.id === id) {
        currentConversation.value = updatedConversation
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update conversation'
      throw err
    }
  }

  async function duplicateConversation(id: string) {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      // Find the original conversation
      const originalConversation = conversations.value.find(c => c.id === id)
      if (!originalConversation) {
        throw new Error('Conversation not found')
      }

      // Create new conversation
      const newConversation = {
        title: `${originalConversation.title} (Copy)`,
        user_id: authStore.user.id,
        model_provider: originalConversation.model_provider,
        model_name: originalConversation.model_name,
        system_prompt: originalConversation.system_prompt,
      }

      const createdConversation = await axiosDb.createConversation(newConversation)

      // Get original messages
      const originalMessages = await axiosDb.getMessages(id)

      // Copy messages to new conversation
      for (const message of originalMessages) {
        await axiosDb.createMessage({
          conversation_id: createdConversation.id,
          role: message.role,
          content: message.content,
          metadata: message.metadata,
        })
      }

      conversations.value.unshift(createdConversation)

      return createdConversation
    } catch (err: any) {
      error.value = err.message || 'Failed to duplicate conversation'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteConversation(id: string) {
    try {
      await axiosDb.deleteConversation(id)
      conversations.value = conversations.value.filter(c => c.id !== id)

      if (currentConversation.value?.id === id) {
        currentConversation.value = null
        messages.value = []
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete conversation'
      throw err
    }
  }

  async function sendMessage(content: string, stream: boolean = false, files?: FileAttachment[]) {
    if (!currentConversation.value) {
      throw new Error('No conversation selected')
    }

    try {
      streaming.value = stream
      error.value = null

      console.log('Sending message:', {
        content,
        stream,
        model: currentConversation.value.model_name,
        fileCount: files?.length || 0
      })

      // Add user message
      const userMessage = {
        conversation_id: currentConversation.value.id,
        role: 'user' as const,
        content,
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

      const savedUserMessage = await axiosDb.createMessage(userMessage)
      messages.value.push(savedUserMessage)

      // Prepare messages for LLM
      const llmMessages: ChatMessage[] = messages.value.map(m => ({
        role: m.role,
        content: m.content,
        files: m.id === savedUserMessage.id ? files : undefined // Only add files to the current message
      }))

      console.log('LLM messages prepared:', llmMessages.length)

      if (stream) {
        // Create assistant message placeholder
        const assistantMessage = {
          conversation_id: currentConversation.value.id,
          role: 'assistant' as const,
          content: '',
        }

        const savedAssistantMessage = await axiosDb.createMessage(assistantMessage)
        messages.value.push(savedAssistantMessage)

        // Stream response
        let fullContent = ''
        const messageIndex = messages.value.length - 1

        console.log('Starting stream...', {
          provider: currentConversation.value.model_provider,
          model: currentConversation.value.model_name,
          messageCount: llmMessages.length
        })

        try {
          let hasContent = false
          for await (const chunk of llmService.streamMessage({
            messages: llmMessages,
            model: currentConversation.value.model_name,
            provider: currentConversation.value.model_provider,
            stream: true,
            files
          })) {
            console.log('Received chunk:', chunk)
            fullContent += chunk
            hasContent = true

            // Force reactivity update
            const updatedMessage = {
              ...messages.value[messageIndex],
              content: fullContent
            }
            messages.value.splice(messageIndex, 1, updatedMessage)
          }

          console.log('Stream completed, final content length:', fullContent.length)

          // If no content was streamed, try non-streaming
          if (!hasContent || !fullContent.trim()) {
            console.log('No streamed content, trying non-streaming...')
            const response = await llmService.sendMessage({
              messages: llmMessages,
              model: currentConversation.value.model_name,
              provider: currentConversation.value.model_provider,
              stream: false,
              files
            })

            fullContent = response.choices[0].message.content
            console.log('Non-streaming response received:', fullContent.substring(0, 100) + '...')

            messages.value[messageIndex] = {
              ...messages.value[messageIndex],
              content: fullContent,
              metadata: {
                model: response.model,
                tokens: response.usage?.total_tokens,
                finish_reason: response.choices[0].finish_reason
              }
            }
          }

          // Update the message in the database with final content
          if (fullContent) {
            await axiosDb.updateMessage(savedAssistantMessage.id, { content: fullContent })
          } else {
            throw new Error('No response content generated')
          }
        } catch (streamError) {
          console.error('Streaming error:', streamError)

          // Try non-streaming as fallback
          try {
            console.log('Streaming failed, trying non-streaming fallback...')
            const response = await llmService.sendMessage({
              messages: llmMessages,
              model: currentConversation.value.model_name,
              provider: currentConversation.value.model_provider,
              stream: false,
              files
            })

            fullContent = response.choices[0].message.content
            console.log('Fallback response received:', fullContent.substring(0, 100) + '...')

            messages.value[messageIndex] = {
              ...messages.value[messageIndex],
              content: fullContent,
              metadata: {
                model: response.model,
                tokens: response.usage?.total_tokens,
                finish_reason: response.choices[0].finish_reason
              }
            }

            // Update the message in the database with final content
            await axiosDb.updateMessage(savedAssistantMessage.id, { content: fullContent })
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError)
            // Remove the empty assistant message if both streaming and fallback failed
            messages.value.splice(messageIndex, 1)
            await axiosDb.deleteMessage(savedAssistantMessage.id)
            throw streamError
          }
        }
      } else {
        // Non-streaming response
        console.log('Using non-streaming response')
        const response = await llmService.sendMessage({
          messages: llmMessages,
          model: currentConversation.value.model_name,
          provider: currentConversation.value.model_provider,
          stream: false,
          files
        })

        const assistantMessage = {
          conversation_id: currentConversation.value.id,
          role: 'assistant' as const,
          content: response.choices[0].message.content,
          metadata: {
            model: response.model,
            tokens: response.usage?.total_tokens,
            finish_reason: response.choices[0].finish_reason
          }
        }

        const savedAssistantMessage = await axiosDb.createMessage(assistantMessage)
        messages.value.push(savedAssistantMessage)
      }

      // Update conversation timestamp
      await axiosDb.updateConversation(currentConversation.value.id, {
        updated_at: new Date().toISOString()
      })

    } catch (err: any) {
      console.error('Send message error:', err)
      error.value = err.message || 'Failed to send message'

      // Show user-friendly error messages
      if (err.message.includes('API key not configured')) {
        error.value = 'Please configure your API key in the .env file'
      } else if (err.message.includes('401')) {
        error.value = 'Invalid API key. Please check your configuration.'
      } else if (err.message.includes('429')) {
        error.value = 'Rate limit exceeded. Please try again later.'
      } else if (err.message.includes('insufficient_quota')) {
        error.value = 'API quota exceeded. Please check your billing.'
      }

      throw err
    } finally {
      streaming.value = false
    }
  }

  async function editMessage(id: string, newContent: string) {
    if (!currentConversation.value) {
      throw new Error('No conversation selected')
    }

    try {
      // Update the message content
      await axiosDb.updateMessage(id, { content: newContent })
      const messageIndex = messages.value.findIndex(m => m.id === id)
      if (messageIndex !== -1) {
        messages.value[messageIndex] = {
          ...messages.value[messageIndex],
          content: newContent
        }

        // If this is a user message, regenerate the AI response
        const editedMessage = messages.value[messageIndex]
        if (editedMessage.role === 'user') {
          console.log('User message edited, regenerating AI response...')

          // Set streaming state
          streaming.value = true
          error.value = null

          try {
            // Find the next AI message (if any) and regenerate it
            const nextMessageIndex = messageIndex + 1
            if (nextMessageIndex < messages.value.length && messages.value[nextMessageIndex].role === 'assistant') {
              await regenerateMessage(messages.value[nextMessageIndex].id)
            } else {
              // If no AI response exists, generate a new one
              console.log('No AI response found, generating new response...')

              // Get all messages up to and including the edited message
              const contextMessages = messages.value.slice(0, messageIndex + 1)

              // Prepare messages for LLM
              const llmMessages: ChatMessage[] = contextMessages.map(m => ({
                role: m.role,
                content: m.content
              }))

              // Create assistant message placeholder
              const assistantMessage = {
                conversation_id: currentConversation.value.id,
                role: 'assistant' as const,
                content: '',
                metadata: {}
              }

              const savedAssistantMessage = await axiosDb.createMessage(assistantMessage)
              const newMessageIndex = messages.value.length
              messages.value.push(savedAssistantMessage)

              // Generate new AI response with fallback
              let fullContent = ''
              let hasContent = false

              try {
                for await (const chunk of llmService.streamMessage({
                  messages: llmMessages,
                  model: currentConversation.value.model_name,
                  provider: currentConversation.value.model_provider,
                  stream: true
                })) {
                  fullContent += chunk
                  hasContent = true
                  messages.value[newMessageIndex] = {
                    ...messages.value[newMessageIndex],
                    content: fullContent
                  }
                }
              } catch {
                console.log('Streaming failed, trying non-streaming...')
                hasContent = false
              }

              // Fallback to non-streaming if needed
              if (!hasContent || !fullContent.trim()) {
                const response = await llmService.sendMessage({
                  messages: llmMessages,
                  model: currentConversation.value.model_name,
                  provider: currentConversation.value.model_provider,
                  stream: false
                })

                fullContent = response.choices[0].message.content
                messages.value[newMessageIndex] = {
                  ...messages.value[newMessageIndex],
                  content: fullContent,
                  metadata: {
                    model: response.model,
                    tokens: response.usage?.total_tokens,
                    finish_reason: response.choices[0].finish_reason
                  }
                }
              }

              // Update the message in the database
              if (fullContent) {
                await axiosDb.updateMessage(savedAssistantMessage.id, { content: fullContent })
              }
            }
          } finally {
            streaming.value = false
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to edit message'
      throw err
    }
  }

  async function regenerateMessage(id: string) {
    if (!currentConversation.value) {
      throw new Error('No conversation selected')
    }

    try {
      streaming.value = true
      error.value = null

      // Find the message to regenerate
      const messageIndex = messages.value.findIndex(m => m.id === id)
      if (messageIndex === -1) {
        throw new Error('Message not found')
      }

      // Get all messages up to (but not including) the message to regenerate
      const contextMessages = messages.value.slice(0, messageIndex)

      // Prepare messages for LLM
      const llmMessages: ChatMessage[] = contextMessages.map(m => ({
        role: m.role,
        content: m.content
      }))

      // Clear the current message content
      messages.value[messageIndex] = {
        ...messages.value[messageIndex],
        content: ''
      }

      // Try streaming first, then fallback to non-streaming
      let fullContent = ''
      let hasContent = false

      try {
        for await (const chunk of llmService.streamMessage({
          messages: llmMessages,
          model: currentConversation.value.model_name,
          provider: currentConversation.value.model_provider,
          stream: true
        })) {
          fullContent += chunk
          hasContent = true
          messages.value[messageIndex] = {
            ...messages.value[messageIndex],
            content: fullContent
          }
        }
      } catch {
        console.log('Streaming failed during regeneration, trying non-streaming...')
        hasContent = false
      }

      // If streaming failed or no content, try non-streaming
      if (!hasContent || !fullContent.trim()) {
        console.log('Using non-streaming for regeneration...')
        const response = await llmService.sendMessage({
          messages: llmMessages,
          model: currentConversation.value.model_name,
          provider: currentConversation.value.model_provider,
          stream: false
        })

        fullContent = response.choices[0].message.content
        messages.value[messageIndex] = {
          ...messages.value[messageIndex],
          content: fullContent,
          metadata: {
            model: response.model,
            tokens: response.usage?.total_tokens,
            finish_reason: response.choices[0].finish_reason
          }
        }
      }

      // Update the message in the database
      if (fullContent) {
        await axiosDb.updateMessage(id, { content: fullContent })
      } else {
        throw new Error('No response content generated during regeneration')
      }

    } catch (err: any) {
      console.error('Regenerate message error:', err)
      error.value = err.message || 'Failed to regenerate message'
      throw err
    } finally {
      streaming.value = false
    }
  }

  async function deleteMessage(id: string) {
    try {
      await axiosDb.deleteMessage(id)
      messages.value = messages.value.filter(m => m.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete message'
      throw err
    }
  }

  function clearCurrentConversation() {
    currentConversation.value = null
    messages.value = []
  }

  function clearError() {
    error.value = null
  }

  // Handle token refresh without full state refresh
  function handleTokenRefresh() {
    console.log('🔑 Token refreshed, updating timestamp only')
    // Just update the timestamp, no need to reload data
    lastRefreshTimestamp.value = Date.now()
    // Clear any auth-related errors
    if (error.value?.includes('auth') || error.value?.includes('session') || error.value?.includes('expired')) {
      error.value = null
    }
  }

  // Smart refresh state with debouncing and selective updates
  async function refreshState(force: boolean = false) {
    try {
      console.log('🔄 Smart refresh state called...', { force })

      // Debounce rapid refresh calls
      const now = Date.now()
      if (!force && isRefreshing.value) {
        console.log('⏳ Refresh already in progress, skipping...')
        return
      }

      if (!force && (now - lastRefreshTimestamp.value) < REFRESH_DEBOUNCE_MS) {
        console.log('⏳ Refresh called too recently, debouncing...')
        return
      }

      isRefreshing.value = true
      lastRefreshTimestamp.value = now

      // First check and refresh database connection only if needed
      console.log('🔍 Checking database connection...')
      const isConnected = await checkSupabaseConnection()
      if (!isConnected) {
        console.log('🔄 Database connection unhealthy, refreshing session...')
        await refreshSupabaseSession()
        // Wait a moment for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        console.log('❌ User not authenticated, clearing chat state')
        conversations.value = []
        currentConversation.value = null
        messages.value = []
        lastConversationId.value = null
        return
      }

      // Clear any previous errors
      error.value = null

      // Smart conversation loading - only reload if we don't have any or forced
      try {
        if (conversations.value.length === 0 || force) {
          console.log('🔄 Loading conversations...', {
            hasConversations: conversations.value.length > 0,
            force
          })
          await loadConversations()
        } else {
          console.log('✅ Conversations already loaded, skipping reload')
        }
      } catch (convError) {
        console.error('❌ Failed to load conversations during refresh:', convError)
        // Don't throw here, continue with other refresh operations
      }

      // Smart message loading - only reload if conversation changed or forced
      if (currentConversation.value) {
        const currentId = currentConversation.value.id
        const needsMessageReload = force ||
                                  lastConversationId.value !== currentId ||
                                  messages.value.length === 0

        if (needsMessageReload) {
          try {
            console.log('🔄 Reloading messages for current conversation...', {
              conversationId: currentId,
              lastId: lastConversationId.value,
              messageCount: messages.value.length,
              force
            })
            await selectConversation(currentConversation.value)
          } catch (msgError) {
            console.error('❌ Failed to reload messages during refresh:', msgError)
            // Don't throw here, just log the error
          }
        } else {
          console.log('✅ Messages already loaded for current conversation, skipping reload')
        }
      }

      console.log('✅ Smart refresh completed successfully')
    } catch (refreshError: any) {
      console.error('❌ Failed to refresh chat state:', refreshError)
      // Set a user-friendly error message
      error.value = 'Connection lost. Please check your internet connection and try again.'
    } finally {
      isRefreshing.value = false
    }
  }

  // Conversation sharing functions
  async function shareConversation(id: string) {
    try {
      loading.value = true
      error.value = null

      const sharedConversation = await axiosDb.shareConversation(id)

      // Update the conversation in the list
      const index = conversations.value.findIndex(c => c.id === id)
      if (index !== -1) {
        conversations.value[index] = sharedConversation
      }

      // Update current conversation if it's the one being shared
      if (currentConversation.value?.id === id) {
        currentConversation.value = sharedConversation
      }

      // Copy share link to clipboard
      const shareUrl = `${window.location.origin}/share/${sharedConversation.share_id}`
      await navigator.clipboard.writeText(shareUrl)

      return sharedConversation
    } catch (err: any) {
      error.value = err.message || 'Failed to share conversation'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function unshareConversation(id: string) {
    try {
      loading.value = true
      error.value = null

      const unsharedConversation = await axiosDb.unshareConversation(id)

      // Update the conversation in the list
      const index = conversations.value.findIndex(c => c.id === id)
      if (index !== -1) {
        conversations.value[index] = unsharedConversation
      }

      // Update current conversation if it's the one being unshared
      if (currentConversation.value?.id === id) {
        currentConversation.value = unsharedConversation
      }

      return unsharedConversation
    } catch (err: any) {
      error.value = err.message || 'Failed to unshare conversation'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getSharedConversation(shareId: string) {
    try {
      loading.value = true
      error.value = null

      const { conversation, messages: sharedMessages } = await axiosDb.getSharedConversation(shareId)

      // Set the shared conversation and messages (read-only)
      currentConversation.value = conversation
      messages.value = sharedMessages

      return { conversation, messages: sharedMessages }
    } catch (err: any) {
      error.value = err.message || 'Failed to load shared conversation'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Navigation helpers
  function navigateToConversation(conversationId: string) {
    router.push(`/chat/${conversationId}`)
  }

  function navigateToSharedConversation(shareId: string) {
    router.push(`/share/${shareId}`)
  }

  // Set up token refresh event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('tokenRefresh', () => {
      console.log('🔑 Received token refresh event in chat store')
      handleTokenRefresh()
    })
  }

  return {
    // State
    conversations,
    currentConversation,
    messages,
    loading,
    streaming,
    error,

    // Getters
    hasConversations,
    currentMessages,

    // Actions
    loadConversations,
    createConversation,
    selectConversation,
    updateConversationTitle,
    duplicateConversation,
    deleteConversation,
    sendMessage,
    editMessage,
    regenerateMessage,
    deleteMessage,
    clearCurrentConversation,
    clearError,
    refreshState,
    handleTokenRefresh,

    // Sharing actions
    shareConversation,
    unshareConversation,
    getSharedConversation,
    navigateToConversation,
    navigateToSharedConversation
  }
})
