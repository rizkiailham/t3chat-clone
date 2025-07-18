<template>
  <div class="w-full">
    <!-- File Preview Section -->
    <FilePreview
      v-if="attachedFiles.length > 0"
      v-model="attachedFiles"
      class="mb-3"
    />

    <!-- File Upload Guidelines -->
    <div v-if="showFileGuidelines" class="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-start space-x-2">
        <InformationCircleIcon class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div class="text-sm text-blue-700 dark:text-blue-300">
          <p class="font-medium mb-1">Supported file types:</p>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li><strong>Images:</strong> JPEG, PNG, GIF, WebP (max 5MB)</li>
            <li v-if="!props.isGuestMode"><strong>PDFs:</strong> PDF documents (max 10MB)</li>
            <li v-else class="text-amber-600 dark:text-amber-400"><strong>PDFs:</strong> Requires sign-in</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="relative flex items-end gap-2 sm:gap-3">
      <!-- Text Area -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="message"
          @keydown="handleKeydown"
          @input="adjustHeight"
          :disabled="disabled"
          placeholder="Message the AI..."
          class="w-full resize-none border-0 bg-transparent py-4 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 leading-relaxed rounded-xl text-base sm:text-sm touch-manipulation"
          style="min-height: 56px; max-height: 200px; overflow-y: auto;"
          rows="1"
        ></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-1 sm:space-x-2 pb-3">
        <!-- File Upload Button -->
        <FileUploadButton
          :disabled="disabled"
          :current-file-count="attachedFiles.length"
          :is-guest-mode="props.isGuestMode"
          @files-selected="handleFilesSelected"
          @error="handleFileError"
        />

        <!-- Send Button -->
        <button
          @click="sendMessage"
          :disabled="!canSend"
          class="p-3 sm:p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 touch-manipulation"
          :class="canSend
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'"
          aria-label="Send message"
        >
          <PaperAirplaneIcon class="w-5 h-5 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>

    <!-- Character count and shortcuts -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-2 sm:space-y-0">
      <div class="flex items-center space-x-2 sm:space-x-4 flex-wrap">
        <span class="hidden sm:inline text-xs opacity-75">
          Shift+Enter for new line • Enter to send
        </span>
        <button
          @click="showFileGuidelines = !showFileGuidelines"
          class="text-xs text-blue-600 dark:text-blue-400 hover:underline touch-manipulation"
        >
          {{ showFileGuidelines ? 'Hide' : 'Show' }} file guidelines
        </button>
      </div>

      <div class="flex items-center space-x-2 text-xs flex-wrap">
        <span v-if="attachedFiles.length > 0" class="text-blue-600 dark:text-blue-400">
          {{ attachedFiles.length }} file{{ attachedFiles.length > 1 ? 's' : '' }} attached
        </span>
        <span class="opacity-75" :class="{ 'text-red-500': message.length > maxCharacters }">
          {{ message.length }}/{{ maxCharacters.toLocaleString() }}
        </span>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="fileError" class="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-sm text-red-700 dark:text-red-300">{{ fileError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { PaperAirplaneIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import FileUploadButton from './FileUploadButton.vue'
import FilePreview from './FilePreview.vue'
import type { FileAttachment } from '../../types'

interface Props {
  disabled?: boolean
  isGuestMode?: boolean
  currentModel?: {
    provider: string
    name: string
    context_length?: number
  }
}

interface Emits {
  (e: 'send', message: string, files?: FileAttachment[]): void
  (e: 'height-change', height: number): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isGuestMode: false,
  currentModel: () => ({ provider: '', name: '', context_length: 4000 })
})

const emit = defineEmits<Emits>()

const message = ref('')
const textareaRef = ref<HTMLTextAreaElement>()
const attachedFiles = ref<FileAttachment[]>([])
const showFileGuidelines = ref(false)
const fileError = ref<string | null>(null)

// Dynamic character limit based on model's context length
const maxCharacters = computed(() => {
  const contextLength = props.currentModel?.context_length || 4000
  // Conservative estimate: 1 token ≈ 4 characters for English text
  // Reserve 25% of context for response and system messages
  const usableTokens = Math.floor(contextLength * 0.75)
  const maxChars = usableTokens * 4

  // Set reasonable bounds: minimum 4000, maximum 200000 characters
  return Math.max(4000, Math.min(maxChars, 200000))
})

const canSend = computed(() => {
  const hasMessage = message.value.trim().length > 0
  const hasFiles = attachedFiles.value.length > 0
  const isValidLength = message.value.length <= maxCharacters.value

  return (hasMessage || hasFiles) && !props.disabled && isValidLength
})

// Watch for file changes and guidelines to adjust height
watch(() => attachedFiles.value.length, () => {
  nextTick(() => {
    adjustHeight()
  })
})

// Watch for guidelines visibility to adjust height
watch(() => showFileGuidelines.value, () => {
  nextTick(() => {
    adjustHeight()
  })
})

// Browser focus handlers
let focusHandler: (() => void) | null = null

onMounted(() => {
  console.log('🚀 ChatInput mounted')

  // Initialize textarea height and focus
  nextTick(() => {
    if (textareaRef.value) {
      // Set initial height
      textareaRef.value.style.height = '56px'
      textareaRef.value.focus()
    }
  })

  // Add focus handler to re-focus when window becomes active
  focusHandler = () => {
    console.log('🎯 Window focused, re-focusing chat input')
    if (textareaRef.value && !props.disabled) {
      textareaRef.value.focus()
    }
  }

  window.addEventListener('focus', focusHandler)
  console.log('✅ ChatInput focus handler added')
})

onUnmounted(() => {
  console.log('🧹 ChatInput unmounting, cleaning up')
  if (focusHandler) {
    window.removeEventListener('focus', focusHandler)
  }
})

function handleKeydown(event: KeyboardEvent) {
  try {
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log('🚀 Enter key pressed, sending message')
      event.preventDefault()
      sendMessage()
    }
  } catch (error) {
    console.error('❌ Error in handleKeydown:', error)
  }
}

function sendMessage() {
  try {
    console.log('🚀 Send message triggered')

    if (!canSend.value) {
      console.warn('❌ Cannot send: canSend is false')
      return
    }

    const messageText = message.value.trim()
    const hasFiles = attachedFiles.value.length > 0

    if (!messageText && !hasFiles) {
      console.warn('❌ Cannot send: no message or files')
      return
    }

    console.log('✅ Sending message:', {
      text: messageText,
      fileCount: attachedFiles.value.length
    })

    // Emit the message with files
    emit('send', messageText, attachedFiles.value.length > 0 ? attachedFiles.value : undefined)

    // Clear the input and files
    message.value = ''
    attachedFiles.value = []
    fileError.value = null
    resetHeight()

    // Focus back to textarea for better UX
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.focus()
      }
    })

    console.log('✅ Message sent successfully')
  } catch (error) {
    console.error('❌ Error sending message:', error)
    // Show user-friendly error
    alert('Failed to send message. Please try again.')
  }
}

