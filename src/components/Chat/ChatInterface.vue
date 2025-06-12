<template>
  <div class="flex ml-[-2px] h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
    <!-- Sidebar -->
    <div
      class="glass border-r border-white/20 dark:border-gray-700/50 flex flex-col transition-all duration-300 ease-out backdrop-blur-xl"
      :class="{
        'w-80 translate-x-0 fixed lg:relative z-40 h-full': showSidebar,
        'w-0 -translate-x-full lg:translate-x-0 lg:w-16 lg:relative': !showSidebar,
        'lg:w-80': showSidebar && !isMobile,
        'lg:w-16': !showSidebar && !isMobile
      }"
    >
      <!-- Header -->
      <div v-if="!isMobile || isMobile && showSidebar" class="p-[12px] border-b border-white/10 dark:border-gray-700/50">
        <div class="flex items-center justify-between">
          <h1
            v-if="showSidebar || isMobile"
            class="text-lg lg:text-xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate"
          >
            T3 Chat
          </h1>
          <div class="flex items-center space-x-2 flex-shrink-0">
            <button
              v-if="showSidebar || isMobile"
              @click="showNewChatModal = true"
              class="p-2 lg:p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
              title="New Chat"
            >
              <PencilSquareIcon class="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
            <button
              v-if="isMobile"
              @click="showSidebar = !showSidebar"
              class="lg:hidden p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ChevronLeftIcon class="w-5 h-5" />
            </button>
            <button
              v-if="!isMobile"
              @click="showSidebar = !showSidebar"
              class="p-2 lg:p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              :title="showSidebar ? 'Collapse Sidebar' : 'Expand Sidebar'"
            >
              <ChevronLeftIcon v-if="showSidebar" class="w-5 h-5 transition-transform duration-200" />
              <ChevronRightIcon v-else class="w-5 h-5 transition-transform duration-200" />
            </button>
          </div>
        </div>

        <!-- Collapsed state - show only icons -->

        <div v-if="!showSidebar && !isMobile" class="flex flex-col items-center space-y-3 mt-4 lg:mt-6">
          <button
            @click="showNewChatModal = true"
            class="p-2.5 lg:p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group"
            title="New Chat"
          >
            <PencilSquareIcon class="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
      </div>

      <!-- Conversation List -->
      <ConversationList
        @conversation-selected="handleConversationSelected"
        :collapsed="!showSidebar && !isMobile"
      />

      <!-- User Menu -->
      <div class="p-3 lg:p-4 border-t border-white/10 dark:border-gray-700/50 mt-auto flex-shrink-0">
        <div v-if="showSidebar || isMobile" class="flex items-center space-x-3 p-2 lg:p-3 rounded-xl glass-subtle hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group">
          <div class="relative flex-shrink-0">
            <img
              :src="authStore.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'User')}&background=3b82f6&color=fff`"
              :alt="authStore.user?.name"
              class="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover ring-2 ring-white/20 dark:ring-gray-600/50 transition-all duration-200 group-hover:ring-blue-400/50"
              @error="handleAvatarError"
              @load="() => console.log('Avatar loaded:', authStore.user?.avatar_url)"
            >
            <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-400 rounded-full ring-1 lg:ring-2 ring-white dark:ring-gray-800"></div>
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
            class="p-1.5 lg:p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
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
              class="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover ring-2 ring-white/20 dark:ring-gray-600/50 cursor-pointer hover:ring-blue-400/50 transition-all duration-200"
              @error="handleAvatarError"
              @click="handleSignOut"
              title="Sign Out"
            >
            <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-400 rounded-full ring-1 ring-white dark:ring-gray-800"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="showSidebar && isMobile"
      @click="showSidebar = false"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-300"
    ></div>

    <!-- Main Chat Area with Floating Glass Effect -->
    <div class="flex-1 flex flex-col min-w-0 relative p-4 lg:p-8">
      <!-- Floating Chat Container -->
      <div class="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <!-- Floating Chat Header -->
        <div class="gemini-glass-header mb-2">
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
                <h2 class="text-xs lg:text-xl font-bold text-gray-900 dark:text-white">
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
                  T3 Chat
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select a conversation or start a new chat
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <!-- Debug refresh button (remove in production) -->
              <button
                @click="handlePageVisible"
                class="p-2.5 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
                title="Refresh State (Debug)"
              >
                <svg class="w-5 h-5 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
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

        <!-- Floating Messages Area -->
        <div class="flex-1 overflow-hidden relative min-h-0">
          <div v-if="!chatStore.currentConversation" class="h-full flex items-center justify-center">
            <div class="gemini-welcome-card">
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
                <PencilSquareIcon class="w-5 h-5" />
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

            <!-- Messages Area (Normal Scrollable) -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto max-h-chat space-y-4 min-h-0">
              <MessageBubble
                v-for="message in chatStore.messages"
                :key="message.id"
                :message="message"
                @edit="handleEditMessage"
                @regenerate="handleRegenerateMessage"
                class="animate-fade-in"
              />
            </div>

            <!-- Floating Chat Input Container -->
            <div class="relative py-1">
              <div class="gemini-floating-input">
                <ChatInput
                  :key="`chat-input-${componentKey}`"
                  @send="handleSendMessage"
                  :disabled="chatStore.streaming"
                />
              </div>
              <div class="hidden sm:block text-center text-xs my-1">T3 can make mistakes, so double-check it</div>
            </div>
          </div>
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

    <!-- Debug Panel for Testing -->
    <div class="hidden fixed bottom-4 right-4 z-50">
      <div class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-xs space-y-2 max-w-xs">
        <div class="font-semibold text-yellow-800 dark:text-yellow-200">🧪 Debug Panel</div>
        <div class="space-y-1">
          <button
            @click="testCodeBlock"
            class="w-full px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs hover:bg-blue-300 dark:hover:bg-blue-700"
          >
            Test Code Block
          </button>
          <button
            @click="testFormattedText"
            class="w-full px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs hover:bg-green-300 dark:hover:bg-green-700"
          >
            Test Formatted Text
          </button>
          <button
            @click="testApiConnections"
            class="w-full px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-xs hover:bg-purple-300 dark:hover:bg-purple-700"
          >
            Test APIs
          </button>
          <button
            @click="forceRefresh"
            class="w-full px-2 py-1 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded text-xs hover:bg-orange-300 dark:hover:bg-orange-700"
          >
            Force Refresh
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '../../stores/chat'
import {
  PencilSquareIcon,
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
const componentKey = ref(0) // Force re-render key



const _windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0);

