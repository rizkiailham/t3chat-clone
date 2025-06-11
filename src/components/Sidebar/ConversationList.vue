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
    <div v-else class="p-2">
      <div class="space-y-1">
        <div
          v-for="conversation in chatStore.conversations"
          :key="conversation.id"
          @click="selectConversation(conversation)"
          class="group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors"
          :class="isSelected(conversation) 
            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'"
        >
          <!-- Conversation content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 
                class="text-sm font-medium truncate"
                :class="isSelected(conversation) 
                  ? 'text-blue-900 dark:text-blue-100' 
                  : 'text-gray-900 dark:text-white'"
              >
                {{ conversation.title }}
              </h3>
              <span 
                class="text-xs ml-2 flex-shrink-0"
                :class="isSelected(conversation) 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'"
              >
                {{ formatDate(conversation.updated_at) }}
              </span>
            </div>
            
            <div class="flex items-center mt-1 space-x-2">
              <span 
                class="text-xs px-2 py-0.5 rounded-full"
                :class="isSelected(conversation)
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'"
              >
                {{ conversation.model_provider }}
              </span>
              <span 
                class="text-xs truncate"
                :class="isSelected(conversation) 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'"
              >
                {{ conversation.model_name }}
              </span>
            </div>
          </div>

          <!-- Actions menu -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button
              @click.stop="showMenu(conversation)"
              class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
      class="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
      :style="menuPosition"
    >
      <button
        @click="renameConversation"
        class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <PencilIcon class="w-4 h-4 inline mr-2" />
        Rename
      </button>
      <button
        @click="duplicateConversation"
        class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <DocumentDuplicateIcon class="w-4 h-4 inline mr-2" />
        Duplicate
      </button>
      <hr class="my-1 border-gray-200 dark:border-gray-700">
      <button
        @click="deleteConversation"
        class="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <TrashIcon class="w-4 h-4 inline mr-2" />
        Delete
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
  TrashIcon
} from '@heroicons/vue/24/outline'
import { useChatStore } from '../../stores/chat'
import type { Conversation } from '../../types'

interface Emits {
  (e: 'conversationSelected'): void
}

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
  try {
    await chatStore.selectConversation(conversation)
    // Emit event to close mobile sidebar
    emit('conversationSelected')
  } catch (error) {
    console.error('Failed to select conversation:', error)
  }
}

function showMenu(conversation: Conversation, event?: MouseEvent) {
  menuConversation.value = conversation
  
  if (event) {
    menuPosition.value = {
      top: `${event.clientY}px`,
      left: `${event.clientX}px`
    }
  }
}

function hideMenu() {
  menuConversation.value = null
}

function renameConversation() {
  if (!menuConversation.value) return
  
  const newTitle = prompt('Enter new title:', menuConversation.value.title)
  if (newTitle && newTitle.trim()) {
    chatStore.updateConversationTitle(menuConversation.value.id, newTitle.trim())
  }
  
  hideMenu()
}

function duplicateConversation() {
  if (!menuConversation.value) return
  
  // Implementation for duplicating conversation
  console.log('Duplicate conversation:', menuConversation.value.id)
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
