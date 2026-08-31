<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="选项详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="600px"
    top="10vh"
  >
    <el-descriptions :column="2" border v-loading="state.loading">
      <el-descriptions-item label="ID">{{ state.detailData.id || '无' }}</el-descriptions-item>
      <el-descriptions-item label="标签ID">{{ state.detailData.tagId || '无' }}</el-descriptions-item>
      <el-descriptions-item label="编码">{{ state.detailData.code || '无' }}</el-descriptions-item>
      <el-descriptions-item label="名称">{{ state.detailData.name || '无' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
          {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="排序">{{ state.detailData.sort || 0 }}</el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">{{ state.detailData.description || '无' }}</el-descriptions-item>
      <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
      <el-descriptions-item label="修改人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
      <el-descriptions-item label="修改时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DataTagOptionApi } from '@/modules/data/tag/api/DataTagOption.api'
  import type { DataTagOptionDetailResponseVo } from '@/modules/data/tag/type/DataTagOption.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    optionId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as DataTagOptionDetailResponseVo
  })

  // 格式化时间戳
  const formatTime = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 加载选项详情
  const loadOptionDetail = async () => {
    if (!props.optionId) return
    try {
      state.loading = true
      const data = await DataTagOptionApi.detail({ id: props.optionId })
      state.detailData = data
    } catch (error) {
      console.error('获取选项详情失败', error)
      ElMessage.error('获取选项详情失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {} as DataTagOptionDetailResponseVo
    state.loading = false
  }

  // 监听对话框打开和选项ID变化
  watch(
    [() => props.modelValue, () => props.optionId],
    async ([modelValue, optionId]) => {
      if (modelValue && optionId) {
        await loadOptionDetail()
      }
    },
    { immediate: false }
  )
</script>
