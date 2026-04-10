import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import type {
  DataAttachmentUploadParams,
  DataAttachmentQueryPageRequestVo,
  DataAttachmentDetailResponseVo,
  DataAttachmentUrlResponseVo,
  DataAttachmentExpandPageResponse,
  DataAttachmentUploadImageParams
} from '../type/DataAttachment.type'

/** 后端 Manage 附件上传：entity + entityId + version（与 DataAttachmentController 一致） */
const MODULE_ENTITY_DATA_MATERIAL = 'DATA_MATERIAL'

const upload = async (params: DataAttachmentUploadParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/file/attachment/upload', params.file, {
    AttachmentType: params.AttachmentType
  })
}

const uploadImage = async (params: DataAttachmentUploadImageParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/file/attachment/upload_image', params.file, {
    thumbnailWeight: params.thumbnailWeight,
    thumbnailHeight: params.thumbnailHeight,
    AttachmentType: params.AttachmentType
  })
}

/** 素材附件上传（entity=DATA_MATERIAL, entityId=materialId），返回 attachmentId */
const uploadForMaterial = async (materialId: string, file: File, options?: { version?: string }): Promise<IdResponse> => {
  return request.upload<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/file/attachment/upload', file, {
    entity: MODULE_ENTITY_DATA_MATERIAL,
    entityId: materialId,
    version: options?.version ?? 'v1'
  })
}

/** 素材图片附件上传（生成缩略图），返回 attachmentId */
const uploadImageForMaterial = async (
  materialId: string,
  file: File,
  options?: { version?: string; thumbnailWeight?: number; thumbnailHeight?: number }
): Promise<IdResponse> => {
  return request.upload<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/file/attachment/upload_image', file, {
    entity: MODULE_ENTITY_DATA_MATERIAL,
    entityId: materialId,
    version: options?.version ?? 'v1',
    thumbnailWeight: options?.thumbnailWeight ?? 320,
    thumbnailHeight: options?.thumbnailHeight ?? 320
  })
}

const getUrl = async (attachmentId: string, expireSecond?: number): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file/attachment/get_url', {
    attachmentId,
    expireSecond
  })
}

const getThumbnailUrl = async (attachmentId: string, expireSecond?: number): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file/attachment/get_thumbnail_url', {
    attachmentId,
    expireSecond
  })
}

const detail = async (params: IdRequest): Promise<DataAttachmentDetailResponseVo> => {
  return request.post<DataAttachmentDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file/attachment/detail', params)
}

const pageExpand = async (params: DataAttachmentQueryPageRequestVo): Promise<DataAttachmentExpandPageResponse> => {
  return request.post<DataAttachmentExpandPageResponse>(MANAGE_API_BASE_URL + 'manage/data/file/attachment/page_expand', params)
}

export const DataAttachmentApi = {
  upload,
  uploadImage,
  uploadForMaterial,
  uploadImageForMaterial,
  getUrl,
  getThumbnailUrl,
  detail,
  pageExpand
}
