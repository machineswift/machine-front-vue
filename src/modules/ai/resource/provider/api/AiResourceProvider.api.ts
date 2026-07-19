import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  AiResourceProviderCreateRequestVo,
  AiResourceProviderUpdateRequestVo,
  AiResourceProviderUpdateStatusRequestVo,
  AiResourceProviderDetailResponseVo,
  AiResourceProviderExpandListResponseVo,
  AiResourceProviderListRequestVo,
  AiResourceProviderListResponseVo
} from '../type/AiResourceProvider.type'

const BASE_URL = ADMIN_API_BASE_URL + 'admin/ai/resource_center/provider/'

// 创建厂商
const create = async (params: AiResourceProviderCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(BASE_URL + 'create', params)
}

// 删除厂商
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(BASE_URL + 'delete', params)
}

// 修改厂商
const update = async (params: AiResourceProviderUpdateRequestVo): Promise<void> => {
  return request.post(BASE_URL + 'update', params)
}

// 修改厂商状态
const updateStatus = async (params: AiResourceProviderUpdateStatusRequestVo): Promise<void> => {
  return request.post(BASE_URL + 'update_status', params)
}

// 厂商详情
const detail = async (params: IdRequest): Promise<AiResourceProviderDetailResponseVo> => {
  return request.post<AiResourceProviderDetailResponseVo>(BASE_URL + 'detail', params)
}

// 厂商列表（扩展，包含用户姓名）
const list = async (params?: AiResourceProviderListRequestVo): Promise<AiResourceProviderExpandListResponseVo[]> => {
  return request.post<AiResourceProviderExpandListResponseVo[]>(BASE_URL + 'list_expand', params ?? {})
}

// 厂商简单列表（用于组件弹窗/下拉选择）
const listSimple = async (params?: AiResourceProviderListRequestVo): Promise<AiResourceProviderListResponseVo[]> => {
  return request.post<AiResourceProviderListResponseVo[]>(BASE_URL + 'list_simple', params ?? {})
}

export const AiResourceProviderApi = {
  create,
  destroy,
  update,
  updateStatus,
  detail,
  list,
  listSimple
}
