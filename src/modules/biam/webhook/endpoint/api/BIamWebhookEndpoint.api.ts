import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  BIamWebhookEndpointCreateRequestVo,
  BIamWebhookEndpointUpdateRequestVo,
  BIamWebhookEndpointUpdateStatusRequestVo,
  BIamWebhookEndpointUpdatePauseRequestVo,
  BIamWebhookEndpointUpdateSubscriptionRequestVo,
  BIamWebhookEndpointDetailResponseVo,
  BIamWebhookEndpointPageQueryRequestVo,
  BIamWebhookEndpointPageResponse
} from '../type/BIamWebhookEndpoint.type'

// 新增接收端
const create = async (params: BIamWebhookEndpointCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(iamApi('iam/biam/webhook/endpoint/create'), params)
}

// 删除接收端
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/endpoint/delete'), params)
}

// 修改接收端
const update = async (params: BIamWebhookEndpointUpdateRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/endpoint/update'), params)
}

// 修改接收端状态
const updateStatus = async (params: BIamWebhookEndpointUpdateStatusRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/endpoint/update_status'), params)
}

// 暂停/恢复接收端投递
const updatePause = async (params: BIamWebhookEndpointUpdatePauseRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/endpoint/update_pause'), params)
}

// 修改接收端订阅关系
const updateSubscription = async (params: BIamWebhookEndpointUpdateSubscriptionRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/endpoint/update_subscription'), params)
}

// 接收端详情
const detail = async (params: IdRequest): Promise<BIamWebhookEndpointDetailResponseVo> => {
  return request.post<BIamWebhookEndpointDetailResponseVo>(iamApi('iam/biam/webhook/endpoint/detail'), params)
}

// 分页查询接收端
const pageExpand = async (params: BIamWebhookEndpointPageQueryRequestVo): Promise<BIamWebhookEndpointPageResponse> => {
  return request.post<BIamWebhookEndpointPageResponse>(iamApi('iam/biam/webhook/endpoint/page_expand'), params)
}

export const BIamWebhookEndpointApi = {
  create,
  destroy,
  update,
  updateStatus,
  updatePause,
  updateSubscription,
  detail,
  pageExpand
}