// Only add the event listener if in a browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    _windowWidth.value = window.innerWidth;
  });
}

// Export the reactive width and isMobile computed property
const windowWidth = _windowWidth;

const isMobile = computed(() => {
  console.log(windowWidth.value < 1024);
  return windowWidth.value < 1024;
});

// Browser visibility and focus handling
let visibilityChangeHandler: (() => void) | null = null
let focusHandler: (() => void) | null = null
let blurHandler: (() => void) | null = null

onMounted(async () => {
  console.log('🚀 ChatInterface mounted')

  if (!authStore.isAuthenticated) {
    console.log('❌ User not authenticated, redirecting to login')
    router.push('/login')
    return
  }

  console.log('✅ User authenticated, loading conversations')
  await chatStore.loadConversations()

  // Add browser visibility change handler
  visibilityChangeHandler = () => {
    console.log('👁️ Visibility changed:', document.visibilityState)
    if (document.visibilityState === 'visible') {
      console.log('🔄 Page became visible, refreshing state...')
      handlePageVisible()
    }
  }

  // Add window focus/blur handlers
  focusHandler = () => {
    console.log('🎯 Window focused, refreshing state...')
    handlePageVisible()
  }

  blurHandler = () => {
    console.log('😴 Window blurred')
  }

  // Add event listeners
  document.addEventListener('visibilitychange', visibilityChangeHandler)
  window.addEventListener('focus', focusHandler)
  window.addEventListener('blur', blurHandler)

  console.log('✅ Event listeners added for browser state management')
})

