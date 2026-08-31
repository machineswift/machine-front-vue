import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

// 访问日志分页查询接口请求参数
export interface BIamUserAccessLogQueryPageRequestVo extends PageRequest {
  userId?: string
  username?: string
  operateSource?: string
  module?: string
  moduleEntity?: string
  operateType?: string
  operateName?: string
  actionStatus?: string
  httpStatus?: number
  requestPath?: string
  clientIp?: string
  traceId?: string
  createStartTime?: number
  createEndTime?: number
}

// 访问日志清理接口请求参数
export interface BIamUserAccessLogDeleteRequestVo {
  beforeCreateTime: number
}

// 访问日志详情接口返回参数
export interface BIamUserAccessLogDetailResponseVo {
  id: string
  userId: string
  username: string
  operateSource: string
  module: string
  moduleEntity: string
  operateType: string
  operateName: string
  traceId: string
  clientIp: string
  platform: string
  deviceId: string
  userAgent: string
  httpMethod: string
  requestPath: string
  queryString: string
  requestBody: string
  httpStatus: number
  responseBody: string
  actionStatus: string
  errorCode: string
  errorMessage: string
  exceptionStack: string
  costTime: number
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

// 访问日志分页查询接口返回参数
export interface BIamUserAccessLogExpandListResponseVo {
  id: string
  userId: string
  username: string
  operateSource: string
  module: string
  moduleEntity: string
  operateType: string
  operateName: string
  traceId: string
  clientIp: string
  platform: string
  deviceId: string
  httpMethod: string
  requestPath: string
  httpStatus: number
  actionStatus: string
  errorCode: string
  errorMessage: string
  costTime: number
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

export type BIamUserAccessLogExpandPageResponse = PageResponse<BIamUserAccessLogExpandListResponseVo>
