<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <div
      class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out fixed lg:relative z-40 h-full"
      :class="{
        'w-80 translate-x-0': showSidebar,
        'w-0 -translate-x-full lg:translate-x-0 lg:w-16': !showSidebar,
        'lg:w-80': showSidebar && !isMobile,
        'lg:w-16': !showSidebar && !isMobile
      }"
    >
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h1
            v-if="showSidebar || isMobile"
            class="text-xl font-semibold text-gray-900 dark:text-white"
          >
            T3 Chat Clone
          </h1>
          <div class="flex items-center space-x-2">
            <button
              v-if="showSidebar || isMobile"
              @click="showNewChatModal = true"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="New Chat"
            >
              <PlusIcon class="w-5 h-5" />
            </button>
            <button
              v-if="!isMobile"
              @click="showSidebar = !showSidebar"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              :title="showSidebar ? 'Collapse Sidebar' : 'Expand Sidebar'"
            >
              <ChevronLeftIcon v-if="showSidebar" class="w-5 h-5" />
              <ChevronRightIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Collapsed state - show only icons -->
        <div v-if="!showSidebar && !isMobile" class="flex flex-col items-center space-y-3 mt-4">
          <button
            @click="showNewChatModal = true"
            class="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="New Chat"
          >
            <PlusIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Conversation List -->
      <ConversationList
        @conversation-selected="handleConversationSelected"
        :collapsed="!showSidebar && !isMobile"
      />

      <!-- User Menu -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <div v-if="showSidebar || isMobile" class="flex items-center space-x-3">
          <img
            :src="authStore.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'User')}&background=3b82f6&color=fff`"
            :alt="authStore.user?.name"
            class="w-8 h-8 rounded-full object-cover"
            @error="handleAvatarError"
            @load="() => console.log('Avatar loaded:', authStore.user?.avatar_url)"
          >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ authStore.user?.email }}
            </p>
          </div>
          <button
            @click="handleSignOut"
            class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Sign Out"
          >
            <ArrowRightStartOnRectangleIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Collapsed state -->
        <div v-else class="flex flex-col items-center space-y-2">
          <img
            :src="authStore.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'User')}&background=3b82f6&color=fff`"
            :alt="authStore.user?.name"
            class="w-8 h-8 rounded-full object-cover"
            @error="handleAvatarError"
          >
          <button
            @click="handleSignOut"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Sign Out"
          >
            <ArrowRightStartOnRectangleIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="showSidebar"
      @click="showSidebar = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
    ></div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col lg:ml-0" :class="{ 'ml-0': !showSidebar }">
      <!-- Chat Header -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Mobile menu button -->
            <button
              @click="showSidebar = !showSidebar"
              class="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bars3Icon class="w-5 h-5" />
            </button>

            <div v-if="chatStore.currentConversation">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ chatStore.currentConversation.title }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ chatStore.currentConversation.model_provider }} • {{ chatStore.currentConversation.model_name }}
              </p>
            </div>
            <div v-else>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                T3 Chat Clone
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Select a conversation or start a new chat
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="showSettings = true"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <CogIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-hidden">
        <div v-if="!chatStore.currentConversation" class="h-full flex items-center justify-center">
          <div class="text-center">
            <ChatBubbleLeftRightIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Welcome to T3 Chat Clone</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">Start a new conversation to begin chatting with AI</p>
            <button
              @click="showNewChatModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Chat
            </button>
          </div>
        </div>

        <div v-else class="h-full flex flex-col">
          <!-- Error Message -->
          <div v-if="chatStore.error" class="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div class="flex items-start">
              <ExclamationCircleIcon class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <div class="text-sm text-red-800 dark:text-red-200">
                {{ chatStore.error }}
              </div>
              <button
                @click="chatStore.clearError()"
                class="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
            <MessageBubble
              v-for="message in chatStore.messages"
              :key="message.id"
              :message="message"
              @edit="handleEditMessage"
              @regenerate="handleRegenerateMessage"
            />
            

          </div>

          <!-- Chat Input -->
          <ChatInput @send="handleSendMessage" :disabled="chatStore.streaming" />
        </div>
      </div>
    </div>

    <!-- New Chat Modal -->
    <NewChatModal
      v-if="showNewChatModal"
      @close="showNewChatModal = false"
      @create="handleCreateConversation"
    />

    <!-- Settings Modal -->
    <SettingsModal
      v-if="showSettings"
      @close="showSettings = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '../../stores/chat'
import {
  PlusIcon,
  CogIcon,
  ArrowRightStartOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

import ConversationList from '../Sidebar/ConversationList.vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'
import NewChatModal from '../Modals/NewChatModal.vue'
import SettingsModal from '../Modals/SettingsModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

const messagesContainer = ref<HTMLElement>()
const showNewChatModal = ref(false)
const showSettings = ref(false)
const showSidebar = ref(true) // Default to expanded



// Detect mobile
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await chatStore.loadConversations()
})

// Auto-scroll to bottom when new messages arrive
watch(() => chatStore.messages.length, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})

async function handleSendMessage(content: string) {
  try {
    await chatStore.sendMessage(content, true)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

async function handleCreateConversation(data: { title: string; provider: string; model: string }) {
  try {
    await chatStore.createConversation(data.title, data.provider, data.model)
    showNewChatModal.value = false
  } catch (error) {
    console.error('Failed to create conversation:', error)
  }
}

function handleConversationSelected() {
  if (isMobile.value) {
    showSidebar.value = false
  }
}

function handleAvatarError(event: Event) {
  const img = event.target as HTMLImageElement
  console.log('Avatar error, falling back to UI-Avatars. Original src:', img.src)
  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'User')}&background=3b82f6&color=fff`
}

async function handleEditMessage(messageId: string, newContent: string) {
  try {
    await chatStore.editMessage(messageId, newContent)
  } catch (error) {
    console.error('Failed to edit message:', error)
  }
}

async function handleRegenerateMessage(messageId: string) {
  try {
    await chatStore.regenerateMessage(messageId)
  } catch (error) {
    console.error('Failed to regenerate message:', error)
  }
}

async function handleSignOut() {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Failed to sign out:', error)
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
