<template>
  <div class="w-full">
    <div class="relative">
      <!-- Text Area -->
      <textarea
        ref="textareaRef"
        v-model="message"
        @keydown="handleKeydown"
        @input="adjustHeight"
        :disabled="disabled"
        placeholder="Message the AI..."
        class="w-full resize-none max-h-[60px] border-0 bg-transparent pt-4 pr-16 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        :class="{ 'min-h-[56px]': true }"
        rows="1"
      ></textarea>

      <!-- Send Button -->
      <button
        @click="sendMessage"
        :disabled="!canSend"
        class="absolute right-3 bottom-3 p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
        :class="canSend
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'"
      >
        <PaperAirplaneIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Character count and shortcuts -->
    <div class="flex items-center justify-start text-sm text-gray-500 dark:text-gray-400">
        

        <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-6">
          <span class="hidden sm:inline text-xs opacity-75">
            Shift+Enter for new line • Enter to send
          </span>
        </div>
          <!-- Attachment button (future feature) -->
          <button
            class="sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 opacity-50 cursor-not-allowed"
            title="Attachments (coming soon)"
            disabled
          >
            <PaperClipIcon class="w-4 h-4" />
          </button>

          <!-- Voice input button (future feature) -->
          <!-- <button
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 opacity-50 cursor-not-allowed"
            title="Voice input (coming soon)"
            disabled
          >
            <MicrophoneIcon class="w-4 h-4" />
          </button> -->
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  MicrophoneIcon 
} from '@heroicons/vue/24/outline'

interface Props {
  disabled?: boolean
}

interface Emits {
  (e: 'send', message: string): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const message = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

const canSend = computed(() => {
  return message.value.trim().length > 0 && !props.disabled && message.value.length <= 4000
})

// Browser focus handlers
let focusHandler: (() => void) | null = null

onMounted(() => {
  console.log('🚀 ChatInput mounted')

  // Focus the textarea when component mounts
  if (textareaRef.value) {
    textareaRef.value.focus()
  }

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
    if (!messageText) {
      console.warn('❌ Cannot send: message is empty')
      return
    }

    console.log('✅ Sending message:', messageText)

    // Emit the message
    emit('send', messageText)

    // Clear the input
    message.value = ''
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

async function adjustHeight() {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight
    const maxHeight = 200 // Maximum height in pixels
    textareaRef.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }
}

function resetHeight() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
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
</style>
