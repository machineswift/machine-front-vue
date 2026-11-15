import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  BIamAuth2RegisteredClientCreateRequestVo,
  BIamAuth2RegisteredClientUpdateRequestVo,
  BIamAuth2RegisteredClientUpdateStatusRequestVo,
  BIamAuth2RegisteredClientPageQueryRequestVo,
  BIamAuth2RegisteredClientDetailResponseVo,
  BIamAuth2RegisteredClientPageResponse
} from '../type/BIamAuth2RegisteredClient.type'

// 创建客户端
const create = async (params: BIamAuth2RegisteredClientCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(iamApi('iam/biam/identity_center/auth2_registered_client/create'), params)
}

// 修改客户端
const update = async (params: BIamAuth2RegisteredClientUpdateRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/identity_center/auth2_registered_client/update'), params)
}

// 修改客户端状态
const updateStatus = async (params: BIamAuth2RegisteredClientUpdateStatusRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/identity_center/auth2_registered_client/update_status'), params)
}

// 删除客户端
const deleteClient = async (params: IdRequest): Promise<void> => {
  return request.post(iamApi('iam/biam/identity_center/auth2_registered_client/delete'), params)
}

// 客户端详情
const detail = async (params: IdRequest): Promise<BIamAuth2RegisteredClientDetailResponseVo> => {
  return request.post<BIamAuth2RegisteredClientDetailResponseVo>(iamApi('iam/biam/identity_center/auth2_registered_client/detail'), params)
}

// 分页查询
const pageExpand = async (params: BIamAuth2RegisteredClientPageQueryRequestVo): Promise<BIamAuth2RegisteredClientPageResponse> => {
  return request.post<BIamAuth2RegisteredClientPageResponse>(iamApi('iam/biam/identity_center/auth2_registered_client/page_expand'), params)
}

// 清理缓存
const cleanCache = async (): Promise<void> => {
  return request.get(iamApi('iam/biam/identity_center/auth2_registered_client/clean_cache'))
}

export const BIamAuth2RegisteredClientApi = {
  create,
  update,
  updateStatus,
  deleteClient,
  detail,
  pageExpand,
  cleanCache
}
