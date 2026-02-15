<template>
  <el-dialog
    v-model="state.visible"
    title="分类详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-tabs type="border-card" v-loading="state.loading" class="el-tabs-card">
      <!-- 基本信息标签页 -->
      <el-tab-pane label="基本信息" class="el-main-tab-pane">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">
            {{ state.detailData.id }}
          </el-descriptions-item>
          <el-descriptions-item label="编码">
            {{ state.detailData.code || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="名称">
            {{ state.detailData.name || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="父ID">
            {{ state.detailData.parentId || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="排序">
            {{ state.detailData.sort || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ state.detailData.createName || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新人">
            {{ state.detailData.updateName || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTimestamp(state.detailData.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatTimestamp(state.detailData.updateTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ state.detailData.description || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { DataTagCategoryApi } from '@/modules/data/tag/api/DataTagCategory.api'
  import type { DataTagCategoryDetailResponseVo } from '@/modules/data/tag/type/DataTagCategory.type'
  import { ElMessage } from 'element-plus'

  const props = defineProps<{
    modelValue: boolean
    categoryId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // 统一状态管理
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<DataTagCategoryDetailResponseVo>
  })

  // 格式化时间戳
  const formatTimestamp = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 获取分类详情
  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      const res = await DataTagCategoryApi.detail({ id: props.categoryId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取分类详情失败', error)
      ElMessage.error('获取分类详情失败')
    } finally {
      state.loading = false
    }
  }

  // 对话框关闭时清理数据
  const handleDialogClosed = () => {
    state.detailData = {}
    state.loading = false
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.categoryId],
    async ([modelValue, categoryId]) => {
      if (modelValue && categoryId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  .el-tabs-card {
    min-height: 400px;

    .el-main-tab-pane {
      height: 100%;
    }
  }

  .el-descriptions {
    margin: 10px;

    :deep(.el-descriptions__cell) {
      padding: 12px 10px;
    }
  }
</style>
