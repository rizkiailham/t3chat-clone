<template>
  <div class="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <!-- Sidebar -->
    <div
      class="glass border-r border-white/20 dark:border-gray-700/50 flex flex-col transition-all duration-500 ease-out fixed lg:relative z-40 h-full backdrop-blur-xl"
      :class="{
        'w-80 translate-x-0': showSidebar,
        'w-0 -translate-x-full lg:translate-x-0 lg:w-16': !showSidebar,
        'lg:w-80': showSidebar && !isMobile,
        'lg:w-16': !showSidebar && !isMobile
      }"
    >
      <!-- Header -->
      <div class="p-6 border-b border-white/10 dark:border-gray-700/50">
        <div class="flex items-center justify-between">
          <h1
            v-if="showSidebar || isMobile"
            class="text-xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            T3 Chat Clone
          </h1>
          <div class="flex items-center space-x-2">
            <button
              v-if="showSidebar || isMobile"
              @click="showNewChatModal = true"
              class="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
              title="New Chat"
            >
              <PlusIcon class="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
            <button
              v-if="!isMobile"
              @click="showSidebar = !showSidebar"
              class="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              :title="showSidebar ? 'Collapse Sidebar' : 'Expand Sidebar'"
            >
              <ChevronLeftIcon v-if="showSidebar" class="w-5 h-5 transition-transform duration-200" />
              <ChevronRightIcon v-else class="w-5 h-5 transition-transform duration-200" />
            </button>
          </div>
        </div>

        <!-- Collapsed state - show only icons -->
        <div v-if="!showSidebar && !isMobile" class="flex flex-col items-center space-y-3 mt-6">
          <button
            @click="showNewChatModal = true"
            class="p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group"
            title="New Chat"
          >
            <PlusIcon class="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
      </div>

      <!-- Conversation List -->
      <ConversationList
        @conversation-selected="handleConversationSelected"
        :collapsed="!showSidebar && !isMobile"
      />

      <!-- User Menu -->
      <div class="p-4 border-t border-white/10 dark:border-gray-700/50 mt-auto">
        <div v-if="showSidebar || isMobile" class="flex items-center space-x-3 p-3 rounded-xl glass-subtle hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group">
          <div class="relative">
            <img
              :src="authStore.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'User')}&background=3b82f6&color=fff`"
              :alt="authStore.user?.name"
              class="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 dark:ring-gray-600/50 transition-all duration-200 group-hover:ring-blue-400/50"
              @error="handleAvatarError"
              @load="() => console.log('Avatar loaded:', authStore.user?.avatar_url)"
            >
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white dark:ring-gray-800"></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ authStore.user?.email }}
            </p>
          </div>
          <button
            @click="handleSignOut"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            title="Sign Out"
          >
            <ArrowRightStartOnRectangleIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Collapsed state -->
        <div v-else class="flex justify-center">
          <div class="relative group">
            <img
              :src="authStore.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'User')}&background=3b82f6&color=fff`"
              :alt="authStore.user?.name"
              class="w-8 h-8 rounded-full object-cover ring-2 ring-white/20 dark:ring-gray-600/50 cursor-pointer hover:ring-blue-400/50 transition-all duration-200"
              @error="handleAvatarError"
              @click="handleSignOut"
              title="Sign Out"
            >
            <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full ring-1 ring-white dark:ring-gray-800"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="showSidebar"
      @click="showSidebar = false"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
    ></div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col lg:ml-0" :class="{ 'ml-0': !showSidebar }">
      <!-- Chat Header -->
      <div class="p-6 border-b border-white/10 dark:border-gray-700/50 glass backdrop-blur-xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Mobile menu button -->
            <button
              @click="showSidebar = !showSidebar"
              class="lg:hidden p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Bars3Icon class="w-5 h-5" />
            </button>

            <div v-if="chatStore.currentConversation" class="animate-fade-in">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ chatStore.currentConversation.title }}
              </h2>
              <div class="flex items-center space-x-2 mt-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {{ chatStore.currentConversation.model_provider }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ chatStore.currentConversation.model_name }}
                </span>
              </div>
            </div>
            <div v-else class="animate-fade-in">
              <h2 class="text-xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                T3 Chat Clone
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select a conversation or start a new chat
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="showSettings = true"
              class="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
              title="Settings"
            >
              <CogIcon class="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-hidden relative">
        <div v-if="!chatStore.currentConversation" class="h-full flex items-center justify-center p-8">
          <div class="text-center max-w-md mx-auto animate-fade-in">
            <div class="relative mb-8">
              <div class="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ChatBubbleLeftRightIcon class="w-10 h-10 text-white" />
              </div>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome to T3 Chat Clone</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Start a new conversation to begin chatting with AI. Experience the power of modern conversational AI.
            </p>
            <button
              @click="showNewChatModal = true"
              class="btn-primary inline-flex items-center space-x-2 px-6 py-3 text-base font-semibold"
            >
              <PlusIcon class="w-5 h-5" />
              <span>Start New Chat</span>
            </button>
          </div>
        </div>

        <div v-else class="h-full flex flex-col">
          <!-- Error Message -->
          <div v-if="chatStore.error" class="mx-6 mt-4 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl backdrop-blur-sm animate-slide-in-left">
            <div class="flex items-start">
              <div class="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                <ExclamationCircleIcon class="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Error</h4>
                <p class="text-sm text-red-700 dark:text-red-300">
                  {{ chatStore.error }}
                </p>
              </div>
              <button
                @click="chatStore.clearError()"
                class="flex-shrink-0 p-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-6">
            <MessageBubble
              v-for="message in chatStore.messages"
              :key="message.id"
              :message="message"
              @edit="handleEditMessage"
              @regenerate="handleRegenerateMessage"
              class="animate-fade-in"
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
