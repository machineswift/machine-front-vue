import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  ScmBackCategoryCreateRequestVo,
  ScmBackCategoryUpdateRequestVo,
  ScmBackCategoryUpdateParentRequestVo,
  ScmBackCategoryUpdateAttributeGroupRequestVo,
  ScmBackCategoryDetailResponseVo,
  ScmBackCategoryTreeSimpleResponseVo,
  ScmBackCategoryTreeExpandResponseVo,
  ScmBackCategoryUpdateAttributeRequestVo
} from '@/modules/scm/category/category/type/ScmBackCategory.type'

// 创建后台分类
const create = async (params: ScmBackCategoryCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(adminApi('admin/scm/back_category/create'), params)
}

// 删除后台分类
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(adminApi('admin/scm/back_category/delete'), params)
}

// 修改后台分类
const update = async (params: ScmBackCategoryUpdateRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/back_category/update'), params)
}

// 修改父分类ID
const updateParent = async (params: ScmBackCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/back_category/update_parent'), params)
}

// 修改后台分类关联的属性分组（全量替换）
const updateAttributeGroup = async (params: ScmBackCategoryUpdateAttributeGroupRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/back_category/update_attribute_group'), params)
}

// 修改后台分类关联的属性（全量替换）
const updateAttribute = async (params: ScmBackCategoryUpdateAttributeRequestVo): Promise<void> => {
  return request.post(adminApi('admin/scm/back_category/update_attribute'), params)
}

// 查询后台分类详情
const detail = async (params: IdRequest): Promise<ScmBackCategoryDetailResponseVo> => {
  return request.post<ScmBackCategoryDetailResponseVo>(adminApi('admin/scm/back_category/detail'), params)
}

// 后台分类树(应用于组件弹窗)
const treeSimple = async (): Promise<ScmBackCategoryTreeSimpleResponseVo> => {
  return request.post<ScmBackCategoryTreeSimpleResponseVo>(adminApi('admin/scm/back_category/tree_simple'))
}

// 后台分类树(应用于管理列表)
const treeExpand = async (): Promise<ScmBackCategoryTreeExpandResponseVo> => {
  return request.post<ScmBackCategoryTreeExpandResponseVo>(adminApi('admin/scm/back_category/tree_expand'))
}

export const ScmBackCategoryApi = {
  create,
  destroy,
  update,
  updateParent,
  updateAttributeGroup,
  updateAttribute,
  detail,
  treeSimple,
  treeExpand
}
