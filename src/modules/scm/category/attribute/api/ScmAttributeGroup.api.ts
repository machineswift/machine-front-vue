import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest } from '@/shared/types/Common.type'
import type { ScmBackCategoryAttributeGroupItemResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'
import type {
  ScmAttributeGroupCreateRequestVo,
  ScmAttributeGroupUpdateRequestVo,
  ScmAttributeGroupUpdateStatusRequestVo,
  ScmAttributeGroupUpdateCodeRequestVo,
  ScmAttributeGroupUpdateBackCategoryRequestVo,
  ScmAttributeGroupUpdateAttributeRequestVo,
  ScmAttributeGroupQueryListRequestVo,
  ScmAttributeGroupQueryPageRequestVo,
  ScmAttributeGroupDetailResponseVo,
  ScmAttributeGroupPageResponse,
  ScmAttributeGroupSimplePageResponse
} from '@/modules/scm/category/attribute/type/ScmAttributeGroup.type'

// 创建属性分组
const create = async (params: ScmAttributeGroupCreateRequestVo): Promise<void> => {
  return request.post<void>(adminApi('admin/scm/attribute_group/create'), params)
}

// 删除属性分组
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post<void>(adminApi('admin/scm/attribute_group/delete'), params)
}

// 修改属性分组
const update = async (params: ScmAttributeGroupUpdateRequestVo): Promise<void> => {
  return request.post<void>(adminApi('admin/scm/attribute_group/update'), params)
}

// 修改属性分组状态
const updateStatus = async (params: ScmAttributeGroupUpdateStatusRequestVo): Promise<void> => {
  return request.post<void>(adminApi('admin/scm/attribute_group/update_status'), params)
}

// 修改属性分组编码
const updateCode = async (params: ScmAttributeGroupUpdateCodeRequestVo): Promise<void> => {
  return request.post<void>(adminApi('admin/scm/attribute_group/update_code'), params)
}

// 修改属性分组关联的后台分类
const updateBackCategory = async (params: ScmAttributeGroupUpdateBackCategoryRequestVo): Promise<void> => {
  return request.post<void>(adminApi('admin/scm/attribute_group/update_back_category'), params)
}

// 修改属性分组关联的属性
const updateAttribute = async (params: ScmAttributeGroupUpdateAttributeRequestVo): Promise<void> => {
  return request.post<void>(adminApi('admin/scm/attribute_group/update_attribute'), params)
}

// 查询属性分组详情
const detail = async (params: IdRequest): Promise<ScmAttributeGroupDetailResponseVo> => {
  return request.post<ScmAttributeGroupDetailResponseVo>(adminApi('admin/scm/attribute_group/detail'), params)
}

// 查询属性分组列表（应用于组件弹窗，含分组在指定后台分类下的关联配置）
const listSimple = async (params: ScmAttributeGroupQueryListRequestVo): Promise<ScmBackCategoryAttributeGroupItemResponseVo[]> => {
  return request.post<ScmBackCategoryAttributeGroupItemResponseVo[]>(adminApi('admin/scm/attribute_group/list_simple'), params)
}

// 分页查询属性分组（应用于组件弹窗/属性分组选择器）
const pageSimple = async (params: ScmAttributeGroupQueryPageRequestVo): Promise<ScmAttributeGroupSimplePageResponse> => {
  return request.post<ScmAttributeGroupSimplePageResponse>(adminApi('admin/scm/attribute_group/page_simple'), params)
}

// 分页查询属性分组（应用于属性分组管理菜单）
const pageExpand = async (params: ScmAttributeGroupQueryPageRequestVo): Promise<ScmAttributeGroupPageResponse> => {
  return request.post<ScmAttributeGroupPageResponse>(adminApi('admin/scm/attribute_group/page_expand'), params)
}

export const ScmAttributeGroupApi = {
  create,
  destroy,
  update,
  updateStatus,
  updateCode,
  updateBackCategory,
  updateAttribute,
  detail,
  listSimple,
  pageSimple,
  pageExpand
}
