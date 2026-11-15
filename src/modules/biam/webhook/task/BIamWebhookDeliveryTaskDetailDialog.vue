<template>
  <el-dialog
    v-model="state.visible"
    title="Webhook投递任务详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    width="clamp(640px, 62vw, 960px)"
    align-center
    @closed="handleDialogClosed"
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 失败摘要：一眼定位最近一次失败原因 -->
      <el-alert v-if="lastFailure" type="error" :closable="false" show-icon :title="lastFailureTitle">
        <template #default>
          <span class="failure-detail">{{ lastFailure }}</span>
        </template>
      </el-alert>

      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="接收端">{{ state.detailData.webhookEndpointName || state.detailData.webhookEndpointId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="投递状态">
          <el-tag v-if="state.detailData.status" :type="WEBHOOK_DELIVERY_TASK_STATUS_TAG_TYPE[state.detailData.status || ''] || 'info'" effect="light">
            {{ enumStore.getEnumLabel(DICT_IAM_WEBHOOK_DELIVERY_TASK_STATUS, state.detailData.status) }}
          </el-tag>
          <span v-else class="detail-empty">无</span>
        </el-descriptions-item>
        <el-descriptions-item label="事件编码">{{ state.detailData.eventCode || '无' }}</el-descriptions-item>
        <el-descriptions-item label="事件标识">{{ state.detailData.eventKey || '无' }}</el-descriptions-item>
        <el-descriptions-item label="事件发生时间">{{ formatTime(state.detailData.eventTime) }}</el-descriptions-item>
        <el-descriptions-item label="链路追踪ID">{{ state.detailData.traceId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="投递次数">{{ state.detailData.attemptCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="最近投递时间">{{ formatTime(state.detailData.lastAttemptTime) }}</el-descriptions-item>
        <el-descriptions-item label="投递成功时间">{{ formatTime(state.detailData.successTime) }}</el-descriptions-item>
        <el-descriptions-item label="下次重试时间">{{ formatTime(state.detailData.nextRetryTime) }}</el-descriptions-item>
        <el-descriptions-item label="任务ID">{{ state.detailData.id || '无' }}</el-descriptions-item>
        <el-descriptions-item label="事件记录ID" :span="2">{{ state.detailData.eventRecordId || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 事件载荷：存于事件记录，投递任务只保存引用 -->
      <el-descriptions class="detail-descriptions" :column="1" border title="事件载荷（事件记录快照）">
        <el-descriptions-item label="载荷快照">
          <pre class="detail-code">{{ payloadText }}</pre>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 执行记录 -->
      <div class="detail-section">
        <div class="detail-section-title">执行记录</div>
        <el-table v-if="attemptList.length" :data="attemptList" border size="small" max-height="360" style="width: 100%">
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="attempt-expand">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="请求标识" :span="2">{{ row.requestId || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="链路追踪ID" :span="2">{{ row.traceId || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="请求发起时间">{{ formatTime(row.requestTime) }}</el-descriptions-item>
                  <el-descriptions-item label="响应接收时间">{{ formatTime(row.responseTime) }}</el-descriptions-item>
                  <el-descriptions-item label="响应体" :span="2">
                    <pre class="detail-code">{{ formatJson(row.responseBody) }}</pre>
                  </el-descriptions-item>
                  <el-descriptions-item label="错误信息" :span="2">
                    <span class="detail-text-break" :class="{ 'detail-empty': !row.errorMessage }">{{ row.errorMessage || '无' }}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="attemptNo" label="序号" align="center" width="70" />
          <el-table-column prop="attemptType" label="执行类型" align="center" width="110">
            <template #default="{ row }">{{ enumStore.getEnumLabel(DICT_IAM_WEBHOOK_DELIVERY_ATTEMPT_TYPE, row.attemptType) }}</template>
          </el-table-column>
          <el-table-column prop="result" label="执行结果" align="center" width="100">
            <template #default="{ row }">
              <el-tag :type="WEBHOOK_DELIVERY_ATTEMPT_RESULT_TAG_TYPE[row.result] || 'info'" size="small">
                {{ enumStore.getEnumLabel(DICT_IAM_WEBHOOK_DELIVERY_ATTEMPT_RESULT, row.result) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="requestTime" label="请求时间" align="center" width="170">
            <template #default="{ row }">{{ formatTime(row.requestTime) }}</template>
          </el-table-column>
          <el-table-column prop="durationMs" label="耗时" align="center" width="100">
            <template #default="{ row }">{{ row.durationMs != null ? `${row.durationMs} ms` : '-' }}</template>
          </el-table-column>
          <el-table-column prop="responseStatus" label="响应状态" align="center" width="100">
            <template #default="{ row }">{{ row.responseStatus ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="errorMessage" label="错误信息" align="left" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">{{ row.errorMessage || '-' }}</template>
          </el-table-column>
        </el-table>
        <span v-else class="detail-empty">无</span>
      </div>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
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
  import { computed, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { BIamWebhookDeliveryTaskApi } from './api/BIamWebhookDeliveryTask.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import {
    DICT_IAM_WEBHOOK_DELIVERY_ATTEMPT_RESULT,
    DICT_IAM_WEBHOOK_DELIVERY_ATTEMPT_TYPE,
    DICT_IAM_WEBHOOK_DELIVERY_TASK_STATUS
  } from '@/shared/constants/DictionaryEnum.constant'
  import { WEBHOOK_DELIVERY_ATTEMPT_RESULT_TAG_TYPE, WEBHOOK_DELIVERY_TASK_STATUS_TAG_TYPE } from './type/BIamWebhookDeliveryTask.type'
  import type { BIamWebhookDeliveryTaskDetailResponseVo } from './type/BIamWebhookDeliveryTask.type'

  const props = defineProps<{
    modelValue: boolean
    taskId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as Partial<BIamWebhookDeliveryTaskDetailResponseVo>
  })

  const attemptList = computed(() => state.detailData.attemptList || [])

  /** 最近一次非成功的执行记录，用于失败摘要 */
  const lastFailureAttempt = computed(() => {
    const list = attemptList.value
    for (let index = list.length - 1; index >= 0; index--) {
      const attempt = list[index]
      if (attempt && attempt.result !== 'SUCCESS') return attempt
    }
    return null
  })

  const lastFailure = computed(() => {
    const status = state.detailData.status
    if (status !== 'FAILED' && status !== 'EXPIRED' && status !== 'PAUSED') return ''
    const attempt = lastFailureAttempt.value
    if (!attempt) return '该任务没有可用的投递执行记录'
    const parts: string[] = []
    if (attempt.responseStatus != null) parts.push(`HTTP ${attempt.responseStatus}`)
    if (attempt.errorMessage) parts.push(attempt.errorMessage)
    if (!parts.length) parts.push(`执行结果：${enumStore.getEnumLabel(DICT_IAM_WEBHOOK_DELIVERY_ATTEMPT_RESULT, attempt.result)}`)
    return parts.join(' · ')
  })

  const lastFailureTitle = computed(() => {
    const attempt = lastFailureAttempt.value
    return attempt ? `最近一次失败（第 ${attempt.attemptNo} 次投递）` : '失败原因'
  })

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '无')

  /** 请求/响应体为 JSON 字符串时格式化展示，解析失败则原样输出 */
  const formatJson = (text?: string): string => {
    if (!text) return '无'
    try {
      return JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      return text
    }
  }

  const payloadText = computed(() => {
    const payload = state.detailData.payload
    return payload ? JSON.stringify(payload, null, 2) : '无'
  })

  const fetchData = async () => {
    if (!props.taskId) return
    try {
      state.loading = true
      state.detailData = (await BIamWebhookDeliveryTaskApi.detail({ id: props.taskId })) || {}
    } catch (error) {
      console.error('获取投递任务详情失败', error)
      ElMessage.error('获取投递任务详情失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {}
    state.loading = false
  }

  watch(
    [() => props.modelValue, () => props.taskId],
    async ([modelValue, taskId]) => {
      if (modelValue && taskId) await fetchData()
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .attempt-expand {
    padding: 8px 12px;
  }

  .failure-detail {
    display: inline-block;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    word-break: break-all;
  }
</style>
