import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
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
  return request.post<IdResponse<string>>(ADMIN_API_BASE_URL + 'admin/crm/customer/create', params)
}

// 删除客户
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/crm/customer/delete', params)
}

// 修改客户
const update = async (params: CrmCustomerUpdateRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/crm/customer/update', params)
}

// 客户详情
const detail = async (params: IdRequest): Promise<CrmCustomerDetailResponseVo> => {
  return request.post<CrmCustomerDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/crm/customer/detail', params)
}

// 分页查询客户(应用于组件弹窗)
const pageSimple = async (params: CrmCustomerQueryPageRequestVo): Promise<CrmCustomerSimplePageResponse> => {
  return request.post<CrmCustomerSimplePageResponse>(ADMIN_API_BASE_URL + 'admin/crm/customer/page_simple', params)
}

// 分页查询客户(应用于客户管理菜单)
const pageExpand = async (params: CrmCustomerQueryPageRequestVo): Promise<CrmCustomerExpandPageResponse> => {
  return request.post<CrmCustomerExpandPageResponse>(ADMIN_API_BASE_URL + 'admin/crm/customer/page_expand', params)
}

export const CrmCustomerApi = {
  create,
  destroy,
  update,
  detail,
  pageSimple,
  pageExpand
}
