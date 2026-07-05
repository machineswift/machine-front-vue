import request from '@/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
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
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/scm/back_category/create', params)
}

// 删除后台分类
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/back_category/delete', params)
}

// 修改后台分类
const update = async (params: ScmBackCategoryUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/back_category/update', params)
}

// 修改父分类ID
const updateParent = async (params: ScmBackCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/back_category/update_parent', params)
}

// 查询后台分类详情
const detail = async (params: IdRequest): Promise<ScmBackCategoryDetailResponseVo> => {
  return request.post<ScmBackCategoryDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/scm/back_category/detail', params)
}

// 后台分类树(应用于组件弹窗)
const treeSimple = async (): Promise<ScmBackCategoryTreeSimpleResponseVo> => {
  return request.post<ScmBackCategoryTreeSimpleResponseVo>(MANAGE_API_BASE_URL + 'manage/scm/back_category/tree_simple')
}

// 后台分类树(应用于管理列表)
const treeExpand = async (): Promise<ScmBackCategoryTreeExpandResponseVo> => {
  return request.post<ScmBackCategoryTreeExpandResponseVo>(MANAGE_API_BASE_URL + 'manage/scm/back_category/tree_expand')
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
