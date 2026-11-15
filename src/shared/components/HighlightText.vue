<template>
  <template v-for="(segment, index) in segments" :key="index">
    <span v-if="segment.highlight" class="highlight">{{ segment.text }}</span>
    <template v-else>{{ segment.text }}</template>
  </template>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { HighlightRange } from '@/shared/types/Common.type'

  // 命中区间切片渲染为 文本 + <span class="highlight">，不使用 innerHTML（规避 XSS）
  interface Segment {
    text: string
    highlight: boolean
  }

  const props = withDefaults(
    defineProps<{
      text?: string
      // 闭区间，下标基于原始文本
      ranges?: HighlightRange[]
    }>(),
    {
      text: '',
      ranges: () => []
    }
  )

  const segments = computed<Segment[]>(() => {
    const text = props.text ?? ''
    const ranges = props.ranges ?? []
    if (!text) return []
    if (!ranges.length) return [{ text, highlight: false }]

    const result: Segment[] = []
    let cursor = 0
    for (const [start, end] of ranges) {
      if (start > cursor) result.push({ text: text.slice(cursor, start), highlight: false })
      result.push({ text: text.slice(start, end + 1), highlight: true })
      cursor = end + 1
    }
    if (cursor < text.length) result.push({ text: text.slice(cursor), highlight: false })
    return result
  })
</script>

<style scoped lang="scss">
  .highlight {
    padding: 0 2px;
    color: #000;
    font-weight: bold;
    background-color: #fffb8f;
    border-radius: 2px;
  }
</style>
