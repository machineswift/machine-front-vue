import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import type {
  DataBrandCreateRequestVo,
  DataBrandUpdateRequestVo,
  DataBrandUpdateStatusRequestVo,
  DataBrandDetailResponseVo,
  DataBrandQueryPageRequestVo,
  DataBrandSimplePageResponse,
  DataBrandExpandPageResponse
} from '@/modules/data/brand/type/DataBrand.type'

// 创建
const create = async (params: DataBrandCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/brand/create', params)
}

// 删除
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/brand/delete', params)
}

// 修改
const update = async (params: DataBrandUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/brand/update', params)
}

// 修改状态
const updateStatus = async (params: DataBrandUpdateStatusRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/brand/update_status', params)
}

// 详情
const detail = async (params: IdRequest): Promise<DataBrandDetailResponseVo> => {
  return request.post<DataBrandDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/brand/detail', params)
}

// 分页查询(应用于组件弹窗)
const pageSimple = async (params: DataBrandQueryPageRequestVo): Promise<DataBrandSimplePageResponse> => {
  return request.post<DataBrandSimplePageResponse>(MANAGE_API_BASE_URL + 'manage/data/brand/page_simple', params)
}

// 分页查询(应用于角色管理菜单)
const pageExpand = async (params: DataBrandQueryPageRequestVo): Promise<DataBrandExpandPageResponse> => {
  return request.post<DataBrandExpandPageResponse>(MANAGE_API_BASE_URL + 'manage/data/brand/page_expand', params)
}

export const DataBrandApi = {
  create,
  destroy,
  update,
  updateStatus,
  detail,
  pageSimple,
  pageExpand
}
