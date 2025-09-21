<template>
  <el-dialog
    v-model="state.visible"
    title="登录日志详情"
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
        <el-descriptions :column="2" border label-width="80px">
          <el-descriptions-item label="ID">{{ state.detailData.id || '无' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ state.detailData.userId || '无' }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ state.detailData.username || '无' }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ state.detailData.name || '无' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ state.detailData.phone || '无' }}</el-descriptions-item>
          <el-descriptions-item label="认证动作">
            <el-tag>{{ formatAuthAction(state.detailData.authAction) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="认证方式">
            <el-tag>{{ formatAuthMethod(state.detailData.authMethod) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="认证结果">
            <el-tag :type="state.detailData.authResult === 'SUCCESS' ? 'success' : 'danger'">
              {{ formatAuthResult(state.detailData.authResult) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="失败原因">{{ state.detailData.failReason || '无' }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ state.detailData.ipAddress || '无' }}</el-descriptions-item>
          <el-descriptions-item label="平台">{{ state.detailData.platform || '无' }}</el-descriptions-item>
          <el-descriptions-item label="User Agent">{{ state.detailData.userAgent || '无' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { IamUserLoginLogApi } from '@/modules/iam/loginLog/api/IamUserLoginLog.api'
  import type { IamUserLoginLogDetailResponseVo } from '@/modules/iam/loginLog/type/IamUserLoginLog.type'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'

  const enumStore = useDictionaryEnumStore()

  const props = defineProps<{
    modelValue: boolean
    logId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  // 统一状态管理
  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<IamUserLoginLogDetailResponseVo>
  })

  // 格式化认证动作
  const formatAuthAction = (action?: string) => {
    if (!action) return '无'
    const enumItem = enumStore.getEnumItemByCodeSync('IamAuthActionEnum', action)
    return enumItem?.message || action
  }

  // 格式化认证方式
  const formatAuthMethod = (method?: string) => {
    if (!method) return '无'
    const enumItem = enumStore.getEnumItemByCodeSync('IamAuthMethodEnum', method)
    return enumItem?.message || method
  }

  // 格式化认证结果
  const formatAuthResult = (result?: string) => {
    if (!result) return '无'
    const enumItem = enumStore.getEnumItemByCodeSync('IamAuthResultEnum', result)
    return enumItem?.message || result
  }

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 对话框关闭时清理数据
  const handleDialogClosed = () => {
    state.detailData = {}
    state.loading = false
  }

  // 获取登录日志详情
  const fetchData = async () => {
    if (!props.logId) return

    try {
      state.loading = true
      const res = await IamUserLoginLogApi.detail({ id: props.logId })
      state.detailData = res || {}
    } catch (error) {
      console.error('获取登录日志详情失败', error)
      state.detailData = {}
    } finally {
      state.loading = false
    }
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.logId],
    async ([modelValue, logId]) => {
      if (modelValue && logId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
