import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  DataBrandCreateRequestVo,
  DataBrandUpdateRequestVo,
  DataBrandUpdateStatusRequestVo,
  DataBrandUpdateParentRequestVo,
  DataBrandDetailResponseVo,
  DataBrandQueryPageRequestVo,
  DataBrandQueryPageSimpleRequestVo,
  DataBrandQueryChildrenRequestVo,
  DataBrandSimplePageResponse,
  DataBrandExpandPageResponse
} from '@/modules/data/brand/type/DataBrand.type'

// 创建
const create = async (params: DataBrandCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(ADMIN_API_BASE_URL + 'admin/data/brand/create', params)
}

// 删除
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/brand/delete', params)
}

// 修改
const update = async (params: DataBrandUpdateRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/brand/update', params)
}

// 修改状态
const updateStatus = async (params: DataBrandUpdateStatusRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/brand/update_status', params)
}

// 修改父品牌
const updateParent = async (params: DataBrandUpdateParentRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/brand/update_parent', params)
}

// 详情
const detail = async (params: IdRequest): Promise<DataBrandDetailResponseVo> => {
  return request.post<DataBrandDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/data/brand/detail', params)
}

// 分页查询(应用于组件弹窗，扁平列表：parentId 限定某一级、keyword 模糊名称/编码)
const pageSimple = async (params: DataBrandQueryPageSimpleRequestVo): Promise<DataBrandSimplePageResponse> => {
  return request.post<DataBrandSimplePageResponse>(ADMIN_API_BASE_URL + 'admin/data/brand/page_simple', params)
}

// 分页查询(应用于管理菜单)
const pageExpand = async (params: DataBrandQueryPageRequestVo): Promise<DataBrandExpandPageResponse> => {
  return request.post<DataBrandExpandPageResponse>(ADMIN_API_BASE_URL + 'admin/data/brand/page_expand', params)
}

// 查询子品牌(应用于组件弹窗，扁平列表、sort 倒序)
const childrenSimple = async (params: DataBrandQueryChildrenRequestVo): Promise<DataBrandSimplePageResponse> => {
  return request.post<DataBrandSimplePageResponse>(ADMIN_API_BASE_URL + 'admin/data/brand/children_simple', params)
}

// 查询子品牌(应用于管理菜单，扁平列表、sort 倒序)
const childrenExpand = async (params: DataBrandQueryChildrenRequestVo): Promise<DataBrandExpandPageResponse> => {
  return request.post<DataBrandExpandPageResponse>(ADMIN_API_BASE_URL + 'admin/data/brand/children_expand', params)
}

export const DataBrandApi = {
  create,
  destroy,
  update,
  updateStatus,
  updateParent,
  detail,
  pageSimple,
  pageExpand,
  childrenSimple,
  childrenExpand
}
