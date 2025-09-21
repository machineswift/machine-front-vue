import type { PageRequest, PageResponse } from '@/modules/common/types/Common.type'

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
  attachmentType: string
  file: File
}

export interface DataAttachmentUploadImageParams {
  thumbnailWeight?: number
  thumbnailHeight?: number
  file: File
}

export interface DataMaterialUpdateRequestVo {
  id: string
  title: string
  categoryIdSet?: Set<string>
  expireTime?: number
  description?: string
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
