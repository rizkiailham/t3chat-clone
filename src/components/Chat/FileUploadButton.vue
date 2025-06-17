<template>
  <div class="relative">
    <!-- Modern Upload Button -->
    <button
      @click="triggerFileInput"
      :disabled="uploading || disabled"
      class="group relative pb-[14px] px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
      title="Upload image or PDF"
    >
      <!-- Upload Icon -->
      <PaperClipIcon
        v-if="!uploading"
        class="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
      />

      <!-- Loading Spinner -->
      <div
        v-else
        class="w-5 h-5 relative"
      >
        <div class="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-800"></div>
        <div class="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
      </div>

      <!-- Hover Effect -->
      <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
    </button>

    <!-- Beautiful Progress Modal -->
    <Teleport to="body">
      <div
        v-if="uploading && showProgress"
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
        @click.self="() => {}"
      >
        <div class="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-500 scale-100 animate-modal-enter">
          <!-- Header -->
          <div class="text-center mb-6">
            <!-- Dynamic Icon -->
            <div
              class="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all duration-500"
              :class="{
                'bg-gradient-to-r from-blue-500 to-purple-600': !uploadError && !uploadSuccess,
                'bg-gradient-to-r from-red-500 to-red-600': uploadError,
                'bg-gradient-to-r from-green-500 to-green-600': uploadSuccess
              }"
            >
              <!-- Processing Icon -->
              <svg
                v-if="!uploadError && !uploadSuccess"
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>

              <!-- Error Icon -->
              <svg
                v-else-if="uploadError"
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>

              <!-- Success Icon -->
              <svg
                v-else
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <!-- Dynamic Title -->
            <h3
              class="text-xl font-bold mb-2 transition-colors duration-300"
              :class="{
                'text-gray-900 dark:text-white': !uploadError && !uploadSuccess,
                'text-red-600 dark:text-red-400': uploadError,
                'text-green-600 dark:text-green-400': uploadSuccess
              }"
            >
              {{ uploadError ? 'Upload Failed' : uploadSuccess ? 'Upload Complete!' : 'Processing File' }}
            </h3>

            <!-- Dynamic Description -->
            <p class="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              <span class="font-medium text-gray-900 dark:text-white">{{ currentFileName }}</span>
              <br>
              <span v-if="uploadError" class="text-red-600 dark:text-red-400">
                {{ uploadError }}
              </span>
              <span v-else-if="uploadSuccess" class="text-green-600 dark:text-green-400">
                File processed successfully and ready for AI analysis
              </span>
              <span v-else>
                We're extracting content for AI analysis
              </span>
            </p>
          </div>

          <!-- Progress Component -->
          <ProgressBar
            :progress="uploadProgress.progress"
            :status-text="uploadProgress.status"
            :show-steps="true"
            :steps="['Validate', 'Upload', 'Process', 'Complete']"
            :current-step="uploadProgress.step"
          />

          <!-- Footer -->
          <div class="mt-6 text-center">
            <div
              class="inline-flex items-center space-x-2 text-xs px-3 py-2 rounded-full transition-all duration-300"
              :class="{
                'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800': !uploadError && !uploadSuccess,
                'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20': uploadError,
                'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20': uploadSuccess
              }"
            >
              <div
                class="w-2 h-2 rounded-full transition-all duration-300"
                :class="{
                  'bg-blue-500 animate-pulse': !uploadError && !uploadSuccess,
                  'bg-red-500': uploadError,
                  'bg-green-500': uploadSuccess
                }"
              ></div>
              <span v-if="uploadError">
                Upload failed - please try again
              </span>
              <span v-else-if="uploadSuccess">
                Ready for AI analysis
              </span>
              <span v-else>
                Powered by PDF.co
              </span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*,.pdf"
      multiple
      @change="handleFileSelect"
      class="hidden"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PaperClipIcon } from '@heroicons/vue/24/outline'
import { fileUploadService, type UploadProgress } from '../../services/file-upload.service'
import type { FileAttachment } from '../../types'
import ProgressBar from '../UI/ProgressBar.vue'

interface Props {
  disabled?: boolean
  maxFiles?: number
  currentFileCount?: number
}

interface Emits {
  (e: 'files-selected', files: FileAttachment[]): void
  (e: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  maxFiles: 5,
  currentFileCount: 0
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const showProgress = ref(false)
const currentFileName = ref('')
const uploadProgress = ref<UploadProgress>({
  progress: 0,
  status: 'Starting...',
  step: 0,
  totalSteps: 4
})
const uploadError = ref('')
const uploadSuccess = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])

  if (selectedFiles.length === 0) return

  // Check file count limit
  if (props.currentFileCount + selectedFiles.length > props.maxFiles) {
    emit('error', `Maximum ${props.maxFiles} files allowed. Please remove some files first.`)
    return
  }

  uploading.value = true
  showProgress.value = true
  uploadError.value = ''
  uploadSuccess.value = false

  try {
    const processedFiles: FileAttachment[] = []

    for (const file of selectedFiles) {
      currentFileName.value = file.name

      // Reset progress for each file
      uploadProgress.value = {
        progress: 0,
        status: 'Preparing file...',
        step: 0,
        totalSteps: 4
      }

      const result = await fileUploadService.processFile(file, (progress) => {
        uploadProgress.value = progress
      })

      if (result.error) {
        uploadError.value = result.error
        emit('error', result.error)
        continue
      }

      processedFiles.push({
        file: result.file,
        type: result.type,
        base64: result.base64!,
        content: result.content,
        pdfData: result.pdfData // Include PDF data for AI analysis
      })
    }

    if (processedFiles.length > 0) {
      uploadSuccess.value = true

      // Show success for a moment before closing
      uploadProgress.value = {
        progress: 100,
        status: 'Upload completed successfully!',
        step: 4,
        totalSteps: 4
      }

      // Wait a bit to show success state
      await new Promise(resolve => setTimeout(resolve, 1000))

      emit('files-selected', processedFiles)
    }

  } catch (err: any) {
    uploadError.value = `Failed to process files: ${err.message}`
    emit('error', `Failed to process files: ${err.message}`)
  } finally {
    // Delay closing to show final state
    setTimeout(() => {
      uploading.value = false
      showProgress.value = false
      currentFileName.value = ''
      uploadError.value = ''
      uploadSuccess.value = false
    }, uploadSuccess.value ? 500 : 2000) // Shorter delay for success, longer for errors

    // Clear the input so the same file can be selected again
    if (target) target.value = ''
  }
}

defineExpose({
  triggerFileInput
})
</script>

<style scoped>
@keyframes modal-enter {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-enter {
  animation: modal-enter 0.3s ease-out;
}
</style>
