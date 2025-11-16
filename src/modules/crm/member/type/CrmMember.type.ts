import type { PageRequest, PageResponse } from '@/modules/common/types/Common.type'

// 创建会员请求参数
export interface CrmMemberCreateRequestVo {
  email?: string
  phone: string
  name: string
  gender: string
  birthYear?: number
  birthMonth?: number
  birthDay?: number
}

// 修改会员请求参数
export interface CrmMemberUpdateRequestVo {
  id: string
  name: string
  gender: string
  birthYear?: number
  birthMonth?: number
  birthDay?: number
}

// 会员详情返回参数
export interface CrmMemberDetailResponseVo {
  id: string
  code?: string
  email?: string
  phone: string
  name: string
  gender: string
  birthYear?: number
  birthMonth?: number
  birthDay?: number
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

// 会员简单列表返回参数（应用于组件弹窗）
export interface CrmMemberSimpleListResponseVo {
  id: string
  code?: string
  email?: string
  phone: string
  name: string
  gender: string
  birthYear?: number
  birthMonth?: number
  birthDay?: number
  createTime: number
  updateTime: number
}

// 会员扩展列表返回参数（应用于会员管理菜单）
export interface CrmMemberExpandListResponseVo {
  id: string
  code?: string
  email?: string
  phone: string
  name: string
  gender: string
  birthYear?: number
  birthMonth?: number
  birthDay?: number
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

// 会员分页查询接口请求参数
export interface CrmMemberQueryPageRequestVo extends PageRequest {
  code?: string
  email?: string
  phone?: string
  createStartTime?: number
  createEndTime?: number
}

// 分页响应类型
export type CrmMemberSimplePageResponse = PageResponse<CrmMemberSimpleListResponseVo>
export type CrmMemberExpandPageResponse = PageResponse<CrmMemberExpandListResponseVo>
