import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

/** 投递执行记录 */
export interface BIamWebhookDeliveryTaskAttemptDto {
  id: string
  /** 执行序号，从1开始递增 */
  attemptNo: number
  /** 执行类型（BIamWebhookDeliveryAttemptTypeEnum）：NORMAL / RETRY / PROBE / MANUAL */
  attemptType: string
  /** 执行结果（BIamWebhookDeliveryAttemptResultEnum）：RUNNING / SUCCESS / FAILED / TIMEOUT / SKIPPED */
  result: string
  /** 请求发起时间（Unix 时间戳） */
  requestTime: number
  requestId: string
  /** 链路追踪ID */
  traceId: string
  /** 响应接收时间（Unix 时间戳） */
  responseTime: number
  /** 单次 HTTP 请求耗时（毫秒） */
  durationMs: number
  responseStatus: number
  responseBody: string
  errorMessage: string
}

export interface BIamWebhookDeliveryTaskDetailResponseVo {
  id: string
  /** 事件记录ID */
  eventRecordId: string
  eventCode: string
  /** 业务事件唯一标识 */
  eventKey: string
  webhookEndpointId: string
  webhookEndpointName: string
  /** 投递事件载荷快照（取自事件记录，JSON） */
  payload: Record<string, unknown> | null
  /** 事件发生时间（Unix 时间戳） */
  eventTime: number
  /** 链路追踪ID */
  traceId: string
  /** 投递任务状态（BIamWebhookDeliveryTaskStatusEnum）：PENDING / SUCCESS / FAILED / EXPIRED / CANCELED / PAUSED */
  status: string
  /** 已执行的 HTTP 请求次数 */
  attemptCount: number
  /** 最近一次投递时间（Unix 时间戳） */
  lastAttemptTime: number
  /** 投递成功时间（Unix 时间戳） */
  successTime: number
  /** 下次重试时间（Unix 时间戳），仅待投递任务有值 */
  nextRetryTime: number
  attemptList: BIamWebhookDeliveryTaskAttemptDto[]
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

export interface BIamWebhookDeliveryTaskListResponseVo {
  id: string
  /** 事件记录ID */
  eventRecordId: string
  eventCode: string
  /** 业务事件唯一标识 */
  eventKey: string
  webhookEndpointId: string
  webhookEndpointName: string
  /** 投递任务状态（BIamWebhookDeliveryTaskStatusEnum）：PENDING / SUCCESS / FAILED / EXPIRED / CANCELED / PAUSED */
  status: string
  /** 已执行的 HTTP 请求次数 */
  attemptCount: number
  /** 最近一次投递时间（Unix 时间戳） */
  lastAttemptTime: number
  /** 投递成功时间（Unix 时间戳） */
  successTime: number
  /** 下次重试时间（Unix 时间戳），仅待投递任务有值 */
  nextRetryTime: number
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

export interface BIamWebhookDeliveryTaskPageQueryRequestVo extends PageRequest {
  /** Webhook 接收端ID */
  webhookEndpointId?: string
  /** 事件编码 */
  eventCode?: string
  /** 业务事件唯一标识 */
  eventKey?: string
  /** 投递任务状态（BIamWebhookDeliveryTaskStatusEnum） */
  status?: string
  createStartTime?: number
  createEndTime?: number
}

export type BIamWebhookDeliveryTaskPageResponse = PageResponse<BIamWebhookDeliveryTaskListResponseVo>

export type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

/** 投递任务状态标签色（BIamWebhookDeliveryTaskStatusEnum） */
export const WEBHOOK_DELIVERY_TASK_STATUS_TAG_TYPE: Record<string, TagType> = {
  PENDING: 'warning',
  SUCCESS: 'success',
  FAILED: 'danger',
  EXPIRED: 'info',
  CANCELED: 'info',
  PAUSED: 'info'
}

/** 投递执行结果标签色（BIamWebhookDeliveryAttemptResultEnum） */
export const WEBHOOK_DELIVERY_ATTEMPT_RESULT_TAG_TYPE: Record<string, TagType> = {
  RUNNING: 'primary',
  SUCCESS: 'success',
  FAILED: 'danger',
  TIMEOUT: 'warning',
  SKIPPED: 'info'
}

/** 批量重新投递请求 */
export interface BIamWebhookDeliveryTaskBatchRetryRequestVo {
  /** 投递任务ID集合，单次最多200条 */
  idList: string[]
}
