import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  ScmAttributeValueCreateRequestVo,
  ScmAttributeValueUpdateRequestVo,
  ScmAttributeValueUpdateStatusRequestVo,
  ScmAttributeValueUpdateCodeRequestVo,
  ScmAttributeValueListByAttributeRequestVo,
  ScmAttributeValueListResponseVo,
  ScmAttributeValueSimpleListResponseVo
} from '@/modules/scm/category/attribute/type/ScmAttributeValue.type'

// 创建属性枚举值
const create = async (params: ScmAttributeValueCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(adminApi('admin/scm/attribute_value/create'), params)
}

// 修改属性枚举值
const update = async (params: ScmAttributeValueUpdateRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/attribute_value/update'), params)
}

// 修改属性值状态
const updateStatus = async (params: ScmAttributeValueUpdateStatusRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/attribute_value/update_status'), params)
}

// 修改属性值编码
const updateCode = async (params: ScmAttributeValueUpdateCodeRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/attribute_value/update_code'), params)
}

// 删除属性枚举值
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(adminApi('admin/scm/attribute_value/delete'), params)
}

// 根据属性ID查询属性值列表（应用于组件弹窗）
const listSimple = async (params: ScmAttributeValueListByAttributeRequestVo): Promise<ScmAttributeValueSimpleListResponseVo[]> => {
  return request.post<ScmAttributeValueSimpleListResponseVo[]>(adminApi('admin/scm/attribute_value/list_simple'), params)
}

// 根据属性ID查询属性值列表（应用于属性库管理菜单）
const listExpand = async (params: ScmAttributeValueListByAttributeRequestVo): Promise<ScmAttributeValueListResponseVo[]> => {
  return request.post<ScmAttributeValueListResponseVo[]>(adminApi('admin/scm/attribute_value/list_expand'), params)
}

export const ScmAttributeValueApi = {
  create,
  update,
  updateStatus,
  updateCode,
  destroy,
  listSimple,
  listExpand
}
