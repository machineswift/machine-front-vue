<template>
  <el-dialog
    v-model="state.visible"
    title="分类详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="8vh"
  >
    <el-tabs type="border-card" v-loading="state.loading" class="el-tabs-card">
      <!-- 基本信息标签页 -->
      <el-tab-pane label="基本信息" class="el-main-tab-pane">
        <el-form :model="state.detailData" label-width="100px">
          <el-divider content-position="left">基本信息</el-divider>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="编码">
                <el-input :model-value="state.detailData.code || '无'" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="名称">
                <el-input :model-value="state.detailData.name || '无'" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="排序">
            <el-input :model-value="state.detailData.sort ?? 0" disabled style="width: 200px" />
          </el-form-item>

          <el-form-item label="描述" v-if="state.detailData.description">
            <el-input :model-value="state.detailData.description" type="textarea" :rows="3" disabled />
          </el-form-item>

          <el-divider content-position="left">操作信息</el-divider>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="创建人">
                <el-input :model-value="state.detailData.createName || '无'" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新人">
                <el-input :model-value="state.detailData.updateName || '无'" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="创建时间">
                <el-input :model-value="formatTimestamp(state.detailData.createTime)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间">
                <el-input :model-value="formatTimestamp(state.detailData.updateTime)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
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

    .el-row {
      width: 100%;
    }
  }
</style>
