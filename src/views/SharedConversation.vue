<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <!-- Header -->
    <div class="glass border-b border-white/20 dark:border-gray-700/50 backdrop-blur-xl">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <ChatBubbleLeftRightIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                Shared Conversation
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Read-only view • No login required
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <button
              v-if="conversation"
              @click="copyShareLink"
              class="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              title="Copy Share Link"
            >
              <LinkIcon class="w-5 h-5" />
            </button>
            <a
              href="/login"
              class="btn-primary inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold"
            >
              <UserPlusIcon class="w-4 h-4" />
              <span>Sign In</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading shared conversation...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md mx-auto px-4">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationCircleIcon class="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Conversation Not Found
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ error }}
        </p>
        <a
          href="/"
          class="btn-primary inline-flex items-center space-x-2 px-6 py-3 text-base font-semibold"
        >
          <HomeIcon class="w-5 h-5" />
          <span>Go to T3 Chat</span>
        </a>
      </div>
    </div>

    <!-- Conversation Content -->
    <div v-else-if="conversation" class="max-w-4xl mx-auto px-4 py-8">
      <!-- Conversation Info -->
      <div class="gemini-glass-header mb-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {{ conversation.title }}
            </h2>
            <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center space-x-2">
                <CalendarIcon class="w-4 h-4" />
                <span>{{ formatDate(conversation.created_at) }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <ChatBubbleLeftIcon class="w-4 h-4" />
                <span>{{ messages.length }} messages</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {{ conversation.model_provider }}
                </span>
                <span>{{ conversation.model_name }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-2 ml-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
              <ShareIcon class="w-4 h-4 mr-1" />
              Shared
            </span>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="space-y-6">
        <div
          v-for="message in messages"
          :key="message.id"
          class="animate-fade-in"
        >
          <SharedMessageBubble :message="message" />
        </div>
      </div>

      <!-- Call to Action -->
      <div class="mt-12 text-center">
        <div class="gemini-welcome-card max-w-md mx-auto">
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <ChatBubbleLeftRightIcon class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Start Your Own Conversations
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Create your own AI conversations with multiple models and providers. Sign up for free to get started.
          </p>
          <a
            href="/login"
            class="btn-primary inline-flex items-center space-x-2 px-6 py-3 text-base font-semibold"
          >
            <UserPlusIcon class="w-5 h-5" />
            <span>Sign Up Free</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  LinkIcon,
  UserPlusIcon,
  HomeIcon,
  ExclamationCircleIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'
import { axiosDb } from '../services/axios-db'
import type { Conversation, Message } from '../types'
import SharedMessageBubble from '@/components/Chat/SharedMessageBubble.vue'

const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const conversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])

onMounted(async () => {
  const shareId = route.params.shareId as string
  
  if (!shareId) {
    error.value = 'Invalid share link'
    loading.value = false
    return
  }

  try {
    const { conversation: sharedConversation, messages: sharedMessages } = await axiosDb.getSharedConversation(shareId)
    conversation.value = sharedConversation
    messages.value = sharedMessages
  } catch (err: any) {
    console.error('Failed to load shared conversation:', err)
    if (err.message.includes('not found')) {
      error.value = 'This conversation is no longer shared or does not exist.'
    } else {
      error.value = 'Failed to load conversation. Please try again later.'
    }
  } finally {
    loading.value = false
  }
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function copyShareLink() {
  if (!conversation.value?.share_id) return

  try {
    const shareUrl = `${window.location.origin}/share/${conversation.value.share_id}`
    await navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy share link:', error)
    alert('Failed to copy link. Please try again.')
  }
}
</script>
