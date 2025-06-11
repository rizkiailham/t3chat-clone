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

      currentConversation.value = conversation
      const data = await db.getMessages(conversation.id)
      messages.value = data

      console.log('Loaded messages:', data.length)
    } catch (err: any) {
      console.error('Failed to select conversation:', err)
      error.value = err.message || 'Failed to load conversation'
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

  async function sendMessage(content: string, stream: boolean = true) {
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

        console.log('Starting stream...')

        try {
          for await (const chunk of llmService.streamMessage({
            messages: llmMessages,
            model: currentConversation.value.model_name,
            provider: currentConversation.value.model_provider,
            stream: true
          })) {
            fullContent += chunk
            messages.value[messageIndex] = {
              ...messages.value[messageIndex],
              content: fullContent
            }
          }

          console.log('Stream completed, final content length:', fullContent.length)

          // Update the message in the database with final content
          if (fullContent) {
            await db.updateMessage(savedAssistantMessage.id, { content: fullContent })
          }
        } catch (streamError) {
          console.error('Streaming error:', streamError)
          // Remove the empty assistant message if streaming failed
          messages.value.splice(messageIndex, 1)
          await db.deleteMessage(savedAssistantMessage.id)
          throw streamError
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
    deleteConversation,
    sendMessage,
    deleteMessage,
    clearCurrentConversation,
    clearError
  }
})
