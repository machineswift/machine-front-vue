import request from '@/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
import type {
  ScmPropertyValueCreateRequestVo,
  ScmPropertyValueUpdateRequestVo,
  ScmPropertyValueListByPropertyRequestVo,
  ScmPropertyValueListResponseVo
} from '@/modules/scm/category/type/ScmPropertyValue.type'

// 创建属性枚举值
const create = async (params: ScmPropertyValueCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/scm/property_value/create', params)
}

// 修改属性枚举值
const update = async (params: ScmPropertyValueUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/property_value/update', params)
}

// 删除属性枚举值
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/property_value/delete', params)
}

// 根据属性ID查询枚举值列表
const listByPropertyId = async (params: ScmPropertyValueListByPropertyRequestVo): Promise<ScmPropertyValueListResponseVo[]> => {
  return request.post<ScmPropertyValueListResponseVo[]>(MANAGE_API_BASE_URL + 'manage/scm/property_value/list_by_property_id', params)
}

export const ScmPropertyValueApi = {
  create,
  update,
  destroy,
  listByPropertyId
}