function handleFilesSelected(files: FileAttachment[]) {
  attachedFiles.value = [...attachedFiles.value, ...files]
  fileError.value = null
  // Recalculate height when files are added
  nextTick(() => {
    adjustHeight()
  })
}

function handleFileError(error: string) {
  fileError.value = error
  console.error('📎 File upload error:', error)
}

async function adjustHeight() {
  await nextTick()
  if (textareaRef.value) {
    // Store current height for comparison
    const currentHeight = textareaRef.value.offsetHeight

    // Reset height to auto to get the natural scroll height
    textareaRef.value.style.height = 'auto'

    const scrollHeight = textareaRef.value.scrollHeight
    const minHeight = 56 // Minimum height in pixels
    const maxHeight = 200 // Maximum height in pixels

    // Calculate new height within bounds
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight))
    textareaRef.value.style.height = newHeight + 'px'

    // Enable/disable scrolling based on content
    if (scrollHeight > maxHeight) {
      textareaRef.value.style.overflowY = 'auto'
    } else {
      textareaRef.value.style.overflowY = 'hidden'
    }

    // Calculate total input area height including file previews
    await nextTick()
    const totalHeight = calculateTotalInputHeight()

    // Emit height change if it actually changed
    if (totalHeight !== currentHeight) {
      emit('height-change', totalHeight)
    }
  }
}

function calculateTotalInputHeight(): number {
  let totalHeight = 56 // Base textarea height

  if (textareaRef.value) {
    totalHeight = textareaRef.value.offsetHeight
  }

  // Add file preview height if files are attached
  if (attachedFiles.value.length > 0) {
    const filePreviewHeight = Math.min(attachedFiles.value.length * 50, 128) // Max 128px (max-h-32)
    totalHeight += filePreviewHeight + 12 // Add margin
  }

  // Add file guidelines height if shown
  if (showFileGuidelines.value) {
    totalHeight += 80 // Approximate height of guidelines box + margin
  }

  // Add space for character count and controls
  totalHeight += 40

  return totalHeight
}

function resetHeight() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.overflowY = 'hidden'
    // Force minimum height
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = '56px'
      }
    })
  }
}

// Expose focus method for parent components
defineExpose({
  focus: () => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  }
})
</script>

<style scoped>
textarea {
  scrollbar-width: thin;
  scrollbar-color: rgb(156 163 175) transparent;
  /* Ensure proper box sizing */
  box-sizing: border-box;
  /* Prevent horizontal scrolling */
  overflow-x: hidden;
  /* Better line height for readability */
  line-height: 1.5;
  /* Smooth transitions */
  transition: height 0.2s ease;
}

textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background-color: rgb(156 163 175);
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background-color: rgb(107 114 128);
}

/* Ensure the container grows properly */
.relative {
  display: flex;
  align-items: flex-end;
  min-height: 56px;
  /* Prevent layout shifts */
  contain: layout;
}

/* Better focus styles */
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Ensure smooth height transitions */
.flex-1 {
  transition: all 0.2s ease;
}

/* Prevent button jumping during height changes */
.pb-3 {
  align-self: flex-end;
}
</style>
