import request from '@/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
import type {
  ScmFrontCategoryCreateRequestVo,
  ScmFrontCategoryUpdateRequestVo,
  ScmFrontCategoryUpdateParentRequestVo,
  ScmFrontCategoryDetailResponseVo,
  ScmFrontCategoryTreeSimpleResponseVo,
  ScmFrontCategoryTreeExpandResponseVo
} from '@/modules/scm/category/type/ScmFrontCategory.type'

// 创建前台分类
const create = async (params: ScmFrontCategoryCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/scm/front_category/create', params)
}

// 删除前台分类
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/front_category/delete', params)
}

// 修改前台分类
const update = async (params: ScmFrontCategoryUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/front_category/update', params)
}

// 修改父分类ID
const updateParent = async (params: ScmFrontCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/front_category/update_parent', params)
}

// 查询前台分类详情
const detail = async (params: IdRequest): Promise<ScmFrontCategoryDetailResponseVo> => {
  return request.post<ScmFrontCategoryDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/scm/front_category/detail', params)
}

// 前台分类树(应用于组件弹窗)
const treeSimple = async (): Promise<ScmFrontCategoryTreeSimpleResponseVo> => {
  return request.post<ScmFrontCategoryTreeSimpleResponseVo>(MANAGE_API_BASE_URL + 'manage/scm/front_category/tree_simple')
}

// 前台分类树(应用于管理列表)
const treeExpand = async (): Promise<ScmFrontCategoryTreeExpandResponseVo> => {
  return request.post<ScmFrontCategoryTreeExpandResponseVo>(MANAGE_API_BASE_URL + 'manage/scm/front_category/tree_expand')
}

export const ScmFrontCategoryApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple,
  treeExpand
}
