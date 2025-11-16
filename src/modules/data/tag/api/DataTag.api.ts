import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import type {
  DataTagCreateRequestVo,
  DataTagUpdateRequestVo,
  DataTagUpdateCodeRequestVo,
  DataTagUpdateStatusRequestVo,
  DataTagUpdateSortRequestVo,
  DataTagUpdateCategoryRequestVo,
  DataTagDetailResponseVo,
  DataTagQueryPageRequestVo,
  DataTagSimplePageResponse,
  DataTagExpandPageResponse
} from '../type/DataTag.type'

// 创建智能标签
const create = async (params: DataTagCreateRequestVo): Promise<IdResponse<string>> => {
  return request.post<IdResponse<string>>(MANAGE_API_BASE_URL + 'manage/data/tag/create', params)
}

// 删除智能标签
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag/delete', params)
}

// 修改智能标签
const update = async (params: DataTagUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag/update', params)
}

// 修改智能标签编码
const updateCode = async (params: DataTagUpdateCodeRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag/update_code', params)
}

// 修改智能标签状态
const updateStatus = async (params: DataTagUpdateStatusRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag/update_status', params)
}

// 修改智能标签排序
const updateSort = async (params: DataTagUpdateSortRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag/update_sort', params)
}

// 修改智能标签关联分类
const updateCategory = async (params: DataTagUpdateCategoryRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/tag/update_category', params)
}

// 智能标签详情
const detail = async (params: IdRequest): Promise<DataTagDetailResponseVo> => {
  return request.post<DataTagDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/tag/detail', params)
}

// 分页查询智能标签(应用于组件弹窗)
const pageSimple = async (params: DataTagQueryPageRequestVo): Promise<DataTagSimplePageResponse> => {
  return request.post<DataTagSimplePageResponse>(MANAGE_API_BASE_URL + 'manage/data/tag/page_simple', params)
}

// 分页查询智能标签(应用于管理菜单)
const pageExpand = async (params: DataTagQueryPageRequestVo): Promise<DataTagExpandPageResponse> => {
  return request.post<DataTagExpandPageResponse>(MANAGE_API_BASE_URL + 'manage/data/tag/page_expand', params)
}

export const DataTagApi = {
  create,
  destroy,
  update,
  updateCode,
  updateStatus,
  updateSort,
  updateCategory,
  detail,
  pageSimple,
  pageExpand
}
