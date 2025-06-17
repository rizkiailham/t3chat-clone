<template>
  <div class="flex ml-[-2px] h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
    <!-- Sidebar -->
    <div
      class="glass border-r border-white/20 dark:border-gray-700/50 flex flex-col transition-all duration-300 ease-out backdrop-blur-xl mobile-scroll"
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
              v-if="!isGuestMode && (showSidebar || isMobile)"
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

        <div v-if="!isGuestMode && !showSidebar && !isMobile" class="flex flex-col items-center space-y-3 mt-4 lg:mt-6">
          <button
            @click="showNewChatModal = true"
            class="p-2.5 lg:p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group"
            title="New Chat"
          >
            <PencilSquareIcon class="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
      </div>

      <!-- Conversation List (only for authenticated users) -->
      <ConversationList
        v-if="!isGuestMode"
        @conversation-selected="handleConversationSelected"
        :collapsed="!showSidebar && !isMobile"
      />

      <!-- Guest Mode Info -->
      <div v-if="isGuestMode && (showSidebar && isMobile) || isGuestMode && (showSidebar && !isMobile)" class="flex-1 p-4">
        <div class="text-center space-y-4">
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ChatBubbleLeftRightIcon class="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Guest Mode</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              You're chatting as a guest. Your conversations won't be saved, but you can experience our AI models.
            </p>
          </div>
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="router.push('/login')"
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Sign In to Save Chats
            </button>
          </div>
        </div>
      </div>

      <!-- User Menu -->
      <div v-if="!isMobile || isMobile && showSidebar" class="p-3 lg:p-4 border-t border-white/10 dark:border-gray-700/50 mt-auto flex-shrink-0">
        <!-- Authenticated User Menu -->
        <div v-if="!isGuestMode && (showSidebar || isMobile)" class="flex items-center space-x-3 p-2 lg:p-3 rounded-xl glass-subtle hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group">
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

        <!-- Guest User Menu -->
        <div v-if="isGuestMode && (showSidebar || isMobile)" class="flex items-center space-x-3 p-2 lg:p-3 rounded-xl glass-subtle hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 group">
          <div class="relative flex-shrink-0">
            <div class="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center ring-2 ring-white/20 dark:ring-gray-600/50 transition-all duration-200 group-hover:ring-amber-400/50">
              <span class="text-white text-sm font-bold">G</span>
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-amber-400 rounded-full ring-1 lg:ring-2 ring-white dark:ring-gray-800"></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              Guest User
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              No account required
            </p>
          </div>
          <button
            @click="router.push('/login')"
            class="p-1.5 lg:p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
            title="Sign In"
          >
            <ArrowRightStartOnRectangleIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Collapsed state for authenticated users -->
        <div v-if="!isGuestMode && !showSidebar && !isMobile" class="flex justify-center">
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

        <!-- Collapsed state for guest users -->
        <div v-if="isGuestMode && !showSidebar && !isMobile" class="flex justify-center">
          <div class="relative group">
            <div
              class="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center ring-2 ring-white/20 dark:ring-gray-600/50 cursor-pointer hover:ring-amber-400/50 transition-all duration-200"
              @click="router.push('/login')"
              title="Sign In"
            >
              <span class="text-white text-xs font-bold">G</span>
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-amber-400 rounded-full ring-1 ring-white dark:ring-gray-800"></div>
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
    <div class="flex-1 flex flex-col min-w-0 relative mobile-container mobile-padding pt-4 lg:pt-8" :class="{'overflow-y-auto': isGuestMode && !guestChatStore.hasMessages, 'overflow-y-hidden': !isGuestMode || (isGuestMode && guestChatStore.hasMessages)}">
      <!-- Floating Chat Container -->
      <div class="flex-1 flex flex-col max-w-4xl mx-auto w-full mobile-scroll">
        <!-- Floating Chat Header -->
        <div v-if="!isGuestMode || (isGuestMode && guestChatStore.hasMessages)" class="gemini-glass-header mb-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <!-- Mobile menu button -->
              <button
                @click="showSidebar = !showSidebar"
                class="lg:hidden p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                aria-label="Toggle menu"
              >
                <Bars3Icon class="w-6 h-6" />
              </button>

              <div v-if="!isGuestMode && chatStore.currentConversation" class="animate-fade-in">
                <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {{ chatStore.currentConversation.title }}
                </h2>
                <div class="flex items-center space-x-2 mt-1 flex-wrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {{ chatStore.currentConversation.model_provider }}
                  </span>
                  <span class="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {{ chatStore.currentConversation.model_name }}
                  </span>
                </div>
              </div>
              <div v-else-if="isGuestMode" class="animate-fade-in">
                <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-gradient bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  T3 Chat - Guest Mode
                </h2>
                <!-- Show compact model selector if user has messages, otherwise show current model -->
                <div v-if="guestChatStore.hasMessages" class="mt-2">
                  <GuestModelSelectorCompact />
                </div>
                <div v-else class="flex items-center space-x-2 mt-1 flex-wrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                    {{ guestChatStore.currentModel.provider }}
                  </span>
                  <span class="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {{ guestChatStore.currentModel.name }}
                  </span>
                </div>
              </div>
              <div v-else class="animate-fade-in">
                <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  T3 Chat
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Select a conversation or start a new chat
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-1 sm:space-x-2">
              <!-- Debug refresh button (remove in production) -->
              <button
                @click="handlePageVisible"
                class="p-3 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group touch-manipulation"
                title="Refresh State (Debug)"
              >
                <svg class="w-5 h-5 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
              <button
                @click="showSettings = true"
                class="p-3 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group touch-manipulation"
                title="Settings"
              >
                <CogIcon class="w-5 h-5 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>

        <!-- Floating Messages Area -->
        <div class="flex-1 overflow-hidden relative min-h-0 flex flex-col">
          <!-- Guest Mode Indicator -->
          <div v-if="isGuestMode" class="mx-6 mt-4 flex-shrink-0">
            <GuestModeIndicator @sign-in="handleSignIn" />
          </div>

          <!-- Authenticated User Welcome Message -->
          <div v-if="shouldShowWelcomeMessage" class="h-full flex items-center justify-center">
            <div class="gemini-welcome-card text-center">
              <div class="relative mb-8 flex justify-center">
                <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ChatBubbleLeftRightIcon class="w-10 h-10 text-white" />
                </div>
                <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">Welcome to T3 Chat Clone</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-center max-w-md mx-auto">
                Start a new conversation to begin chatting with AI. Experience the power of modern conversational AI.
              </p>
              <div class="space-y-4">
                <button
                  @click="showNewChatModal = true"
                  class="btn-primary inline-flex items-center space-x-2 px-6 py-3 text-base font-semibold w-full justify-center"
                >
                  <PencilSquareIcon class="w-5 h-5" />
                  <span>Start New Chat</span>
                </button>
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Or select an existing conversation from the sidebar
                </p>
              </div>
            </div>
          </div>

          <!-- Guest Mode Welcome -->
          <button
              @click="showSidebar = !showSidebar"
              class="lg:hidden absolute top p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
              aria-label="Toggle menu"
            >
              <Bars3Icon class="w-6 h-6" />
          </button>
          <div v-if="isGuestMode && !guestChatStore.hasMessages" class="h-full flex items-center justify-center p-3 sm:p-4">
            <div class="w-full max-w-2xl space-y-4 sm:space-y-6">
              <!-- Simplified Welcome Header -->
              <div class="text-center">
                <div class="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mb-3 sm:mb-4">
                  <ChatBubbleLeftRightIcon class="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Start Chatting</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed px-2">
                  Try our AI models instantly • No account required
                </p>
              </div>

              <!-- Compact Model Selector -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div class="space-y-3">
                  <!-- Current Model Display -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <div class="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-md flex items-center justify-center">
                        <CpuChipIcon class="w-4 h-4 text-white" />
                      </div>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">AI Model</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        {{ guestChatStore.currentModel.provider }}
                      </span>
                      <span class="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                        {{ guestChatStore.currentModel.name }}
                      </span>
                    </div>
                  </div>

                  <!-- Model Selection (Collapsible) -->
                  <div v-if="showModelSelector" class="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        v-model="selectedProvider"
                        @change="onProviderChange"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select provider...</option>
                        <option
                          v-for="provider in availableProviders"
                          :key="provider.id"
                          :value="provider.id"
                        >
                          {{ provider.name }}
                        </option>
                      </select>

                      <select
                        v-model="selectedModel"
                        @change="onModelChange"
                        :disabled="!selectedProvider || !currentProviderModels.length"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 text-sm"
                      >
                        <option value="">Select model...</option>
                        <option
                          v-for="model in currentProviderModels"
                          :key="model.id"
                          :value="model.id"
                        >
                          {{ model.name }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Toggle Button -->
                  <button
                    @click="showModelSelector = !showModelSelector"
                    class="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-1 transition-colors"
                  >
                    {{ showModelSelector ? 'Hide Options' : 'Change Model' }}
                  </button>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  @click="() => handleTestMessage()"
                  class="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 touch-manipulation"
                >
                  <span>💬</span>
                  <span>Try a Quick Test</span>
                </button>
                <button
                  @click="handleSignIn"
                  class="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors touch-manipulation"
                >
                  Sign In
                </button>
              </div>

              <!-- Minimal Info -->
              <div class="text-center">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Guest conversations aren't saved •
                  <button @click="handleSignIn" class="underline hover:text-gray-700 dark:hover:text-gray-300">Sign in</button> to save chats
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="(!isGuestMode || guestChatStore.hasMessages) && !shouldShowWelcomeMessage" class="h-full flex flex-col">
            <!-- Messages Area (Dynamic Height) -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto space-y-4" :style="messagesContainerStyle">
              <MessageBubble
                v-for="message in (isGuestMode ? guestChatStore.messages : chatStore.messages)"
                :key="message.id"
                :message="message"
                @edit="handleEditMessage"
                @regenerate="handleRegenerateMessage"
                class="animate-fade-in"
              />
            </div>

            <!-- Floating Chat Input Container -->
            <div class="relative py-1 pb-4 mb-4" style="min-height: 120px;">
              <div class="gemini-floating-input">
                <ChatInput
                  :key="`chat-input-${componentKey}`"
                  @send="handleSendMessage"
                  @height-change="handleInputHeightChange"
                  :disabled="isGuestMode ? guestChatStore.streaming : chatStore.streaming"
                  :is-guest-mode="isGuestMode"
                  :current-model="currentModelInfo"
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
          <button
            @click="testConversationSelection"
            class="w-full px-2 py-1 bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 rounded text-xs hover:bg-indigo-300 dark:hover:bg-indigo-700"
          >
            Test Conversation Selection
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '../../stores/chat'
import { useGuestChatStore } from '../../stores/guest-chat'
import {
  PencilSquareIcon,
  CogIcon,
  ArrowRightStartOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  CpuChipIcon
} from '@heroicons/vue/24/outline'

import ConversationList from '../Sidebar/ConversationList.vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'
import NewChatModal from '../Modals/NewChatModal.vue'
import SettingsModal from '../Modals/SettingsModal.vue'
import GuestModeIndicator from '../GuestModeIndicator.vue'
import GuestModelSelectorCompact from '../Guest/GuestModelSelectorCompact.vue'
import type { FileAttachment, LLMProvider } from '../../types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()
const guestChatStore = useGuestChatStore()

// Computed properties for handling both authenticated and guest modes
const isGuestMode = computed(() => authStore.isGuestMode)
const currentChatStore = computed(() => isGuestMode.value ? guestChatStore : chatStore)
const currentMessages = computed(() => isGuestMode.value ? guestChatStore.currentMessages : chatStore.currentMessages)

// Get current model info with context length for dynamic character limits
const currentModelInfo = computed(() => {
  if (isGuestMode.value) {
    // For guest mode, get model info from guest store
    const providers = guestChatStore.getAvailableProviders()
    const currentProvider = providers.find(p => p.id === guestChatStore.currentModel.provider)
    const currentModel = currentProvider?.models.find(m => m.id === guestChatStore.currentModel.name)

    return {
      provider: guestChatStore.currentModel.provider,
      name: guestChatStore.currentModel.name,
      context_length: currentModel?.context_length || 4000
    }
  } else if (chatStore.currentConversation) {
    // For authenticated mode, get from current conversation
    // We need to look up the model's context length from the LLM service
    // For now, provide reasonable defaults based on known models
    const modelName = chatStore.currentConversation.model_name
    let contextLength = 4000 // Default fallback

    // Map known models to their context lengths
    if (modelName.includes('gpt-4o')) {
      contextLength = 128000
    } else if (modelName.includes('gpt-3.5-turbo')) {
      contextLength = 16385
    } else if (modelName.includes('gemini-2.0-flash')) {
      contextLength = 1048576
    } else if (modelName.includes('gemini-1.5-pro')) {
      contextLength = 2097152
    }

    return {
      provider: chatStore.currentConversation.model_provider,
      name: chatStore.currentConversation.model_name,
      context_length: contextLength
    }
  }

  // Default fallback
  return {
    provider: '',
    name: '',
    context_length: 4000
  }
})

// Computed property to determine when to show welcome message
const shouldShowWelcomeMessage = computed(() => {
  console.log('🔍 shouldShowWelcomeMessage computed:', {
    isGuestMode: isGuestMode.value,
    isAuthenticated: authStore.isAuthenticated,
    currentConversation: chatStore.currentConversation ? 'EXISTS' : 'NULL'
  })

  return !isGuestMode.value &&
         authStore.isAuthenticated &&
         !chatStore.currentConversation
})

// Computed property to determine when to show chat input
const shouldShowChatInput = computed(() => {
  if (isGuestMode.value) {
    return true // Always show input in guest mode
  }
  return authStore.isAuthenticated && !!chatStore.currentConversation
})

const messagesContainer = ref<HTMLElement>()
const showNewChatModal = ref(false)
const showSettings = ref(false)
const showSidebar = ref(true) // Default to expanded
const componentKey = ref(0) // Force re-render key

// Guest mode model selector variables
const showModelSelector = ref(false)
const selectedProvider = ref('')
const selectedModel = ref('')
const availableProviders = ref<LLMProvider[]>([])

// Computed properties for guest model selector
const currentProviderModels = computed(() => {
  const provider = availableProviders.value.find(p => p.id === selectedProvider.value)
  return provider?.models || []
})



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

// Track input height for dynamic layout
const inputHeight = ref(0) // Default minimum height

// Dynamic height calculation for messages container
const messagesContainerStyle = computed(() => {
  // Account for input area height plus padding and margins
  const inputAreaHeight = inputHeight.value + 90 // Add extra padding for floating container

  if (isMobile.value) {
  // On mobile, account for more space for the input area
  return {
    maxHeight: `calc(100vh - ${Math.max(260, inputAreaHeight + 100)}px)`,
    minHeight: `calc(100vh - ${Math.max(260, inputAreaHeight + 100)}px)` // Assuming minHeight should be the same as maxHeight for this specific case
  }
  } else {
  // On desktop, account for the floating input and header
  return {
    maxHeight: `calc(100vh - ${Math.max(290, inputAreaHeight + 100)}px)`,
    minHeight: `calc(100vh - ${Math.max(320, inputAreaHeight + 100)}px)` // Assuming minHeight should be the same as maxHeight for this specific case
  }
  }
});

// Watch for route changes to handle conversation navigation
watch(() => router.currentRoute.value.params.conversationId, async (newConversationId) => {
  if (newConversationId && authStore.isAuthenticated) {
    console.log('🔗 Route changed to conversation:', newConversationId)

    // Ensure conversations are loaded first
    if (chatStore.conversations.length === 0) {
      console.log('📋 Loading conversations first...')
      await chatStore.loadConversations()
    }

    const conversation = chatStore.conversations.find(c => c.id === newConversationId)
    if (conversation) {
      if (conversation.id !== chatStore.currentConversation?.id) {
        console.log('✅ Selecting conversation from route change')
        await chatStore.selectConversation(conversation)
      } else {
        console.log('✅ Conversation already selected')
      }
    } else {
      console.log('❌ Conversation not found after loading, redirecting to home')
      router.push('/')
    }
  }
});

// Browser visibility and focus handling
let visibilityChangeHandler: (() => void) | null = null
let focusHandler: (() => void) | null = null
let blurHandler: (() => void) | null = null
let connectionMonitor: NodeJS.Timeout | null = null

onMounted(async () => {
  console.log('🚀 ChatInterface mounted')
  console.log('🎭 Current auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    isGuestMode: authStore.isGuestMode,
    canUseApp: authStore.canUseApp,
    hasUser: !!authStore.user,
    hasSession: !!authStore.session
  })

  if (authStore.isAuthenticated) {
    console.log('✅ User authenticated, loading conversations')
    await chatStore.loadConversations()

    console.log('🔍 Debug: After loading conversations:', {
      conversationsCount: chatStore.conversations.length,
      currentConversation: chatStore.currentConversation ? 'EXISTS' : 'NULL',
      currentConversationId: chatStore.currentConversation?.id
    })

    // Handle conversation ID from URL
    const conversationId = router.currentRoute.value.params.conversationId as string
    if (conversationId) {
      console.log('🔗 Conversation ID found in URL:', conversationId)
      const conversation = chatStore.conversations.find(c => c.id === conversationId)
      if (conversation) {
        console.log('✅ Found conversation, selecting it')
        await chatStore.selectConversation(conversation)
      } else {
        console.log('❌ Conversation not found, redirecting to home')
        router.push('/')
      }
    } else {
      console.log('🔍 No conversation ID in URL, current conversation should be NULL')
      console.log('🔍 Current conversation state:', chatStore.currentConversation ? 'EXISTS (unexpected!)' : 'NULL (correct)')

      // Force clear current conversation if no ID in URL
      if (chatStore.currentConversation) {
        console.log('🧹 Clearing unexpected current conversation')
        chatStore.clearCurrentConversation()
      }
    }
  } else if (authStore.isGuestMode) {
    console.log('🎭 Guest mode active - initializing fresh state')
    // Initialize guest mode with fresh state and Gemini default
    guestChatStore.initializeGuestMode()

    // Initialize guest model selector
    availableProviders.value = guestChatStore.getAvailableProviders()
    selectedProvider.value = guestChatStore.currentModel.provider
    selectedModel.value = guestChatStore.currentModel.name

    // For guest mode, redirect to home if trying to access specific conversation
    const conversationId = router.currentRoute.value.params.conversationId as string
    if (conversationId) {
      console.log('🔗 Guest user trying to access specific conversation, redirecting to home')
      router.push('/')
    }
  } else {
    console.log('❌ User not authenticated and not in guest mode, enabling guest mode instead of redirecting')
    // Instead of redirecting to login, enable guest mode
    await authStore.enableGuestMode()
  }

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

  // Start smart connection health monitoring
  connectionMonitor = setInterval(async () => {
    // Only monitor if user is authenticated and page is visible (skip for guest mode)
    if (authStore.isAuthenticated && !authStore.isGuestMode && document.visibilityState === 'visible') {
      try {
        // Simple health check - try to get session
        const session = await authStore.getSession()
        if (!session) {
          console.log('⚠️ Connection monitor: No session found, light refresh...')
          await authStore.refreshTokenOnly()
        }
      } catch (error) {
        console.log('⚠️ Connection monitor: Health check failed, light refresh...', error)
        await authStore.refreshTokenOnly()
      }
    } else if (authStore.isGuestMode) {
      console.log('🎭 Connection monitor: Skipping health check for guest mode')
    }
  }, 60000) // Check every 60 seconds (less aggressive)

  console.log('✅ Event listeners and connection monitor added')
})

