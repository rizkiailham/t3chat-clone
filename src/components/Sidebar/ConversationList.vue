<template>
  <div class="flex-1 overflow-y-auto">
    <!-- Loading state -->
    <div v-if="chatStore.loading && !chatStore.conversations.length" class="p-4">
      <div class="space-y-3">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!chatStore.conversations.length" class="p-4 text-center">
      <div class="text-gray-500 dark:text-gray-400">
        <ChatBubbleLeftIcon class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p class="text-sm">No conversations yet</p>
        <p class="text-xs mt-1">Start a new chat to begin</p>
      </div>
    </div>

    <!-- Conversations list -->
    <div v-else class="p-3">
      <div class="space-y-2">
        <div
          v-for="conversation in chatStore.conversations"
          :key="conversation.id"
          @click="selectConversation(conversation)"
          class="group relative flex items-center rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          :class="[
            isSelected(conversation)
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-700/50 shadow-lg'
              : 'hover:bg-white/50 dark:hover:bg-gray-700/50 hover:shadow-md',
            collapsed ? 'justify-center' : 'p-4'
          ]"
        >
          <!-- Collapsed state - show only avatar/icon -->
          <div v-if="collapsed" class="flex items-center justify-center">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 group-hover:scale-110"
              :class="isSelected(conversation)
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-2 ring-blue-200 dark:ring-blue-800'
                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-300'"
              :title="conversation.title"
            >
              {{ conversation.title.charAt(0).toUpperCase() }}
            </div>
          </div>

          <!-- Expanded state - show full content -->
          <div v-else class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <h3
                class="text-sm font-semibold truncate leading-tight"
                :class="isSelected(conversation)
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-gray-900 dark:text-white'"
              >
                {{ conversation.title }}
              </h3>
              <span
                class="text-xs ml-3 flex-shrink-0 font-medium"
                :class="isSelected(conversation)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'"
              >
                {{ formatDate(conversation.updated_at) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span
                  class="inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200"
                  :class="isSelected(conversation)
                    ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700'
                    : 'bg-gray-100 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300'"
                >
                  {{ conversation.model_provider }}
                </span>
                <span
                  class="text-xs truncate font-medium"
                  :class="isSelected(conversation)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'"
                >
                  {{ conversation.model_name }}
                </span>
              </div>

              <!-- Shared indicator -->
              <div v-if="conversation.is_shared" class="flex items-center">
                <span
                  class="inline-flex items-center text-xs px-2 py-1 rounded-full font-medium bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-700"
                >
                  <ShareIcon class="w-3 h-3 mr-1" />
                  Shared
                </span>
              </div>
            </div>
          </div>

          <!-- Actions menu (only in expanded state) -->
          <div v-if="!collapsed" class="opacity-0 group-hover:opacity-100 transition-all duration-200 ml-3">
            <button
              @click.stop="showMenu(conversation, $event)"
              class="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <EllipsisVerticalIcon class="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Context menu -->
    <div
      v-if="menuConversation"
      ref="menuRef"
      class="fixed z-50 glass border border-white/20 dark:border-gray-700/50 rounded-xl shadow-xl backdrop-blur-xl py-2 min-w-[180px] animate-scale-in"
      :style="menuPosition"
    >
      <button
        @click="renameConversation"
        class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-3"
      >
        <PencilIcon class="w-4 h-4" />
        <span>Rename</span>
      </button>
      <button
        @click="duplicateConversation"
        class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-3"
      >
        <DocumentDuplicateIcon class="w-4 h-4" />
        <span>Duplicate</span>
      </button>

      <!-- Sharing options -->
      <hr class="my-2 border-gray-200/50 dark:border-gray-700/50">
      <button
        v-if="!menuConversation?.is_shared"
        @click="shareConversation"
        class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-3"
      >
        <ShareIcon class="w-4 h-4" />
        <span>Share</span>
      </button>
      <button
        v-if="menuConversation?.is_shared"
        @click="copyShareLink"
        class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-3"
      >
        <LinkIcon class="w-4 h-4" />
        <span>Copy Link</span>
      </button>
      <button
        v-if="menuConversation?.is_shared"
        @click="unshareConversation"
        class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-3"
      >
        <EyeSlashIcon class="w-4 h-4" />
        <span>Unshare</span>
      </button>

      <hr class="my-2 border-gray-200/50 dark:border-gray-700/50">
      <button
        @click="deleteConversation"
        class="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center space-x-3"
      >
        <TrashIcon class="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ShareIcon,
  LinkIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'
import { useChatStore } from '../../stores/chat'
import type { Conversation } from '../../types'

interface Props {
  collapsed?: boolean
}

interface Emits {
  (e: 'conversationSelected'): void
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const emit = defineEmits<Emits>()
const chatStore = useChatStore()

const menuConversation = ref<Conversation | null>(null)
const menuPosition = ref({ top: '0px', left: '0px' })
const menuRef = ref<HTMLElement>()

const isSelected = (conversation: Conversation) => {
  return chatStore.currentConversation?.id === conversation.id
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return 'now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}d`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

async function selectConversation(conversation: Conversation) {
  const maxRetries = 3
  let lastError: any = null

  console.log('🎯 ConversationList: Selecting conversation:', conversation.id, conversation.title)

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ConversationList: Selection attempt ${attempt + 1}/${maxRetries + 1}`)

      // Pre-selection validation on retries
      if (attempt > 0) {
        console.log('🔍 ConversationList: Pre-selection validation...')

        // Check if chat store is in a good state
        if (chatStore.loading) {
          console.log('⏳ Chat store is loading, waiting...')
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Progressive delay
        const delay = Math.min(1000 * attempt, 2000)
        console.log(`⏳ ConversationList: Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Attempt conversation selection
      await chatStore.selectConversation(conversation)

      console.log('✅ ConversationList: Conversation selected successfully')

      // Navigate to conversation URL
      chatStore.navigateToConversation(conversation.id)

      // Emit event to close mobile sidebar
      emit('conversationSelected')

      // Success - break out of retry loop
      break

    } catch (error: any) {
      lastError = error
      console.error(`❌ ConversationList: Selection failed (attempt ${attempt + 1}):`, {
        message: error.message,
        code: error.code,
        status: error.status
      })

      // Analyze error for retry decision
      const isRetryable = error.message?.includes('auth') ||
                         error.message?.includes('JWT') ||
                         error.message?.includes('session') ||
                         error.message?.includes('network') ||
                         error.message?.includes('fetch') ||
                         error.message?.includes('timeout') ||
                         !error.status

      console.log(`🔍 ConversationList: Error retryable: ${isRetryable}`)

      // If we have retries left and it's retryable
      if (attempt < maxRetries && isRetryable) {
        console.log(`🔄 ConversationList: Will retry (${maxRetries - attempt} attempts left)`)
        continue
      }

      // No more retries or non-retryable error
      console.error(`💥 ConversationList: Selection failed permanently after ${attempt + 1} attempts`)

      // Show user-friendly error
      if (error.message?.includes('auth') || error.message?.includes('JWT')) {
        alert('Session expired. Please refresh the page and try again.')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        alert('Network error. Please check your connection and try again.')
      } else if (error.message?.includes('timeout')) {
        alert('Request timed out. Please try again.')
      } else {
        alert('Failed to load conversation. Please try again.')
      }

      break
    }
  }
}

function showMenu(conversation: Conversation, event?: MouseEvent) {
  menuConversation.value = conversation

  if (event) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    menuPosition.value = {
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`
    }
  }
}

function hideMenu() {
  menuConversation.value = null
}

async function renameConversation() {
  if (!menuConversation.value) return

  const newTitle = prompt('Enter new title:', menuConversation.value.title)
  if (newTitle && newTitle.trim()) {
    try {
      await chatStore.updateConversationTitle(menuConversation.value.id, newTitle.trim())
    } catch (error) {
      console.error('Failed to rename conversation:', error)
    }
  }

  hideMenu()
}

async function duplicateConversation() {
  if (!menuConversation.value) return

  try {
    await chatStore.duplicateConversation(menuConversation.value.id)
  } catch (error) {
    console.error('Failed to duplicate conversation:', error)
  }

  hideMenu()
}

async function deleteConversation() {
  if (!menuConversation.value) return

  if (confirm('Are you sure you want to delete this conversation?')) {
    try {
      await chatStore.deleteConversation(menuConversation.value.id)
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  hideMenu()
}

// Sharing functions
async function shareConversation() {
  if (!menuConversation.value) return

  try {
    const sharedConversation = await chatStore.shareConversation(menuConversation.value.id)

    // Show success message
    alert(`Conversation shared! Link copied to clipboard.\n\nShare URL: ${window.location.origin}/share/${sharedConversation.share_id}`)
  } catch (error) {
    console.error('Failed to share conversation:', error)
    alert('Failed to share conversation. Please try again.')
  }

  hideMenu()
}

async function unshareConversation() {
  if (!menuConversation.value) return

  if (confirm('Are you sure you want to stop sharing this conversation? The share link will no longer work.')) {
    try {
      await chatStore.unshareConversation(menuConversation.value.id)
      alert('Conversation is no longer shared.')
    } catch (error) {
      console.error('Failed to unshare conversation:', error)
      alert('Failed to unshare conversation. Please try again.')
    }
  }

  hideMenu()
}

async function copyShareLink() {
  if (!menuConversation.value?.share_id) return

  try {
    const shareUrl = `${window.location.origin}/share/${menuConversation.value.share_id}`
    await navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy share link:', error)
    alert('Failed to copy link. Please try again.')
  }

  hideMenu()
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    hideMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
