<template>
  <div class="flex items-start space-x-3" :class="{ 'flex-row-reverse space-x-reverse': isUser }">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div v-if="isUser" class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <span class="text-white text-sm font-medium">{{ userInitial }}</span>
      </div>
      <div v-else class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
        <span class="text-white text-sm font-medium">AI</span>
      </div>
    </div>

    <!-- Message Content -->
    <div class="flex-1 max-w-3xl">
      <div 
        class="rounded-lg p-4 shadow-sm"
        :class="messageClasses"
      >
        <!-- Message text -->
        <div 
          v-if="message.content"
          class="prose prose-sm max-w-none"
          :class="proseClasses"
          v-html="formattedContent"
        ></div>
        
        <!-- Empty content placeholder -->
        <div v-else class="text-gray-400 italic">
          Generating response...
        </div>
      </div>

      <!-- Message metadata -->
      <div class="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400" :class="{ 'justify-end': isUser }">
        <span>{{ formatTime(message.created_at) }}</span>
        <span v-if="message.metadata?.tokens" class="hidden sm:inline">
          • {{ message.metadata.tokens }} tokens
        </span>
        <button
          @click="copyMessage"
          class="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Copy message"
        >
          <ClipboardIcon class="w-3 h-3" />
        </button>
        <button
          v-if="!isUser"
          @click="regenerateMessage"
          class="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Regenerate response"
        >
          <ArrowPathIcon class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClipboardIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/auth'
import type { Message } from '../../types'

interface Props {
  message: Message
}

const props = defineProps<Props>()
const authStore = useAuthStore()

const isUser = computed(() => props.message.role === 'user')
const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() || 'U')

const messageClasses = computed(() => {
  if (isUser.value) {
    return 'bg-blue-600 text-white ml-auto'
  }
  return 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
})

const proseClasses = computed(() => {
  if (isUser.value) {
    return 'prose-invert'
  }
  return 'dark:prose-invert'
})

const formattedContent = computed(() => {
  let content = props.message.content

  // Convert markdown-style formatting to HTML
  content = content
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto"><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br>')

  return content
})

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else {
    return date.toLocaleDateString()
  }
}

async function copyMessage() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy message:', error)
  }
}

function regenerateMessage() {
  // This would trigger a regeneration of the AI response
  // Implementation depends on your chat store structure
  console.log('Regenerate message:', props.message.id)
}
</script>

<style scoped>
.prose {
  @apply text-inherit;
}

.prose pre {
  @apply my-2;
}

.prose code {
  @apply text-inherit;
}

.prose strong {
  @apply font-semibold text-inherit;
}

.prose em {
  @apply italic text-inherit;
}
</style>
