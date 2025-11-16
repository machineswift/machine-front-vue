import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import type {
  CrmCustomerCreateRequestVo,
  CrmCustomerUpdateRequestVo,
  CrmCustomerDetailResponseVo,
  CrmCustomerQueryPageRequestVo,
  CrmCustomerSimplePageResponse,
  CrmCustomerExpandPageResponse
} from '../type/CrmCustomer.type'

// 创建客户
const create = async (params: CrmCustomerCreateRequestVo): Promise<IdResponse<string>> => {
  return request.post<IdResponse<string>>(MANAGE_API_BASE_URL + 'manage/crm/customer/create', params)
}

// 删除客户
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/crm/customer/delete', params)
}

// 修改客户
const update = async (params: CrmCustomerUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/crm/customer/update', params)
}

// 客户详情
const detail = async (params: IdRequest): Promise<CrmCustomerDetailResponseVo> => {
  return request.post<CrmCustomerDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/crm/customer/detail', params)
}

// 分页查询客户(应用于组件弹窗)
const pageSimple = async (params: CrmCustomerQueryPageRequestVo): Promise<CrmCustomerSimplePageResponse> => {
  return request.post<CrmCustomerSimplePageResponse>(MANAGE_API_BASE_URL + 'manage/crm/customer/page_simple', params)
}

// 分页查询客户(应用于客户管理菜单)
const pageExpand = async (params: CrmCustomerQueryPageRequestVo): Promise<CrmCustomerExpandPageResponse> => {
  return request.post<CrmCustomerExpandPageResponse>(MANAGE_API_BASE_URL + 'manage/crm/customer/page_expand', params)
}

export const CrmCustomerApi = {
  create,
  destroy,
  update,
  detail,
  pageSimple,
  pageExpand
}
