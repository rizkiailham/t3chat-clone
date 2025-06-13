<template>
  <div class="file-upload-container">
    <!-- File Upload Button -->
    <button
      @click="triggerFileInput"
      class="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
      title="Upload image or PDF"
      :disabled="uploading"
    >
      <PaperClipIcon v-if="!uploading" class="w-5 h-5" />
      <div v-else class="w-5 h-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
    </button>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*,.pdf"
      multiple
      @change="handleFileSelect"
      class="hidden"
    />

    <!-- File Preview -->
    <div v-if="files.length > 0" class="mt-2 space-y-2">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center space-x-3">
          <!-- File Icon -->
          <div class="flex-shrink-0">
            <PhotoIcon v-if="file.type === 'image'" class="w-6 h-6 text-blue-600" />
            <DocumentIcon v-else class="w-6 h-6 text-red-600" />
          </div>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {{ file.file.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatFileSize(file.file.size) }} • {{ file.type.toUpperCase() }}
            </p>
          </div>

          <!-- Image Preview -->
          <div v-if="file.type === 'image' && file.base64" class="flex-shrink-0">
            <img
              :src="file.base64"
              :alt="file.file.name"
              class="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        <!-- Remove Button -->
        <button
          @click="removeFile(index)"
          class="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Remove file"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-center space-x-2">
        <ExclamationTriangleIcon class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
      </div>
    </div>

    <!-- File Upload Guidelines -->
    <div v-if="showGuidelines" class="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-start space-x-2">
        <InformationCircleIcon class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div class="text-sm text-blue-700 dark:text-blue-300">
          <p class="font-medium mb-1">Supported file types:</p>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li><strong>Images:</strong> JPEG, PNG, GIF, WebP (max 5MB)</li>
            <li><strong>PDFs:</strong> PDF documents (max 10MB)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  PaperClipIcon, 
  PhotoIcon, 
  DocumentIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from '@heroicons/vue/24/outline'
import { fileUploadService, type FileUploadResult } from '../../services/file-upload.service'
import type { FileAttachment } from '../../types'

// Props
interface Props {
  modelValue: FileAttachment[]
  showGuidelines?: boolean
  maxFiles?: number
}

const props = withDefaults(defineProps<Props>(), {
  showGuidelines: false,
  maxFiles: 5
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [files: FileAttachment[]]
  'error': [error: string]
}>()

// Refs
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const error = ref<string | null>(null)

// Computed
const files = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])

  if (selectedFiles.length === 0) return

  // Check file count limit
  if (files.value.length + selectedFiles.length > props.maxFiles) {
    error.value = `Maximum ${props.maxFiles} files allowed. Please remove some files first.`
    return
  }

  uploading.value = true
  error.value = null

  try {
    const processedFiles: FileAttachment[] = []

    for (const file of selectedFiles) {
      const result = await fileUploadService.processFile(file)
      
      if (result.error) {
        error.value = result.error
        continue
      }

      processedFiles.push({
        file: result.file,
        type: result.type,
        base64: result.base64!,
        content: result.content
      })
    }

    if (processedFiles.length > 0) {
      files.value = [...files.value, ...processedFiles]
    }

  } catch (err: any) {
    error.value = `Failed to process files: ${err.message}`
    emit('error', error.value)
  } finally {
    uploading.value = false
    // Clear the input so the same file can be selected again
    if (target) target.value = ''
  }
}

function removeFile(index: number) {
  const newFiles = [...files.value]
  newFiles.splice(index, 1)
  files.value = newFiles
  error.value = null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Clear error when files change
function clearError() {
  error.value = null
}

// Expose methods for parent component
defineExpose({
  clearError,
  triggerFileInput
})
</script>

<style scoped>
.file-upload-container {
  @apply relative;
}

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
</style>
