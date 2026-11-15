import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse, PageResponse } from '@/shared/types/Common.type'
import type {
  ScmAttributeCreateRequestVo,
  ScmAttributeUpdateRequestVo,
  ScmAttributeUpdateCodeRequestVo,
  ScmAttributeUpdateAttributeGroupRequestVo,
  ScmAttributeUpdateBackCategoryRequestVo,
  ScmAttributeQueryPageRequestVo,
  ScmAttributeDetailResponseVo,
  ScmAttributeSimpleListResponseVo,
  ScmAttributeListResponseVo
} from '@/modules/scm/category/attribute/type/ScmAttribute.type'

// 创建属性
const create = async (params: ScmAttributeCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(adminApi('admin/scm/attribute/create'), params)
}

// 修改属性
const update = async (params: ScmAttributeUpdateRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/attribute/update'), params)
}

// 修改属性编码
const updateCode = async (params: ScmAttributeUpdateCodeRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/attribute/update_code'), params)
}

// 修改属性关联的属性分组
const updateAttributeGroup = async (params: ScmAttributeUpdateAttributeGroupRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/attribute/update_attribute_group'), params)
}

// 修改属性关联的后台分类
const updateBackCategory = async (params: ScmAttributeUpdateBackCategoryRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/attribute/update_back_category'), params)
}

// 删除属性
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(adminApi('admin/scm/attribute/delete'), params)
}

// 查询属性详情
const detail = async (params: IdRequest): Promise<ScmAttributeDetailResponseVo> => {
  return request.post<ScmAttributeDetailResponseVo>(adminApi('admin/scm/attribute/detail'), params)
}

// 分页查询属性（应用于组件弹窗/属性选择器）
const pageSimple = async (params: ScmAttributeQueryPageRequestVo): Promise<PageResponse<ScmAttributeSimpleListResponseVo>> => {
  return request.post<PageResponse<ScmAttributeSimpleListResponseVo>>(adminApi('admin/scm/attribute/page_simple'), params)
}

// 分页查询属性（应用于属性库管理菜单）
const pageExpand = async (params: ScmAttributeQueryPageRequestVo): Promise<PageResponse<ScmAttributeListResponseVo>> => {
  return request.post<PageResponse<ScmAttributeListResponseVo>>(adminApi('admin/scm/attribute/page_expand'), params)
}

export const ScmAttributeApi = {
  create,
  update,
  updateCode,
  updateAttributeGroup,
  updateBackCategory,
  destroy,
  detail,
  pageSimple,
  pageExpand
}
