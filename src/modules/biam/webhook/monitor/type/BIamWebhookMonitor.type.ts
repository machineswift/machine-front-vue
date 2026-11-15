import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

export type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

/** 熔断状态标签色（BIamWebhookCircuitBreakerStateEnum） */
export const WEBHOOK_CIRCUIT_STATE_TAG_TYPE: Record<string, TagType> = {
  CLOSED: 'success',
  OPEN: 'danger',
  HALF_OPEN: 'warning'
}

/** 熔断状态语义说明 */
export const WEBHOOK_CIRCUIT_STATE_DESC: Record<string, string> = {
  CLOSED: '正常投递',
  OPEN: '熔断中，暂停投递',
  HALF_OPEN: '半开探测，恢复投递'
}

/** 熔断运维操作类型：PROBE=OPEN 提前探测转 HALF_OPEN；OPEN=HALF_OPEN 人工重新熔断 */
export type BIamWebhookCircuitOperateType = 'PROBE' | 'OPEN'

/** 快捷时间范围（毫秒跨度） */
export interface BIamWebhookMonitorTimePreset {
  label: string
  millis: number
}

export const WEBHOOK_MONITOR_TIME_PRESETS: BIamWebhookMonitorTimePreset[] = [
  { label: '近1小时', millis: 60 * 60 * 1000 },
  { label: '近6小时', millis: 6 * 60 * 60 * 1000 },
  { label: '近24小时', millis: 24 * 60 * 60 * 1000 },
  { label: '近7天', millis: 7 * 24 * 60 * 60 * 1000 },
  { label: '近30天', millis: 30 * 24 * 60 * 60 * 1000 }
]

/** 默认监控区间：近24小时（与后端缺省口径一致） */
export const WEBHOOK_MONITOR_DEFAULT_PRESET = 24 * 60 * 60 * 1000

/** 趋势指标 key，与后端 BIamWebhookMonitorTrendResponseVo.Point 字段一致 */
export type BIamWebhookTrendMetricKey = 'createdTaskCount' | 'successTaskCount' | 'httpAttemptCount' | 'httpFailureCount' | 'httpTimeoutCount'

export interface BIamWebhookTrendSeries {
  key: BIamWebhookTrendMetricKey
  label: string
  color: string
  /** 是否绘制面积填充（仅主指标开启，避免多条面积互相遮挡） */
  area?: boolean
}

export const WEBHOOK_TREND_SERIES: BIamWebhookTrendSeries[] = [
  { key: 'createdTaskCount', label: '创建任务', color: '#409eff', area: true },
  { key: 'successTaskCount', label: '投递成功', color: '#67c23a' },
  { key: 'httpAttemptCount', label: 'HTTP 请求', color: '#8b5cf6' },
  { key: 'httpFailureCount', label: 'HTTP 失败', color: '#f56c6c' },
  { key: 'httpTimeoutCount', label: 'HTTP 超时', color: '#e6a23c' }
]

export interface BIamWebhookMonitorOverviewQueryRequestVo {
  /** 开始时间（毫秒时间戳），不传默认最近24小时 */
  startTime?: number
  /** 结束时间（毫秒时间戳），不传默认当前时间 */
  endTime?: number
  /** Webhook 接收端ID */
  webhookEndpointId?: string
  /** 事件编码 */
  eventCode?: string
}

export interface BIamWebhookMonitorOverviewResponseVo {
  /** 时间范围内创建的投递任务数 */
  totalTaskCount: number
  /** 时间范围内投递成功的任务数 */
  successTaskCount: number
  /** 时间范围内最终失败的任务数 */
  failedTaskCount: number
  /** 时间范围内已过期的任务数 */
  expiredTaskCount: number
  /** 时间范围内已取消的任务数 */
  cancelledTaskCount: number
  /** 时间范围内因接收端不可投递而暂停的任务数 */
  pausedTaskCount: number
  /** 投递成功率（%） */
  successRate: number
  /** 当前待处理任务数 */
  pendingTaskCount: number
  /** 最老待处理任务的创建时间（毫秒时间戳） */
  oldestPendingTime: number | null
  /** 最老待处理任务已等待时长（秒） */
  oldestPendingAgeSeconds: number | null
  /** 熔断状态为 OPEN 的接收端数 */
  openCircuitCount: number
  /** 熔断状态为 HALF_OPEN 的接收端数 */
  halfOpenCircuitCount: number
  /** 已启用接收端数 */
  enabledEndpointCount: number
  /** 已禁用接收端数 */
  disabledEndpointCount: number
  /** 人工暂停投递的接收端数 */
  pausedEndpointCount: number
}

export interface BIamWebhookMonitorTrendQueryRequestVo {
  startTime?: number
  endTime?: number
  webhookEndpointId?: string
  eventCode?: string
  /** 统计粒度（BIamWebhookMonitorIntervalEnum）：MINUTE / HOUR / DAY；不传按跨度自动选择 */
  interval?: string
}

export interface BIamWebhookMonitorTrendPoint {
  bucketTime: number
  createdTaskCount: number
  successTaskCount: number
  httpAttemptCount: number
  httpFailureCount: number
  httpTimeoutCount: number
}

export interface BIamWebhookMonitorTrendResponseVo {
  /** 实际生效的统计粒度 */
  interval: string
  points: BIamWebhookMonitorTrendPoint[]
}

