<template>
  <el-dialog
    v-model="state.visible"
    title="品牌分类详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="编码">{{ state.detailData.code || '无' }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ state.detailData.name || '无' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ state.detailData.sort ?? '无' }}</el-descriptions-item>
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
  import { reactive, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DataBrandCategoryApi } from '@/modules/data/brand/api/DataBrandCategory.api'
  import type { DataBrandCategoryDetailResponseVo } from '@/modules/data/brand/type/DataBrandCategory.type'

  const props = defineProps<{
    modelValue: boolean
    categoryId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<DataBrandCategoryDetailResponseVo>
  })

  // 格式化时间戳
  const formatTime = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  const fetchData = async () => {
    if (!props.categoryId) return
    try {
      state.loading = true
      const res = await DataBrandCategoryApi.detail({ id: props.categoryId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取分类详情失败', error)
      ElMessage.error('获取分类详情失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {}
    state.loading = false
  }

  watch(
    [() => props.modelValue, () => props.categoryId],
    async ([modelValue, categoryId]) => {
      if (modelValue && categoryId) await fetchData()
    },
    { immediate: false }
  )
</script>
