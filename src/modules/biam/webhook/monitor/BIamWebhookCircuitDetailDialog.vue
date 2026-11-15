<template>
  <el-dialog
    v-model="state.visible"
    title="接收端熔断详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    width="clamp(720px, 74vw, 1000px)"
    align-center
    @closed="handleDialogClosed"
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 接收端概览 -->
      <div class="circuit-header">
        <div class="circuit-header-main">
          <div class="circuit-name" :title="detail.webhookEndpointName || detail.webhookEndpointCode">
            {{ detail.webhookEndpointName || detail.webhookEndpointCode || '接收端' }}
          </div>
          <div class="circuit-tags">
            <el-tag v-if="detail.endpointStatus" size="small" effect="light" :type="detail.endpointStatus === 'ENABLE' ? 'success' : 'danger'">
              {{ enumStore.getEnumLabel(DICT_STATUS, detail.endpointStatus) }}
            </el-tag>
            <el-tag size="small" effect="light" :type="detail.pauseFlag ? 'warning' : 'info'">{{ detail.pauseFlag ? '暂停投递' : '正常投递' }}</el-tag>
            <el-tag size="small" effect="dark" :type="circuitTagType">{{ circuitLabel }}</el-tag>
          </div>
        </div>
        <div class="circuit-code">
          <span class="circuit-code-label">接收端编码</span>
          <span class="circuit-code-value">{{ detail.webhookEndpointCode || '无' }}</span>
        </div>
      </div>

      <!-- 熔断状态流转 -->
      <div class="circuit-flow">
        <template v-for="(node, index) in FLOW_NODES" :key="node.value">
          <div class="flow-node" :class="{ 'is-active': detail.circuitState === node.value }">
            <span class="flow-title">{{ node.label }}</span>
            <span class="flow-desc">{{ node.desc }}</span>
          </div>
          <el-icon v-if="index < FLOW_NODES.length - 1" class="flow-arrow"><Right /></el-icon>
        </template>
      </div>

      <!-- 状态指标 -->
      <div class="metric-grid">
        <div class="metric-item">
          <span class="metric-label">持续打开时长</span>
          <span class="metric-value">{{ formatMonitorDuration(detail.openDurationSeconds) }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">预计可探测时间</span>
          <span class="metric-value">{{ formatMonitorTime(detail.nextProbeTime) }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">累计熔断次数</span>
          <span class="metric-value">{{ detail.openCount ?? 0 }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">连续失败次数</span>
          <span class="metric-value" :class="{ 'is-danger': (detail.consecutiveFailures ?? 0) > 0 }">{{ detail.consecutiveFailures ?? 0 }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">最近失败时间</span>
          <span class="metric-value">{{ formatMonitorTime(detail.lastFailureTime) }}</span>
        </div>
        <div class="metric-item metric-item--wide">
          <span class="metric-label">最近失败原因</span>
          <span class="metric-value metric-value--text" :class="{ 'detail-empty': !detail.lastFailureReason }">
            {{ detail.lastFailureReason || '无' }}
          </span>
        </div>
      </div>

      <!-- 失败统计窗口 -->
      <div class="detail-section">
        <div class="detail-section-title">
          当前失败统计窗口
          <span class="section-sub">{{ detail.window ? `统计窗口 ${detail.window.windowSeconds} 秒` : '暂无窗口数据' }}</span>
        </div>
        <template v-if="detail.window">
          <div class="window-range">{{ formatMonitorTime(detail.window.windowStartTime) }} ~ {{ formatMonitorTime(detail.window.windowEndTime) }}</div>
          <div class="window-grid">
            <div class="window-item">
              <span class="window-label">请求数</span>
              <span class="window-value">{{ detail.window.requestCount }}</span>
            </div>
            <div class="window-item">
              <span class="window-label">成功</span>
              <span class="window-value is-success">{{ detail.window.successCount }}</span>
            </div>
            <div class="window-item">
              <span class="window-label">失败</span>
              <span class="window-value is-danger">{{ detail.window.failureCount }}</span>
            </div>
            <div class="window-item">
              <span class="window-label">超时</span>
              <span class="window-value is-warning">{{ detail.window.timeoutCount }}</span>
            </div>
            <div class="window-item window-item--rate">
              <span class="window-label">失败率</span>
              <el-progress
                :percentage="Math.min(100, Number(detail.window.failureRate ?? 0))"
                :stroke-width="8"
                :color="rateColor"
                :format="() => `${detail.window?.failureRate ?? 0}%`"
              />
            </div>
          </div>
        </template>
        <span v-else class="detail-empty">无</span>
      </div>

      <!-- 熔断策略 -->
      <div class="detail-section">
        <div class="detail-section-title">熔断策略</div>
        <el-descriptions v-if="policy" class="detail-descriptions" :column="4" border size="small">
          <el-descriptions-item label="连续失败阈值">{{ policy.failureThreshold }} 次</el-descriptions-item>
          <el-descriptions-item label="失败率阈值">{{ policy.failureRateThreshold }}%</el-descriptions-item>
          <el-descriptions-item label="最小请求数">{{ policy.minimumRequestCount }} 次</el-descriptions-item>
          <el-descriptions-item label="失败率窗口">{{ policy.failureWindowSeconds }} 秒</el-descriptions-item>
          <el-descriptions-item label="熔断持续时长">{{ policy.openDurationSeconds }} 秒</el-descriptions-item>
          <el-descriptions-item label="半开最大探测">{{ policy.halfOpenMaxCalls }} 次</el-descriptions-item>
          <el-descriptions-item label="半开恢复成功数">{{ policy.halfOpenSuccessThreshold }} 次</el-descriptions-item>
          <el-descriptions-item label="半开再熔断失败数">{{ policy.halfOpenFailureThreshold }} 次</el-descriptions-item>
        </el-descriptions>
        <span v-else class="detail-empty">无</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="state.loading" @click="fetchData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <div class="footer-right">
          <el-button @click="state.visible = false">关闭</el-button>
          <el-button
            v-if="detail.circuitState === 'OPEN'"
            type="warning"
            :disabled="!canProbe"
            v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:MONITOR:CIRCUIT_BREAKER_PROBE']"
            @click="emit('operate', 'PROBE')"
          >
            提前探测
          </el-button>
          <el-button
            v-if="detail.circuitState === 'HALF_OPEN'"
            type="danger"
            v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:MONITOR:CIRCUIT_BREAKER_OPEN']"
            @click="emit('operate', 'OPEN')"
          >
            人工重新熔断
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Refresh, Right } from '@element-plus/icons-vue'
  import { BIamWebhookMonitorApi } from './api/BIamWebhookMonitor.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_WEBHOOK_CIRCUIT_BREAKER_STATE, DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { formatMonitorDuration, formatMonitorTime, WEBHOOK_CIRCUIT_STATE_TAG_TYPE } from './type/BIamWebhookMonitor.type'
  import type { BIamWebhookCircuitBreakerDetailResponseVo, BIamWebhookCircuitOperateType } from './type/BIamWebhookMonitor.type'

  const props = defineProps<{
    modelValue: boolean
    endpointId?: string
  }>()

  const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
    (event: 'operate', type: BIamWebhookCircuitOperateType): void
  }>()

  const enumStore = useDictionaryEnumStore()

  /** 状态流转展示：关闭 → 打开 → 半开 */
  const FLOW_NODES = [
    { value: 'CLOSED', label: '关闭', desc: '正常投递' },
    { value: 'OPEN', label: '打开', desc: '暂停投递' },
    { value: 'HALF_OPEN', label: '半开', desc: '探测恢复' }
  ]

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: value => emit('update:modelValue', value)
    }),
    loading: false,
    detail: {} as Partial<BIamWebhookCircuitBreakerDetailResponseVo>
  })

  const detail = computed(() => state.detail)

  const policy = computed(() => state.detail.policy ?? null)

  const circuitLabel = computed(() => enumStore.getEnumLabel(DICT_IAM_WEBHOOK_CIRCUIT_BREAKER_STATE, state.detail.circuitState, '无'))

  const circuitTagType = computed(() => WEBHOOK_CIRCUIT_STATE_TAG_TYPE[state.detail.circuitState || ''] || 'info')

  /** 探测需要接收端处于启用且未暂停投递，与后端校验保持一致 */
  const canProbe = computed(() => state.detail.endpointStatus === 'ENABLE' && !state.detail.pauseFlag)

  const rateColor = (percentage: number): string => {
    if (percentage >= 50) return '#f56c6c'
    if (percentage >= 20) return '#e6a23c'
    return '#67c23a'
  }

  const fetchData = async () => {
    if (!props.endpointId) return
    try {
      state.loading = true
      state.detail = (await BIamWebhookMonitorApi.circuitBreakerDetail({ id: props.endpointId })) || {}
    } catch (error) {
      console.error('获取熔断详情失败', error)
      ElMessage.error('获取熔断详情失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detail = {}
    state.loading = false
  }

  watch(
    [() => props.modelValue, () => props.endpointId],
    async ([modelValue, endpointId]) => {
      if (modelValue && endpointId) await fetchData()
    },
    { immediate: false }
  )

  defineExpose({ refresh: fetchData })
</script>

<style scoped lang="scss">
  .circuit-header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }

  .circuit-header-main {
    min-width: 0;
  }

  .circuit-name {
    margin-bottom: 8px;
    overflow: hidden;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .circuit-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .circuit-code {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-end;
    flex-shrink: 0;
    font-size: 12px;

    .circuit-code-label {
      color: var(--el-text-color-secondary);
    }

    .circuit-code-value {
      font-family: var(--el-font-family-mono, monospace);
      color: var(--el-text-color-primary);
    }
  }

  .circuit-flow {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 16px 8px;
    background: var(--el-bg-color);
    border: 1px dashed var(--el-border-color-light);
    border-radius: 8px;
  }

  .flow-node {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
    min-width: 96px;
    padding: 8px 14px;
    background: var(--el-fill-color-light);
    border: 1px solid transparent;
    border-radius: 8px;
    transition: all 0.2s ease;

    .flow-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-regular);
    }

    .flow-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-5);

      .flow-title {
        color: var(--el-color-primary);
      }
    }
  }

  .flow-arrow {
    color: var(--el-text-color-placeholder);
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;

    .metric-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .metric-value {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      font-variant-numeric: tabular-nums;
    }

    .metric-value.is-danger {
      color: var(--el-color-danger);
    }

    .metric-value--text {
      font-size: 13px;
      font-weight: 400;
      word-break: break-all;
    }

    &.metric-item--wide {
      grid-column: 1 / -1;
    }
  }

  .section-sub {
    margin-left: 8px;
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  .window-range {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .window-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
  }

  .window-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;

    .window-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .window-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      font-variant-numeric: tabular-nums;

      &.is-success {
        color: var(--el-color-success);
      }

      &.is-danger {
        color: var(--el-color-danger);
      }

      &.is-warning {
        color: var(--el-color-warning);
      }
    }

    &.window-item--rate {
      grid-column: span 2;
    }
  }

  .detail-section {
    margin-top: 20px;
  }

  .dialog-footer {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  .footer-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
