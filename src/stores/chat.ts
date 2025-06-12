import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '../services/supabase'
import { LLMService } from '../services/llm.service'
import type { Conversation, Message, ChatState, ChatMessage } from '../types'
import { useAuthStore } from './auth'

const llmService = new LLMService()

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const streaming = ref(false)
  const error = ref<string | null>(null)

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

      const data = await db.getConversations(authStore.user.id)
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

      const conversation = await db.createConversation(newConversation)
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
    try {
      loading.value = true
      error.value = null

      console.log('Selecting conversation:', conversation.id, conversation.title)

      // Clear current state first
      messages.value = []
      currentConversation.value = null

      // Set new conversation
      currentConversation.value = conversation

      // Load messages
      const data = await db.getMessages(conversation.id)
      messages.value = [...data] // Force reactivity with spread operator

    } catch (err: any) {
      console.error('Failed to select conversation:', err)
      error.value = err.message || 'Failed to load conversation'
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
      const updatedConversation = await db.updateConversation(id, { title })
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

      const createdConversation = await db.createConversation(newConversation)

      // Get original messages
      const originalMessages = await db.getMessages(id)

      // Copy messages to new conversation
      for (const message of originalMessages) {
        await db.createMessage({
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
      await db.deleteConversation(id)
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

  async function sendMessage(content: string, stream: boolean = false) {
    if (!currentConversation.value) {
      throw new Error('No conversation selected')
    }

    try {
      streaming.value = stream
      error.value = null

      console.log('Sending message:', { content, stream, model: currentConversation.value.model_name })

      // Add user message
      const userMessage = {
        conversation_id: currentConversation.value.id,
        role: 'user' as const,
        content,
      }

      const savedUserMessage = await db.createMessage(userMessage)
      messages.value.push(savedUserMessage)

      // Prepare messages for LLM
      const llmMessages: ChatMessage[] = messages.value.map(m => ({
        role: m.role,
        content: m.content
      }))

      console.log('LLM messages prepared:', llmMessages.length)

      if (stream) {
        // Create assistant message placeholder
        const assistantMessage = {
          conversation_id: currentConversation.value.id,
          role: 'assistant' as const,
          content: '',
        }

        const savedAssistantMessage = await db.createMessage(assistantMessage)
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
            stream: true
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
              stream: false
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
            await db.updateMessage(savedAssistantMessage.id, { content: fullContent })
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
              stream: false
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
            await db.updateMessage(savedAssistantMessage.id, { content: fullContent })
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError)
            // Remove the empty assistant message if both streaming and fallback failed
            messages.value.splice(messageIndex, 1)
            await db.deleteMessage(savedAssistantMessage.id)
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
          stream: false
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

        const savedAssistantMessage = await db.createMessage(assistantMessage)
        messages.value.push(savedAssistantMessage)
      }

      // Update conversation timestamp
      await db.updateConversation(currentConversation.value.id, {
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
      await db.updateMessage(id, { content: newContent })
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

              const savedAssistantMessage = await db.createMessage(assistantMessage)
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
              } catch (streamError) {
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
                await db.updateMessage(savedAssistantMessage.id, { content: fullContent })
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
      } catch (streamError) {
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
        await db.updateMessage(id, { content: fullContent })
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
      await db.deleteMessage(id)
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

  // Refresh conversations and current state
  async function refreshState() {
    try {
      console.log('🔄 Refreshing chat state...')

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        console.log('❌ User not authenticated, clearing chat state')
        conversations.value = []
        currentConversation.value = null
        messages.value = []
        return
      }

      // Reload conversations if we don't have any
      if (conversations.value.length === 0) {
        console.log('🔄 No conversations loaded, reloading...')
        await loadConversations()
      }

      // Reload messages for current conversation if needed
      if (currentConversation.value && messages.value.length === 0) {
        console.log('🔄 Current conversation has no messages, reloading...')
        await selectConversation(currentConversation.value)
      }

      console.log('✅ Chat state refreshed successfully')
    } catch (error) {
      console.error('❌ Failed to refresh chat state:', error)
    }
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
    refreshState
  }
})
