import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  ScmPropertyValueCreateRequestVo,
  ScmPropertyValueUpdateRequestVo,
  ScmPropertyValueListByPropertyRequestVo,
  ScmPropertyValueListResponseVo
} from '@/modules/scm/category/type/ScmPropertyValue.type'

// 创建属性枚举值
const create = async (params: ScmPropertyValueCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(ADMIN_API_BASE_URL + 'admin/scm/property_value/create', params)
}

// 修改属性枚举值
const update = async (params: ScmPropertyValueUpdateRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/scm/property_value/update', params)
}

// 删除属性枚举值
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/scm/property_value/delete', params)
}

// 根据属性ID查询枚举值列表
const listByPropertyId = async (params: ScmPropertyValueListByPropertyRequestVo): Promise<ScmPropertyValueListResponseVo[]> => {
  return request.post<ScmPropertyValueListResponseVo[]>(ADMIN_API_BASE_URL + 'admin/scm/property_value/list_by_property_id', params)
}

export const ScmPropertyValueApi = {
  create,
  update,
  destroy,
  listByPropertyId
}
