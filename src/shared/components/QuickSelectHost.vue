<template>
  <component :is="dialog" v-if="dialog" :model-value="modelValue" v-bind="$attrs" @update:model-value="handleVisibleChange" @confirm="handleConfirm" />
</template>

<script setup lang="ts">
  import { computed, defineAsyncComponent } from 'vue'
  import type { QuickSelectKind } from '@/shared/types/QuickSelect.type'
  import { getQuickSelectLoader } from '@/shared/components/quick-select/registry'

  defineOptions({
    name: 'QuickSelectHost',
    inheritAttrs: false
  })

  const props = defineProps<{
    kind: QuickSelectKind
    modelValue?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    // 具体行类型由各选择器决定，宿主只做透传
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    confirm: [rows: any[]]
  }>()

  // registry 存的是懒加载函数，组件首次渲染时才真正加载对应 chunk
  const dialog = computed(() => {
    const loader = getQuickSelectLoader(props.kind)
    if (!loader) {
      console.warn(`[QuickSelectHost] 未注册的快速选择器: ${props.kind}`)
      return null
    }
    return defineAsyncComponent(loader)
  })

  const handleVisibleChange = (visible: boolean) => {
    emit('update:modelValue', visible)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleConfirm = (rows: any[]) => {
    emit('confirm', rows)
  }
</script>
