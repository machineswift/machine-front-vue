import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

export interface DataAttachmentDto {
  id?: string
  status?: string
  type?: string
  title?: string
  name?: string
  size?: number
  expireTime?: number
  description?: string
}

export interface DataAttachmentUploadParams {
  file: File
}

export interface DataAttachmentUrlResponseVo {
  url: string
}

export interface DataAttachmentUrlsResponseVo {
  urlList: string[]
}

export interface DataAttachmentQueryPageRequestVo extends PageRequest {
  status?: string
  type?: string
  storageType?: string
  title?: string
  name?: string
  categoryIdSet?: Set<string>
  createUserIdSet?: Set<string>
  updateUserIdSet?: Set<string>
  updateStartTime?: number
  updateEndTime?: number
  createStartTime?: number
  createEndTime?: number
}

export interface DataAttachmentDetailResponseVo {
  id?: string
  status?: string
  type?: string
  storageType?: string
  title?: string
  name?: string
  categoryIdSet?: Set<string>
  size?: number
  expireTime?: number
  description?: string
  createName?: string
  createBy?: string
  createTime?: number
  updateName?: string
  updateBy?: string
  updateTime?: number
}

export interface DataAttachmentExpandListResponseVo {
  id?: string
  status?: string
  type?: string
  storageType?: string
  title?: string
  name?: string
  categoryIdSet?: Set<string>
  size?: number
  expireTime?: number
  description?: string
  createName?: string
  createBy?: string
  createTime?: number
  updateName?: string
  updateBy?: string
  updateTime?: number
}

export type DataAttachmentExpandPageResponse = PageResponse<DataAttachmentExpandListResponseVo>

// ==================== 附件操作日志 ====================

// 附件操作日志分页查询接口请求参数
export interface DataAttachmentLogQueryPageRequestVo extends PageRequest {
  userIdSet?: string[]
  phone?: string
  realName?: string
  operateSource?: string
  module?: string
  moduleEntity?: string
  moduleEntityId?: string
  attachmentGroup?: string
  operationTypeSet?: string[]
  operationResult?: string
  clientIp?: string
  traceId?: string
  platform?: string
  createStartTime?: number
  createEndTime?: number
}

// 附件操作日志分页查询接口返回参数
export interface DataAttachmentLogExpandListResponseVo {
  id: string
  userId: string
  username: string
  realName: string
  phone: string
  attachmentId: string
  versionId: string
  moduleEntityName: string
  attachmentGroup: string
  operateSource: string
  module: string
  moduleEntity: string
  moduleEntityId: string
  operationType: string
  traceId: string
  clientIp: string
  platform: string
  operationResult: string
  createBy: string
  createName: string
  createTime: number
}

// 附件操作日志详情接口返回参数
export interface DataAttachmentLogDetailResponseVo {
  id: string
  userId: string
  username: string
  realName: string
  phone: string
  attachmentId: string
  versionId: string
  moduleEntityName: string
  attachmentGroup: string
  operateSource: string
  module: string
  moduleEntity: string
  moduleEntityId: string
  operationType: string
  traceId: string
  clientIp: string
  platform: string
  userAgent: string
  operationResult: string
  errorMessage: string
  createBy: string
  createName: string
  createTime: number
}

export type DataAttachmentLogExpandPageResponse = PageResponse<DataAttachmentLogExpandListResponseVo>
