import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  DataAttachmentUploadParams,
  DataAttachmentQueryPageRequestVo,
  DataAttachmentDetailResponseVo,
  DataAttachmentUrlResponseVo,
  DataAttachmentExpandPageResponse
} from '../type/DataAttachment.type'

/** 上传附件，返回 attachmentId */
const upload = async (params: DataAttachmentUploadParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/upload', params.file)
}

const getThumbnailUrl = async (attachmentId: string, expireSecond?: number): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/get_thumbnail_url', {
    attachmentId,
    expireSecond
  })
}

const detail = async (params: IdRequest): Promise<DataAttachmentDetailResponseVo> => {
  return request.post<DataAttachmentDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/detail', params)
}

const pageExpand = async (params: DataAttachmentQueryPageRequestVo): Promise<DataAttachmentExpandPageResponse> => {
  return request.post<DataAttachmentExpandPageResponse>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/page_expand', params)
}

export const DataAttachmentApi = {
  upload,
  getThumbnailUrl,
  detail,
  pageExpand
}
