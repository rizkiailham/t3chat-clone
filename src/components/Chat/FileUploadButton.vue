<template>
  <div class="relative">
    <!-- Upload Button -->
    <button
      @click="triggerFileInput"
      :disabled="uploading || disabled"
      class="pb-[14px] px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Upload image or PDF"
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PaperClipIcon } from '@heroicons/vue/24/outline'
import { fileUploadService } from '../../services/file-upload.service'
import type { FileAttachment } from '../../types'

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

  try {
    const processedFiles: FileAttachment[] = []

    for (const file of selectedFiles) {
      const result = await fileUploadService.processFile(file)
      
      if (result.error) {
        emit('error', result.error)
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
      emit('files-selected', processedFiles)
    }

  } catch (err: any) {
    emit('error', `Failed to process files: ${err.message}`)
  } finally {
    uploading.value = false
    // Clear the input so the same file can be selected again
    if (target) target.value = ''
  }
}

defineExpose({
  triggerFileInput
})
</script>
