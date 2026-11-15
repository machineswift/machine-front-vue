import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  BIamWebhookEventCreateRequestVo,
  BIamWebhookEventUpdateRequestVo,
  BIamWebhookEventUpdateStatusRequestVo,
  BIamWebhookEventDetailResponseVo,
  BIamWebhookEventPageQueryRequestVo,
  BIamWebhookEventPageResponse
} from '../type/BIamWebhookEvent.type'

// 新增事件
const create = async (params: BIamWebhookEventCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(iamApi('iam/biam/webhook/event/create'), params)
}

// 删除事件
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/event/delete'), params)
}

// 修改事件
const update = async (params: BIamWebhookEventUpdateRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/event/update'), params)
}

// 修改事件状态
const updateStatus = async (params: BIamWebhookEventUpdateStatusRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/event/update_status'), params)
}

// 事件详情
const detail = async (params: IdRequest): Promise<BIamWebhookEventDetailResponseVo> => {
  return request.post<BIamWebhookEventDetailResponseVo>(iamApi('iam/biam/webhook/event/detail'), params)
}

// 分页查询事件
const pageExpand = async (params: BIamWebhookEventPageQueryRequestVo): Promise<BIamWebhookEventPageResponse> => {
  return request.post<BIamWebhookEventPageResponse>(iamApi('iam/biam/webhook/event/page_expand'), params)
}

export const BIamWebhookEventApi = {
  create,
  destroy,
  update,
  updateStatus,
  detail,
  pageExpand
}
