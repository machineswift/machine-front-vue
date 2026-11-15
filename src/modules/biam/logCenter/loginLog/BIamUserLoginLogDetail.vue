<template>
  <el-dialog
    v-model="state.visible"
    title="登录日志详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 操作主体 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作主体">
        <el-descriptions-item label="用户ID">{{ state.detailData.userId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ state.detailData.username || '无' }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ state.detailData.realName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ state.detailData.phone || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 认证信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="认证信息">
        <el-descriptions-item label="认证动作">
          <el-tag>{{ state.detailData.authAction ? enumStore.getEnumLabel(DICT_IAM_AUTH_ACTION, state.detailData.authAction) : '无' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="认证方式">
          <el-tag>{{ state.detailData.authMethod ? enumStore.getEnumLabel(DICT_IAM_AUTH_METHOD, state.detailData.authMethod) : '无' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 请求链路 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="请求链路">
        <el-descriptions-item label="IP地址">{{ state.detailData.ipAddress || '无' }}</el-descriptions-item>
        <el-descriptions-item label="平台">{{ state.detailData.platform || '无' }}</el-descriptions-item>
        <el-descriptions-item v-if="state.detailData.userAgent" label="User Agent" :span="2">
          <span class="detail-text-break">{{ state.detailData.userAgent }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作结果 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作结果">
        <el-descriptions-item label="认证结果">
          <el-tag :type="state.detailData.authResult === 'SUCCESS' ? 'success' : 'danger'">
            {{ state.detailData.authResult ? enumStore.getEnumLabel(DICT_IAM_AUTH_RESULT, state.detailData.authResult) : '无' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="state.detailData.failReason" label="失败原因" :span="2">
          <span class="detail-text-break">{{ state.detailData.failReason }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 审计信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="审计信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { BIamUserLoginLogApi } from '@/modules/biam/logCenter/loginLog/api/BIamUserLoginLog.api'
  import type { BIamUserLoginLogDetailResponseVo } from '@/modules/biam/logCenter/loginLog/type/IamUserLoginLog.type'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_AUTH_ACTION, DICT_IAM_AUTH_METHOD, DICT_IAM_AUTH_RESULT } from '@/shared/constants/DictionaryEnum.constant'

  const enumStore = useDictionaryEnumStore()

  const props = defineProps<{
    modelValue: boolean
    logId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<BIamUserLoginLogDetailResponseVo>
  })

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 对话框关闭时清理数据
  const handleDialogClosed = () => {
    state.detailData = {}
    state.loading = false
  }

  const fetchData = async () => {
    if (!props.logId) return

    try {
      state.loading = true
      const res = await BIamUserLoginLogApi.detail({ id: props.logId })
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
