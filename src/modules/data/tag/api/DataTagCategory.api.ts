import request from '@/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
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
const create = async (params: DataTagCategoryCreateRequestVo): Promise<IdResponse<string>> => {
  return request.post<IdResponse<string>>(MANAGE_API_BASE_URL + 'manage/data/tag_category/create', params)
}

// 删除智能标签分类
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag_category/delete', params)
}

// 修改智能标签分类
const update = async (params: DataTagCategoryUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag_category/update', params)
}

// 修改智能标签分类排序
const updateSort = async (params: DataTagCategoryUpdateSortRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag_category/update_sort', params)
}

// 修改智能标签分类父ID
const updateParent = async (params: DataTagCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag_category/update_parent', params)
}

// 智能标签分类详情
const detail = async (params: IdRequest): Promise<DataTagCategoryDetailResponseVo> => {
  return request.post<DataTagCategoryDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/tag_category/detail', params)
}

// 智能标签分类树(应用于组件弹窗)
const treeSimple = async (params: DataTagCategoryTreeRequestVo): Promise<DataTagCategoryTreeSimpleOutputDto> => {
  return request.post<DataTagCategoryTreeSimpleOutputDto>(MANAGE_API_BASE_URL + 'manage/data/tag_category/tree_simple', params)
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
