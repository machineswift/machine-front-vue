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
