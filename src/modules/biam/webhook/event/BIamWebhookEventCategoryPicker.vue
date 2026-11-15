<template>
  <TreePickerPanel
    :model-value="modelValue"
    :roots="categoryTreeOptions"
    :icon="FolderOpened"
    :placeholder="placeholder"
    :height="280"
    @update:model-value="handleSelect"
  />
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import { BIamWebhookEventCategoryApi } from './api/BIamWebhookEventCategory.api'
  import type { BIamWebhookEventCategorySimpleTreeResponseVo } from './type/BIamWebhookEventCategory.type'

  withDefaults(
    defineProps<{
      modelValue?: string
      placeholder?: string
    }>(),
    {
      modelValue: '',
      placeholder: '输入分类名称或编码搜索'
    }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const categoryTreeOptions = ref<BIamWebhookEventCategorySimpleTreeResponseVo[]>([])

  const loadTree = async () => {
    try {
      const response = await BIamWebhookEventCategoryApi.treeSimple()
      const root = response as unknown as BIamWebhookEventCategorySimpleTreeResponseVo
      categoryTreeOptions.value = root?.id ? [root] : []
    } catch (error) {
      console.error('加载分类树失败', error)
      ElMessage.error('加载分类树失败')
    }
  }

  /** 事件只能挂在叶子分类下，选择非叶子节点时回退到上一次有效值 */
  const handleSelect = (categoryId: string) => {
    const node = TreeDataUtil.findNode(categoryTreeOptions.value, categoryId)
    if (node?.children?.length) {
      ElMessage.warning('事件只能挂在叶子分类下，请选择叶子分类')
      return
    }
    emit('update:modelValue', categoryId)
  }

  onMounted(loadTree)
</script>
