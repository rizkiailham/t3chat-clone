<template>
  <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="max-w-4xl mx-auto">
      <div class="relative">
        <!-- Text Area -->
        <textarea
          ref="textareaRef"
          v-model="message"
          @keydown="handleKeydown"
          @input="adjustHeight"
          :disabled="disabled"
          placeholder="Type your message... (Shift+Enter for new line, Enter to send)"
          class="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'min-h-[44px]': true }"
          rows="1"
        ></textarea>

        <!-- Send Button -->
        <button
          @click="sendMessage"
          :disabled="!canSend"
          class="absolute right-2 bottom-2 p-2 rounded-md transition-colors"
          :class="canSend 
            ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
            : 'text-gray-400 cursor-not-allowed'"
        >
          <PaperAirplaneIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Character count and shortcuts -->
      <div class="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div class="flex items-center space-x-4">
          <span>{{ message.length }}/4000</span>
          <span class="hidden sm:inline">Shift+Enter for new line</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Attachment button (future feature) -->
          <button
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-50 cursor-not-allowed"
            title="Attachments (coming soon)"
            disabled
          >
            <PaperClipIcon class="w-4 h-4" />
          </button>
          
          <!-- Voice input button (future feature) -->
          <button
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-50 cursor-not-allowed"
            title="Voice input (coming soon)"
            disabled
          >
            <MicrophoneIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
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

onMounted(() => {
  // Focus the textarea when component mounts
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function sendMessage() {
  if (!canSend.value) return

  const messageText = message.value.trim()
  if (messageText) {
    emit('send', messageText)
    message.value = ''
    resetHeight()
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
