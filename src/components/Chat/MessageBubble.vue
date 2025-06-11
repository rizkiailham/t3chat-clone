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
        <!-- Edit mode -->
        <div v-if="isEditing">
          <textarea
            ref="editTextarea"
            v-model="editContent"
            @keydown="handleEditKeydown"
            class="w-full resize-none bg-transparent border-none outline-none text-inherit"
            :class="{ 'text-white': isUser }"
            rows="1"
          ></textarea>
          <div class="flex items-center justify-end space-x-2 mt-2">
            <button
              @click="cancelEdit"
              class="px-3 py-1 text-xs rounded border"
              :class="isUser
                ? 'border-white/30 text-white/80 hover:bg-white/10'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              Cancel
            </button>
            <button
              @click="saveEdit"
              class="px-3 py-1 text-xs rounded"
              :class="isUser
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-blue-600 text-white hover:bg-blue-700'"
            >
              Save
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

      <!-- Message metadata -->
      <div class="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400" :class="{ 'justify-end': isUser }">
        <span>{{ formatTime(message.created_at) }}</span>
        <span v-if="message.metadata?.tokens" class="hidden sm:inline">
          • {{ message.metadata.tokens }} tokens
        </span>
        <button
          v-if="isUser"
          @click="startEdit"
          class="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Edit message"
        >
          <PencilIcon class="w-3 h-3" />
        </button>
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

/* Code block styling */
:deep(.code-block-container) {
  margin: 1rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #1a1a1a;
  border: 1px solid #374151;
}

:deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #2d2d2d;
  border-bottom: 1px solid #374151;
  max-height: 20px;
}

:deep(.code-language) {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 500;
}

:deep(.copy-code-btn) {
  padding: 0.25rem;
  color: #9ca3af;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: color 0.2s;
}

:deep(.copy-code-btn:hover) {
  color: #ffffff;
}

:deep(.code-block) {
  margin: 0;
  padding: 1rem;
  background: #1a1a1a;
  overflow-x: auto;
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #e5e7eb; /* Default text color */
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
  background: rgba(156, 163, 175, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
  font-size: 0.875em;
}
</style>
