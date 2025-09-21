import type { PageRequest, PageResponse } from '@/modules/common/types/Common.type'

// 登录日志分页查询接口请求参数
export interface IamUserLoginLogQueryPageRequestVo extends PageRequest {
  userIdSet?: string[]
  authAction: string
  authMethod: string
  authResult: string
  createStartTime?: number
  createEndTime?: number
  updateStartTime?: number
  updateEndTime?: number
}

// 登录日志详情接口返回参数
export interface IamUserLoginLogDetailResponseVo {
  id: string
  userId: string
  username: string
  authAction: string
  authMethod: string
  authResult: string
  code: string
  phone: string
  name: string
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
export interface IamUserLoginLogExpandListResponseVo {
  id: string
  userId: string
  username: string
  authAction: string
  authMethod: string
  authResult: string
  code: string
  phone: string
  name: string
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

export type IamUserLoginLogExpandPageResponse = PageResponse<IamUserLoginLogExpandListResponseVo>
