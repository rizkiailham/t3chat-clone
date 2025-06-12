<template>
  <div v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCodeBlock } from '../../utils/syntax-highlighter'

interface Props {
  content: string
}

const props = defineProps<Props>()

const renderedContent = computed(() => {
  return formatCodeBlock(props.content)
})
</script>