onUnmounted(() => {
  console.log('🧹 ChatInterface unmounting, cleaning up event listeners and monitors')

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

  // Clear connection monitor
  if (connectionMonitor) {
    clearInterval(connectionMonitor)
    connectionMonitor = null
  }
})

// Smart page visible handler with optimized refresh logic
async function handlePageVisible() {
  try {
    console.log('🔄 Handling page visible event - smart recovery')

    // Clear any existing errors first
    chatStore.clearError()

    // Step 1: Check if we're in guest mode - skip auth refresh entirely
    if (authStore.isGuestMode) {
      console.log('🎭 In guest mode, skipping all auth checks and only refreshing chat state')

      // Only refresh chat state for guest mode if needed
      if (route.params.conversationId && route.params.conversationId !== chatStore.currentConversation?.id) {
        console.log('🔄 Refreshing conversation state for guest mode')
        await chatStore.loadConversations()

        const conversation = chatStore.conversations.find(c => c.id === route.params.conversationId)
        if (conversation && conversation.id !== chatStore.currentConversation?.id) {
          await chatStore.selectConversation(conversation)
        }
      }

      console.log('✅ Guest mode page visible handling completed')
      return
    }

    // Step 2: For authenticated users, check if we actually need to refresh
    const currentSession = await authStore.getSession()
    if (!currentSession) {
      console.log('❌ No session found for authenticated user')
      // Check if route allows guest mode
      if (route.meta.allowGuest) {
        console.log('🎭 Route allows guest mode, enabling guest mode instead of redirecting')
        authStore.enableGuestMode()
        return
      } else {
        console.log('❌ Route requires auth, redirecting to login')
        router.push('/login')
        return
      }
    }

    // Step 2: Light auth refresh (token only, no chat state refresh)
    console.log('🔐 Step 1: Light authentication refresh...')
    try {
      await authStore.refreshTokenOnly()
      console.log('✅ Token refreshed successfully')
    } catch (authError) {
      console.warn('⚠️ Token refresh failed, trying full auth refresh:', authError)
      // Fallback to full auth refresh if token refresh fails
      await authStore.refreshAuth(true) // Skip chat refresh
    }

    // Step 3: Check authentication status
    if (!authStore.isAuthenticated) {
      console.log('❌ Authentication lost after refresh attempts, redirecting to login')
      router.push('/login')
      return
    }

    console.log('✅ Authentication verified')

    // Step 4: Smart chat state refresh (only if needed and not on home page)
    const conversationId = router.currentRoute.value.params.conversationId as string
    if (conversationId) {
      console.log('💬 Step 2: Smart chat state refresh...')
      await chatStore.refreshState(false) // Don't force refresh
    } else {
      console.log('🏠 On home page, skipping chat state refresh')
      // Just load conversations but don't select any
      if (chatStore.conversations.length === 0) {
        await chatStore.loadConversations()
      }
      // Ensure no conversation is selected on home page
      if (chatStore.currentConversation) {
        console.log('🧹 Clearing conversation on home page')
        chatStore.clearCurrentConversation()
      }
    }

    // Step 5: Re-focus input if available (no component re-render needed)
    await nextTick()
    const chatInput = document.querySelector('textarea')
    if (chatInput && !chatStore.streaming) {
      chatInput.focus()
      console.log('🎯 Chat input re-focused')
    }

    console.log('✅ Smart page visible handling completed successfully')
  } catch (error) {
    console.error('❌ Critical error in page visible handler:', error)

    // Show user-friendly error
    chatStore.error = 'Connection lost. Please refresh the page or check your internet connection.'

    // Try one more auth refresh as last resort
    try {
      await authStore.refreshAuth(true) // Skip chat refresh
    } catch (finalError) {
      console.error('❌ Final auth refresh failed:', finalError)
    }
  }
}

