<template>
  <el-dialog
    v-model="state.visible"
    title="组织详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
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
          <el-descriptions-item label="组织名称">{{ state.detailData.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="组织编码">{{ state.detailData.code || '-' }}</el-descriptions-item>
          <el-descriptions-item label="组织数">{{ state.detailData.organizationNumber || 0 }}</el-descriptions-item>
          <el-descriptions-item label="门店数">{{ state.detailData.shopNumber || 0 }}</el-descriptions-item>
          <el-descriptions-item label="用户数">{{ state.detailData.userNumber || 0 }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ state.detailData.sort || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ state.detailData.createName }}
          </el-descriptions-item>
          <el-descriptions-item label="修改人">
            {{ state.detailData.updateName }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(state.detailData.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatTime(state.detailData.updateTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ state.detailData.description || '-' }}
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
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import type { IamOrganizationDetailResponseVo } from '@/modules/iam/organization/type/IamOrganization.type'

  const props = defineProps<{
    modelValue: boolean
    organizationId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // 合并所有状态到state对象
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<IamOrganizationDetailResponseVo>
  })

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  // 对话框关闭时清理数据
  const handleDialogClosed = () => {
    // 重置详情数据
    state.detailData = {}
    // 重置加载状态
    state.loading = false
  }

  // 获取组织详情
  const fetchData = async () => {
    if (!props.organizationId) return

    try {
      state.loading = true
      const res = await IamOrganizationApi.detail({ id: props.organizationId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取组织详情失败', error)
      state.detailData = {}
    } finally {
      state.loading = false
    }
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.organizationId],
    async ([modelValue, organizationId]) => {
      if (modelValue && organizationId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