onUnmounted(() => {
  console.log('🧹 ChatInterface unmounting, cleaning up event listeners')

  // Remove event listeners
  if (visibilityChangeHandler) {
    document.removeEventListener('visibilitychange', visibilityChangeHandler)
  }
  if (focusHandler) {
    window.removeEventListener('focus', focusHandler)
  }
  if (blurHandler) {
    window.removeEventListener('blur', blurHandler)
  }
})

// Handle when page becomes visible/focused
async function handlePageVisible() {
  try {
    console.log('🔄 Handling page visible event')

    // First refresh authentication state
    await authStore.refreshAuth()

    // Re-check authentication after refresh
    if (!authStore.isAuthenticated) {
      console.log('❌ Authentication lost, redirecting to login')
      router.push('/login')
      return
    }

    // Refresh chat state
    await chatStore.refreshState()

    // Force component re-render to ensure all event handlers are reattached
    componentKey.value++
    console.log('🔄 Component key updated to force re-render:', componentKey.value)

    console.log('✅ Page visible handling completed')
  } catch (error) {
    console.error('❌ Error handling page visible:', error)
  }
}

// Auto-scroll to bottom when new messages arrive
watch(() => chatStore.messages.length, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})

// Watch for authentication changes
watch(() => authStore.isAuthenticated, (isAuth) => {
  console.log('🔐 Authentication state changed:', isAuth)
  if (!isAuth) {
    console.log('❌ User logged out, redirecting to login')
    router.push('/login')
  }
})

// Watch for current conversation changes
watch(() => chatStore.currentConversation, (newConv, oldConv) => {
  if (newConv && newConv.id !== oldConv?.id) {
    console.log('📝 Current conversation changed:', newConv.title)
    // Ensure messages are loaded for the new conversation
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
})

async function handleSendMessage(content: string) {
  try {
    console.log('🚀 ChatInterface: Handling send message:', content)

    // Ensure we have a valid state before sending
    if (!authStore.isAuthenticated) {
      console.warn('❌ User not authenticated')
      await authStore.refreshAuth()
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }
    }

    if (!content || !content.trim()) {
      console.warn('❌ Empty message content')
      return
    }

    if (!chatStore.currentConversation) {
      console.warn('❌ No current conversation')
      chatStore.error = 'Please select or create a conversation first'
      return
    }

    console.log('✅ Sending message to chat store...')
    await chatStore.sendMessage(content, true)
    console.log('✅ Message sent successfully')

  } catch (error) {
    console.error('❌ Failed to send message:', error)
    chatStore.error = 'Failed to send message. Please try again.'
  }
}

