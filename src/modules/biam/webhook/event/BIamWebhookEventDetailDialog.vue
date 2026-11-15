<template>
  <el-dialog
    v-model="state.visible"
    title="Webhook事件详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="事件编码">{{ state.detailData.code || '无' }}</el-descriptions-item>
        <el-descriptions-item label="事件名称">{{ state.detailData.name || '无' }}</el-descriptions-item>
        <el-descriptions-item label="所属分类">{{ state.categoryName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
            {{ state.detailData.status ? enumStore.getEnumLabel(DICT_STATUS, state.detailData.status) : '无' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="排序">{{ state.detailData.sort ?? '无' }}</el-descriptions-item>
        <el-descriptions-item label="事件描述" :span="2">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.description }">{{ state.detailData.description || '无' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 载荷结构定义 -->
      <el-descriptions class="detail-descriptions" :column="1" border title="载荷结构定义">
        <el-descriptions-item label="载荷结构">
          <pre class="detail-code">{{ payloadSchemaText }}</pre>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { BIamWebhookEventApi } from './api/BIamWebhookEvent.api'
  import { BIamWebhookEventCategoryApi } from './api/BIamWebhookEventCategory.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { BIamWebhookEventDetailResponseVo } from './type/BIamWebhookEvent.type'
  import type { BIamWebhookEventCategorySimpleTreeResponseVo } from './type/BIamWebhookEventCategory.type'

  const props = defineProps<{
    modelValue: boolean
    eventId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    categoryName: '',
    detailData: {} as Partial<BIamWebhookEventDetailResponseVo>
  })

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '无')

  const payloadSchemaText = computed(() => {
    const schema = state.detailData.payloadSchema
    return schema ? JSON.stringify(schema, null, 2) : '无'
  })

  const loadCategoryName = async (categoryId?: string) => {
    if (!categoryId) {
      state.categoryName = ''
      return
    }
    try {
      const root = (await BIamWebhookEventCategoryApi.treeSimple()) as unknown as BIamWebhookEventCategorySimpleTreeResponseVo
      const node = TreeDataUtil.findNode(root?.id ? [root] : [], categoryId)
      state.categoryName = node?.name || categoryId
    } catch (error) {
      console.error('加载分类树失败', error)
      state.categoryName = categoryId
    }
  }

  const fetchData = async () => {
    if (!props.eventId) return
    try {
      state.loading = true
      state.detailData = (await BIamWebhookEventApi.detail({ id: props.eventId })) || {}
      await loadCategoryName(state.detailData.categoryId)
    } catch (error) {
      console.error('获取事件详情失败', error)
      ElMessage.error('获取事件详情失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {}
    state.categoryName = ''
    state.loading = false
  }

  watch(
    [() => props.modelValue, () => props.eventId],
    async ([modelValue, eventId]) => {
      if (modelValue && eventId) await fetchData()
    },
    { immediate: false }
  )
</script>
