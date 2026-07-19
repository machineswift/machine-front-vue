<template>
  <el-dialog
    v-model="state.visible"
    title="会员详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="60%"
    top="10vh"
  >
    <el-descriptions :column="2" border v-loading="state.loading">
      <el-descriptions-item label="会员ID">
        {{ state.detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="会员编码">
        {{ state.detailData.code || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="邮箱">
        {{ state.detailData.email || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="手机号">
        {{ state.detailData.phone || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="姓名">
        {{ state.detailData.name || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="性别">
        {{ getMemberGenderLabel(state.detailData.gender) }}
      </el-descriptions-item>
      <el-descriptions-item label="出生年份">
        {{ state.detailData.birthYear || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="出生月份">{{ state.detailData.birthMonth }}-{{ state.detailData.birthDay }}</el-descriptions-item>
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
  import { CrmMemberApi } from '@/modules/crm/member/api/CrmMember.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { CrmMemberDetailResponseVo } from '@/modules/crm/member/type/CrmMember.type'
  import { ElMessage } from 'element-plus'

  const enumStore = useDictionaryEnumStore()

  const props = defineProps<{
    modelValue: boolean
    memberId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // 统一状态管理
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<CrmMemberDetailResponseVo>
  })

  // 获取会员性别标签
  const getMemberGenderLabel = (type?: string): string => {
    if (!type) return '无'
    const enumItem = enumStore.getEnumItemByCodeSync('GenderEnum', type)
    return enumItem?.message || type
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 获取会员详情
  const fetchData = async () => {
    if (!props.memberId) return

    try {
      state.loading = true
      const res = await CrmMemberApi.detail({ id: props.memberId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取会员详情失败', error)
      ElMessage.error('获取会员详情失败')
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
    [() => props.modelValue, () => props.memberId],
    async ([modelValue, memberId]) => {
      if (modelValue && memberId) {
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
