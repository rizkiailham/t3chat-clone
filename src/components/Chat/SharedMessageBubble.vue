<template>
  <div class="flex items-start space-x-4 group">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
        :class="avatarClasses"
      >
        <UserIcon v-if="message.role === 'user'" class="w-5 h-5 text-white" />
        <SparklesIcon v-else class="w-5 h-5 text-white" />
      </div>
    </div>

    <!-- Message Content -->
    <div class="flex-1 min-w-0">
      <!-- Role Label -->
      <div class="flex items-center space-x-2 mb-2">
        <span
          class="text-sm font-semibold"
          :class="message.role === 'user'
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-purple-700 dark:text-purple-300'"
        >
          {{ message.role === 'user' ? 'You' : 'Assistant' }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatTime(message.created_at) }}
        </span>
      </div>

      <!-- Message Attachments (above the bubble) -->
      <MessageAttachments
        v-if="message.role === 'user' && message.metadata?.attachments"
        :attachments="message.metadata.attachments"
      />

      <!-- Message Bubble -->
      <div
        class="relative rounded-2xl p-4 shadow-sm border transition-all duration-200"
        :class="bubbleClasses"
      >
        <!-- Content -->
        <div class="prose prose-sm dark:prose-invert max-w-none">
          <div v-if="message.role === 'user'" class="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {{ message.content }}
          </div>
          <div v-else class="space-y-4">
            <MarkdownRenderer :content="message.content" />
          </div>
        </div>

        <!-- Copy Button -->
        <button
          @click="copyMessage"
          class="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Copy message"
        >
          <ClipboardIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserIcon, SparklesIcon, ClipboardIcon } from '@heroicons/vue/24/outline'
import type { Message } from '../../types'
import MarkdownRenderer from './MarkdownRenderer.vue'
import MessageAttachments from './MessageAttachments.vue'

interface Props {
  message: Message
}

const props = defineProps<Props>()

const avatarClasses = computed(() => {
  if (props.message.role === 'user') {
    return 'bg-gradient-to-br from-blue-500 to-blue-600'
  } else {
    return 'bg-gradient-to-br from-purple-500 to-purple-600'
  }
})

const bubbleClasses = computed(() => {
  if (props.message.role === 'user') {
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50'
  } else {
    return 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50'
  }
})

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function copyMessage() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy message:', error)
  }
}
</script>

<style scoped>
.prose {
  @apply text-gray-900 dark:text-gray-100;
}

.prose :deep(pre) {
  @apply bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg;
}

.prose :deep(code) {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-sm;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300;
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4),
.prose :deep(h5),
.prose :deep(h6) {
  @apply text-gray-900 dark:text-gray-100 font-semibold;
}

.prose :deep(ul),
.prose :deep(ol) {
  @apply text-gray-900 dark:text-gray-100;
}

.prose :deep(li) {
  @apply text-gray-900 dark:text-gray-100;
}

.prose :deep(strong) {
  @apply text-gray-900 dark:text-gray-100 font-semibold;
}

.prose :deep(em) {
  @apply text-gray-700 dark:text-gray-300;
}

.prose :deep(a) {
  @apply text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300;
}

.prose :deep(table) {
  @apply border-collapse border border-gray-300 dark:border-gray-600;
}

.prose :deep(th),
.prose :deep(td) {
  @apply border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100;
}

.prose :deep(th) {
  @apply bg-gray-100 dark:bg-gray-800 font-semibold;
}
</style>
