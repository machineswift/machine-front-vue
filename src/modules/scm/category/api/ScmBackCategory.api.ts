import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  ScmBackCategoryCreateRequestVo,
  ScmBackCategoryUpdateRequestVo,
  ScmBackCategoryUpdateParentRequestVo,
  ScmBackCategoryDetailResponseVo,
  ScmBackCategoryTreeSimpleResponseVo,
  ScmBackCategoryTreeExpandResponseVo
} from '@/modules/scm/category/type/ScmBackCategory.type'

// 创建后台分类
const create = async (params: ScmBackCategoryCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(ADMIN_API_BASE_URL + 'admin/scm/back_category/create', params)
}

// 删除后台分类
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/scm/back_category/delete', params)
}

// 修改后台分类
const update = async (params: ScmBackCategoryUpdateRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/scm/back_category/update', params)
}

// 修改父分类ID
const updateParent = async (params: ScmBackCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/scm/back_category/update_parent', params)
}

// 查询后台分类详情
const detail = async (params: IdRequest): Promise<ScmBackCategoryDetailResponseVo> => {
  return request.post<ScmBackCategoryDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/scm/back_category/detail', params)
}

// 后台分类树(应用于组件弹窗)
const treeSimple = async (): Promise<ScmBackCategoryTreeSimpleResponseVo> => {
  return request.post<ScmBackCategoryTreeSimpleResponseVo>(ADMIN_API_BASE_URL + 'admin/scm/back_category/tree_simple')
}

// 后台分类树(应用于管理列表)
const treeExpand = async (): Promise<ScmBackCategoryTreeExpandResponseVo> => {
  return request.post<ScmBackCategoryTreeExpandResponseVo>(ADMIN_API_BASE_URL + 'admin/scm/back_category/tree_expand')
}

export const ScmBackCategoryApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple,
  treeExpand
}
