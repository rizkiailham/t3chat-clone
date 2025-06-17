<template>
  <div v-if="attachments && attachments.length > 0" class="mb-3">
    <!-- Images Grid -->
    <div v-if="imageAttachments.length > 0" class="grid gap-2" :class="gridClasses">
      <div
        v-for="(attachment, index) in imageAttachments"
        :key="index"
        class="relative group cursor-pointer"
        @click="openImageModal(attachment)"
      >
        <img
          :src="attachment.base64"
          :alt="attachment.name"
          class="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-[1.02]"
        />
        <!-- Image Overlay -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-center">
          <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <EyeIcon class="w-6 h-6 text-white drop-shadow-lg" />
          </div>
        </div>
        <!-- File Name -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg p-2">
          <p class="text-xs text-white font-medium truncate">{{ attachment.name }}</p>
        </div>
      </div>
    </div>

    <!-- PDF Files -->
    <div v-if="pdfAttachments.length > 0" class="space-y-2" :class="{ 'mt-3': imageAttachments.length > 0 }">
      <div
        v-for="(attachment, index) in pdfAttachments"
        :key="index"
        class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
      >
        <!-- PDF Icon -->
        <div class="flex-shrink-0 mr-3">
          <DocumentIcon class="w-6 h-6 text-red-600" />
        </div>

        <!-- File Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {{ attachment.name }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatFileSize(attachment.size) }} • PDF
          </p>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <Teleport to="body">
      <div
        v-if="selectedImage"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click="closeImageModal"
      >
        <div class="relative max-w-4xl max-h-[90vh] p-4">
          <!-- Close Button -->
          <button
            @click="closeImageModal"
            class="absolute top-2 right-2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all duration-200"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>

          <!-- Image -->
          <img
            :src="selectedImage.base64"
            :alt="selectedImage.name"
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            @click.stop
          />

          <!-- Image Info -->
          <div class="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-3">
            <p class="text-white font-medium">{{ selectedImage.name }}</p>
            <p class="text-gray-300 text-sm">{{ formatFileSize(selectedImage.size) }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DocumentIcon, EyeIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { MessageAttachment } from '../../types'

interface Props {
  attachments?: MessageAttachment[]
}

const props = defineProps<Props>()

// Refs
const selectedImage = ref<MessageAttachment | null>(null)

// Computed
const imageAttachments = computed(() => 
  props.attachments?.filter(attachment => attachment.type === 'image') || []
)

const pdfAttachments = computed(() => 
  props.attachments?.filter(attachment => attachment.type === 'pdf') || []
)

const gridClasses = computed(() => {
  const count = imageAttachments.value.length
  if (count === 1) return 'grid-cols-1 max-w-sm'
  if (count === 2) return 'grid-cols-2 max-w-md'
  if (count === 3) return 'grid-cols-3 max-w-lg'
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-2xl'
})

// Methods
function openImageModal(attachment: MessageAttachment) {
  selectedImage.value = attachment
}

function closeImageModal() {
  selectedImage.value = null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* Smooth transitions for grid layout */
.grid {
  transition: all 0.3s ease;
}

/* Custom scrollbar for modal if needed */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
