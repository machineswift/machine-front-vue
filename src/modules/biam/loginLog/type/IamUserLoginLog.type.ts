import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

// 登录日志分页查询接口请求参数
export interface BIamUserLoginLogQueryPageRequestVo extends PageRequest {
  userIdSet?: string[]
  phone?: string
  username?: string
  ipAddress?: string
  realName?: string
  authAction?: string
  authMethod?: string
  authResult?: string
  createStartTime?: number
  createEndTime?: number
  updateStartTime?: number
  updateEndTime?: number
}

// 登录日志详情接口返回参数
export interface BIamUserLoginLogDetailResponseVo {
  id: string
  userId: string
  username: string
  realName: string
  phone: string
  authAction: string
  authMethod: string
  authResult: string
  ipAddress: string
  platform: string
  userAgent: string
  failReason: string
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

// 登录日志分页查询接口返回参数
export interface BIamUserLoginLogExpandListResponseVo {
  id: string
  userId: string
  username: string
  realName: string
  phone: string
  authAction: string
  authMethod: string
  authResult: string
  ipAddress: string
  platform: string
  failReason: string
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

export type BIamUserLoginLogExpandPageResponse = PageResponse<BIamUserLoginLogExpandListResponseVo>