export interface BIamWebhookMonitorEndpointPageQueryRequestVo extends PageRequest {
  /** 接收端编码（模糊查询） */
  webhookEndpointCode?: string
  /** 接收端状态（StatusEnum）：ENABLE / DISABLE */
  endpointStatus?: string
  /** 是否人工暂停投递 */
  pauseFlag?: boolean
  /** 熔断状态（BIamWebhookCircuitBreakerStateEnum）：CLOSED / OPEN / HALF_OPEN */
  circuitState?: string
  /** 是否存在待处理任务 */
  hasPendingTask?: boolean
}

export interface BIamWebhookMonitorEndpointListResponseVo {
  webhookEndpointId: string
  webhookEndpointCode: string
  webhookEndpointName: string
  /** 接收端启用状态（StatusEnum） */
  endpointStatus: string
  pauseFlag: boolean
  /** 熔断状态（BIamWebhookCircuitBreakerStateEnum） */
  circuitState: string
  /** 统计窗口内 HTTP 请求数 */
  requestCount: number
  /** 统计窗口内成功请求数 */
  successCount: number
  /** 统计窗口内失败请求数（含超时） */
  failureCount: number
  /** 统计窗口内失败率（%） */
  failureRate: number
  /** 连续失败次数 */
  consecutiveFailures: number
  /** 最近成功时间（毫秒时间戳） */
  lastSuccessTime: number | null
  /** 最近失败时间（毫秒时间戳） */
  lastFailureTime: number | null
  /** 最近失败原因 */
  lastFailureReason: string | null
  /** 当前待处理任务数 */
  pendingTaskCount: number
  /** 最老待处理任务的创建时间（毫秒时间戳） */
  oldestPendingTime: number | null
  /** 当前已持续打开时长（秒），非 OPEN 为 0 */
  openDurationSeconds: number
  /** 预计允许探测时间（毫秒时间戳），非 OPEN 为空 */
  nextProbeTime: number | null
}

export type BIamWebhookMonitorEndpointPageResponse = PageResponse<BIamWebhookMonitorEndpointListResponseVo>

export interface BIamWebhookCircuitBreakerOperateRequestVo {
  webhookEndpointId: string
  /** 操作原因（必填，最长512） */
  reason: string
  /** 预期熔断器版本号，用于乐观锁校验 */
  expectedVersion: number
}

export interface BIamWebhookCircuitBreakerPolicy {
  /** 连续失败阈值 */
  failureThreshold: number
  /** 失败率阈值（%） */
  failureRateThreshold: number
  /** 触发失败率判断的最小请求数 */
  minimumRequestCount: number
  /** 失败率统计窗口（秒） */
  failureWindowSeconds: number
  /** OPEN 状态持续时间（秒） */
  openDurationSeconds: number
  /** HALF_OPEN 允许的最大探测请求数 */
  halfOpenMaxCalls: number
  /** HALF_OPEN 恢复为 CLOSED 所需连续成功数 */
  halfOpenSuccessThreshold: number
  /** HALF_OPEN 重新进入 OPEN 的失败阈值 */
  halfOpenFailureThreshold: number
}

export interface BIamWebhookCircuitBreakerWindow {
  /** 窗口时长（秒） */
  windowSeconds: number
  /** 窗口开始时间（毫秒时间戳） */
  windowStartTime: number
  /** 窗口结束时间（毫秒时间戳） */
  windowEndTime: number
  /** 窗口内已结束的请求数 */
  requestCount: number
  /** 窗口内成功请求数 */
  successCount: number
  /** 窗口内失败请求数（含超时） */
  failureCount: number
  /** 窗口内超时请求数 */
  timeoutCount: number
  /** 窗口内失败率（%） */
  failureRate: number
}

export interface BIamWebhookCircuitBreakerDetailResponseVo {
  webhookEndpointId: string
  webhookEndpointCode: string
  webhookEndpointName: string
  /** 接收端启用状态（StatusEnum） */
  endpointStatus: string
  pauseFlag: boolean
  /** 熔断状态（BIamWebhookCircuitBreakerStateEnum） */
  circuitState: string
  /** 熔断器版本号，操作时作为 expectedVersion 回传 */
  version: number
  /** 最近一次进入 OPEN 的时间（毫秒时间戳） */
  openedAt: number | null
  /** 当前已持续打开时长（秒） */
  openDurationSeconds: number
  /** 预计允许探测时间（毫秒时间戳） */
  nextProbeTime: number | null
  /** 熔断次数 */
  openCount: number
  /** 连续失败次数 */
  consecutiveFailures: number
  lastFailureTime: number | null
  lastFailureReason: string | null
  policy: BIamWebhookCircuitBreakerPolicy | null
  window: BIamWebhookCircuitBreakerWindow | null
}

/** 时间戳格式化，空值统一展示「无」 */
export const formatMonitorTime = (timestamp?: number | null): string => (timestamp ? new Date(timestamp).toLocaleString() : '无')

/** 时长格式化：秒 → 天/小时/分钟/秒，用于积压等待与熔断持续时长 */
export const formatMonitorDuration = (seconds?: number | null): string => {
  if (seconds == null || seconds < 0) return '无'
  if (seconds < 60) return `${seconds} 秒`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分 ${seconds % 60} 秒`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时 ${minutes % 60} 分`
  return `${Math.floor(hours / 24)} 天 ${hours % 24} 小时`
}
