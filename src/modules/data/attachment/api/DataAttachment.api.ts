import request from '@/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
import type {
  DataAttachmentUploadParams,
  DataAttachmentQueryPageRequestVo,
  DataAttachmentDetailResponseVo,
  DataAttachmentUrlResponseVo,
  DataAttachmentExpandPageResponse
} from '../type/DataAttachment.type'

/** 上传附件，返回 attachmentId */
const upload = async (params: DataAttachmentUploadParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/file_center/attachment/upload', params.file)
}

const getThumbnailUrl = async (attachmentId: string, expireSecond?: number): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file_center/attachment/get_thumbnail_url', {
    attachmentId,
    expireSecond
  })
}

const detail = async (params: IdRequest): Promise<DataAttachmentDetailResponseVo> => {
  return request.post<DataAttachmentDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file_center/attachment/detail', params)
}

const pageExpand = async (params: DataAttachmentQueryPageRequestVo): Promise<DataAttachmentExpandPageResponse> => {
  return request.post<DataAttachmentExpandPageResponse>(MANAGE_API_BASE_URL + 'manage/data/file_center/attachment/page_expand', params)
}

export const DataAttachmentApi = {
  upload,
  getThumbnailUrl,
  detail,
  pageExpand
}
