import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest } from '@/shared/types/Common.type'
import type {
  BIamWebhookDeliveryTaskBatchRetryRequestVo,
  BIamWebhookDeliveryTaskDetailResponseVo,
  BIamWebhookDeliveryTaskPageQueryRequestVo,
  BIamWebhookDeliveryTaskPageResponse
} from '../type/BIamWebhookDeliveryTask.type'

// 投递任务详情
const detail = async (params: IdRequest): Promise<BIamWebhookDeliveryTaskDetailResponseVo> => {
  return request.post<BIamWebhookDeliveryTaskDetailResponseVo>(iamApi('iam/biam/webhook/delivery_task/detail'), params)
}

// 分页查询投递任务
const pageExpand = async (params: BIamWebhookDeliveryTaskPageQueryRequestVo): Promise<BIamWebhookDeliveryTaskPageResponse> => {
  return request.post<BIamWebhookDeliveryTaskPageResponse>(iamApi('iam/biam/webhook/delivery_task/page_expand'), params)
}

// 任务重新投递（失败/过期/暂停重置为待投递；待投递立即投递）
const retry = async (params: IdRequest): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/delivery_task/retry'), params)
}

// 批量重新投递，返回成功提交条数
const batchRetry = async (params: BIamWebhookDeliveryTaskBatchRetryRequestVo): Promise<number> => {
  return request.post<number>(iamApi('iam/biam/webhook/delivery_task/batch_retry'), params)
}

// 取消任务（仅待投递任务）
const cancel = async (params: IdRequest): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/delivery_task/cancel'), params)
}

export const BIamWebhookDeliveryTaskApi = {
  detail,
  pageExpand,
  retry,
  batchRetry,
  cancel
}
