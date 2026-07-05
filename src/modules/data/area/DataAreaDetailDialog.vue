<template>
  <el-dialog
    v-model="state.visible"
    title="区域详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="8vh"
  >
    <el-form :model="state.detailData" label-width="100px" v-loading="state.loading">
      <el-divider content-position="left">基本信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="区域编码">
            <el-input :model-value="state.detailData.code || '-'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="区域名称">
            <el-input :model-value="state.detailData.name || '-'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="排序">
        <el-input :model-value="state.detailData.sort ?? '-'" disabled style="width: 200px" />
      </el-form-item>

      <el-divider content-position="left">操作信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建人">
            <el-input :model-value="state.detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="修改人">
            <el-input :model-value="state.detailData.updateName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input :model-value="formatTime(state.detailData.createTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新时间">
            <el-input :model-value="formatTime(state.detailData.updateTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import type { DataAreaDetailResponseVo } from '@/modules/data/types'

  const props = defineProps<{
    modelValue: boolean
    areaId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // 统一状态管理
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as DataAreaDetailResponseVo
  })

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  // 获取区域详情
  const fetchData = async () => {
    if (!props.areaId) return

    try {
      state.loading = true
      const res = await DataAreaApi.detail({ id: props.areaId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取区域详情失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    //重置详情数据
    state.detailData = {} as DataAreaDetailResponseVo

    //重置加载状态
    state.loading = false
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.areaId],
    async ([modelValue, areaId]) => {
      if (modelValue && areaId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  .el-row {
    width: 100%;
  }
</style>
