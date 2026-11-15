<template>
  <el-dialog
    v-model="state.visible"
    title="组织详情"
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
        <el-descriptions-item label="组织名称">{{ state.detailData.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="组织编码">{{ state.detailData.code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="组织数">{{ state.detailData.organizationNumber ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="门店数">{{ state.detailData.shopNumber ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="用户数">{{ state.detailData.userNumber ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ state.detailData.sort ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" v-if="state.detailData.description" :span="2">
          <span class="detail-text-break">{{ state.detailData.description }}</span>
        </el-descriptions-item>
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
  import { BIamOrganizationApi } from '@/modules/biam/accessControl/organization/api/BIamOrganization.api'
  import type { BIamOrganizationDetailResponseVo } from '@/modules/biam/accessControl/organization/type/BIamOrganization.type'

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
    detailData: {} as Partial<BIamOrganizationDetailResponseVo>
  })

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  // 对话框关闭时清理数据
  const handleDialogClosed = () => {
    state.detailData = {}
    state.loading = false
  }

  const fetchData = async () => {
    if (!props.organizationId) return

    try {
      state.loading = true
      const res = await BIamOrganizationApi.detail({ id: props.organizationId })
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
