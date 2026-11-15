<template>
  <el-dialog
    v-model="state.visible"
    title="区域详情"
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
        <el-descriptions-item label="区域编码">{{ state.detailData.code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="区域名称">{{ state.detailData.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ state.detailData.sort ?? '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="修改人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
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
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import type { DataAreaDetailResponseVo } from '@/modules/data/area/type/DataArea.type'

  const props = defineProps<{
    modelValue: boolean
    areaId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

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
