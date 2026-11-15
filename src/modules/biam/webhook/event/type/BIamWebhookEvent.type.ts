import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

export interface BIamWebhookEventCreateRequestVo {
  categoryId: string
  /** 事件编码，与平台事件编码保持一致（如 IAM_USER_CREATE） */
  code: string
  name: string
  /** 事件载荷结构定义（JSON） */
  payloadSchema?: Record<string, unknown> | null
  sort?: number
  description?: string
}

export interface BIamWebhookEventUpdateRequestVo {
  id: string
  categoryId: string
  /** 事件编码，与平台事件编码保持一致（如 IAM_USER_CREATE） */
  code: string
  name: string
  /** 事件载荷结构定义（JSON） */
  payloadSchema?: Record<string, unknown> | null
  sort?: number
  description?: string
}

export interface BIamWebhookEventUpdateStatusRequestVo {
  id: string
  /** 状态（StatusEnum）：ENABLE / DISABLE */
  status: string
}

export interface BIamWebhookEventDetailResponseVo {
  id: string
  categoryId: string
  code: string
  name: string
  /** 状态（StatusEnum）：ENABLE / DISABLE */
  status: string
  /** 事件载荷结构定义（JSON） */
  payloadSchema: Record<string, unknown> | null
  sort: number
  description?: string
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

export interface BIamWebhookEventListResponseVo {
  id: string
  categoryId: string
  code: string
  name: string
  /** 状态（StatusEnum）：ENABLE / DISABLE */
  status: string
  sort: number
  description?: string
  /** 显式订阅该事件的接收端数量 */
  subscriberCount: number
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

export interface BIamWebhookEventPageQueryRequestVo extends PageRequest {
  /** 事件分类ID集合（多选，精确匹配） */
  categoryIdSet?: string[]
  /** 事件编码（模糊查询） */
  code?: string
  /** 事件名称（模糊查询） */
  name?: string
  /** 状态（StatusEnum）：ENABLE / DISABLE */
  status?: string
  createStartTime?: number
  createEndTime?: number
}

export type BIamWebhookEventPageResponse = PageResponse<BIamWebhookEventListResponseVo>
