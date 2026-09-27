import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  DataAttachmentUploadParams,
  DataAttachmentQueryPageRequestVo,
  DataAttachmentDetailResponseVo,
  DataAttachmentUrlResponseVo,
  DataAttachmentUrlsResponseVo,
  DataAttachmentExpandPageResponse
} from '../type/DataAttachment.type'

/** 上传附件，返回 attachmentId */
const upload = async (params: DataAttachmentUploadParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/upload', params.file)
}

const thumbnail = async (attachmentId: string, expireSecond?: number): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/thumbnail', {
    attachmentId,
    expireSecond
  })
}

/** 缩略图(批量)，返回该附件下所有文件的缩略图地址 */
const batchThumbnail = async (attachmentId: string): Promise<DataAttachmentUrlsResponseVo> => {
  return request.get<DataAttachmentUrlsResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/batch_thumbnail', {
    attachmentId
  })
}

/** 预览 */
const preview = async (attachmentId: string): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/preview', {
    attachmentId
  })
}

/** 预览(批量)，返回该附件下所有文件的预览地址 */
const batchPreview = async (attachmentId: string): Promise<DataAttachmentUrlsResponseVo> => {
  return request.get<DataAttachmentUrlsResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/batch_preview', {
    attachmentId
  })
}

/** 下载 */
const download = async (attachmentId: string): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/download', {
    attachmentId
  })
}

/** 下载(批量)，返回该附件下所有文件的下载地址 */
const batchDownload = async (attachmentId: string): Promise<DataAttachmentUrlsResponseVo> => {
  return request.get<DataAttachmentUrlsResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment/batch_download', {
    attachmentId
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
  thumbnail,
  batchThumbnail,
  preview,
  batchPreview,
  download,
  batchDownload,
  detail,
  pageExpand
}
