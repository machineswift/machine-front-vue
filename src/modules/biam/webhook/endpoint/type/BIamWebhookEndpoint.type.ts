import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

/**
 * Webhook 重试策略：各次重试的等待间隔（秒），固定为系统策略，不可修改。
 * 5秒 → 5分钟 → 30分钟 → 2小时 → 4小时 → 8小时 → 12小时 → 24小时（最后一次）
 */
export const WEBHOOK_RETRY_INTERVALS: number[] = [5, 300, 1800, 7200, 14400, 28800, 43200, 86400]

/** 格式化单个重试间隔，如 5秒 / 30分钟 / 24小时 */
export const formatRetryInterval = (seconds: number): string => {
  if (seconds === 0) return '立即'
  if (seconds % 3600 === 0) return `${seconds / 3600}小时`
  if (seconds % 60 === 0) return `${seconds / 60}分钟`
  return `${seconds}秒`
}

export interface BIamWebhookEndpointCreateRequestVo {
  name: string
  clientId: string
  endpointUrl: string
  endpointSecret: string
  retryPolicy?: number[] | null
  description?: string
}

export interface BIamWebhookEndpointUpdateRequestVo {
  id: string
  name: string
  clientId: string
  endpointUrl: string
  endpointSecret?: string
  retryPolicy?: number[] | null
  description?: string
}

export interface BIamWebhookEndpointUpdateStatusRequestVo {
  id: string
  status: string
}

export interface BIamWebhookEndpointUpdatePauseRequestVo {
  id: string
  pauseFlag: boolean
}

export interface BIamWebhookEndpointEventSubscriptionDto {
  eventId: string
  action: string
}

export interface BIamWebhookEndpointEventSubscriptionResponseVo extends BIamWebhookEndpointEventSubscriptionDto {
  code: string
  name: string
}

export interface BIamWebhookEndpointUpdateSubscriptionRequestVo {
  id: string
  eventSubscriptions: BIamWebhookEndpointEventSubscriptionDto[]
  categoryIdSet: string[]
}

export interface BIamWebhookEndpointDetailResponseVo {
  id: string
  code: string
  name: string
  status: string
  pauseFlag: boolean
  clientId: string
  endpointUrl: string
  retryPolicy: number[] | null
  description?: string
  categoryIdSet: string[]
  eventSubscriptions: BIamWebhookEndpointEventSubscriptionResponseVo[]
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

export interface BIamWebhookEndpointListResponseVo {
  id: string
  code: string
  name: string
  status: string
  pauseFlag: boolean
  clientId: string
  clientName: string
  /** Webhook 接收地址 */
  endpointUrl: string
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

export interface BIamWebhookEndpointPageQueryRequestVo extends PageRequest {
  code?: string
  name?: string
  status?: string
  pauseFlag?: boolean
  clientId?: string
  createStartTime?: number
  createEndTime?: number
}

export type BIamWebhookEndpointPageResponse = PageResponse<BIamWebhookEndpointListResponseVo>

export interface BIamWebhookEndpointClientOption {
  clientId: string
  clientName: string
}
