import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

// 操作日志分页查询接口请求参数
export interface BIamOperationLogQueryPageRequestVo extends PageRequest {
  userId?: string
  username?: string
  operateSource?: string
  module?: string
  moduleEntity?: string
  moduleEntityId?: string
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

// 操作日志详情接口返回参数
export interface BIamOperationLogDetailResponseVo {
  id: string
  userId: string
  username: string
  operateSource: string
  module: string
  moduleEntity: string
  moduleEntityId: string
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
  content: string
  diff: string
  actionStatus: string
  errorCode: string
  errorMessage: string
  exceptionStack: string
  costTime: number
  extendInfo: string | Record<string, unknown> | null
  createBy: string
  createName: string
  createTime: number
  updateBy: string
  updateName: string
  updateTime: number
}

// 操作日志分页查询接口返回参数
export interface BIamOperationLogExpandListResponseVo {
  id: string
  userId: string
  username: string
  operateSource: string
  module: string
  moduleEntity: string
  moduleEntityId: string
  operateType: string
  operateName: string
  traceId: string
  clientIp: string
  platform: string
  deviceId: string
  httpMethod: string
  requestPath: string
  httpStatus: number
  content: string
  actionStatus: string
  errorCode: string
  errorMessage: string
  costTime: number
  createBy: string
  createName: string
  createTime: number
}

export type BIamOperationLogExpandPageResponse = PageResponse<BIamOperationLogExpandListResponseVo>
