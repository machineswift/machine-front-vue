import request from '@/shared/utils/Request.util'
import { IAM_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  IamAuth2RegisteredClientCreateRequestVo,
  IamAuth2RegisteredClientUpdateRequestVo,
  IamAuth2RegisteredClientUpdateStatusRequestVo,
  IamAuth2RegisteredClientPageQueryRequestVo,
  IamAuth2RegisteredClientDetailResponseVo,
  IamAuth2RegisteredClientPageResponse
} from '../type/IamAuth2RegisteredClient.type'

// 创建客户端
const create = async (params: IamAuth2RegisteredClientCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(IAM_API_BASE_URL + 'iam/identity_center/auth2_registered_client/create', params)
}

// 修改客户端
const update = async (params: IamAuth2RegisteredClientUpdateRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/identity_center/auth2_registered_client/update', params)
}

// 修改客户端状态
const updateStatus = async (params: IamAuth2RegisteredClientUpdateStatusRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/identity_center/auth2_registered_client/update_status', params)
}

// 删除客户端
const deleteClient = async (params: IdRequest): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/identity_center/auth2_registered_client/delete', params)
}

// 客户端详情
const detail = async (params: IdRequest): Promise<IamAuth2RegisteredClientDetailResponseVo> => {
  return request.post<IamAuth2RegisteredClientDetailResponseVo>(IAM_API_BASE_URL + 'iam/identity_center/auth2_registered_client/detail', params)
}

// 分页查询
const pageExpand = async (params: IamAuth2RegisteredClientPageQueryRequestVo): Promise<IamAuth2RegisteredClientPageResponse> => {
  return request.post<IamAuth2RegisteredClientPageResponse>(IAM_API_BASE_URL + 'iam/identity_center/auth2_registered_client/page_expand', params)
}

export const IamAuth2RegisteredClientApi = {
  create,
  update,
  updateStatus,
  deleteClient,
  detail,
  pageExpand
}
