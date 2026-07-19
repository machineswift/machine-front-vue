<template>
  <el-dialog
    v-model="state.visible"
    title="客户详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="60%"
    top="10vh"
  >
    <el-descriptions :column="2" border v-loading="state.loading">
      <el-descriptions-item label="客户ID">
        {{ state.detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="客户编码">
        {{ state.detailData.code || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="身份证号">
        {{ state.detailData.identityCardNumber || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="姓名">
        {{ state.detailData.name || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="性别">
        {{ getCustomerGenderLabel(state.detailData.gender) }}
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
    </el-descriptions>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { CrmCustomerApi } from '@/modules/crm/customer/api/CrmCustomer.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { CrmCustomerDetailResponseVo } from '@/modules/crm/customer/type/CrmCustomer.type'
  import { ElMessage } from 'element-plus'

  const enumStore = useDictionaryEnumStore()

  const props = defineProps<{
    modelValue: boolean
    customerId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // 统一状态管理
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<CrmCustomerDetailResponseVo>
  })

  // 获取客户性别标签
  const getCustomerGenderLabel = (type?: string): string => {
    if (!type) return '无'
    const enumItem = enumStore.getEnumItemByCodeSync('GenderEnum', type)
    return enumItem?.message || type
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 获取客户详情
  const fetchData = async () => {
    if (!props.customerId) return

    try {
      state.loading = true
      const res = await CrmCustomerApi.detail({ id: props.customerId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取客户详情失败', error)
      ElMessage.error('获取客户详情失败')
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
    [() => props.modelValue, () => props.customerId],
    async ([modelValue, customerId]) => {
      if (modelValue && customerId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  .el-descriptions {
    margin: 10px;

    :deep(.el-descriptions__cell) {
      padding: 12px 10px;
    }
  }
</style>