// Auto-scroll to bottom when new messages arrive
watch(() => isGuestMode.value ? guestChatStore.messages.length : chatStore.messages.length, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})

// Watch for authentication changes
watch(() => authStore.isAuthenticated, (isAuth) => {
  console.log('🔐 Authentication state changed:', isAuth)
  if (!isAuth && !authStore.isGuestMode) {
    console.log('❌ User logged out and not in guest mode, redirecting to login')
    router.push('/login')
  } else if (!isAuth && authStore.isGuestMode) {
    console.log('🎭 User logged out but in guest mode, staying on current page')
  }
})

// Watch for guest mode changes to ensure fresh initialization
watch(() => authStore.isGuestMode, (isGuest, wasGuest) => {
  console.log('🎭 Guest mode state changed:', { isGuest, wasGuest })
  if (isGuest && !wasGuest) {
    console.log('🎭 Guest mode enabled - ensuring fresh initialization')
    // Initialize guest mode with fresh state and Gemini default
    guestChatStore.initializeGuestMode()

    // Initialize guest model selector
    availableProviders.value = guestChatStore.getAvailableProviders()
    selectedProvider.value = guestChatStore.currentModel.provider
    selectedModel.value = guestChatStore.currentModel.name
  } else if (!isGuest && wasGuest) {
    console.log('🎭 Guest mode disabled - clearing guest state')
    // Clear guest state when leaving guest mode
    guestChatStore.clearMessages()
    guestChatStore.clearError()

    // Clear guest model selector
    availableProviders.value = []
    selectedProvider.value = ''
    selectedModel.value = ''
    showModelSelector.value = false
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

async function handleSendMessage(content: string, files?: FileAttachment[]) {
  try {
    console.log('🚀 ChatInterface: Handling send message:', {
      content,
      fileCount: files?.length || 0,
      mode: authStore.isGuestMode ? 'guest' : 'authenticated',
      isGuestMode: authStore.isGuestMode,
      isAuthenticated: authStore.isAuthenticated,
      canUseApp: authStore.canUseApp
    })

    if (!content || !content.trim()) {
      console.warn('❌ Empty message content')
      const errorMessage = 'Please enter a message'
      if (authStore.isGuestMode) {
        guestChatStore.error = errorMessage
      } else {
        chatStore.error = errorMessage
      }
      return
    }

    if (authStore.isGuestMode) {
      // Guest mode: use guest chat store
      console.log('🎭 Sending message in guest mode')
      await guestChatStore.sendMessage(content, files)
    } else {
      // Authenticated mode: use regular chat store
      // Clear any existing errors
      chatStore.clearError()

      // Comprehensive validation and recovery
      if (!authStore.isAuthenticated) {
        console.warn('❌ User not authenticated, attempting recovery...')
        await authStore.refreshAuth()
        if (!authStore.isAuthenticated) {
          console.error('❌ Authentication recovery failed, enabling guest mode instead')
          authStore.enableGuestMode()
          // Retry sending message in guest mode
          await guestChatStore.sendMessage(content, files)
          return
        }
        console.log('✅ Authentication recovered')
      }

      if (!chatStore.currentConversation) {
        console.warn('❌ No current conversation, attempting to recover state...')
        await chatStore.refreshState()

        if (!chatStore.currentConversation) {
          console.error('❌ No conversation available after state refresh')
          chatStore.error = 'Please select or create a conversation first'
          return
        }
        console.log('✅ Conversation state recovered')
      }

      console.log('✅ All validations passed, sending message to chat store...')
      await chatStore.sendMessage(content, true, files)
    }

    console.log('✅ Message sent successfully')

  } catch (error: any) {
    console.error('❌ Failed to send message:', error)

    const errorMessage = error.message || 'Failed to send message. Please try again.'

    if (authStore.isGuestMode) {
      guestChatStore.error = errorMessage
    } else {
      // Provide specific error messages based on error type for authenticated users
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        chatStore.error = 'Session expired. Please refresh the page and try again.'
        // Try to refresh auth in background
        authStore.refreshAuth().catch(console.error)
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        chatStore.error = 'Network error. Please check your connection and try again.'
      } else if (error.message?.includes('conversation')) {
        chatStore.error = 'Conversation error. Please select a conversation and try again.'
      } else {
        chatStore.error = errorMessage
      }
    }
  }
}

async function handleCreateConversation(data: { title: string; provider: string; model: string }) {
  try {
    console.log('🚀 ChatInterface: Creating conversation with data:', data)

    // Clear any existing errors
    chatStore.clearError()

    // Validate input data
    if (!data.title || !data.provider || !data.model) {
      console.warn('❌ Invalid conversation data:', data)
      chatStore.error = 'Please fill in all required fields'
      return
    }

    // Ensure user is authenticated
    if (!authStore.isAuthenticated) {
      console.warn('❌ User not authenticated, attempting recovery...')
      await authStore.refreshAuth()
      if (!authStore.isAuthenticated) {
        console.error('❌ Authentication recovery failed')
        router.push('/login')
        return
      }
      console.log('✅ Authentication verified')
    }

    console.log('✅ Creating conversation...')
    const newConversation = await chatStore.createConversation(data.title, data.provider, data.model)

    console.log('✅ Conversation created successfully')
    showNewChatModal.value = false

    // Navigate to the new conversation
    console.log('🔗 Navigating to new conversation:', newConversation.id)
    await router.push(`/chat/${newConversation.id}`)

    // Small delay to ensure route watcher processes the navigation
    await nextTick()

    // Clear any previous errors
    chatStore.clearError()

  } catch (error: any) {
    console.error('❌ Failed to create conversation:', error)

    // Provide specific error messages
    if (error.message?.includes('JWT') || error.message?.includes('auth')) {
      chatStore.error = 'Session expired. Please refresh the page and try again.'
      authStore.refreshAuth().catch(console.error)
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      chatStore.error = 'Network error. Please check your connection and try again.'
    } else {
      chatStore.error = error.message || 'Failed to create conversation. Please try again.'
    }
  }
}

function handleInputHeightChange(height: number) {
  inputHeight.value = height
  // Scroll to bottom when input height changes to maintain view
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
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
    if (isGuestMode.value) {
      // Guest mode doesn't support editing messages
      guestChatStore.error = 'Message editing is not available in guest mode. Sign in to edit messages.'
    } else {
      await chatStore.editMessage(messageId, newContent)
    }
  } catch (error) {
    console.error('Failed to edit message:', error)
  }
}

async function handleRegenerateMessage(messageId: string) {
  try {
    if (isGuestMode.value) {
      await guestChatStore.regenerateMessage(messageId)
    } else {
      await chatStore.regenerateMessage(messageId)
    }
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
  console.log('🧪 Comprehensive API connection test starting...')

  const results = {
    supabaseConnection: false,
    authentication: false,
    database: false,
    conversation: false,
    session: false
  }

  try {
    // Test 1: Supabase connection health
    console.log('🔍 Test 1: Supabase connection health...')
    try {
      const { checkSupabaseConnection } = await import('../../services/supabase')
      results.supabaseConnection = await checkSupabaseConnection()
      console.log(`${results.supabaseConnection ? '✅' : '❌'} Supabase Connection: ${results.supabaseConnection ? 'HEALTHY' : 'UNHEALTHY'}`)
    } catch (connError) {
      console.error('❌ Supabase connection test failed:', connError)
    }

    // Test 2: Session validation
    console.log('🔐 Test 2: Session validation...')
    try {
      const session = await authStore.getSession()
      results.session = !!session
      console.log(`${results.session ? '✅' : '❌'} Session: ${results.session ? 'VALID' : 'INVALID'}`)
      if (session && session.expires_at) {
        console.log('Session expires at:', new Date(session.expires_at * 1000))
      }
    } catch (sessionError) {
      console.error('❌ Session test failed:', sessionError)
    }

    // Test 3: Authentication status
    console.log('🔐 Test 3: Authentication status...')
    results.authentication = authStore.isAuthenticated
    console.log(`${results.authentication ? '✅' : '❌'} Authentication: ${results.authentication ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'}`)

    if (results.authentication) {
      console.log('User ID:', authStore.user?.id)
      console.log('User email:', authStore.user?.email)
    }

    // Test 4: Database operations
    console.log('🗄️ Test 4: Database operations...')
    try {
      await chatStore.loadConversations()
      results.database = true
      console.log('✅ Database: ACCESSIBLE')
      console.log('Conversations loaded:', chatStore.conversations.length)
    } catch (dbError) {
      console.error('❌ Database: FAILED', dbError)
    }

    // Test 5: Current conversation state
    console.log('💬 Test 5: Current conversation state...')
    if (chatStore.currentConversation) {
      results.conversation = true
      console.log('✅ Conversation: ACTIVE')
      console.log('Current conversation:', chatStore.currentConversation.title)
      console.log('Messages count:', chatStore.messages.length)
      console.log('Model:', chatStore.currentConversation.model_provider, chatStore.currentConversation.model_name)
    } else {
      console.log('⚠️ Conversation: NO ACTIVE CONVERSATION')
    }

    // Summary
    const passedTests = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length

    console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed`)
    console.log('Results:', results)

    const message = `API Connection Test Results:\n\n` +
      `✅ Supabase Connection: ${results.supabaseConnection ? 'HEALTHY' : 'UNHEALTHY'}\n` +
      `✅ Session: ${results.session ? 'VALID' : 'INVALID'}\n` +
      `✅ Authentication: ${results.authentication ? 'OK' : 'FAILED'}\n` +
      `✅ Database: ${results.database ? 'OK' : 'FAILED'}\n` +
      `✅ Conversation: ${results.conversation ? 'ACTIVE' : 'NONE'}\n\n` +
      `Score: ${passedTests}/${totalTests} tests passed\n\n` +
      `Check console for detailed logs.`

    alert(message)

  } catch (error: any) {
    console.error('❌ API connection test failed:', error)
    alert(`API connection test failed: ${error?.message || 'Unknown error'}\n\nCheck console for details.`)
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

function testConversationSelection() {
  console.log('🧪 Testing conversation selection robustness...')

  if (chatStore.conversations.length === 0) {
    alert('No conversations available to test. Please create a conversation first.')
    return
  }

  const testConversation = chatStore.conversations[0]
  console.log('🎯 Testing with conversation:', testConversation.title)

  // Simulate rapid selection attempts
  let attempts = 0
  const maxAttempts = 3

  const testSelection = async () => {
    attempts++
    console.log(`🔄 Test attempt ${attempts}/${maxAttempts}`)

    try {
      await chatStore.selectConversation(testConversation)
      console.log(`✅ Test attempt ${attempts} successful`)

      if (attempts < maxAttempts) {
        // Wait a bit and try again
        setTimeout(testSelection, 1000)
      } else {
        console.log('✅ All conversation selection tests passed!')
        alert('Conversation selection test completed successfully! Check console for details.')
      }
    } catch (error) {
      console.error(`❌ Test attempt ${attempts} failed:`, error)
      alert(`Conversation selection test failed on attempt ${attempts}. Check console for details.`)
    }
  }

  testSelection()
}

// Guest mode model selector functions
function onProviderChange() {
  // Reset model when provider changes
  selectedModel.value = ''

  // Auto-select first model if available and apply immediately
  if (currentProviderModels.value.length > 0) {
    selectedModel.value = currentProviderModels.value[0].id
    applyModelChanges()
  }
}

function onModelChange() {
  // Apply model change immediately when user selects
  if (selectedProvider.value && selectedModel.value) {
    applyModelChanges()
  }
}

function applyModelChanges() {
  if (selectedProvider.value && selectedModel.value) {
    guestChatStore.setModel(selectedProvider.value, selectedModel.value)
    console.log('🎭 Guest model updated:', selectedProvider.value, selectedModel.value)
  }
}

function handleSignIn() {
  console.log('🔐 Guest user requesting sign in')
  router.push('/login')
}

function handleTestMessage(message?: string) {
  console.log('🧪 Handling test message from guest model selector')
  const testMessage = message || `Hello! This is a test message using ${guestChatStore.currentModel.provider} ${guestChatStore.currentModel.name}. Please respond to confirm the connection is working.`
  handleSendMessage(testMessage)
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
  padding: 20px;
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
  /* Ensure input grows upward by anchoring to bottom */
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
    /* Extra bottom margin on mobile to prevent browser overlap */
    margin-bottom: 16px;
  }
}

/* Remove old max-h-chat classes since we're using dynamic height */
</style>
