import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  AiResourceModelCreateRequestVo,
  AiResourceModelUpdateRequestVo,
  AiResourceModelUpdateStatusRequestVo,
  AiResourceModelDetailResponseVo,
  AiResourceModelQueryPageRequestVo,
  AiResourceModelSimplePageResponse,
  AiResourceModelExpandPageResponse
} from '../type/AiResourceModel.type'

const BASE_URL = ADMIN_API_BASE_URL + 'admin/ai/resource_center/model/'

// 创建模型
const create = async (params: AiResourceModelCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(BASE_URL + 'create', params)
}

// 删除模型
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(BASE_URL + 'delete', params)
}

// 修改模型
const update = async (params: AiResourceModelUpdateRequestVo): Promise<void> => {
  return request.post(BASE_URL + 'update', params)
}

// 修改模型状态
const updateStatus = async (params: AiResourceModelUpdateStatusRequestVo): Promise<void> => {
  return request.post(BASE_URL + 'update_status', params)
}

// 模型详情
const detail = async (params: IdRequest): Promise<AiResourceModelDetailResponseVo> => {
  return request.post<AiResourceModelDetailResponseVo>(BASE_URL + 'detail', params)
}

// 分页查询(应用于组件弹窗)
const pageSimple = async (params: AiResourceModelQueryPageRequestVo): Promise<AiResourceModelSimplePageResponse> => {
  return request.post<AiResourceModelSimplePageResponse>(BASE_URL + 'page_simple', params)
}

// 分页查询(应用于管理菜单)
const pageExpand = async (params: AiResourceModelQueryPageRequestVo): Promise<AiResourceModelExpandPageResponse> => {
  return request.post<AiResourceModelExpandPageResponse>(BASE_URL + 'page_expand', params)
}

export const AiResourceModelApi = {
  create,
  destroy,
  update,
  updateStatus,
  detail,
  pageSimple,
  pageExpand
}
