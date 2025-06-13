<template>
  <div v-if="files.length > 0" class="max-h-32 overflow-y-auto space-y-2 scrollbar-thin">
    <div
      v-for="(file, index) in files"
      :key="index"
      class="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <!-- File Icon -->
      <div class="flex-shrink-0 mr-2">
        <PhotoIcon v-if="file.type === 'image'" class="w-5 h-5 text-blue-600" />
        <DocumentIcon v-else class="w-5 h-5 text-red-600" />
      </div>

      <!-- File Info -->
      <div class="flex-1 min-w-0 mr-2">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {{ file.file.name }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatFileSize(file.file.size) }} • {{ file.type.toUpperCase() }}
        </p>
      </div>

      <!-- Image Preview -->
      <div v-if="file.type === 'image' && file.base64" class="flex-shrink-0 mr-2">
        <img
          :src="file.base64"
          :alt="file.file.name"
          class="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-600 shadow-sm"
        />
      </div>

      <!-- Remove Button -->
      <button
        @click="removeFile(index)"
        class="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
        title="Remove file"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PhotoIcon, DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { FileAttachment } from '../../types'

interface Props {
  modelValue: FileAttachment[]
}

interface Emits {
  (e: 'update:modelValue', files: FileAttachment[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const files = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function removeFile(index: number) {
  const newFiles = [...files.value]
  newFiles.splice(index, 1)
  files.value = newFiles
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
/* Animation for file preview */
.file-preview-enter-active,
.file-preview-leave-active {
  transition: all 0.3s ease;
}

.file-preview-enter-from,
.file-preview-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Scrollbar styling for file preview */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgb(156 163 175) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgb(156 163 175);
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgb(107 114 128);
}
</style>
