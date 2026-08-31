<template>
  <el-dialog
    v-model="state.visible"
    title="组织详情"
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
          <el-form-item label="组织名称">
            <el-input :model-value="state.detailData.name || '-'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组织编码">
            <el-input :model-value="state.detailData.code || '-'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="组织数">
            <el-input :model-value="state.detailData.organizationNumber ?? 0" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="门店数">
            <el-input :model-value="state.detailData.shopNumber ?? 0" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="用户数">
            <el-input :model-value="state.detailData.userNumber ?? 0" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="排序">
        <el-input :model-value="state.detailData.sort ?? '-'" disabled style="width: 200px" />
      </el-form-item>

      <el-form-item label="备注" v-if="state.detailData.description">
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
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import type { BIamOrganizationDetailResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'

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

<style lang="scss" scoped>
  .el-row {
    width: 100%;
  }
</style>
