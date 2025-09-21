import type { PageRequest, PageResponse } from '@/modules/common/types/Common.type'

export interface DataMaterialTextDto {
  format: string
  content?: string
}

export interface DataMaterialImageDto {
  format: string
  width: number
  height: number
  dpi?: number
}

export interface DataMaterialAudioDto {
  format: string
  duration: number
  bitrate: number
  sampleRate?: number
  channels?: number
}

export interface DataMaterialVideoDto {
  format: string
  duration: number
  width: number
  height: number
  bitrate?: number
  fps?: number
  codec?: string
  audioCodec?: string
}

export interface DataMaterialDocumentDto {
  format: string
  pageCount: number
}

export interface DataMaterialFileDto {
  format: string
  checksum: string
}

export interface DataMaterialUploadParams {
  materIalType: string
  file: File
}

export interface DataMaterialUploadImageParams {
  thumbnailWeight?: number
  thumbnailHeight?: number
  file: File
}

export interface DataMaterialCreateRequestVo {
  materialId: string
  type: string
  title: string
  categoryIdSet?: Set<string>
  expireTime?: number
  description?: string

  textMetaInfo?: DataMaterialTextDto
  imageMetaInfo?: DataMaterialImageDto
  audioMetaInfo?: DataMaterialAudioDto
  videoMetaInfo?: DataMaterialVideoDto
  documentMetaInfo?: DataMaterialDocumentDto
  fileMetaInfo?: DataMaterialFileDto
}

export interface DataMaterialUpdateRequestVo {
  id: string
  title: string
  categoryIdSet?: Set<string>
  expireTime?: number
  description?: string

  textMetaInfo?: DataMaterialTextDto
  imageMetaInfo?: DataMaterialImageDto
  audioMetaInfo?: DataMaterialAudioDto
  videoMetaInfo?: DataMaterialVideoDto
  documentMetaInfo?: DataMaterialDocumentDto
  fileMetaInfo?: DataMaterialFileDto
}

export interface DataMaterialUrlResponseVo {
  url: string
}

export interface DataMaterialQueryPageRequestVo extends PageRequest {
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

export interface DataMaterialDetailResponseVo {
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

  textMetaInfo?: DataMaterialTextDto
  imageMetaInfo?: DataMaterialImageDto
  audioMetaInfo?: DataMaterialAudioDto
  videoMetaInfo?: DataMaterialVideoDto
  documentMetaInfo?: DataMaterialDocumentDto
  fileMetaInfo?: DataMaterialFileDto
}

export interface DataMaterialExpandListResponseVo {
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

  textMetaInfo?: DataMaterialTextDto
  imageMetaInfo?: DataMaterialImageDto
  audioMetaInfo?: DataMaterialAudioDto
  videoMetaInfo?: DataMaterialVideoDto
  documentMetaInfo?: DataMaterialDocumentDto
  fileMetaInfo?: DataMaterialFileDto
}

export type DataMaterialExpandPageResponse = PageResponse<DataMaterialExpandListResponseVo>
