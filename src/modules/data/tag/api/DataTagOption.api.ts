import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  DataTagOptionCreateRequestVo,
  DataTagOptionUpdateRequestVo,
  DataTagOptionUpdateCodeRequestVo,
  DataTagOptionUpdateStatusRequestVo,
  DataTagOptionUpdateSortRequestVo,
  DataTagOptionDetailResponseVo,
  DataTagOptionQueryListRequestVo,
  DataTagOptionSimpleListResponseVo,
  DataTagOptionExpandListResponseVo
} from '../type/DataTagOption.type'

// 创建智能标签选项
const create = async (params: DataTagOptionCreateRequestVo): Promise<IdResponse<string>> => {
  return request.post<IdResponse<string>>(ADMIN_API_BASE_URL + 'admin/data/tag_option/create', params)
}

// 删除智能标签选项
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/tag_option/delete', params)
}

// 修改智能标签选项
const update = async (params: DataTagOptionUpdateRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/tag_option/update', params)
}

// 修改智能标签选项编码
const updateCode = async (params: DataTagOptionUpdateCodeRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/tag_option/update_code', params)
}

// 修改智能标签选项状态
const updateStatus = async (params: DataTagOptionUpdateStatusRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/tag_option/update_status', params)
}

// 修改智能标签选项排序
const updateSort = async (params: DataTagOptionUpdateSortRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/tag_option/update_sort', params)
}

// 智能标签选项详情
const detail = async (params: IdRequest): Promise<DataTagOptionDetailResponseVo> => {
  return request.post<DataTagOptionDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/data/tag_option/detail', params)
}

// 查询智能标签选项(应用于组件弹窗)
const listSimple = async (params: DataTagOptionQueryListRequestVo): Promise<DataTagOptionSimpleListResponseVo[]> => {
  return request.post<DataTagOptionSimpleListResponseVo[]>(ADMIN_API_BASE_URL + 'admin/data/tag_option/list_simple', params)
}

// 查询智能标签选项(应用于管理菜单)
const listExpand = async (params: DataTagOptionQueryListRequestVo): Promise<DataTagOptionExpandListResponseVo[]> => {
  return request.post<DataTagOptionExpandListResponseVo[]>(ADMIN_API_BASE_URL + 'admin/data/tag_option/list_expand', params)
}

export const DataTagOptionApi = {
  create,
  destroy,
  update,
  updateCode,
  updateStatus,
  updateSort,
  detail,
  listSimple,
  listExpand
}
