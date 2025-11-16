import type { PageRequest, PageResponse } from '@/modules/common/types/Common.type'

// 创建客户请求参数
export interface CrmCustomerCreateRequestVo {
  identityCardNumber: string
  name?: string
  gender: string
}

// 修改客户请求参数
export interface CrmCustomerUpdateRequestVo {
  id: string
  name?: string
  gender: string
}

// 客户详情返回参数
export interface CrmCustomerDetailResponseVo {
  id: string
  code?: string
  identityCardNumber: string
  name?: string
  gender: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

// 客户简单列表返回参数（应用于组件弹窗）
export interface CrmCustomerSimpleListResponseVo {
  id: string
  code?: string
  identityCardNumber: string
  name?: string
  gender: string
  createTime: number
  updateTime: number
}

// 客户扩展列表返回参数（应用于客户管理菜单）
export interface CrmCustomerExpandListResponseVo {
  id: string
  code?: string
  identityCardNumber: string
  name?: string
  gender: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

// 客户分页查询接口请求参数
export interface CrmCustomerQueryPageRequestVo extends PageRequest {
  code?: string
  identityCardNumber?: string
  createStartTime?: number
  createEndTime?: number
}

// 分页响应类型
export type CrmCustomerSimplePageResponse = PageResponse<CrmCustomerSimpleListResponseVo>
export type CrmCustomerExpandPageResponse = PageResponse<CrmCustomerExpandListResponseVo>
