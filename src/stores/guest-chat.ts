import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { LLMService } from '../services/llm.service'
import type { Message, Conversation, FileAttachment, ChatMessage } from '../types'

const llmService = new LLMService()

export const useGuestChatStore = defineStore('guest-chat', () => {
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const streaming = ref(false)
  const error = ref<string | null>(null)
  const currentModel = ref({ provider: 'openai', name: 'gpt-4o' })

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
        fileCount: files?.length || 0
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
        // Stream response
        const messageGenerator = llmService.streamMessage({
          messages: llmMessages,
          model: currentModel.value.name,
          provider: currentModel.value.provider,
          stream: true,
          files
        })

        let fullContent = ''
        for await (const chunk of messageGenerator) {
          fullContent += chunk
          // Update the last message (assistant message)
          const lastMessage = messages.value[messages.value.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = fullContent
          }
        }
      } else {
        // Non-stream response
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
      }

    } catch (err: any) {
      console.error('❌ Guest mode: Error sending message:', err)
      error.value = err.message || 'Failed to send message'
      
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
    setModel
  }
})
