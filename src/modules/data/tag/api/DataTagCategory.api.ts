import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  DataTagCategoryCreateRequestVo,
  DataTagCategoryUpdateRequestVo,
  DataTagCategoryUpdateSortRequestVo,
  DataTagCategoryUpdateParentRequestVo,
  DataTagCategoryDetailResponseVo,
  DataTagCategoryTreeRequestVo,
  DataTagCategoryTreeSimpleOutputDto
} from '../type/DataTagCategory.type'

// 创建智能标签分类
const create = async (params: DataTagCategoryCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(adminApi('admin/data/tag_category/create'), params)
}

// 删除智能标签分类
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(adminApi('admin/data/tag_category/delete'), params)
}

// 修改智能标签分类
const update = async (params: DataTagCategoryUpdateRequestVo): Promise<void> => {
  return request.post(adminApi('admin/data/tag_category/update'), params)
}

// 修改智能标签分类排序
const updateSort = async (params: DataTagCategoryUpdateSortRequestVo): Promise<void> => {
  return request.post(adminApi('admin/data/tag_category/update_sort'), params)
}

// 修改智能标签分类父ID
const updateParent = async (params: DataTagCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(adminApi('admin/data/tag_category/update_parent'), params)
}

// 智能标签分类详情
const detail = async (params: IdRequest): Promise<DataTagCategoryDetailResponseVo> => {
  return request.post<DataTagCategoryDetailResponseVo>(adminApi('admin/data/tag_category/detail'), params)
}

// 智能标签分类树(应用于组件弹窗)
const treeSimple = async (params: DataTagCategoryTreeRequestVo): Promise<DataTagCategoryTreeSimpleOutputDto> => {
  return request.post<DataTagCategoryTreeSimpleOutputDto>(adminApi('admin/data/tag_category/tree_simple'), params)
}

export const DataTagCategoryApi = {
  create,
  destroy,
  update,
  updateSort,
  updateParent,
  detail,
  treeSimple
}
