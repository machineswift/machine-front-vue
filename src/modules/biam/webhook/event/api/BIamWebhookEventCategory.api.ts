import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  BIamWebhookEventCategoryCreateRequestVo,
  BIamWebhookEventCategoryUpdateRequestVo,
  BIamWebhookEventCategoryUpdateParentRequestVo,
  BIamWebhookEventCategoryDetailResponseVo,
  BIamWebhookEventCategorySimpleTreeResponseVo
} from '../type/BIamWebhookEventCategory.type'

// 新增事件分类
const create = async (params: BIamWebhookEventCategoryCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(iamApi('iam/biam/webhook/event_category/create'), params)
}

// 删除事件分类
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/event_category/delete'), params)
}

// 修改事件分类
const update = async (params: BIamWebhookEventCategoryUpdateRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/event_category/update'), params)
}

// 修改事件分类父节点
const updateParent = async (params: BIamWebhookEventCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/webhook/event_category/update_parent'), params)
}

// 事件分类详情
const detail = async (params: IdRequest): Promise<BIamWebhookEventCategoryDetailResponseVo> => {
  return request.post<BIamWebhookEventCategoryDetailResponseVo>(iamApi('iam/biam/webhook/event_category/detail'), params)
}

// 事件分类树(应用于组件弹窗)
const treeSimple = async (): Promise<BIamWebhookEventCategorySimpleTreeResponseVo> => {
  return request.get<BIamWebhookEventCategorySimpleTreeResponseVo>(iamApi('iam/biam/webhook/event_category/tree_simple'))
}

export const BIamWebhookEventCategoryApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple
}
