<template>
  <el-dialog
    v-model="state.visible"
    title="标签详情"
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

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="状态">
                <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
                  {{ getStatusLabel(state.detailData.status) }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序">
                <el-input :model-value="state.detailData.sort ?? 0" disabled />
              </el-form-item>
            </el-col>
          </el-row>

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
  import { DataTagApi } from '@/modules/data/tag/api/DataTag.api'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'
  import type { DataTagDetailResponseVo } from '@/modules/data/tag/type/DataTag.type'
  import { ElMessage } from 'element-plus'

  const enumStore = useDictionaryEnumStore()

  const props = defineProps<{
    modelValue: boolean
    tagId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // 统一状态管理
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<DataTagDetailResponseVo>
  })

  // 获取状态标签
  const getStatusLabel = (type?: string): string => {
    if (!type) return '无'
    const enumItem = enumStore.getEnumItemByCodeSync('StatusEnum', type)
    return enumItem?.message || type
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 获取标签详情
  const fetchData = async () => {
    if (!props.tagId) return

    try {
      state.loading = true
      const res = await DataTagApi.detail({ id: props.tagId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取标签详情失败', error)
      ElMessage.error('获取标签详情失败')
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
    () => props.modelValue,
    async modelValue => {
      if (modelValue && props.tagId) {
        await fetchData()
      }
    },
    { immediate: false }
  )

  // 单独监听 tagId 变化，确保在对话框已打开时切换 tagId 也能加载数据
  watch(
    () => props.tagId,
    async tagId => {
      if (props.modelValue && tagId) {
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
