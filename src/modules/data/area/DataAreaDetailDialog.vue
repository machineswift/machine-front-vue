<template>
  <el-dialog
    v-model="state.visible"
    title="区域详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-skeleton :loading="state.loading" animated>
      <template #template>
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
      </template>
      <template #default>
        <el-descriptions :column="2" border label-width="80">
          <el-descriptions-item label="区域编码">{{ state.detailData.code || '-' }}</el-descriptions-item>
          <el-descriptions-item label="区域名称">{{ state.detailData.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ state.detailData.sort || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ state.detailData.createName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="修改人">
            {{ state.detailData.updateName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(state.detailData.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatTime(state.detailData.updateTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">关闭</el-button>
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
