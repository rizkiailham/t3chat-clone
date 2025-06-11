<template>
  <div class="flex items-start space-x-4 group" :class="{ 'flex-row-reverse space-x-reverse': isUser }">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div v-if="isUser" class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-100 dark:ring-blue-900/30">
        <span class="text-white text-sm font-bold">{{ userInitial }}</span>
      </div>
      <div v-else class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-purple-100 dark:ring-purple-900/30">
        <span class="text-white text-sm font-bold">AI</span>
      </div>
    </div>

    <!-- Message Content -->
    <div class="flex-1 max-w-4xl">
      <div
        class="rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
        :class="messageClasses"
      >
        <!-- Edit mode -->
        <div v-if="isEditing" class="space-y-4">
          <textarea
            ref="editTextarea"
            v-model="editContent"
            @keydown="handleEditKeydown"
            class="w-full resize-none bg-transparent border-none outline-none text-inherit placeholder-current/50 focus:ring-0"
            :class="{ 'text-white': isUser }"
            placeholder="Edit your message..."
            rows="3"
          ></textarea>
          <div class="flex items-center justify-end space-x-3 pt-2 border-t border-current/10">
            <button
              @click="cancelEdit"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              :class="isUser
                ? 'border border-white/30 text-white/80 hover:bg-white/10 hover:border-white/50'
                : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'"
            >
              Cancel
            </button>
            <button
              @click="saveEdit"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              :class="isUser
                ? 'bg-white/20 text-white hover:bg-white/30 shadow-lg'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'"
            >
              Save Changes
            </button>
          </div>
        </div>

        <!-- Display mode -->
        <div v-else>
          <!-- Message text -->
          <div
            v-if="message.content"
            class="prose prose-sm max-w-none"
            :class="proseClasses"
            v-html="formattedContent"
          ></div>

          <!-- Loading state with better UX -->
          <div v-else class="flex items-center space-x-3 py-2">
            <!-- Animated dots -->
            <div class="flex space-x-1">
              <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
              <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
              <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
            </div>
            <!-- Loading text -->
            <span class="text-gray-600 dark:text-gray-300 text-sm font-medium">
              {{ loadingText }}
            </span>
          </div>
        </div>
      </div>

      <!-- Message metadata and actions -->
      <div class="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div class="flex items-center space-x-2">
          <span class="font-medium">{{ formatTime(message.created_at) }}</span>
          <span v-if="message.metadata?.tokens" class="hidden sm:inline opacity-75">
            • {{ message.metadata.tokens }} tokens
          </span>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            v-if="isUser"
            @click="startEdit"
            class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            title="Edit message"
          >
            <PencilIcon class="w-3.5 h-3.5" />
          </button>
          <button
            @click="copyMessage"
            class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            title="Copy message"
          >
            <ClipboardIcon class="w-3.5 h-3.5" />
          </button>
          <button
            v-if="!isUser"
            @click="regenerateMessage"
            class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            title="Regenerate response"
          >
            <ArrowPathIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { ClipboardIcon, ArrowPathIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/auth'
import { formatCodeBlock } from '../../utils/syntax-highlighter'
import type { Message } from '../../types'

interface Props {
  message: Message
}

interface Emits {
  (e: 'edit', messageId: string, newContent: string): void
  (e: 'regenerate', messageId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const authStore = useAuthStore()

// Editing state
const isEditing = ref(false)
const editContent = ref('')
const editTextarea = ref<HTMLTextAreaElement>()

const isUser = computed(() => props.message.role === 'user')
const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() || 'U')

// Dynamic loading text
const loadingTextIndex = ref(0)
const loadingTexts = [
  'Thinking...',
  'Generating response...',
  'Processing your request...',
  'AI is working...',
  'Almost ready...'
]

const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

// Cycle through loading texts
let loadingInterval: NodeJS.Timeout | null = null

onMounted(() => {
  if (!props.message.content) {
    loadingInterval = setInterval(() => {
      loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
    }, 2000)
  }
})

onUnmounted(() => {
  if (loadingInterval) {
    clearInterval(loadingInterval)
  }
})

const messageClasses = computed(() => {
  if (isUser.value) {
    return 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-auto border border-blue-500/20 shadow-lg shadow-blue-500/25'
  }
  return 'glass border border-white/20 dark:border-gray-700/50 text-gray-900 dark:text-white shadow-lg'
})

const proseClasses = computed(() => {
  if (isUser.value) {
    return 'prose-invert'
  }
  return 'dark:prose-invert'
})

const formattedContent = computed(() => {
  let content = props.message.content

  // First, handle code blocks with syntax highlighting
  content = formatCodeBlock(content)

  // Then handle other markdown formatting
  content = content
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code (only if not already in a code block)
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
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

async function startEdit() {
  isEditing.value = true
  editContent.value = props.message.content
  await nextTick()
  if (editTextarea.value) {
    editTextarea.value.focus()
    // Auto-resize textarea
    editTextarea.value.style.height = 'auto'
    editTextarea.value.style.height = editTextarea.value.scrollHeight + 'px'
  }
}

function cancelEdit() {
  isEditing.value = false
  editContent.value = ''
}

function saveEdit() {
  if (editContent.value.trim() !== props.message.content) {
    emit('edit', props.message.id, editContent.value.trim())
  }
  isEditing.value = false
}

function handleEditKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    saveEdit()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancelEdit()
  }

  // Auto-resize textarea
  nextTick(() => {
    if (editTextarea.value) {
      editTextarea.value.style.height = 'auto'
      editTextarea.value.style.height = editTextarea.value.scrollHeight + 'px'
    }
  })
}

function regenerateMessage() {
  emit('regenerate', props.message.id)
}
</script>

<style scoped>
.prose {
  color: inherit;
}

.prose pre {
  margin: 0.5rem 0;
}

.prose code {
  color: inherit;
}

.prose strong {
  font-weight: 600;
  color: inherit;
}

.prose em {
  font-style: italic;
  color: inherit;
}

/* Modern Code block styling */
:deep(.code-block-container) {
  margin: 1.5rem 0;
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid #374151;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

:deep(.code-block-container:hover) {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
}

:deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%);
  border-bottom: 1px solid #4a5568;
}

:deep(.code-language) {
  font-size: 0.75rem;
  color: #a0aec0;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

:deep(.copy-code-btn) {
  padding: 0.5rem;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

:deep(.copy-code-btn:hover) {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

:deep(.code-block) {
  margin: 0;
  padding: 1.5rem;
  background: #1a1a1a;
  overflow-x: auto;
  font-family: var(--font-family-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  color: #e5e7eb;
}

/* Syntax highlighting colors - ensure inline styles work */
:deep(.code-block span) {
  /* Preserve inline style colors */
  font-weight: inherit;
}

:deep(.code-block code) {
  color: #e5e7eb;
  background: transparent;
}

:deep(.inline-code) {
  background: rgba(156, 163, 175, 0.15);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-family: var(--font-family-mono);
  font-size: 0.875em;
  font-weight: 500;
  border: 1px solid rgba(156, 163, 175, 0.2);
  transition: all 0.2s ease;
}

:deep(.inline-code:hover) {
  background: rgba(156, 163, 175, 0.2);
  border-color: rgba(156, 163, 175, 0.3);
}
</style>
