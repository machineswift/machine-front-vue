import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdResponse } from '@/modules/common/types/Common.type'
import type {
  DataAttachmentUploadParams,
  DataAttachmentQueryPageRequestVo,
  DataAttachmentDetailResponseVo,
  DataAttachmentUrlResponseVo,
  DataAttachmentExpandPageResponse,
  DataAttachmentUploadImageParams
} from '../type/DataAttachment.type'

const upload = async (params: DataAttachmentUploadParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/attachment/upload', params.file, {
    AttachmentType: params.AttachmentType
  })
}

const uploadImage = async (params: DataAttachmentUploadImageParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/attachment/upload_image', params.file, {
    thumbnailWeight: params.thumbnailWeight,
    thumbnailHeight: params.thumbnailHeight,
    AttachmentType: params.AttachmentType
  })
}

const getUrl = async (attachmentId: string, expireSecond?: number): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(MANAGE_API_BASE_URL + 'manage/data/attachment/get_url', {
    attachmentId,
    expireSecond
  })
}

const getThumbnailUrl = async (AttachmentId: string, expireSecond?: number): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(MANAGE_API_BASE_URL + 'manage/data/attachment/get_thumbnail_url', {
    AttachmentId,
    expireSecond
  })
}

const detail = async (params: IdRequest): Promise<DataAttachmentDetailResponseVo> => {
  return request.post<DataAttachmentDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/attachment/detail', params)
}

const pageExpand = async (params: DataAttachmentQueryPageRequestVo): Promise<DataAttachmentExpandPageResponse> => {
  return request.post<DataAttachmentExpandPageResponse>(MANAGE_API_BASE_URL + 'manage/data/attachment/page_expand', params)
}

export const DataAttachmentApi = {
  upload,
  uploadImage,
  getUrl,
  getThumbnailUrl,
  detail,
  pageExpand
}