async function handleCreateConversation(data: { title: string; provider: string; model: string }) {
  try {
    console.log('🚀 ChatInterface: Creating conversation with data:', data)

    if (!data.title || !data.provider || !data.model) {
      console.warn('❌ Invalid conversation data:', data)
      chatStore.error = 'Please fill in all required fields'
      return
    }

    console.log('✅ Creating conversation...')
    await chatStore.createConversation(data.title, data.provider, data.model)

    console.log('✅ Conversation created successfully')
    showNewChatModal.value = false

    // Clear any previous errors
    chatStore.clearError()

  } catch (error) {
    console.error('❌ Failed to create conversation:', error)
    chatStore.error = 'Failed to create conversation. Please try again.'
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

// Debug functions for testing new features
function forceRefresh() {
  console.log('🔄 Force refreshing...')
  handlePageVisible()
}

async function testApiConnections() {
  console.log('🧪 Testing API connections...')

  try {
    // Test authentication
    console.log('🔐 Testing authentication...')
    const isAuth = authStore.isAuthenticated
    console.log('Auth status:', isAuth)

    if (isAuth) {
      console.log('✅ Authentication: OK')
    } else {
      console.log('❌ Authentication: FAILED')
      await authStore.refreshAuth()
    }

    // Test database connection
    console.log('🗄️ Testing database connection...')
    try {
      await chatStore.loadConversations()
      console.log('✅ Database: OK')
    } catch (dbError) {
      console.error('❌ Database: FAILED', dbError)
    }

    // Test current conversation
    if (chatStore.currentConversation) {
      console.log('💬 Testing current conversation...')
      console.log('Current conversation:', chatStore.currentConversation.title)
      console.log('Messages count:', chatStore.messages.length)
      console.log('✅ Conversation: OK')
    } else {
      console.log('⚠️ No current conversation selected')
    }

    console.log('✅ API connection test completed')
    alert('API connection test completed. Check console for details.')

  } catch (error) {
    console.error('❌ API connection test failed:', error)
    alert('API connection test failed. Check console for details.')
  }
}

function testCodeBlock() {
  console.log('🧪 Testing code block rendering...')

  if (!chatStore.currentConversation) {
    alert('Please create a conversation first!')
    return
  }

  const testCode = `Here's a JavaScript example:

\`\`\`javascript
function greetUser(name) {
  console.log(\`Hello, \${name}!\`);

  // Check if user is authenticated
  if (isAuthenticated()) {
    return \`Welcome back, \${name}!\`;
  }

  return 'Please log in first.';
}

// Usage example
const message = greetUser('John');
console.log(message);
\`\`\`

And here's a Python example:

\`\`\`python
def calculate_fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n

    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b

    return b

# Example usage
result = calculate_fibonacci(10)
print(f"The 10th Fibonacci number is: {result}")
\`\`\`

This demonstrates the new **Gemini-like code blocks** with syntax highlighting and copy functionality!`

  handleSendMessage(testCode)
}

function testFormattedText() {
  console.log('🧪 Testing formatted text rendering...')

  if (!chatStore.currentConversation) {
    alert('Please create a conversation first!')
    return
  }

  const testText = `# Welcome to Enhanced Text Formatting! 🎉

This message demonstrates the **new Gemini-like text formatting** capabilities:

## Features Included:

### 1. **Typography Improvements**
- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- \`inline code\` with proper styling
- [Links](https://example.com) with hover effects

### 2. **Lists and Structure**
* Bullet points with custom styling
* Multiple levels of organization
* Professional spacing and alignment

### 3. **Numbered Lists**
1. First item with proper numbering
2. Second item with consistent spacing
3. Third item demonstrating the flow

### 4. **Blockquotes**
> This is a blockquote that demonstrates
> how quoted text appears with the new styling.
> It has a clean, professional look!

### 5. **Code Integration**
Here's some inline code: \`const message = "Hello World!"\`

And here's how it integrates with larger text blocks for a **professional, readable experience** that matches modern AI interfaces like Gemini.

**The text is now more readable, properly spaced, and visually appealing!** ✨`

  handleSendMessage(testText)
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

/* Gemini-like Floating Glass Effects */
.gemini-glass-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark .gemini-glass-header {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(75, 85, 99, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.gemini-welcome-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: fade-in 0.6s ease-out;
}

.dark .gemini-welcome-card {
  background: rgba(31, 41, 55, 0.9);
  border-color: rgba(75, 85, 99, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Floating Input Area Only */
.gemini-floating-input {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  max-width: 1200px;
  margin: 0 auto;
}

.dark .gemini-floating-input {
  background: rgba(31, 41, 55, 0.9);
  border-color: rgba(75, 85, 99, 0.3);
}

.gemini-floating-input:hover {
  transform: translateY(-2px);
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .gemini-welcome-card {
    padding: 32px 24px;
    margin: 16px;
  }

  .gemini-glass-header {
    padding: 12px 16px;
    border-radius: 12px;
  }

  .gemini-floating-input {
    border-radius: 16px;
    padding: 12px;
    margin: 0 8px;
  }

  .max-h-chat {
    max-height: calc(100vh - 230px)!important;
  }
}

@media (min-width: 768px) {
  .max-h-chat {
    max-height: calc(100vh - 290px)!important;
  }
}
</style>
