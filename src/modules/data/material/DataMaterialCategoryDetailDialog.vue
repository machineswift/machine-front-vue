<template>
  <el-dialog v-model="state.visible" title="素材分类详情" :close-on-click-modal="false" :destroy-on-close="true" @close="handleDialogClosed" width="520px">
    <el-descriptions :column="1" border v-loading="state.loading">
      <el-descriptions-item label="ID">{{ state.detailData.id || '无' }}</el-descriptions-item>
      <el-descriptions-item label="父ID">{{ state.detailData.parentId || '无' }}</el-descriptions-item>
      <el-descriptions-item label="编码">{{ state.detailData.code || '无' }}</el-descriptions-item>
      <el-descriptions-item label="名称">{{ state.detailData.name || '无' }}</el-descriptions-item>
      <el-descriptions-item label="排序">{{ state.detailData.sort ?? '无' }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import type { DataMaterialCategoryDetailResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'
  import { ElMessage } from 'element-plus'

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
    detailData: {} as Partial<DataMaterialCategoryDetailResponseVo>
  })

  const fetchData = async () => {
    if (!props.categoryId) return
    try {
      state.loading = true
      const res = await DataMaterialCategoryApi.detail({ id: props.categoryId })
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

<style scoped lang="scss">
  .el-descriptions {
    margin: 10px;
  }
</style>
